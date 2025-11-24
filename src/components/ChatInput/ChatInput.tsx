"use client";

import React, { useEffect, useRef, useState } from "react";
import { useChatManager } from "@/context/ChatManager";
import DEWSTooltip from "@/components/DEWSTooltip/DEWSTooltip";
// import LottieAnimation from "@/lottie/LottieAnimation";
import dynamic from "next/dynamic";
import dot_loading from "../../json/dot_loading.json";
import DEWSAlert from "@/components/DEWSAlert/DEWSAlert";

// SSR 비활성화하고 클라이언트에서만 로드
const LottieAnimation = dynamic(() => import("@/lottie/LottieAnimation"), {
  ssr: false,
  loading: () => <div style={{ width: 18, height: 18 }} />, // 로딩 중 대체 UI (선택)
});

const COMMAND_LIST = [
  {
    command: "/fix",
    description:
      "이전 AI 답변의 코드를 사용자의 요청에 맞춰 수정 및 생성 합니다.",
  },
  {
    command: "/refactoring",
    description:
      "이전 AI 답변의 코드를 리팩토링합니다. 사용자가 요청한 부분의 코드와 관련된 부분만을 리팩토링하여 답변을 출력합니다.",
  },
  {
    command: "/add",
    description:
      "이전 AI 답변의 코드를 사용자의 요청에 맞춰 수정 및 생성 합니다.",
  },
  {
    command: "/explain",
    description: "이전 AI 답변의 코드를 더욱더 자세히 설명합니다.",
  },
  {
    command: "/comment",
    description:
      "이전 AI 답변의 코드에 한줄 마다 주석을 추가합니다. 코드를 생략하지 마세요.",
  },
];

interface ChatInputProps {
  promtValue?: string;
  promptOnChange?: (value: string) => void;
  onSendMessage: (data: { text: string; files?: File[] }) => void;
  showSuggestions?: boolean;
  onCommandSelect?: (cmd: string) => void;
  isSending?: boolean;
  onFileDrop?: (files: File[]) => void;
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave?: (e: React.DragEvent<HTMLDivElement>) => void;
  onRemoveFile?: (fileName: string) => void;
  onDrop?: (e: React.DragEvent<HTMLDivElement>) => void;
  onFocusChange?: (focus: boolean) => void;
}

