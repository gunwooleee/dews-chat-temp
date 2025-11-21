"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import ChatInput from "@/components/ChatInput/ChatInput";
import ChatArea from "@/components/ChatArea";
import uuid from "react-uuid";
import { Code, useChatManager } from "@/context/ChatManager";
import DEWSTooltip from "@/components/DEWSTooltip/DEWSTooltip";
import ModelSelection from "@/components/ModelSelection/ModelSelection";
import UploadItem from "@/components/UploadItem/UploadItem";
import DEWSAlert from "@/components/DEWSAlert/DEWSAlert";
import useIsMobile from "@/hooks/useIsMobile";
import ico_del_normal_2x from "@/assets/images/ico/ico_del_normal@2x.png";
import Image from "next/image";
import lg_dnx from "@/assets/images/ico/lg-sbjdnx@2x.png";
import lg_dnx_dark from "@/assets/images/dark/lg-sbjdnx@2x.png";
import { useTheme } from "@/context/ThemeManager";

export default function ChatPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  const {
    chatMessages,
    deleteMessage,
    sendMessage,
    getRoomMessages,
    addCode,
    isSending,
    sidebarIsOpen,
    setSidebarIsOpen,
    ChatType,
    EditSendMessage,
    dragOn,
    setDragOn,
    notAllowed,
    changeModel,
    streamCancle,
    llmModel,
  } = useChatManager();
  const [inputValue, setInputValue] = useState<string>("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isCodeSaved, setIsCodeSaved] = useState(false); // 코드 조각 저장 성공 상태
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editContents, setEditContents] = useState<{ [index: number]: string }>(
    {},
  );
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [isNotAllowedExtension, setIsNotAllowedExtension] = useState(false);
  const [isNotAllowedModel, setIsNotAllowedModel] = useState(false); // 취소가 없이 화면만 있는...
  const [isNotAllowedModelConfirm, setIsNotAllowedModelConfirm] = // 취소/확인 이 있는...
    useState(false);
  const [isNotAllowedFileSize, setIsNotAllowedFileSize] = useState(false);
  const [isNotAllowedFileCount, setIsNotAllowedFileCount] = useState(false);
  const [isPopSate, setIsPopState] = useState(false);
  const [chatFocus, setChatFocus] = useState(false);
  const [pendingNavigationPath, setPendingNavigationPath] = useState<
    string | null
  >(null);
  // const [modelType, setModelType] = useState("gpt4");

  // const modelType = localStorage.getItem("llm_type") || "gpt4";

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

  useEffect(() => {
    sessionStorage.setItem("beforePage", window.location.href);
    const _roomId = window.location.pathname.split("/").pop() ?? "";
    getRoomMessages(_roomId);
    if (chatMessages.length === 0) {
    }
  }, []);

  const handleStreamCancel = () => {
    const getBeforePage = sessionStorage.getItem("beforePage");
    setIsPopState(false);
    streamCancle();

    if (getBeforePage) {
      router.push(getBeforePage);
      setPendingNavigationPath(null);
    }
  };

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
  // 메시지 재구성 string 으로 오는거 배열로
  // const restructuredMessages = chatMessages.map((message) => {
  //   // 메시지 타입이 string 인 경우, 배열로 변환
  //   if (typeof message.content === "string" && message.role === "user") {
  //     return {
  //       ...message,
  //       content: message.content,
  //     };
  //   }
  //   // 이미 배열인 경우 그대로 반환
  //   return message;
  // });
  // console.log("restructuredMessages", restructuredMessages);

  // 업로드 파일 삭제
  const handleRemoveFile = (name: string) => {
    setUploadFiles((prev) => prev.filter((f) => f.name !== name));
    // console.log("uploadFiles", uploadFiles);
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

  const addFiles = (files: File[]) => {
    // const newUploadFiles = Array.from(files).map((file) => ({
    //   file,
    //   name: file.name,
    //   ext: file.name.split(".").pop() || "",
    //   status: "uploading", // 또는 'success', 'uploading'
    // }));

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

  // 드래그 핸들러
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

  const handleCommandClick = (cmd: string) => {
    setInputValue(cmd + " ");
    setShowSuggestions(false);
  };

  const handleSelectedCode = (code: string, language?: string) => {
    const roomId = window.location.pathname.split("/").pop() ?? "";
    const fetchSelectedMessages = async () => {
      try {
        const codeId = uuid();
        const selectedCode: Code = {
          code_id: codeId,
          content: code, // 전달된 코드 내용
          created_at: "",
          language: language ?? "미분류",
          room_id: roomId, // 현재 roomId 사용
          room_name: "새 채팅방", // room_name 추가
        };
        const res = addCode(selectedCode);
        console.log("코드 조각 저장 성공", res);
        setIsCodeSaved(true); // 코드 조각 저장 성공 상태 업데이트
        setTimeout(() => {
          setIsCodeSaved(false);
        }, 2000);
      } catch (error) {
        console.error("코드 조각 저장 실패", error);
      }
    };
    fetchSelectedMessages();
  };

  const handleDeleteMessage = (index: number) => {
    const roomId = window.location.pathname.split("/").pop() ?? "";
    deleteMessage(index, roomId);
  };

  const handleEditMessage = (index: number, content: string) => {
    setEditingIndex(index);
    setEditContents((prev) => ({
      ...prev,
      [index]: content,
    }));
  };

  const handleEditContentChange = (index: number, value: string) => {
    setEditContents((prev) => ({
      ...prev,
      [index]: value,
    }));
  };

  const handleEditSave = (index: number) => {
    const roomId = window.location.pathname.split("/").pop() ?? "";
    const updatedMessage = editContents[index];
    console.log(updatedMessage);
    const data = {
      text: updatedMessage,
      files: [],
      roomId: roomId,
    };
    EditSendMessage(index, roomId, data);
    setEditingIndex(null);
  };

  const handleEditCancel = () => {
    setEditContents((prev) => ({}));
    setEditingIndex(null);
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
      {!isMobile && (
        <>
          <div className={`wrapper-logo-line`}>
            <div
              className={`modelSel h-box v-align-center`}
              style={{
                marginLeft: sidebarIsOpen ? "-12px" : "37px",
              }}
              onClick={() => router.push(`/chat/${ChatType}`)}
              // 호버 배경화면 없게
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <Image
                src={
                  logoData[ChatType]?.[theme === "darkTheme" ? "dark" : "light"]
                    .icon.src
                }
                alt=""
                width={
                  logoData[ChatType]?.[theme === "darkTheme" ? "dark" : "light"]
                    .width
                }
                height={
                  logoData[ChatType]?.[theme === "darkTheme" ? "dark" : "light"]
                    .height
                }
              />
            </div>
            <div className={`Line-77`}></div>
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

      <div className="mainChat flex-1 v-box" style={{ padding: 0, margin: 0 }}>
        <div className={`flex-1 v-box`}>
          <ChatArea
            messages={chatMessages ?? [{}]}
            onSelectedText={handleSelectedCode}
            onDeleteMessage={handleDeleteMessage}
            onEditMessage={handleEditMessage}
            TargetingIndex={editingIndex}
            editContents={editContents}
            onEditContentChange={handleEditContentChange}
            onEditSave={handleEditSave}
            onEditCancel={handleEditCancel}
          />

          <div
            className={"promptFileList h-box v-align-center"}
            style={{
              // width: "clamp(300px, 950px, 100%)",
              width: "950px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          ></div>
          <div className={"genAiDewsInputWrap"}>
            {isMobile && (
              <div className="btnBox">
                <DEWSTooltip
                  className={`history on`}
                  labelText={"히스토리"}
                  position="bottom"
                  onClick={() => {}}
                />

                <p>
                  <Image
                    src={ico_del_normal_2x}
                    alt=""
                    width={18}
                    height={18}
                  />
                  초기화
                </p>
              </div>
            )}

            <div
              className={`genAiDewsTextBox v-box ${chatFocus ? "on" : ""} ${dragOn ? "dragOn" : ""}`}
              onMouseUp={() => setChatFocus(true)}
              onBlur={() => setChatFocus(false)}
              style={{
                // width: "clamp(300px, 950px, 100%)",
                width: "950px",
                // minHeight: "138px",

                marginLeft: "auto",
                marginRight: "auto",
                // marginLeft: "min(300px, 100%)",
                // marginRight: "min(300px, 100%)",
              }}
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
              {/* 입력창 */}
              <ChatInput
                promtValue={inputValue}
                // onInputChange={handleInputChange}
                onSendMessage={async ({ text, files }) => {
                  const roomId =
                    window.location.pathname.split("/").pop() ?? "";
                  await sendMessage({ text, files: uploadFiles, roomId });
                  setInputValue("");
                  setUploadFiles([]);
                }}
                // onSendMessage={handleSend}
                showSuggestions={showSuggestions}
                onCommandSelect={handleCommandClick}
                isSending={isSending}
                onRemoveFile={handleRemoveFile}
                onFileDrop={addFiles}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onFocusChange={setChatFocus}
              />
            </div>
          </div>
        </div>

        {dragOn && <div className="blurDim" />}
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
        // cancelBtn="취소"
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
        // cancelBtn="취소"
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
}
