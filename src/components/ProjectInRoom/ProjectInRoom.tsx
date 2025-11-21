"use client";

import React, { useEffect, useRef, useState } from "react";
import Dropdown from "@/components/Dropdown";
import Image from "next/image";
import ic_chat_line_outlined_18_bk_enabled_2x from "@/assets/images/ico/ic_chat_line_outlined_18_bk_enabled@2x.png";
import DEWSTooltip from "@/components/DEWSTooltip/DEWSTooltip";
import PortalMenu from "@/components/PortalMenu/PortalMenu";
import DEWSAlert from "@/components/DEWSAlert/DEWSAlert";
import { useTheme } from "@/context/ThemeManager";
import img_guide_05_2x_dark from "@/assets/images/dark/img_guide_05@2x.png";
import ic_chat_line_outlined_18_bk_enabled_2x_dark from "@/assets/images/dark/ic_chat_line_outlined_18_bk_enabled@2x.png";
type ProjectInRoomProps = {
  id: string;
  name: string;
  created_at?: string | null;
  selectedIndex: number;
  onSelectAction: (room_id: string) => void;
  onEditRoom?: (id: string, name: string) => void;
  onDeleteRoom?: (id: string) => void;
  onRemoveFromProject?: (id: string, name: string) => void;
  showRemoveToProject?: boolean;
};

export function ProjectInRoom({
  id,
  name,
  created_at,
  selectedIndex,
  onSelectAction,
  onEditRoom,
  onDeleteRoom,
  onRemoveFromProject,
  showRemoveToProject,
}: ProjectInRoomProps) {
  const { theme } = useTheme();
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isUpOpen, setIsUpOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState<string>("");
  const [historyHover, setHistoryHover] = useState(false);
  const [historyPop, setHistoryPop] = useState(false);
  const tooltipButtonRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (historyPop && tooltipButtonRef.current) {
      const rect = tooltipButtonRef.current.getBoundingClientRect();
      const dropdownHeight = 120; // 예상 드롭다운 높이
      const availableHeight = window.innerHeight - rect.bottom;
      setIsUpOpen(availableHeight < dropdownHeight);
    }
  }, [historyPop]);

  const startEditing = (id: string, currentName: string) => {
    setEditingRoomId(id);
    setEditedName(currentName);
  };

  const saveEdit = () => {
    if (onEditRoom && editedName.trim() && editingRoomId) {
      onEditRoom(editingRoomId, editedName.trim());
    }
    cancelEdit();
  };

  const cancelEdit = () => {
    setEditingRoomId(null);
    setEditedName("");
  };

  const handleDelete = async () => {
    try {
      onDeleteRoom?.(id);
    } catch (error) {
      console.error("채팅방 삭제 실패:", error);
      setAlertMessage("채팅방 삭제 중 오류가 발생했습니다.");
    } finally {
      setIsAlertOpen(false);
    }
  };

  // if (rooms.length === 0) {
  //     return (
  //         <div className='projectChatEmpty v-box'>
  //             <Image src={img_empty_chat_filled_64_2x} alt="" width={64} height={64} />
  //             <div className='emptyText'>생성한 채팅이 없습니다.</div>
  //         </div>
  //
  //     )
  // }

  return (
    <div className={`projectChatList v-box`}>
      <div
        ref={containerRef}
        className={`chatItem h-box v-align-center`}
        onMouseEnter={() => setHistoryHover(true)}
        onMouseLeave={() => {
          setHistoryHover(false);
          setHistoryPop(false);
        }}
        onClick={() => {
          if (!editingRoomId) {
            onSelectAction(id);
          }
        }}
      >
        {editingRoomId ? (
          <div className={"DEWSTextFieldIcon flex-1"}>
            <input
              type="text"
              className={"DEWSTextField check flex-1"}
              value={editedName}
              onChange={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setEditedName(e.target.value);
              }}
              // onBlur={() => saveEdit(room.room_id)}
              onBlur={() => {
                saveEdit();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  (e.target as HTMLInputElement).blur();
                } else if (e.key === "Escape") {
                  cancelEdit();
                }
              }}
              autoFocus={true}
            />
            <div className="ico check" style={{ right: "36px" }} />
            <div
              className="ico close"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                cancelEdit();
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            />
          </div>
        ) : (
          <>
            {theme === "darkTheme" ? (
              <Image
                src={ic_chat_line_outlined_18_bk_enabled_2x_dark}
                alt=""
                height={18}
              />
            ) : (
              <Image
                src={ic_chat_line_outlined_18_bk_enabled_2x}
                alt=""
                width={18}
              />
            )}

            <div className={"txt flex-1"}>{name}</div>
            <div className="date">
              {created_at
                ? new Date(created_at).toLocaleString("ko-KR", {
                    timeZone: "Asia/Seoul",
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : ""}
            </div>
          </>
        )}
        <div
          style={{ position: "relative" }}
          ref={tooltipButtonRef}
          onClick={(e) => e.stopPropagation()}
        >
          {historyHover && (
            <DEWSTooltip
              className="moreBtn"
              labelText={"더보기"}
              position="bottom"
              onClick={() => {
                setHistoryPop(!historyPop);
              }}
            />
          )}
        </div>

        <PortalMenu isOpen={historyPop} locationRef={tooltipButtonRef}>
          <Dropdown
            id={id}
            name={name}
            onEditClick={startEditing}
            onDeleteClick={() => {
              setAlertMessage(`선택한 채팅을 삭제하시겠습니까?`);
              // onDeleteRoom?.(id);
              setIsAlertOpen(true);
            }}
            onRemoveFromProjectClick={onRemoveFromProject}
            showRemoveToProject={showRemoveToProject}
            isShow={historyPop}
            isUpOpen={isUpOpen}
            buttonRef={tooltipButtonRef as React.RefObject<HTMLElement>}
            containerRef={containerRef as React.RefObject<HTMLElement>}
            handleClose={() => setHistoryPop(false)}
          />
        </PortalMenu>
      </div>
      {isAlertOpen && (
        <DEWSAlert
          handleAlertClose={() => setIsAlertOpen(false)}
          type="warning"
          width="340px"
          text={alertMessage}
          cancelBtn="취소"
          confirmBtn="확인"
          isOpen={isAlertOpen}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}

export default ProjectInRoom;
