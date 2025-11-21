"use client";

import React, { useEffect, useRef, useState } from "react";
import Dropdown from "@/components/Dropdown";
import DEWSTooltip from "@/components/DEWSTooltip/DEWSTooltip";
import DEWSAlert from "@/components/DEWSAlert/DEWSAlert";
import PortalMenu from "@/components/PortalMenu/PortalMenu";

interface RoomProps {
  id: string;
  name: string;
  onClick?: (id: string) => void;
  onEdit?: (id: string, name: string) => void;
  onDeleteClick?: (id: string) => void;
  showAddToProject?: boolean;
  onAddToProjectClick?: (roomId: string) => void;
  isActive?: boolean;
}

const Room = ({
  id,
  name,
  onClick,
  onEdit,
  onDeleteClick,
  showAddToProject,
  onAddToProjectClick,
  isActive,
}: RoomProps) => {
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [isEdditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(name);
  const [tempName, setTempName] = useState(name);
  const tooltipButtonRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isUpOpen, setIsUpOpen] = useState(false);
  // 퍼블리싱
  const [historyHover, setHistoryHover] = useState(false);
  const [historyPop, setHistoryPop] = useState(false);

  useEffect(() => {
    if (historyPop && tooltipButtonRef.current) {
      const rect = tooltipButtonRef.current.getBoundingClientRect();
      const dropdownHeight = 120; // 예상 드롭다운 높이
      const availableHeight = window.innerHeight - rect.bottom;
      setIsUpOpen(availableHeight < dropdownHeight);
    }
  }, [historyPop]);

  const handleDelete = async () => {
    try {
      onDeleteClick?.(id);
    } catch (error) {
      console.error("채팅방 삭제 실패:", error);
      setAlertMessage("채팅방 삭제 중 오류가 발생했습니다.");
    } finally {
      setIsAlertOpen(false);
    }
  };

  const handleAlertToggle = () => {
    setHistoryPop(!historyPop);
  };

  const onChangeName = (newName: string) => {
    setTempName(newName);
    onEdit?.(id, newName);
  };

  // @ts-ignore
  return (
    <dd
      ref={containerRef}
      className={`h-box ${historyPop && historyHover ? "on" : ""} ${isActive ? "on" : ""}`}
      style={{ position: "relative" }}
      // 함수형 state 로 변환
      onMouseEnter={() => setHistoryHover(true)}
      onMouseLeave={() => {
        setHistoryHover(false);
        setHistoryPop(false);
      }}
      onClick={() => {
        if (!isEdditing) {
          onClick?.(id);
        }
      }}
    >
      {isEdditing ? (
        <div className="DEWSTextFieldIcon flex-1">
          <input
            className="DEWSTextField check flex-1"
            type="text"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            onBlur={() => {
              setIsEditing(false);
              onChangeName(tempName);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                (e.target as HTMLInputElement).blur();
              }
            }}
          />
          <div className="ico check" style={{ right: "36px" }} />
          <div
            className="ico close"
            onClick={() => {
              setTempName(name);
              setIsEditing(false);
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          />
        </div>
      ) : (
        <DEWSTooltip
          className="text ellipsis flex-1"
          position="bottom"
          labelText={`${name}`}
        >
          <div className="text ellipsis flex-1">{name}</div>
        </DEWSTooltip>
      )}
      {/* hover시 노출 */}
      <div ref={tooltipButtonRef} onClick={(e) => e.stopPropagation()}>
        {historyHover && !isEdditing && (
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

      <PortalMenu locationRef={tooltipButtonRef} isOpen={historyPop}>
        <Dropdown
          id={id}
          name={name}
          showAddToProject={showAddToProject}
          // 드롭다운이 열리는것보다 더 길어서 세로가 짤릴때 위로 열릴지 아래로 열릴지 결정 bottom 100% 를 줄지 말지
          onDeleteClick={(roomId) => {
            setAlertMessage(`선택한 채팅을 삭제하시겠습니까?`);
            setIsAlertOpen(true);
          }}
          onEditClick={(seletedId, seletedName) => {
            setEditName(seletedName);
            setIsEditing(true);
          }}
          onAddToProjectClick={onAddToProjectClick}
          isShow={historyPop}
          isUpOpen={isUpOpen}
          buttonRef={tooltipButtonRef as React.RefObject<HTMLElement>}
          containerRef={containerRef as React.RefObject<HTMLElement>}
          handleClose={() => setHistoryPop(false)}
        />
      </PortalMenu>
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
    </dd>
  );
};

export default Room;
