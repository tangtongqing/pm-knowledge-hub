import { jsPDF } from "jspdf";
import { HistorySession } from "./history";
import { formatDate } from "./utils";

class CanvasPDFPainter {
  pages: HTMLCanvasElement[] = [];
  currentCanvas: HTMLCanvasElement | null = null;
  ctx: CanvasRenderingContext2D | null = null;
  currentY: number = 0;
  width = 800;
  height = 1130;
  margin = 50;

  constructor() {
    this.newPage();
  }

  newPage() {
    if (typeof document === "undefined") return;
    const canvas = document.createElement("canvas");
    canvas.width = this.width;
    canvas.height = this.height;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, this.width, this.height);
      
      // Draw background decorations border
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 1;
      if (typeof ctx.strokeRect === "function") {
        ctx.strokeRect(20, 20, this.width - 40, this.height - 40);
      }

      // Draw header
      ctx.font = "12px 'Microsoft YaHei', 'Heiti SC', sans-serif";
      ctx.fillStyle = "#64748b";
      ctx.fillText("PM Knowledge Hub | 模拟面试评估报告", 40, 45);
      
      ctx.beginPath();
      ctx.moveTo(40, 55);
      ctx.lineTo(this.width - 40, 55);
      ctx.strokeStyle = "#e2e8f0";
      ctx.stroke();

      this.currentCanvas = canvas;
      this.ctx = ctx;
      this.currentY = 85;
      this.pages.push(canvas);
    }
  }

  ensureSpace(neededHeight: number) {
    if (this.currentY + neededHeight > this.height - 70) {
      this.newPage();
    }
  }

  drawText(text: string, x: number, fontSpec: string, color: string, lineHeight: number, maxWidth: number, isParagraph = false): number {
    if (!this.ctx) return 0;
    this.ctx.font = fontSpec;
    this.ctx.fillStyle = color;

    const words = text.split("");
    let line = "";
    const lines: string[] = [];

    for (let n = 0; n < words.length; n++) {
      if (words[n] === "\n") {
        lines.push(line);
        line = "";
        continue;
      }
      const testLine = line + words[n];
      const metrics = this.ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        lines.push(line);
        line = words[n];
      } else {
        line = testLine;
      }
    }
    if (line) {
      lines.push(line);
    }

    const totalHeight = lines.length * lineHeight;
    this.ensureSpace(totalHeight + (isParagraph ? 16 : 0));

    lines.forEach((lineText) => {
      this.ctx!.fillText(lineText, x, this.currentY);
      this.currentY += lineHeight;
    });

    if (isParagraph) {
      this.currentY += 8;
    }

    return totalHeight;
  }

  drawSTARCard(title: string, content: string, colorTheme: { bg: string; text: string; letterBg: string; letterText: string }) {
    if (!this.ctx) return;
    
    this.ctx.font = "13px 'Microsoft YaHei', 'Heiti SC', sans-serif";
    const words = content.split("");
    let line = "";
    const lines: string[] = [];
    const maxWidth = this.width - 2 * this.margin - 72; // Adjusted for padding

    for (let n = 0; n < words.length; n++) {
      if (words[n] === "\n") {
        lines.push(line);
        line = "";
        continue;
      }
      const testLine = line + words[n];
      const metrics = this.ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        lines.push(line);
        line = words[n];
      } else {
        line = testLine;
      }
    }
    if (line) lines.push(line);

    const textHeight = lines.length * 20;
    const cardHeight = textHeight + 62;

    this.ensureSpace(cardHeight + 15);

    // Draw card rounded background
    this.ctx.fillStyle = colorTheme.bg;
    this.ctx.beginPath();
    const x = this.margin;
    const y = this.currentY;
    const w = this.width - 2 * this.margin;
    const h = cardHeight;
    const r = 8;
    
    if (typeof this.ctx.roundRect === "function") {
      this.ctx.roundRect(x, y, w, h, r);
    } else {
      this.ctx.rect(x, y, w, h);
    }
    this.ctx.fill();

    // Draw Letter Icon background
    this.ctx.fillStyle = colorTheme.letterBg;
    this.ctx.beginPath();
    if (typeof this.ctx.roundRect === "function") {
      this.ctx.roundRect(x + 16, y + 14, 28, 28, 4);
    } else {
      this.ctx.rect(x + 16, y + 14, 28, 28);
    }
    this.ctx.fill();

    // Draw Letter
    this.ctx.font = "bold 15px 'Microsoft YaHei', 'Heiti SC', sans-serif";
    this.ctx.fillStyle = colorTheme.letterText;
    this.ctx.textAlign = "center";
    this.ctx.fillText(title[0], x + 30, y + 33);
    this.ctx.textAlign = "left";

    // Draw Title Text
    this.ctx.font = "bold 14px 'Microsoft YaHei', 'Heiti SC', sans-serif";
    this.ctx.fillStyle = colorTheme.text;
    this.ctx.fillText(title, x + 56, y + 32);

    // Draw Content
    this.ctx.font = "13px 'Microsoft YaHei', 'Heiti SC', sans-serif";
    this.ctx.fillStyle = "#334155";
    let textY = y + 60;
    lines.forEach((lineText) => {
      this.ctx!.fillText(lineText, x + 16, textY);
      textY += 20;
    });

    this.currentY += cardHeight + 15;
  }
}