const ChatInput = ({
  isSending,
  onSendMessage,
  onFileDrop,
  onDragOver,
  onDragLeave,
  onRemoveFile,
  promtValue,
  promptOnChange,
  onDrop,
  onFocusChange,
}: ChatInputProps) => {
  const {
    streamCancle,
    chatLoadingAnalytic,
    chatLoadingGenerating,
    commandMessage,
    chatInputRef,
    notAllowed,
  } = useChatManager();
  const [isShowUploadOptions, setIsShowUploadOptions] = useState(false);
  const [value, setValue] = useState("");
  const [isHovering, setIsHovering] = useState(false);
  const [showCommandList, setShowCommandList] = useState(false);
  const [isNotAllowedExtension, setIsNotAllowedExtension] = useState(false);
  const [commands, setCommands] = useState(COMMAND_LIST);
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(-1);
  const prevCommandRef = useRef("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const focusOutRef = useRef<HTMLInputElement>(null);
  const uploadOptionsRef = useRef<HTMLDivElement>(null);
  const uploadButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!value.startsWith("/")) {
      if (showCommandList) {
        setShowCommandList(false); // 이미 true인 경우 false로 변경
      }
      return;
    }

    const command = value.toLowerCase().split(" ")[0];

    if (prevCommandRef.current !== command) {
      prevCommandRef.current = command;
      const commandDiscription = COMMAND_LIST.find(
        (cmd) => cmd.command === command,
      );

      if (commandDiscription) {
        const textdic = { [command]: commandDiscription.description };
        commandMessage(textdic);
      }
    }

    const query = value.slice(1).toLowerCase();
    const matched = COMMAND_LIST.filter((cmd) =>
      cmd.command.toLowerCase().includes(query),
    );

    const prevMatchedStr = JSON.stringify(commands);
    const newMatchedStr = JSON.stringify(matched);
    if (prevMatchedStr !== newMatchedStr) {
      setCommands(matched); // 추천 명령어 갱신
      setSelectedCommandIndex(0); // 리스트가 바뀌면 항상 첫 항목 선택
    }

    if (matched.length === 0) {
      setShowCommandList((prev) => !prev); // 추천 명령어가 없으면 숨김
    }

    if (value.startsWith("/") || !matched) {
      setShowCommandList(true);
    }
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      // chatInputRef.current?.focus();
      autoResizeTextarea();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const isInsideUpload = uploadOptionsRef.current?.contains(
        e.target as Node,
      );
      const isInsideButton = uploadButtonRef.current?.contains(
        e.target as Node,
      );
      if (!isInsideUpload && !isInsideButton) {
        setIsShowUploadOptions(false);
      }
    };

    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    if (promtValue !== undefined) {
      setValue(promtValue);
    }
  }, [promtValue]);

  const autoResizeTextarea = () => {
    const textarea = chatInputRef.current;
    if (textarea) {
      textarea.style.height = "auto"; // 높이 초기화
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  //test중인 코드
  const handleFileChangeEdit = (file: File) => {
    // uploadFile
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    if (localStorage.getItem("llm_type") !== "gpt4") {
      // GPT-4가 아닌 경우 파일 업로드 불가능
      // ("GPT-4 모델을 사용하지 않는 경우 파일 업로드가 불가능합니다.");
      setIsNotAllowedExtension(true);
      return;
    }
    onFileDrop?.(fileArray);
    e.target.value = "";
  };

  const handleSendClick = () => {
    if (isSending || value === "") return;
    onSendMessage({
      text: value,
    });
    setValue("");
    focusOutRef.current?.focus();
    setTimeout(() => {
      chatInputRef.current?.focus();
      autoResizeTextarea();
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showCommandList && commands.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedCommandIndex((prevIndex) =>
          prevIndex < commands.length - 1 ? prevIndex + 1 : 0,
        );
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedCommandIndex((prevIndex) =>
          prevIndex > 0 ? prevIndex - 1 : commands.length - 1,
        );
        return;
      }
      if (e.key === "Enter" && !e.shiftKey) {
        const selectedCmd = commands[selectedCommandIndex];
        if (selectedCmd) {
          e.preventDefault();
          setValue(selectedCmd.command + " ");
          setShowCommandList(false);
          return;
        }
      }
      if (e.key === "Escape") {
        setShowCommandList(false);
        return;
      }
    }

    // 메세지전송
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      if (isSending) return; // 전송 중이면 막기
      handleSendClick();
    }
  };

  return (
    <div
      className={"h-box"}
      onDrop={(e) => {
        e.preventDefault(); // 기본 동작 방지
        onDrop?.(e);
      }}
      onDragEnter={(e) => {
        e.preventDefault();
        onDragOver?.(e);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        onDragLeave?.(e);
      }}
      onDragOver={(e) => {
        e.preventDefault(); // 이거 없으면 drop 이벤트가 안 동작할 수도 있음
      }}
    >
      <div className={"posi_re v-box flex-1"}>
        {showCommandList && (
          <div
            className={"DEWSContextPop flex-1 v-box"}
            ref={uploadOptionsRef}
            style={{
              bottom: "105%",
              display: commands.length === 0 ? "none" : "",
            }}
          >
            <div className={"contextSel v-box"}>
              {commands.map((cmd, index) => (
                <div
                  key={cmd.command}
                  className={`selItem h-box v-align-center ${index === selectedCommandIndex ? "on" : ""}`}
                  style={{
                    backgroundColor:
                      index === selectedCommandIndex ? "#e6f0ff" : undefined,
                    borderRadius:
                      index === selectedCommandIndex ? "6px" : undefined,
                  }}
                  onMouseDown={() => {
                    setValue(cmd.command + " ");
                    setShowCommandList(false);
                  }}
                >
                  <div className={"txt"}>{cmd.command}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className={"h-box v-align-start"}>
          {/* 한글 입력 포커싱용 */}
          <input
            type="text"
            ref={focusOutRef}
            style={{
              position: "absolute",
              opacity: 0,
              height: 0,
              width: 0,
              pointerEvents: "none",
            }}
            tabIndex={-1}
          />
          <textarea
            ref={chatInputRef}
            className="flex-1"
            rows={1}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              autoResizeTextarea();
            }}
            onKeyDown={handleKeyDown}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onFocus={(e) => {
              // e.currentTarget.placeholder = "";
              onFocusChange?.(true);
            }}
            onBlur={(e) => {
              if (!value) {
                e.currentTarget.placeholder = "무엇이든 물어보세요.";
                onFocusChange?.(false);
              }
            }}
            // disabled={isSending || chatLoadingAnalytic || chatLoadingGenerating}
            placeholder={
              chatLoadingAnalytic
                ? "질문을 분석하고 있습니다."
                : chatLoadingGenerating
                  ? "답변을 생성하고 있습니다."
                  : isSending
                    ? "답변을 출력중입니다..."
                    : "무엇이든 물어보세요."
            }
            style={{
              resize: "none", // 사용자 수동 리사이즈 허용
              overflow: "auto", // 내용 넘치면 스크롤
              // minHeight: "60px", // 기본 최소 높이
              maxHeight: "150px", // 너무 커지는 것 방지
              fontFamily: "Pretendard, sans-serif",
              letterSpacing: "-0.5px",
            }}
          />
        </div>
        {/* 작성창 하단 버튼영역 */}
        <div
          className={`subFnBtns h-box v-align-center ${chatLoadingAnalytic || chatLoadingGenerating ? "disabled" : ""}`}
          ref={uploadButtonRef}
          style={{ height:"35px"}}
        >
          {/*{chatLoadingAnalytic || chatLoadingGenerating ? (*/}
          {/*  // 로딩일때*/}
          {/*  <>{!notAllowed && <div className="fnBtn add" />} </>*/}
          {/*) : (*/}
          {/*  // 기본*/}
          {/*  <>*/}
          {/*    {!notAllowed && (*/}
          {/*      <DEWSTooltip*/}
          {/*        className="fnBtn add"*/}
          {/*        labelText={"첨부파일 추가"}*/}
          {/*        position="bottom"*/}
          {/*        onMouseDown={(e) => {*/}
          {/*          e.stopPropagation();*/}
          {/*          if (window.localStorage.getItem("llm_type") === "gpt4") {*/}
          {/*            setIsShowUploadOptions((prev) => !prev);*/}
          {/*          } else {*/}
          {/*            setIsNotAllowedExtension(true);*/}
          {/*            if (fileInputRef.current) {*/}
          {/*              fileInputRef.current.files = null;*/}
          {/*              fileInputRef.current.value = "";*/}
          {/*            }*/}
          {/*          }*/}
          {/*        }}*/}
          {/*      />*/}
          {/*    )}*/}
          {/*  </>*/}
          {/*)}*/}
        </div>
        {/* 외부 파일 업로드 버튼영역 */}
        <div
          className="DEWSContextPop flex-1 v-box"
          style={{
            display: isShowUploadOptions ? "" : "none",
            bottom: "52px",
            left: "0px",
            width: "212px",
            height: "auto",
          }}
        >
          {/* 파일 첨부 기능 */}
          <ul className="dataFileSel">
            <li
              className="pc"
              onMouseDown={() => {
                handleFileClick();
                setIsShowUploadOptions(false);
              }}
            >
              <input
                type="file"
                hidden
                ref={fileInputRef}
                onChange={handleFileChange}
                multiple
                accept="image/*, .txt, .md, .pdf, .json, .java, .js, .ts, .html, .css, .c, .cpp, .py, yml, .yaml"
              />
              PC에서 선택
            </li>
            {/*<li className="onechamber" onClick={() => alert("아직 미구현")}>*/}
            {/*  ONECHAMBER에서 선택*/}
            {/*</li>*/}
          </ul>
        </div>
      </div>
      <div className="h-box v-align-end">
        {/* 보내기 버튼 */}

        {!chatLoadingAnalytic && !chatLoadingGenerating && (
          <DEWSTooltip
            labelText="보내기"
            className={`sendBtn ${value === "" ? "" : "on"} ${isSending ? "stopBtn" : ""}`}
            style={{
              display:
                chatLoadingAnalytic || chatLoadingGenerating ? "none" : "",
              // margin: notAllowed ? "0px" : "",
            }}
            position="top"
            onClick={isSending ? streamCancle : handleSendClick}
          />
        )}

        {chatLoadingAnalytic && (
          <div
            className="aiBtnLoading"
            style={{ display: chatLoadingAnalytic ? "" : "none" }}
          >
            <LottieAnimation
              loop={true}
              autoPlay={true}
              animationData={dot_loading}
              width={28}
              height={28}
            />
          </div>
        )}

        {chatLoadingGenerating && (
          <DEWSTooltip
            labelText="생성중지"
            className={`stopBtn`}
            style={{ display: chatLoadingGenerating ? "" : "none" }}
            position="top"
          />
        )}
      </div>
      <DEWSAlert
        type="warning"
        width="340px"
        text={
          <div>
            <p>GPT-OSS-120b 모델은</p>
            <p>파일 업로드 기능을 지원하지 않습니다.</p>
          </div>
        }
        // cancelBtn="취소"
        confirmBtn="확인"
        isOpen={isNotAllowedExtension}
        onConfirm={() => setIsNotAllowedExtension(false)}
      />
    </div>
  );
};

export default ChatInput;
