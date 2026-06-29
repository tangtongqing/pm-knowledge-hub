import os
import re
import yaml
from pathlib import Path
from typing import Dict, List, Any, Tuple

# 正则表达式定义
# 匹配 Obsidian 双链: [[文件名]] 或 [[文件名|显示文本]]
OBSIDIAN_LINK_REGEX = re.compile(r'\[\[([^\]|]+)(?:\|([^\]]+))?\]\]')
# 匹配 Obsidian 图片嵌入: ![[图片名.png]]
OBSIDIAN_IMAGE_REGEX = re.compile(r'!\[\[([^\]]+)\]\]')
# 匹配 YAML Frontmatter: --- 换行内容 ---
FRONTMATTER_REGEX = re.compile(r'^---\s*\n(.*?)\n---\s*\n', re.DOTALL)
# 匹配行内标签: #标签名 (必须以空格开头或行首，且标签本身为字母/汉字/数字，排除标题的 # 号)
INLINE_TAG_REGEX = re.compile(r'(?:^|\s)#([\w\u4e00-\u9fa5\-_]+)(?=\s|$)')

class ObsidianNoteParser:
    def __init__(self, notes_dir: str):
        self.notes_dir = Path(notes_dir)
        if not self.notes_dir.exists():
            raise FileNotFoundError(f"笔记目录不存在: {notes_dir}")

    def clean_text_and_extract_links(self, content: str) -> Tuple[str, List[str]]:
        """
        清洗 Obsidian 语法，并提取双链关联的文档列表。
        [[01-入门/1.1-需求|1.1 需求]] -> 1.1 需求
        """
        outgoing_links = []
        
        # 1. 先转换图片语法 ![[xxx.png]] -> ![xxx.png](../_images/xxx.png)
        # 防止图片的双括号被常规链接正则误吞
        def image_replacer(match):
            image_name = match.group(1).strip()
            return f"![{image_name}](../_images/{image_name})"

        cleaned_content = OBSIDIAN_IMAGE_REGEX.sub(image_replacer, content)

        # 2. 再提取双链，并转化为标准文本
        def link_replacer(match):
            target_path = match.group(1).strip()
            display_text = match.group(2) if match.group(2) else target_path
            outgoing_links.append(target_path)
            return display_text.strip()

        cleaned_content = OBSIDIAN_LINK_REGEX.sub(link_replacer, cleaned_content)

        return cleaned_content, outgoing_links

    def extract_inline_tags(self, content: str) -> List[str]:
        """
        从正文中提取行内标签（如 #产品经理 #AI）
        """
        return list(set(INLINE_TAG_REGEX.findall(content)))

    def parse_frontmatter(self, content: str) -> Tuple[Dict[str, Any], str]:
        """
        解析 YAML Frontmatter，并返回元数据字典和去除 Frontmatter 后的正文内容
        """
        metadata = {}
        body = content
        
        match = FRONTMATTER_REGEX.match(content)
        if match:
            frontmatter_text = match.group(1)
            body = content[match.end():]
            try:
                parsed_yaml = yaml.safe_load(frontmatter_text)
                if isinstance(parsed_yaml, dict):
                    metadata = parsed_yaml
            except Exception as e:
                # 容错：解析失败则记录日志，返回空字典
                print(f"⚠️ YAML 解析失败: {e}")
                
        return metadata, body

    def parse_note(self, file_path: Path) -> Dict[str, Any]:
        """
        解析单篇 Obsidian 笔记，输出标准的结构化数据
        """
        # 计算相对路径
        rel_path = file_path.relative_to(self.notes_dir)
        chapter = rel_path.parts[0] if len(rel_path.parts) > 1 else "根目录"
        
        with open(file_path, "r", encoding="utf-8") as f:
            raw_content = f.read()

        # 1. 解析 Frontmatter
        metadata, body = self.parse_frontmatter(raw_content)

        # 2. 清洗正文，提取出链
        cleaned_body, outgoing_links = self.clean_text_and_extract_links(body)

        # 3. 提取行内标签与 Frontmatter 中的标签合并
        inline_tags = self.extract_inline_tags(cleaned_body)
        yaml_tags = metadata.get("tags", [])
        if isinstance(yaml_tags, str):
            yaml_tags = [yaml_tags]
        elif not isinstance(yaml_tags, list):
            yaml_tags = []
        
        # 移除标签前缀 # 并去重
        all_tags = list(set([t.replace("#", "") for t in yaml_tags + inline_tags]))

        # 4. 确定标题 (优先 Frontmatter -> 其次首个 H1 标题 -> 最后取文件名)
        title = metadata.get("title")
        if not title:
            h1_match = re.search(r'^#\s+(.+)$', body, re.MULTILINE)
            if h1_match:
                title = h1_match.group(1).strip()
            else:
                title = file_path.stem

        # 5. 组装 Obsidian URI (用于唤醒本地 Obsidian 协议)
        # 格式: obsidian://open?vault=vault_name&file=encoded_file_path
        vault_name = self.notes_dir.name
        # 编码路径中的斜杠和空格
        encoded_rel_path = str(rel_path.with_suffix('')).replace('\\', '/').replace(' ', '%20')
        obsidian_uri = f"obsidian://open?vault={vault_name}&file={encoded_rel_path}"

        return {
            "title": title,
            "file_path": str(rel_path).replace('\\', '/'),
            "obsidian_uri": obsidian_uri,
            "content": cleaned_body.strip(),
            "metadata": {
                "chapter": chapter,
                "tags": all_tags,
                "outgoing_links": outgoing_links,
                "raw_metadata": metadata  # 保留原始的 yaml frontmatter 字段
            }
        }

    def scan_and_parse_all(self, exclude_dirs: List[str] = None) -> List[Dict[str, Any]]:
        """
        遍历并解析目录下所有 Markdown 笔记，过滤系统目录
        """
        if exclude_dirs is None:
            exclude_dirs = [".claude", ".claudian", ".obsidian", "_agents", "_images"]

        parsed_notes = []
        
        for root, dirs, files in os.walk(self.notes_dir):
            # 原地修改 dirs 以过滤掉排除目录，防止 walk 深入
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            
            for file in files:
                if file.endswith(".md") and file != "README.md" and file != "学习路线总览.md" and file != "项目进度报告.md":
                    file_path = Path(root) / file
                    try:
                        note_data = self.parse_note(file_path)
                        parsed_notes.append(note_data)
                    except Exception as e:
                        print(f"[Error] 解析笔记失败: {file_path}，错误: {e}")
                        
        return parsed_notes

if __name__ == "__main__":
    # 本地快速测试
    # 从 .env 加载路径
    from dotenv import load_dotenv
    load_dotenv()
    
    notes_path = os.getenv("NOTES_DIR")
    if notes_path:
        print(f"正在扫描目录: {notes_path}")
        parser = ObsidianNoteParser(notes_path)
        notes = parser.scan_and_parse_all()
        print(f"[Success] 扫描完毕。共成功解析 {len(notes)} 篇笔记。")
        if notes:
            print("\n示例解析数据 (第一篇):")
            sample = notes[0]
            print(f"标题: {sample['title']}")
            print(f"相对路径: {sample['file_path']}")
            print(f"标签: {sample['metadata']['tags']}")
            print(f"双链出链数: {len(sample['metadata']['outgoing_links'])}")
            print(f"Obsidian URI: {sample['obsidian_uri']}")
            print(f"正文前100字:\n{sample['content'][:100]}...")
    else:
        print("未在 .env 中找到 NOTES_DIR")