export function exportInterviewReport(session: HistorySession): void {
  if (typeof window === "undefined" || !session.evaluations || session.evaluations.length === 0) return;

  const painter = new CanvasPDFPainter();

  // Draw Cover/Title Section
  painter.drawText("模拟面试评估报告", painter.margin, "bold 26px 'Microsoft YaHei', 'Heiti SC', sans-serif", "#0f172a", 34, 700);
  painter.drawText("基于 STAR 原则的系统化产品经理面试表现测评", painter.margin, "14px 'Microsoft YaHei', 'Heiti SC', sans-serif", "#64748b", 22, 700, true);

  painter.currentY += 10;

  // Metadata Panel
  const metaY = painter.currentY;
  painter.ensureSpace(120);
  if (painter.ctx) {
    // Draw meta card background
    painter.ctx.fillStyle = "#f8fafc";
    painter.ctx.strokeStyle = "#e2e8f0";
    painter.ctx.lineWidth = 1;
    if (typeof painter.ctx.roundRect === "function") {
      painter.ctx.roundRect(painter.margin, metaY, painter.width - 2 * painter.margin, 100, 6);
    } else {
      painter.ctx.rect(painter.margin, metaY, painter.width - 2 * painter.margin, 100);
    }
    painter.ctx.fill();
    painter.ctx.stroke();
  }

  painter.currentY += 25;
  const colWidth = (painter.width - 2 * painter.margin) / 2;

  // Metadata Fields
  painter.drawText(`报告时间: ${formatDate(session.updatedAt)}`, painter.margin + 20, "13px 'Microsoft YaHei', 'Heiti SC', sans-serif", "#334155", 0, colWidth - 30);
  const originalY = painter.currentY;
  painter.currentY -= 15; // Reset Y for column 2
  
  const scores = session.evaluations.map(e => e.score || 0);
  const maxScore = Math.max(...scores);
  const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

  painter.drawText(`最高得分: ${maxScore} 分`, painter.margin + colWidth + 10, "13px 'Microsoft YaHei', 'Heiti SC', sans-serif", "#334155", 0, colWidth - 30);
  
  painter.currentY = originalY + 15;
  painter.drawText(`评估轮数: 共 ${session.evaluations.length} 轮回答`, painter.margin + 20, "13px 'Microsoft YaHei', 'Heiti SC', sans-serif", "#334155", 0, colWidth - 30);
  painter.currentY -= 15;
  painter.drawText(`平均得分: ${avgScore} 分`, painter.margin + colWidth + 10, "13px 'Microsoft YaHei', 'Heiti SC', sans-serif", "#334155", 0, colWidth - 30);

  painter.currentY = metaY + 120; // reset layout coordinate past meta box

  // Extract Candidate Answers
  const candidateMsgs = session.messages.filter(m => m.role === "candidate");

  // STAR Card Themes
  const starThemes = {
    S: { bg: "#f0f9ff", text: "#0369a1", letterBg: "#0ea5e9", letterText: "#ffffff" },
    T: { bg: "#fdf4ff", text: "#a21caf", letterBg: "#d946ef", letterText: "#ffffff" },
    A: { bg: "#f0fdf4", text: "#15803d", letterBg: "#22c55e", letterText: "#ffffff" },
    R: { bg: "#fff7ed", text: "#c2410c", letterBg: "#f97316", letterText: "#ffffff" }
  };

  // Loop Evaluations
  session.evaluations.forEach((evalItem, idx) => {
    painter.ensureSpace(80);
    painter.currentY += 20;

    // Underlined Header Banner for each evaluation round
    painter.drawText(`第 ${idx + 1} 轮面试评估  (得分: ${evalItem.score}分)`, painter.margin, "bold 16px 'Microsoft YaHei', 'Heiti SC', sans-serif", "#1e3a8a", 24, 700);
    if (painter.ctx) {
      painter.ctx.beginPath();
      painter.ctx.moveTo(painter.margin, painter.currentY + 2);
      painter.ctx.lineTo(painter.width - painter.margin, painter.currentY + 2);
      painter.ctx.strokeStyle = "#cbd5e1";
      painter.ctx.lineWidth = 1.5;
      painter.ctx.stroke();
    }
    painter.currentY += 12;

    // Draw Interviewer Question
    painter.drawText("【面试官提问】", painter.margin, "bold 13px 'Microsoft YaHei', 'Heiti SC', sans-serif", "#475569", 18, 700);
    painter.drawText(evalItem.question, painter.margin, "italic 13px 'Microsoft YaHei', 'Heiti SC', sans-serif", "#334155", 20, 700 - painter.margin, true);

    // Draw Candidate Answer
    const answer = candidateMsgs[idx]?.content || "未提供回答";
    painter.drawText("【你的回答】", painter.margin, "bold 13px 'Microsoft YaHei', 'Heiti SC', sans-serif", "#475569", 18, 700);
    painter.drawText(answer, painter.margin, "13px 'Microsoft YaHei', 'Heiti SC', sans-serif", "#334155", 20, 700 - painter.margin, true);

    // Draw STAR Cards
    painter.drawText("【STAR 拆解反馈】", painter.margin, "bold 13px 'Microsoft YaHei', 'Heiti SC', sans-serif", "#475569", 18, 700);
    painter.currentY += 6;

    painter.drawSTARCard("Situation (情景)", evalItem.star_feedback.situation, starThemes.S);
    painter.drawSTARCard("Task (任务)", evalItem.star_feedback.task, starThemes.T);
    painter.drawSTARCard("Action (行动)", evalItem.star_feedback.action, starThemes.A);
    painter.drawSTARCard("Result (结果)", evalItem.star_feedback.result, starThemes.R);

    // Draw Suggested Answer
    painter.drawText("【建议回答框架】", painter.margin, "bold 13px 'Microsoft YaHei', 'Heiti SC', sans-serif", "#475569", 18, 700);
    painter.drawText(evalItem.suggested_answer, painter.margin, "13px 'Microsoft YaHei', 'Heiti SC', sans-serif", "#0f172a", 20, 700 - painter.margin, true);

    painter.currentY += 15;
  });

  // Stamp Page Numbers
  painter.pages.forEach((canvas, idx) => {
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.font = "11px 'Microsoft YaHei', 'Heiti SC', sans-serif";
      ctx.fillStyle = "#94a3b8";
      ctx.textAlign = "center";
      ctx.fillText(`第 ${idx + 1} 页 / 共 ${painter.pages.length} 页`, painter.width / 2, painter.height - 40);
      ctx.textAlign = "left";
    }
  });

  // Generate jsPDF Document
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  painter.pages.forEach((canvas, idx) => {
    if (idx > 0) {
      doc.addPage();
    }
    const imgData = canvas.toDataURL("image/jpeg", 0.95);
    // A4 sizes: 210mm x 297mm
    doc.addImage(imgData, "JPEG", 0, 0, 210, 297);
  });

  doc.save(`PM_Interview_Report_${session.title.replace(/\s+/g, "_")}.pdf`);
}
