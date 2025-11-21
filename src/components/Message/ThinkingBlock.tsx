"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import { MarkDown } from "@/components/Message/MarkDown";
import ic_chev_down_outlined_14_bk_enabled from "@/assets/images/dark/ic_chev_down_outlined_12_bgr_enabled@2x.png";
import ic_chev_up_outlined_14_bk_enabled from "@/assets/images/dark/ic_chev_up_outlined_12_bgr_enabled@2x.png";
import Image from "next/image";
import { formatThinking } from "@/utils/chat/formatThinking";
import { useStreamingTimer } from "@/utils/chat/useStreamingTimer";

type ThinkingBlockMode = "streaming" | "final" | "loaded";

type ThinkingBlockProps = {
  text: string;
  defaultCollapsed?: boolean;
  isStreaming?: boolean; // 스트리밍 진행 여부
  mode?: ThinkingBlockMode,
};

const ThinkingBlock = ({
  text,
  defaultCollapsed = false,
  isStreaming = true,

}: ThinkingBlockProps) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const displayText = useMemo(() => formatThinking(text), [text]);

  // defaultCollapsed 변경 시 동기화
  useEffect(() => {
    setCollapsed(defaultCollapsed);
  }, [defaultCollapsed]);

  const { elapsedSec, finalSec } = useStreamingTimer({
    isActive: !!isStreaming,
  });
  const headerTitle = isStreaming ? "생각 중..." : `${finalSec}초 동안 생각함`;

  return (
    <div
      style={{
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      <style>
        {`
          @keyframes tb-spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>

      <button
        type="button"
        onClick={() => setCollapsed((v) => !v)}
        style={{
          // width: "100%",
          textAlign: "left",
          // padding: "8px 12px",
          // background: "#fafafa",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 15,
          // color: "#374151",
          color: "#a7adb8",
        }}
      >
        <span
          style={{
            display: isStreaming ? "inline-block" : "none",
            width: 12,
            height: 12,
            borderStyle: "solid",
            borderWidth: isStreaming ? 2 : 0,
            borderTopColor: "#10b981",
            borderLeftColor: "#10b981",
            borderRightColor: "transparent",
            borderBottomColor: "transparent",
            borderRadius: "50%",
            // background: isStreaming ? "#10b981" : "#9ca3af",
            animation: isStreaming ? "tb-spin 0.75s linear infinite" : "none",
          }}
        />
        <span style={{ fontWeight: 600 }}>{headerTitle}</span>

        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            color: "#6b7280",
            fontSize: 12,
            marginLeft: "auto",
          }}
        >
          <span style={{ fontWeight: 600 }}>
            {collapsed ? (
              <Image
                src={ic_chev_down_outlined_14_bk_enabled}
                alt=""
                width={18}
                height={18}
              />
            ) : (
              <Image
                src={ic_chev_up_outlined_14_bk_enabled}
                alt=""
                width={18}
                height={18}
              />
            )}
          </span>
        </span>
      </button>

      {!collapsed && (
        <div
          style={{
            padding: "10px 12px",
            borderLeft: "2px solid #e5e7eb",
            wordBreak: "break-word",
          }}
        >
          <MarkDown text={displayText} />
        </div>
      )}
    </div>
  );
};

export default ThinkingBlock;
