"use client";

import React, { useEffect, useRef, useState } from "react";
import MoreDropdown from "../MoreDropdown";
import { useChatManager } from "@/context/ChatManager";

interface DropdownProps {
  id: string;
  name: string;
  onDeleteClick?: (id: string) => void;
  onEditClick?: (id: string, name: string) => void;
  onRemoveFromProjectClick?: (id: string, name: string) => void;
  onAddToProjectClick?: (id: string) => void;
  iconColor?: string;
  showAddToProject?: boolean;
  showRemoveToProject?: boolean;
  isShow?: boolean;
  handleClose?: () => void;
  handleAlertToggle?: () => void;
  buttonRef?: React.RefObject<HTMLElement>;
  containerRef?: React.RefObject<HTMLElement>;
  isUpOpen?: boolean;
}

const Dropdown = ({
  id,
  name,
  showAddToProject = false,
  showRemoveToProject = false,
  onEditClick,
  onRemoveFromProjectClick,
  onAddToProjectClick,
  onDeleteClick,
  iconColor,
  handleClose,
  handleAlertToggle,
  buttonRef,
  containerRef,
  isShow = false,
  isUpOpen,
}: DropdownProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const projectAddButtonRef = useRef<HTMLLIElement>(null);
  const [isProjectAdd, setIsProjectAdd] = useState(false);
  const [historyPop, setHistoryPop] = useState(false);
  const [isUpProjectOpen, setIsUpProjectOpen] = useState(false);
  const { projects } = useChatManager();

  useEffect(() => {
    if (projectAddButtonRef.current) {
      const rect = projectAddButtonRef.current.getBoundingClientRect();
      const projectHeight = 48 * projects.length; // 이게 4개 일때 부터 영역 넘어가니까 bottom 을 100% 로 해서 뒤집어 줘야함 (192px)
      const availableHeight = window.innerHeight - rect.bottom;
      // window.innerHeight는 968px 이고, rect.bottom은 821임, availableHeight는 147px 즉, 192보다 작으므로 위로 올려야함
      // ex2) window.innerHeight는 968px 이고, rect.bottom은 500임, availableHeight는 468px 즉, 192보다 크므로 아래로 내려갈 수 있음
      setIsUpProjectOpen(availableHeight < projectHeight);
    }
  }, [isProjectAdd]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef?.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        handleClose?.();
      }
    };

    if (isShow) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isShow, handleClose]);

  return (
    <div
      className="DEWSContextPop flex-1 v-box"
      style={{
        display: isShow ? "" : "none",
        bottom: isUpOpen ? "100%" : undefined,
        width: "167px",
        height: "auto",
      }}
      ref={menuRef}
    >
      <ul className="dataFileSel">
        {showAddToProject && (
          <>
            <li
              ref={projectAddButtonRef}
              className="projectAdd h-box"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <span
                onMouseMove={() => {
                  setIsProjectAdd(true);
                }}
              >
                프로젝트에 추가
              </span>
              <span
                className="projectAddBtn"
                onClick={() => {
                  setHistoryPop(!historyPop);
                }}
              ></span>
              <MoreDropdown
                isShow={isProjectAdd}
                mode="addRoom"
                selectedRoomId={id}
                isProjectUpOpen={isUpProjectOpen}
                onClose={() => {
                  setHistoryPop(false);
                  handleClose?.();
                }}
                projects={projects}
              />
            </li>
          </>
        )}
        {showRemoveToProject && (
          <ul className="projectAdd h-box">
            <li
              className={"projectRemove"}
              onClick={(e) => {
                e.stopPropagation();
                onRemoveFromProjectClick?.(id, name);
                setTimeout(() => {
                  setHistoryPop(false);
                }, 100);
              }}
            >
              프로젝트에서 제거
            </li>
            <span
              className="projectRemove"
              onClick={() => {
                setHistoryPop(!historyPop);
              }}
            ></span>
          </ul>
        )}

        <li
          className="titleEdit"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onEditClick?.(id, name);
            handleClose?.();
          }}
        >
          수정
        </li>
        <li
          className="projectDel"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onDeleteClick?.(id);
            handleClose?.();
          }}
        >
          삭제
        </li>
      </ul>
    </div>
  );
};

export default Dropdown;
