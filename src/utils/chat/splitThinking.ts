export function splitThinking(text: string): {
  thinking: string;
  answer: string;
} {
  if (!text) return { thinking: "", answer: "" };

  const completeRegex = /\[THINKING\]([\s\S]*?)\[END_THINKING\]/g;

  // 완성된 블록 수집
  const completeMatches = [...text.matchAll(completeRegex)];
  let thinking = completeMatches.map((m) => (m[1] || "").trim()).join("\n\n");

  // 완성 블록 제거 후 본문
  let answer = text.replace(completeRegex, "").trim();

  // 미완성 블록 처리
  const openIdx = answer.indexOf("[THINKING]");
  if (openIdx !== -1) {
    const openContent = answer.slice(openIdx + "[THINKING]".length);
    if (openContent.trim().length > 0) {
      thinking = [thinking, openContent.trim()].filter(Boolean).join("\n\n");
    }
    answer = answer.slice(0, openIdx).trim();
  }

  return { thinking, answer };
}
