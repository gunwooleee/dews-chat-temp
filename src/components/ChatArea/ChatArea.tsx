"use client";

import { MsgType, useChatManager } from "@/context/ChatManager";
import React, { useEffect, useRef, useState } from "react";
import Message from "@/components/Message/Index";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";

interface ChatAreaProps {
  messages: MsgType[];
  onSelectedText: (code: string, language?: string) => void;
  onDeleteMessage?: (index: number) => void;
  onEditMessage?: (index: number, content: string) => void;
  TargetingIndex?: number | null;
  editContents?: { [index: number]: string };
  onEditContentChange?: (index: number, value: string) => void;
  onEditSave?: (index: number) => void;
  onEditCancel?: () => void;
}

const ChatArea = ({
  messages,
  onSelectedText,
  onDeleteMessage,
  onEditMessage,
  TargetingIndex,
  editContents,
  onEditContentChange,
  onEditSave,
  onEditCancel,
}: ChatAreaProps) => {
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const [isBottom, setIsBottom] = useState(true);
  const { isSending, chatLoadingThinking } = useChatManager();
  const count = useRef(0);
  const isAtBottom = useRef(true);

  // 직전 메시지 개수 저장
  const prevLenRef = useRef(0);

  // 마지막 어시스턴트 메시지 텍스트 길이 추적
  const lastAssistantIdRef = useRef<string | null>(null);
  const lastAssistantLenRef = useRef(0);

  // 메시지에서 텍스트만 추출 (string | array 모두 대응)
  const getMessageText = (m?: MsgType): string => {
    if (!m) return "";
    const c = m.content as any;
    if (typeof c === "string") return c;
    if (Array.isArray(c)) {
      const textPart = c.find((x: any) => x?.type === "text");
      return (textPart?.text as string) ?? "";
    }
    return "";
  };

  const scrollToBottom = (force = false) => {
    if (chatLoadingThinking && !force) return;
    // requestAnimationFrame이 살짝 더 안정적
    requestAnimationFrame(() => {
      const index = Math.max(0, messages.length - 1);
      virtuosoRef.current?.scrollToIndex({
        index,
        align: "end",
        behavior: "auto",
      });
    });
  };

  // 초기 진입 스크롤 유지(기존)
  useEffect(() => {
    if (count.current <= 1) {
      setTimeout(() => {
        const index = Math.max(0, messages.length - 2);
        virtuosoRef.current?.scrollToIndex({
          index,
          align: "start",
          behavior: "auto",
        });
      }, 60);
    }
    count.current += 1;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 메시지 변경 시 증가분에 user가 있는지로 판단(기존)
  useEffect(() => {
    const prevLen = prevLenRef.current;
    const added = messages.slice(prevLen);

    if (added.length > 0) {
      const hasNewUser = added.some((m) => m.role === "user");
      if (hasNewUser) {
        scrollToBottom(true); // 유저 메시지 추가 시 무조건 1번
      } else if (!chatLoadingThinking) {
        console.log("체킹");
        scrollToBottom(); // 어시스턴트 진행 중 + Thinking 아님 → 따라가기
      }
    }

    prevLenRef.current = messages.length;
  }, [messages, chatLoadingThinking]);

  // [추가] 마지막 어시스턴트 메시지 “내용 증가”도 따라가기 (길이가 안 늘면 기존 분기가 안 탑니다)
  useEffect(() => {
    // 마지막 어시스턴트 메시지 찾기
    const lastAssistant = [...messages]
      .reverse()
      .find((m) => m.role !== "user");
    if (!lastAssistant) return;

    const id = (lastAssistant as any).uuid ?? (lastAssistant as any).id ?? null;
    const text = getMessageText(lastAssistant);
    const len = text.length;

    // 메시지가 바뀌었으면 기준 길이 초기화
    if (id !== lastAssistantIdRef.current) {
      lastAssistantIdRef.current = id;
      lastAssistantLenRef.current = 0;
    }

    // 텍스트 길이가 증가했고, Thinking 상태가 아니라면 따라가기
    if (len > lastAssistantLenRef.current) {
      if (!chatLoadingThinking) {
        scrollToBottom(); // 스트리밍으로 내용만 변할 때도 스크롤
      }
      lastAssistantLenRef.current = len;
    }
  }, [messages, chatLoadingThinking]);

  // Thinking 종료 시 한 번 정리(기존)
  useEffect(() => {
    if (!chatLoadingThinking) {
      scrollToBottom(true);
    }
  }, [chatLoadingThinking]);

  // 전송 중 + Thinking 아님 → 하단 정렬(기존)
  useEffect(() => {
    if (isSending && !chatLoadingThinking) {
      scrollToBottom();
    }
  }, [isSending, chatLoadingThinking]);

  return (
    <div className="chatBox v-box flex-1">
      <div className="v-box flex-1">
        <Virtuoso
          data={messages}
          ref={virtuosoRef}
          totalCount={messages.length}
          rangeChanged={(range) => {
            isAtBottom.current = range.endIndex === messages.length - 1;
            setIsBottom(isAtBottom.current);
          }}
          itemContent={(index, msg) => {
            const isLast = index === messages.length - 1;
            return (
              <div
                key={msg.uuid}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                style={{
                  width: "950px",
                  marginLeft: "auto",
                  marginRight: "auto",
                  minHeight: `${isLast && isSending && "calc(100vh - 335px)"}`,
                }}
              >
                <Message
                  index={index}
                  role={msg.role}
                  content={msg.content}
                  thinking={msg.thinking}
                  onSelectedText={onSelectedText}
                  id={msg.id}
                  date={msg.date}
                  uuid={msg.uuid}
                  onDeleteMessage={onDeleteMessage}
                  onEditMessage={onEditMessage}
                  isEditing={TargetingIndex === index}
                  editContent={editContents?.[index] || ""}
                  onEditContentChange={onEditContentChange}
                  onEditSave={onEditSave}
                  onEditCancel={onEditCancel}
                  isLastMessageAndLoading={isLast}
                />
              </div>
            );
          }}
        />
      </div>
    </div>
  );
};

export default ChatArea;
