// TypeScript
export function formatThinking(raw: string): string {
  if (!raw) return "";

  const fenceRegex = /```[\s\S]*?```/g;
  const parts: { text: string; isCode: boolean }[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = fenceRegex.exec(raw)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ text: raw.slice(lastIndex, match.index), isCode: false });
    }
    parts.push({ text: match[0], isCode: true });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < raw.length) {
    parts.push({ text: raw.slice(lastIndex), isCode: false });
  }

  const formatted = parts
    .map((p) => {
      if (p.isCode) return p.text;
      let t = p.text;
      t = t.replace(/([.!?…]|[。！？])(?=\s|$|\S)/g, "$1\n");
      t = t
        .replace(/(?:^|\s)([-*•]\s+)/g, (_m, g1) => `\n${g1}`)
        .replace(/(?:^|\s)(\d+\.\s+)/g, (_m, g1) => `\n${g1}`)
        .replace(/(?:^|\s)\((\d+)\)\s+/g, (_m, d) => `\n(${d}) `)
        .replace(/(?:^|\s)(Step\s*\d+:)/gi, (_m, g1) => `\n${g1} `);
      t = t.replace(/[ \t]{2,}/g, " ");
      t = t.replace(/\n{3,}/g, "\n\n");
      return t.trim();
    })
    .join("\n");

  return formatted;
}
