"use client";

import { useEffect, useMemo, useState } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

interface TypewriterMarkdownProps {
  content: string;
  animate?: boolean;
  components?: Components;
  onComplete?: () => void;
  onProgress?: () => void;
}

function getCharacterDelay(character: string, index: number): number {
  if (/[。！？.!?]/.test(character)) return 90;
  if (/[,，、；;：:\n]/.test(character)) return 38;
  if (index > 500) return 4;
  if (index > 180) return 8;
  return 14;
}

export default function TypewriterMarkdown({
  content,
  animate = false,
  components,
  onComplete,
  onProgress,
}: TypewriterMarkdownProps) {
  const characters = useMemo(() => Array.from(content), [content]);
  const [visibleCount, setVisibleCount] = useState(
    animate ? 0 : characters.length,
  );
  const [isTyping, setIsTyping] = useState(animate && characters.length > 0);

  useEffect(() => {
    if (!animate || characters.length === 0) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const frame = requestAnimationFrame(() => {
        setVisibleCount(characters.length);
        setIsTyping(false);
        onComplete?.();
      });
      return () => cancelAnimationFrame(frame);
    }

    let currentIndex = 0;
    let timer: ReturnType<typeof setTimeout>;

    const revealNextCharacter = () => {
      currentIndex += 1;
      setVisibleCount(currentIndex);

      if (currentIndex % 12 === 0) onProgress?.();

      if (currentIndex >= characters.length) {
        setIsTyping(false);
        onProgress?.();
        onComplete?.();
        return;
      }

      timer = setTimeout(
        revealNextCharacter,
        getCharacterDelay(characters[currentIndex - 1], currentIndex),
      );
    };

    timer = setTimeout(revealNextCharacter, 120);
    return () => clearTimeout(timer);
  }, [animate, characters, onComplete, onProgress]);

  const visibleText = characters.slice(0, visibleCount).join("");

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {isTyping ? `${visibleText}\u2009▍` : visibleText}
    </ReactMarkdown>
  );
}
