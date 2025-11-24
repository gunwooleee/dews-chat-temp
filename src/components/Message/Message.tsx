"use client";

import React, { MouseEventHandler, useEffect, useRef, useState } from "react";
import { MsgType, useChatManager } from "@/context/ChatManager";
import DEWSTooltip from "@/components/DEWSTooltip/DEWSTooltip";
import { useTheme } from "@/context/ThemeManager";
import LottieSkeleton from "@/lottie/LottieSkeleton";
import ic_analysis from "../../json/ic_analysis.json";
import dynamic from "next/dynamic";
// import LottieAnimation from "@/lottie/LottieAnimation";
import { MarkDown } from "@/components/Message/MarkDown";
import { createPortal } from "react-dom";
import Image from "next/image";
import ThinkingBlock from "@/components/Message/ThinkingBlock";
import { splitThinking } from "@/utils/chat/splitThinking";

import ic_codestorage_outlined_18_wh_enabled_2x_dark from "@/assets/images/dark/ic_codestorage_outlined_18_wh_enabled@2x.png";
import ic_codestorage_outlined_18_wh_enabled_2x from "@/assets/images/ico/ic_codestorage_outlined_18_wh_enabled@2x.png";
import DEWSSnackbar from "@/components/DEWSSnackbar/DEWSSnackbar";

// SSR 비활성화하고 클라이언트에서만 로드
const LottieAnimation = dynamic(() => import("@/lottie/LottieAnimation"), {
  ssr: false,
  loading: () => <div style={{ width: 18, height: 18 }} />, // 로딩 중 대체 UI (선택)
});

type MessageProps = MsgType & {
  index: number;
  onSelectedText?: (code: string, language?: string) => void;
  onDeleteMessage?: (index: number) => void;
  onEditMessage?: (index: number, content: string) => void;
  isEditing?: boolean;
  editContent?: string;
  onEditContentChange?: (index: number, value: string) => void;
  onEditSave?: (index: number) => void;
  onEditCancel?: () => void;
  isLastMessageAndLoading: boolean;
};

