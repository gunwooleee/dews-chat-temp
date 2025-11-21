"use client";

import React, { useRef, useState } from "react";
import Dropdown from "@/components/Dropdown";
import PortalMenu from "@/components/PortalMenu/PortalMenu";
import DEWSTooltip from "@/components/DEWSTooltip/DEWSTooltip";
import DEWSAlert from "@/components/DEWSAlert/DEWSAlert";

interface ProjectProps {
  projectId: string;
  projectName: string;
  onClick?: (projectId: string, projectName: string) => void;
  onProjectEdit?: (projectId: string, ProjectName: string) => void;
  onDeleteClick?: (projectId: string) => void;
  isActive?: boolean;
}

const Project = ({
  projectId,
  projectName,
  onClick,
  onProjectEdit,
  onDeleteClick,
  isActive,
}: ProjectProps) => {
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [isEdditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(projectName);
  const [tempName, setTempName] = useState(projectName);
  const [editId, setEditId] = useState("");
  const tooltipButtonRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // 퍼블리싱
  const [historyHover, setHistoryHover] = useState(false);
  const [historyPop, setHistoryPop] = useState(false);

  const handleDelete = async () => {
    try {
      onDeleteClick?.(projectId);
    } catch (error) {
      console.error("채팅방 삭제 실패:", error);
      setAlertMessage("채팅방 삭제 중 오류가 발생했습니다.");
    } finally {
      setIsAlertOpen(false);
    }
  };
  const onChangeName = (newName: string) => {
    setTempName(newName);
    console.log("newName", newName);
    onProjectEdit?.(projectId, newName);
  };

  return (
    <dd
      ref={containerRef}
      className={`pj h-box ${historyPop && historyHover ? "on" : ""} ${isActive ? "on" : ""}`}
      onClick={() => {
        if (!isEdditing) {
          onClick?.(projectId, projectName);
        }
      }}
      style={{ position: "relative" }}
      onMouseEnter={() => setHistoryHover(true)}
      onMouseLeave={() => {
        setHistoryHover(false);
        setHistoryPop(false);
      }}
    >
      {isEdditing ? (
        <div className="DEWSTextFieldIcon flex-1">
          <input
            className={"DEWSTextField check flex-1"}
            type="text"
            value={tempName}
            onChange={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setTempName(e.target.value);
            }}
            onBlur={(e) => {
              setIsEditing(false);
              // if (tempName !== projectName) {
              //   onProjectEdit?.(editId, editName);
              // }
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
              setTempName(projectName);
              setIsEditing(false);
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          />
        </div>
      ) : (
        <>
          <DEWSTooltip
            className="text ellipsis flex-1"
            position="bottom"
            labelText={`${projectName}`}
          >
            <div className={`text ellipsis flex-1`}>{projectName}</div>
          </DEWSTooltip>
        </>
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

      <PortalMenu isOpen={historyPop} locationRef={tooltipButtonRef}>
        <Dropdown
          id={projectId}
          name={projectName}
          onDeleteClick={() => {
            setAlertMessage(`선택한 프로젝트를 삭제하시겠습니까?`);
            setIsAlertOpen(true);
            // setEditId(projectId); // 삭제할 방 ID 저장
          }}
          onEditClick={(seleted_roomid, seleted_roomname) => {
            setEditId(seleted_roomid);
            setEditName(seleted_roomname);
            setIsEditing(true);
          }}
          isShow={historyPop}
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

export default Project;
