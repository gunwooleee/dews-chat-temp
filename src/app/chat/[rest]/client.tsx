"use client";

import React, { Fragment, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeManager";
import uuid from "react-uuid";
import { useChatManager } from "@/context/ChatManager";
import ChatInput from "@/components/ChatInput/ChatInput";
import DEWSTooltip from "@/components/DEWSTooltip/DEWSTooltip";
import DEWSSnackbar from "@/components/DEWSSnackbar/DEWSSnackbar";
import UploadItem from "@/components/UploadItem/UploadItem";
import ModelSelection from "@/components/ModelSelection/ModelSelection";
import PromptItem from "@/components/PromptItem/PromptItem";
import DEWSAlert from "@/components/DEWSAlert/DEWSAlert";
import useIsMobile from "@/hooks/useIsMobile";
// import LottieAnimation from "@/lottie/LottieAnimation";
import animationDataStart from "../../../assets/animations/genai_intro_start.json";
import animationBlackDataStart from "../../../assets/animations/genai_intro_black_start.json";
import ic_doc_check_star_filled_24_2x from "@/assets/images/ico/ic_doc_check_star_filled_24@2x.png";
import ic_doc_search_filled_24_2x from "@/assets/images/ico/ic_doc_search_filled_24@2x.png";
import lg_dnx from "@/assets/images/ico/lg-sbjdnx@2x.png";
import lg_dnx_dark from "@/assets/images/dark/lg-sbjdnx@2x.png";
import Image from "next/image";

// LottieAnimation 을 브라우저에서만 로드 (SSR 비활성화)
const LottieAnimation = dynamic(() => import("@/lottie/LottieAnimation"), {
  ssr: false,
});


const ChatWindow = () => {
  const { theme } = useTheme();
  const router = useRouter();
  const isMobile = useIsMobile();
  const {
    sendMessage,
    setRoomId,
    clearChatMessages,
    isSending,
    dragOn,
    setDragOn,
    sidebarIsOpen,
    setSidebarIsOpen,
    ChatType,
    changeSystemMessage,
    notAllowed,
    changeModel,
    llmModel,
  } = useChatManager();
  const [inputPrompt, setInputPrompt] = useState("");
  const [snackbar, setSnackbar] = useState(false);
  const [chatFocus, setChatFocus] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [isNotAllowedExtension, setIsNotAllowedExtension] = useState(false);
  const [isNotAllowedModel, setIsNotAllowedModel] = useState(false);
  const [isNotAllowedModelConfirm, setIsNotAllowedModelConfirm] = // 취소/확인 이 있는...
    useState(false);
  const [isNotAllowedFileSize, setIsNotAllowedFileSize] = useState(false);
  const [isNotAllowedFileCount, setIsNotAllowedFileCount] = useState(false);
  // const modelType = localStorage.getItem("llm_type") || "gpt4";
  // const [modelType, setModelType] = useState("gpt4");

  // userDetail
  // userId 관계키
  // detail: {
  //   temperature: 0.7,
  //   top_p: 1,
  //   llm_type: "gpt4",
  // }
  useEffect(() => {
    sessionStorage.setItem("beforePage", window.location.href);
    clearChatMessages();
    setRoomId("");
  }, []);

  useEffect(() => {
    if (llmModel !== "gpt4" && uploadFiles.length > 0) {
      setIsNotAllowedModelConfirm(true);
      setDragOn(false);
    }
  }, [llmModel]);

  useEffect(() => {
    if (llmModel !== "gpt4" && uploadFiles.length > 0) {
      setIsNotAllowedModel(true);
      setDragOn(false);
    }
  }, [uploadFiles]);

  const handleSend = async ({ text }: { text: string }) => {
    const roomId = uuid();
    clearChatMessages();
    sendMessage({
      text: text,
      roomId: roomId,
      files: uploadFiles,
    });
    setInputPrompt("");
    setUploadFiles([]);
    router.push(`/chat/${ChatType}/c/${roomId}`);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (notAllowed) {
      setDragOn(false);
      return;
    }
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
    setDragOn(false); // 드래그 종료
  };

  // 업로드 파일 삭제
  const handleRemoveFile = (name: string) => {
    setUploadFiles((prev) => prev.filter((f) => f.name !== name));
  };

  // 업로드할때 드래그 on
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOn(true);
  };

  // 업로드할때 드래그 off
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOn(false);
  };

  // 드래그 핸들러
  const addFiles = (files: File[]) => {
    const newUploadFiles = Array.from(files).map((file) => ({
      file,
      name: file.name,
      ext: file.name.split(".").pop() || "",
      status: "uploading", // 또는 'success', 'uploading'
    }));
    const imageFiles = files.filter((file) =>
      ["image/png", "image/jpeg", "image/jpg", "image/gif"].includes(file.type),
    );
    // GPT-4가 아닌 경우 이미지 업로드 제한
    if (localStorage.getItem("llm_type") !== "gpt4" && imageFiles.length > 0) {
      setIsNotAllowedModel(true);
      setDragOn(false);
      return;
    }

    // png, pdf, png 이외의 확장자 파일은 거부해야함
    const allowedExtensions = [
      "png",
      "pdf",
      "jpg",
      "jpeg",
      "json",
      "txt",
      "js",
      "jsx",
      "ts",
      "tsx",
      "html",
      "css",
      "scss",
      "md",
      "xml",
    ];
    const hasInvalidExtension = files.some(
      (file) =>
        !allowedExtensions.includes(
          file.name.split(".").pop()?.toLowerCase() || "",
        ),
    );
    if (hasInvalidExtension) {
      setIsNotAllowedExtension(true);
      setDragOn(false);
      return;
    }
    // pdf 파일의 경우, 5mb 이하로 제한
    const pdfFiles = files.filter((file) => file.type === "application/pdf");
    const isPdfTooLarge = pdfFiles.some((file) => file.size > 5 * 1024 * 1024); // 5MB
    if (isPdfTooLarge) {
      setIsNotAllowedFileSize(true);
      setDragOn(false);
      return;
    }
    //업로드 개수 5개 제한
    if (uploadFiles.length + files.length > 5) {
      setIsNotAllowedFileCount(true);
      return;
    }

    setUploadFiles((prev) => [...prev, ...files]);
  };

  const promptData: Record<
    | "dnx"
    | "dnxflow"
    | "default",
    {
      icon: any;
      text: string;
      inputPrompt: string;
      system_message?: string;
    }[]
  > = {
    dnx: [
      {
        icon: ic_doc_check_star_filled_24_2x,
        text: "이 챗봇은 어떻게 활용하나요?",
        inputPrompt: "이 챗봇은 어떻게 활용하나요?",
        system_message:
          "이 챗봇은 어떻게 활용하나요? 라는 질문이 들어오면 아래 정보를 바탕으로 풍성하게 답변을 해줘==> 이 챗봇은 SBJ 데이터를 기반으로 답변합니다.\n\n 사용 할 수 있는 기능으로는, /(명령어)기능, 드래그앤 드롭 업로드, 파일 첨부, 코드 생성, 코드 보관함이 있습니다. 이미지 첨부를 통한 코드 생성도 지원합니다. \n\n SBJ 의 컴포넌트 정보를 활용하여 다양한 코드의 질문을 답변하고, 코드 보관함에 저장할 수 있습니다. 또한, 코드 생성 및 수정 요청을 처리합니다.",
      },
      {
        icon: ic_doc_search_filled_24_2x,
        text: "DatePicker 사용방법 설명해주세요.",
        inputPrompt: "DatePicker 사용방법 설명해주세요.",
      },
    ],
    dnxflow: [
      {
        icon: ic_doc_check_star_filled_24_2x,
        text: "이 챗봇은 어떻게 활용하나요?",
        inputPrompt: "이 챗봇은 어떻게 활용하나요?",
        system_message:
          "이 챗봇은 어떻게 활용하나요? 라는 질문이 들어오면 아래 정보를 바탕으로 풍성하게 답변을 해줘==> 이 챗봇은 SBJ 데이터를 기반으로 답변합니다.\n\n 사용 할 수 있는 기능으로는, /(명령어)기능, 드래그앤 드롭 업로드, 파일 첨부, 코드 생성, 코드 보관함이 있습니다. 이미지 첨부를 통한 코드 생성도 지원합니다. \n\n SBJ 의 컴포넌트 정보를 활용하여 다양한 코드의 질문을 답변하고, 코드 보관함에 저장할 수 있습니다. 또한, 코드 생성 및 수정 요청을 처리합니다.",
      },
      {
        icon: ic_doc_search_filled_24_2x,
        text: "DatePicker 사용방법 설명해주세요.",
        inputPrompt: "DatePicker 사용방법 설명해주세요.",
      },
    ],
    default: [
      {
        icon: ic_doc_check_star_filled_24_2x,
        text: "AI 기능에 대해 무엇이든 물어보세요!",
        inputPrompt: "AI 기능에 대해 무엇이든 물어보세요!",
      },
      {
        icon: ic_doc_search_filled_24_2x,
        text: "무엇을 도와드릴까요?",
        inputPrompt: "무엇을 도와드릴까요?",
      },
    ],
  };

  const logoData: Record<
    | "dnx"
    | "dnxflow"
    | "default",
    {
      dark: { icon: any; width: number; height: number };
      light: { icon: any; width: number; height: number };
    }
  > = {
    dnx: {
      dark: { icon: lg_dnx_dark, width: 125, height: 33 },
      light: { icon: lg_dnx, width: 125, height: 33 },
    },
    dnxflow: {
      dark: { icon: lg_dnx_dark, width: 125, height: 33 },
      light: { icon: lg_dnx, width: 125, height: 33 },
    },
    default: {
      dark: { icon: lg_dnx_dark, width: 155, height: 33 },
      light: { icon: lg_dnx, width: 155, height: 33 },
    },
  };

  return (
    <>
      {!sidebarIsOpen && !isMobile && (
        <DEWSTooltip labelText={"열기"} position="bottom">
          <div className="foldingWrap">
            <button
              className={`DEWSTooltip btnIco folding`}
              onClick={() => setSidebarIsOpen(!sidebarIsOpen)}
            />
          </div>
        </DEWSTooltip>
      )}
      {/* 모델선택 */}
      {!isMobile && (
        <>
          {/* 챗 타입별로 logoData 랜더링 */}
          <div className={`wrapper-logo-line`}>
            <div className={`wrapper-logo-line`}>
              <div
                className={`modelSel h-box v-align-center`}
                style={{
                  marginLeft: sidebarIsOpen ? "-12px" : "37px",
                }}
                onClick={() => router.push(`/chat/${ChatType}`)}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <Image
                  src={
                    logoData[ChatType]?.[
                      theme === "darkTheme" ? "dark" : "light"
                    ].icon.src
                  }
                  alt=""
                  width={
                    logoData[ChatType]?.[
                      theme === "darkTheme" ? "dark" : "light"
                    ].width
                  }
                  height={
                    logoData[ChatType]?.[
                      theme === "darkTheme" ? "dark" : "light"
                    ].height
                  }
                />
              </div>
              <div className={"Line-77"}></div>
            </div>

            <ModelSelection />
            <div className="viewSell h-box v-align-center">
              <div
                className="btn chat h-box v-align-center on"
                onClick={() => router.push(`/chat/${ChatType}`)}
              >
                <div className="ico"></div>
                <div className="txt">대화</div>
              </div>
              <div
                className="btn code h-box v-align-center"
                onClick={() => router.push(`/chat/${ChatType}/history`)}
              >
                <div className="ico"></div>
                <div className="txt">코드 보관함</div>
              </div>
            </div>
          </div>
        </>
      )}

      {/*헤더영역*/}
      <div className={"mainChat flex-1 v-box"}>
        <div className={`flex-1 v-box flex-center`}>
          <div
            className="infoBox v-box v-align-center"
            style={{ width: "950px", marginLeft: "auto", marginRight: "auto" }}
          >
            {theme === "darkTheme" ? (
              <LottieAnimation
                key="dark"
                className={"visualImg"}
                animationData={animationBlackDataStart}
                autoplay={true}
                loop={true}
                width={450}
              />
            ) : (
              <LottieAnimation
                key="light"
                className={"visualImg"}
                animationData={animationDataStart}
                autoplay={true}
                loop={true}
                width={450}
              />
            )}
          </div>
          {/* 입력 영역 */}
          <div
            className={`genAiDewsTextBox v-box ${chatFocus ? "on" : ""} ${dragOn ? "dragOn" : ""}`}
            style={{
              // width: "clamp(450px, 950px, 100%)",
              width: "950px",
              // minHeight: "138px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
            onMouseUp={() => setChatFocus(true)}
            onBlur={() => setChatFocus(false)}
          >
            {/* 첨부된 파일 영역*/}
            {uploadFiles.length > 0 && (
              <div className={"posi_re fileListBox h-box v-align-center"}>
                {uploadFiles &&
                  uploadFiles.map((file) => (
                    <UploadItem
                      key={file.name}
                      name={file.name}
                      status={"success"}
                      ext={file.type}
                      // status={file.status as any}
                      onRemove={(name) =>
                        setUploadFiles((prev) =>
                          prev.filter((f) => f.name !== name),
                        )
                      }
                    />
                  ))}
              </div>
            )}
            {/* 작성창*/}
            <ChatInput
              promtValue={inputPrompt}
              onSendMessage={handleSend}
              isSending={isSending}
              onRemoveFile={handleRemoveFile}
              onFileDrop={addFiles}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onFocusChange={setChatFocus}
            />
          </div>

          {!isMobile && (
            <div
              className="promptBox v-box"
              style={{
                width: "950px",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              <div className="h-box">
                <div className="title h-box v-align-center">추천 프롬프트</div>
              </div>
              <div className="promptList v-box">
                {(promptData[ChatType] ?? promptData["default"]).map(
                  (item, idx) => (
                    <PromptItem
                      key={idx}
                      icon={item.icon}
                      text={item.text}
                      onClick={() => {
                        setInputPrompt("");
                        setTimeout(() => {
                          setInputPrompt(item.inputPrompt);
                          changeSystemMessage(item.system_message ?? "");
                        }, 0);
                      }}
                    />
                  ),
                )}
              </div>
            </div>
          )}

          <DEWSSnackbar
            type="success"
            text={
              <div className="h-box v-align-center">
                <div className="text mr10">보관되었습니다.</div>
                <div className="btnType01">보관함으로 이동</div>
              </div>
            }
            snackbar={snackbar}
            onClose={() => setSnackbar(false)}
          />
        </div>
        {dragOn && <div className="blurDim" />}
        {/* 알림 문구 */}

        <div
          className="footText v-box v-align-center"
          style={{ width: "950px", marginLeft: "auto", marginRight: "auto" }}
        >
          AI가 제공하는 정보는 부정확한 정보를 포함할 수 있으니 반드시 검토 후
          활용하세요.
        </div>
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
        cancelBtn="취소"
        confirmBtn="확인"
        isOpen={isNotAllowedModelConfirm}
        handleAlertClose={() => {
          changeModel("gpt4");
          setIsNotAllowedModelConfirm(false);
        }}
        onConfirm={() => {
          changeModel(llmModel);
          setUploadFiles([]);
          setIsNotAllowedModelConfirm(false);
        }}
      />
      <DEWSAlert
        type="warning"
        width="340px"
        text={
          <div>
            <p>GPT-OSS-120b 모델은</p>
            <p>파일 업로드 기능을 지원하지 않습니다.</p>
          </div>
        }
        confirmBtn="확인"
        isOpen={isNotAllowedModel}
        onConfirm={() => {
          changeModel(llmModel);
          setUploadFiles([]);
          setIsNotAllowedModel(false);
        }}
      />
      <DEWSAlert
        type="warning"
        width="340px"
        text={
          <div>
            <strong>허용된 확장자만 업로드 가능합니다.</strong>
            <p></p>
          </div>
        }
        confirmBtn="확인"
        isOpen={isNotAllowedExtension}
        onConfirm={() => setIsNotAllowedExtension(false)}
      />
      <DEWSAlert
        type="warning"
        width="340px"
        text={
          <div>
            <strong>파일 사이즈는 5MB 이하만 가능합니다.</strong>
            <p></p>
          </div>
        }
        confirmBtn="확인"
        isOpen={isNotAllowedFileSize}
        onConfirm={() => setIsNotAllowedFileSize(false)}
      />
      <DEWSAlert
        type="warning"
        width="340px"
        text={
          <div>
            <strong>첨부파일은 최대 5개까지 가능합니다.</strong>
            <p></p>
          </div>
        }
        // cancelBtn="취소"
        confirmBtn="확인"
        isOpen={isNotAllowedFileCount}
        onConfirm={() => setIsNotAllowedFileCount(false)}
      />
    </>
  );
};

export default ChatWindow;