const Message = ({
  index,
  role,
  content,
  thinking,
  onSelectedText,
  onEditMessage,
  isEditing,
  editContent,
  onEditContentChange,
  onEditSave,
  onEditCancel,
  isLastMessageAndLoading,
}: MessageProps) => {
  const [selectedText, setSelectedText] = useState("");
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showCopyButton, setShowCopyButton] = useState(false);
  const [isSnackbarActive, setIsSnackbarActive] = useState(false);
  const [tempContent, setTempContent] = useState(editContent);
  const [isCodeStorage, setIsCodeStorage] = useState(false);
  const [isCodeCopied, setIsCodeCopied] = useState(false);
  const [textAreaWidth, setTextAreaWidth] = useState("auto");
  const { theme } = useTheme();
  const textRef = useRef<HTMLDivElement>(null);
  const copyButtonRef = useRef<HTMLParagraphElement>(null);
  const { chatLoadingAnalytic, chatLoadingGenerating, chatLoadingThinking } =
    useChatManager();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const showCopyButtonRef = useRef(showCopyButton);

  useEffect(() => {
    showCopyButtonRef.current = showCopyButton;
  }, [showCopyButton]);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      const selection = window.getSelection();
      const selected = selection?.toString() || "";
      const isInside = textRef.current?.contains(e.target as Node);

      if (isInside && selected) {
        e.preventDefault();
        setSelectedText(selected);
        setTooltipPosition({ x: e.clientX, y: e.clientY });
        setShowCopyButton(true);
      } else {
        setShowCopyButton(false);
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 2) return;
      setTimeout(() => {
        const target = e.target as Node;
        const insideText = textRef.current?.contains(target) ?? false;
        const insideButton = copyButtonRef.current?.contains(target) ?? false;

        if (!insideButton && !insideText) {
          setTimeout(() => {
            setShowCopyButton(false);
          }, 100);
        }
        if (insideText && !insideButton) {
          setShowCopyButton(false);
        }
      }, 0);
    };
    const handleScroll = () => {
      setShowCopyButton(false);
      setSelectedText("");
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (isEditing && textAreaRef.current) {
      const ta = textAreaRef.current;
      ta.style.height = "auto";
      const clampedWidth = Math.max(220, Math.min(ta.scrollWidth, 700));
      const newHeight = ta.scrollHeight;
      setTextAreaWidth(`${clampedWidth}px`);
      ta.style.height = `${newHeight}px`;
    }
  }, [isEditing, editContent]);

  const isArrayContent = Array.isArray(content);

  const textOnly = isArrayContent
    ? (content as { type: string; text?: string }[]).find(
        (c) => c.type === "text",
      )?.text || ""
    : (content as string);

  const images = isArrayContent
    ? (content as { type: string; image_url?: { url: string } }[])
        .filter((c) => c.type === "image_url")
        .map((c) => c.image_url?.url || "")
    : [];

  const filenames = isArrayContent
    ? (content as { type: string; text?: string }[])
        .slice(1)
        .map((c) => c.text || "")
        .map((text) => {
          const match = text.match(/파일명\s*:\s*(\S+\.json)/);
          return match ? match[1] : null;
        })
        .filter((name): name is string => !!name)
    : [];

  const handleEditClick = () => onEditMessage?.(index, textOnly);
  const handleCopyClickSendBlock: MouseEventHandler = (e) => {
    e.preventDefault();
    if (isSnackbarActive) return;

    const selection = window.getSelection();
    const range =
      selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
    if (selectedText && onSelectedText) {
      onSelectedText(selectedText);
    }
    setIsCodeStorage(true);

    if (range) {
      setTimeout(() => {
        const sel = window.getSelection();
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }, 0);
    }
    setShowCopyButton(false);
  };
  const handleCopyClick = () => {
    if (textOnly) {
      navigator.clipboard
        .writeText(textOnly)
        .then(() => setIsCodeCopied(true))
        .catch((err) => console.error("복사 실패:", err));
    }
  };

  // THINKING 블록 분리
  const thinkingText = splitThinking(thinking || "");
  return (
    <>
      {role !== "user" ? (
        <div className="chatMessageWrap ai v-box">
          <div className="aiProfile"></div>
          <div className="chatMessage" style={{ width: "100%" }}>
            <div ref={textRef} className="message">
              {chatLoadingAnalytic && isLastMessageAndLoading && (
                <>
                  <div className="message">질문을 분석 중입니다.</div>
                  <div className="ml10">
                    <LottieAnimation
                      loop={true}
                      autoPlay={true}
                      animationData={ic_analysis}
                      width={24}
                      height={24}
                    />
                  </div>
                </>
              )}
              {isLastMessageAndLoading && chatLoadingGenerating && (
                <>
                  <div className="message">답변을 생성 중입니다.</div>
                  <div className="mt12">
                    <LottieSkeleton
                      width="100%"
                      style={{ padding: "0", maxWidth: "950px" }}
                    />
                  </div>
                </>
              )}

              {/* THINKING 블록 노출 (접힘/펼침) */}
              {thinking && (
                <div style={{ marginBottom: "12px" }}>
                  <ThinkingBlock
                    text={thinking}
                    // defaultCollapsed={!isLastMessageAndLoading}
                    defaultCollapsed={true}
                    isStreaming={chatLoadingThinking && isLastMessageAndLoading}
                  />
                </div>
              )}

              {/* 본문 답변 렌더링 (THINKING 제거된 텍스트) */}
              <MarkDown text={textOnly} onSelectedText={onSelectedText} />
            </div>
          </div>

          {showCopyButton &&
            createPortal(
              <div className={`markdownText h-box`}>
                <p
                  ref={copyButtonRef}
                  data-tooltip-button="true"
                  onMouseDown={handleCopyClickSendBlock}
                  style={{
                    position: "fixed",
                    top: tooltipPosition.y - 25,
                    left: tooltipPosition.x,
                    zIndex: 1000,
                    fontSize: "14px",
                    color: "#fff",
                    backgroundColor: "#333",
                  }}
                >
                  {theme === "darkTheme" ? (
                    <Image
                      src={ic_codestorage_outlined_18_wh_enabled_2x_dark}
                      alt=""
                      width={18}
                      height={18}
                    />
                  ) : (
                    <Image
                      src={ic_codestorage_outlined_18_wh_enabled_2x}
                      alt=""
                      width={18}
                      height={18}
                    />
                  )}
                  코드 보관
                </p>
              </div>,
              document.body,
            )}
        </div>
      ) : (
        <div className="chatMessageWrap user h-box">
          <div className="w100per h-box v-align-center">
            <div className="chatBtn h-box flex-1">
              <DEWSTooltip
                className="btnIco copy"
                labelText={"복사"}
                position="bottom"
                onClick={handleCopyClick}
              />
              <DEWSTooltip
                className="btnIco modify"
                labelText={"수정"}
                position="bottom"
                onClick={handleEditClick}
              />
            </div>
          </div>
          <div className="chatMessage" style={{ width: "auto" }}>
            {isEditing ? (
              <div
                className="DEWSTextFieldIcon"
                style={{ display: "inline-block", width: "auto" }}
              >
                <textarea
                  ref={textAreaRef}
                  value={editContent}
                  className={`DEWSTextField check editBox`}
                  placeholder="수정할 내용을 입력하세요"
                  onChange={(e) => {
                    onEditContentChange?.(index, e.target.value);
                  }}
                  wrap="off"
                  style={{
                    fontFamily: "Pretendard",
                    fontSize: "14px",
                    resize: "none",
                    overflow: "hidden",
                    minWidth: "220px",
                    maxWidth: "700px",
                    width: textAreaWidth,
                    display: "inline-block",
                    whiteSpace: "pre-wrap",
                  }}
                />

                <div
                  className="ico check"
                  style={{ right: "36px" }}
                  onClick={() => {
                    onEditSave?.(index);
                    onEditCancel?.();
                  }}
                />

                <div
                  className="ico close"
                  onClick={() => {
                    setTempContent(editContent);
                    onEditCancel?.();
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                />
              </div>
            ) : (
              <div className="message">
                {images.length > 0 && (
                  <div className="message" style={{ paddingBottom: "1em" }}>
                    <img
                      src={images[0]}
                      alt=""
                      style={{ maxWidth: "100%", borderRadius: "8px" }}
                    />
                  </div>
                )}
                <pre
                  style={{
                    all: "unset",
                    whiteSpace: "pre-wrap",
                    fontFamily: "Pretendard",
                  }}
                >
                  {filenames &&
                    filenames.map((name, idx) => (
                      <div key={idx}>
                        첨부된 파일 :{name}
                        <br />
                      </div>
                    ))}
                  {textOnly}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
      <DEWSSnackbar
        type="success"
        text="보관되었습니다."
        moveLink={`../history`}
        moveText={"코드 보관함"}
        snackbar={isCodeStorage}
        onClose={() => setIsCodeStorage(false)}
        onShowChange={(visible) => setIsSnackbarActive(visible)}
      />
      <DEWSSnackbar
        type="success"
        text="복사되었습니다."
        snackbar={isCodeCopied}
        onClose={() => setIsCodeCopied(false)}
        onShowChange={(visible) => setIsSnackbarActive(visible)}
      />
    </>
  );
};

export default Message;
