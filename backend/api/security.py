"""
AI Safety & Input Sanitization Utilities
=========================================
"""

import re
from slowapi import Limiter
from slowapi.util import get_remote_address

# 初始化 slowapi Limiter 实例以供全局路由共用
limiter = Limiter(key_func=get_remote_address)


def sanitize_user_input(text: str) -> str:
    """
    清理和规范化用户输入的文本，防止基础 prompt 注入和控制字符破坏 prompt 格式。
    
    1. 剥离 0-31 以及 127 等 ASCII 控制字符。
    2. 进行长度截断，强制最大 2000 字符。
    3. 过滤/剥离常见 AI 注入前缀及标记（如 ignore previous instructions, system:, <| 等）。
    """
    if not text:
        return ""
    
    # 1. 截断最大 2000 字符
    text = text[:2000]
    
    # 2. 剥离 ASCII 控制字符 (留下 \n, \r, \t 供排版，其余过滤)
    # \x00-\x08, \x0b-\x0c, \x0e-\x1f, \x7f
    text = re.sub(r'[\x00-\x08\x0b-\x0c\x0e-\x1f\x7f]', '', text)
    
    # 3. 剥离常见 prompt 注入模式
    injection_patterns = [
        r"(?i)ignore\s+previous\s+instructions",
        r"(?i)ignore\s+previous\s+directions",
        r"(?i)ignore\s+above\s+instructions",
        r"(?i)ignore\s+previous",
        r"(?i)system\s*:",
        r"<\|.*?\|>",  # 匹配 <|im_start|>, <|im_end|> 等 chatml 标签
        r"<\|"
    ]
    for pattern in injection_patterns:
        text = re.sub(pattern, "", text)
        
    return text.strip()
