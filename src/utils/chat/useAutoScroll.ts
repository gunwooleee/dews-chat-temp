// import { MutableRefObject, useEffect, useRef, useState } from "react";
// import types { VirtuosoHandle } from "react-virtuoso";
//
// types UseAutoScrollParams<T> = {
//   virtuosoRef: MutableRefObject<VirtuosoHandle | null>;
//   items: T[];
//   isThinking: boolean;
//   isSending: boolean;
//   getItemId: (item: T) => string | number | null | undefined;
//   getItemText?: (item: T) => string;
// };
//
// export function useAutoScroll<T>({
//   virtuosoRef,
//   items,
//   isThinking,
//   isSending,
//   getItemId,
//   getItemText,
// }: UseAutoScrollParams<T>) {
//   const [isBottom, setIsBottom] = useState(true);
//   const prevLenRef = useRef(0);
//   const lastAssistantIdRef = useRef<string | number | null>(null);
//   const lastAssistantLenRef = useRef(0);
//   const mountCountRef = useRef(0);
//
//   const scrollToBottom = (force = false) => {
//     if (isThinking && !force) return;
//     requestAnimationFrame(() => {
//       const index = Math.max(0, items.length - 1);
//       virtuosoRef.current?.scrollToIndex({
//         index,
//         align: "end",
//         behavior: "auto",
//       });
//     });
//   };
//
//   // 초기 진입 시 살짝 위쪽 → 자연스러운 첫 스크롤
//   useEffect(() => {
//     if (mountCountRef.current <= 0) {
//       setTimeout(() => {
//         const index = Math.max(0, items.length - 2);
//         virtuosoRef.current?.scrollToIndex({
//           index,
//           align: "start",
//           behavior: "auto",
//         });
//       }, 60);
//       mountCountRef.current += 1;
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);
//
//   // 새 아이템 추가 시 스크롤 정책
//   useEffect(() => {
//     const prevLen = prevLenRef.current;
//     const added = items.slice(prevLen);
//
//     if (added.length > 0) {
//       // 마지막 추가가 user면 강제 하단 이동
//       const hasUserLike = added.some((_, i) => {
//         const item = added[i] as any;
//         return item?.role === "user";
//       });
//       if (hasUserLike) {
//         scrollToBottom(true);
//       } else if (!isThinking) {
//         scrollToBottom();
//       }
//     }
//     prevLenRef.current = items.length;
//   }, [items, isThinking]);
//
//   // 마지막 assistant 텍스트 길이 증가(스트리밍) 감지 시 따라가기
//   useEffect(() => {
//     if (!getItemText) return;
//
//     const lastAssistant = [...items]
//       .reverse()
//       .find((it: any) => it?.role !== "user");
//     if (!lastAssistant) return;
//
//     const id = getItemId(lastAssistant) ?? null;
//     const text = getItemText(lastAssistant) || "";
//     const len = text.length;
//
//     if (id !== lastAssistantIdRef.current) {
//       lastAssistantIdRef.current = id;
//       lastAssistantLenRef.current = 0;
//     }
//     if (len > lastAssistantLenRef.current) {
//       if (!isThinking) {
//         scrollToBottom();
//       }
//       lastAssistantLenRef.current = len;
//     }
//   }, [items, isThinking, getItemId, getItemText]);
//
//   // Thinking 종료 시 1회 정리
//   useEffect(() => {
//     if (!isThinking) {
//       scrollToBottom(true);
//     }
//   }, [isThinking]);
//
//   // 전송 중 + Thinking 아님 → 하단 정렬
//   useEffect(() => {
//     if (isSending && !isThinking) {
//       scrollToBottom();
//     }
//   }, [isSending, isThinking]);
//
//   const onRangeChanged = (range: { endIndex: number }) => {
//     const atBottom = range.endIndex === items.length - 1;
//     setIsBottom(atBottom);
//   };
//
//   return { isBottom, onRangeChanged, scrollToBottom };
// }
