"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import uuid from "react-uuid";
import ProjectInRoom from "@/components/ProjectInRoom";
import { useChatManager } from "@/context/ChatManager";
import ChatInput from "@/components/ChatInput";
import DEWSTooltip from "@/components/DEWSTooltip/DEWSTooltip";
import ModelSelection from "@/components/ModelSelection/ModelSelection";
import Image from "next/image";
import img_empty_chat_filled_64_2x from "@/assets/images/bg/img_empty_chat_filled_64@2x.png";
import UploadItem from "@/components/UploadItem/UploadItem";
import DEWSAlert from "@/components/DEWSAlert/DEWSAlert";
import useIsMobile from "@/hooks/useIsMobile";
import lg_dnx from "@/assets/images/ico/lg-sbjdnx@2x.png";
import lg_dnx_dark from "@/assets/images/dark/lg-sbjdnx@2x.png";
import { useTheme } from "@/context/ThemeManager";

export default function ProjectPage() {
  const params = useParams();
  const { theme } = useTheme();
  const router = useRouter();
  const isMobile = useIsMobile();
  const searchParams = useSearchParams();
  const [inputValue, setInputValue] = useState<string>("");
  const projectId = params.projectId?.[0] || "";
  const projectName = searchParams.get("projectName");
  const [selected, setSelected] = useState(0);
  const [chatFocus, setChatFocus] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [isNotAllowedExtension, setIsNotAllowedExtension] = useState(false);
  const [isNotAllowedModel, setIsNotAllowedModel] = useState(false);
  const [isNotAllowedModelConfirm, setIsNotAllowedModelConfirm] = // 취소/확인 이 있는...
    useState(false);
  const [isNotAllowedFileSize, setIsNotAllowedFileSize] = useState(false);
  const [isNotAllowedFileCount, setIsNotAllowedFileCount] = useState(false);
  // const modelType = localStorage.getItem("llm_type") || "gpt4";
  const {
    setRoomId,
    projectInrooms,
    sendMessage,
    isSending,
    updateProjectInRoom,
    removeProjectInRoom,
    getProjectInRoomList,
    updateProjectInRoomToRoom,
    clearChatMessages,
    sidebarIsOpen,
    setSidebarIsOpen,
    ChatType,
    dragOn,
    setDragOn,
    notAllowed,
    changeModel,
    llmModel,
  } = useChatManager();

  useEffect(() => {
    sessionStorage.setItem("beforePage", window.location.href);
    getProjectInRoomList(projectId);
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

  const handleRemoveFromProject = async (id: string, name: string) => {
    const room = {
      room_id: id,
      room_name: name,
      updated_at: new Date().toISOString(),
    };
    await updateProjectInRoomToRoom(id, room);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const value = e.target.value;
    setInputValue(value);
  };

  const handleSelectRoom = async (room_id: string) => {
    const idx = projectInrooms.findIndex((r) => r.room_id === room_id);
    if (idx !== -1) setSelected(idx);
    setSelected(idx);
    router.push(`/chat/${ChatType}/c/${room_id}`);
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
    console.log("여기 addFiles", files);
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

  const handleSend = async ({ text }: { text: string }) => {
    // if (!inputValue.trim()) return;
    clearChatMessages();
    console.log("clearChatMessages");

    const roomId = uuid();
    sendMessage({
      text: text,
      roomId: roomId,
      files: uploadFiles,
      projectId: projectId,
    });
    setInputValue("");
    setUploadFiles([]);
    router.push(`/chat/${ChatType}/c/${roomId}`);
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
        </>
      )}

      <div className={"mainChat flex-1 v-box"}>
        <div className="flex-1 v-box flex-center">
          <div
            className="infoBox v-box v-align-center"
            style={{ width: "950px", marginLeft: "auto", marginRight: "auto" }}
          >
            <div className="folder" />
            <h1 className="title">{projectName}</h1>
          </div>
          <div
            className={`genAiDewsTextBox v-box v-box ${chatFocus ? "on" : ""} ${dragOn ? "dragOn" : ""}`}
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
                {uploadFiles.map((file) => (
                  <UploadItem
                    key={file.name}
                    name={file.name}
                    // ext={"pdf"}
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

            <ChatInput
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
          <div
            className="projectMyChat v-box"
            style={{
              // width: "clamp(450px, 950px, 100%)",
              width: "950px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            <div className="title h-box v-align-center">
              이 프로젝트 내 채팅
            </div>
            {projectInrooms === undefined ||
              (projectInrooms.length === 0 && (
                <div className="projectChatEmpty v-box">
                  <Image
                    src={img_empty_chat_filled_64_2x}
                    alt=""
                    width={64}
                    height={64}
                  />
                  <div className="emptyText">생성한 채팅이 없습니다.</div>
                </div>
              ))}
            <div
              className="scrollWrapper"
              style={{
                position: "relative",
                overflowY: "auto",
              }}
            >
              {[...projectInrooms]
                .sort(
                  (a, b) =>
                    new Date(b.updated_at).getTime() -
                    new Date(a.updated_at).getTime(),
                )
                .map((room, index) => (
                  <ProjectInRoom
                    key={room.room_id}
                    id={room.room_id}
                    name={room.room_name}
                    created_at={room.created_at}
                    selectedIndex={selected}
                    onSelectAction={handleSelectRoom}
                    onEditRoom={(id, name) => {
                      updateProjectInRoom(id, name, {
                        room_id: id,
                        room_name: name,
                        updated_at: new Date().toISOString(),
                      });
                    }}
                    onDeleteRoom={(id) => removeProjectInRoom(id)}
                    onRemoveFromProject={handleRemoveFromProject}
                    showRemoveToProject={true}
                  />
                ))}
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
