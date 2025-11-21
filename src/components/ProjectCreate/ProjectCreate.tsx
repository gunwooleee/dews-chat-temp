import uuid from "react-uuid";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useChatManager } from "@/context/ChatManager";

type ProjectCreateProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function ProjectCreate({ isOpen, onClose }: ProjectCreateProps) {
  const [isNewProjectOpen, setIsNewProjectOpen] = React.useState(false);
  const [projectTitle, setProjectTitle] = React.useState("");
  const { addProject, ChatType } = useChatManager();
  const router = useRouter();
  const modalRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.addEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <>
      <div
        className={`DEWSContextPop flex-1 v-box popupCenter`}
        style={{ width: "600px", height: "310px" }}
      >
        <div className={`projectChatPop v-box`}>
          <div className="titleBox h-box v-align-center">
            <div className="tit flex-1">프로젝트 챗 생성</div>
            <div
              className="closeBtn"
              onClick={() => {
                onClose();
              }}
            />
          </div>
          <input
            type="text"
            autoComplete="off"
            name="new-field-1234"
            autoCorrect="off"
            spellCheck="false"
            width="100%"
            className="DEWSTextField"
            placeholder="예) 로그인 페이지 만들기"
            value={projectTitle}
            onFocus={(e) => (e.currentTarget.placeholder = "")}
            onBlur={(e) => {
              if (!projectTitle) {
                e.currentTarget.placeholder = "예) 로그인 페이지 만들기";
              }
            }}
            onChange={(e) => {
              setProjectTitle(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const project_id = uuid();
                const newProject = {
                  project_id: project_id,
                  project_name: projectTitle,
                  created_at: new Date().toISOString(),
                };
                addProject(newProject);
                onClose();
                router.push(
                  `/chat/${ChatType}/p/${project_id}?projectName=${projectTitle}`,
                );
                setProjectTitle("");
              }
            }}
          />
          <div className="infoBox v-box">
            <div className="txt01">프로젝트 챗이란?</div>
            <div className="txt02">
              ‘주제별 AI 작업 공간’이에요. 아이디어, 코드 생성, 수정 요청 같은
              모든 대화를 하나의 채팅방에 모아둘 수 있어요. <br />
              작업을 끊지 않고 이어서 할 수 있고, 나중에 다시 돌아와도 바로
              이해할 수 있어요!
            </div>
          </div>
          <div className="DEWSButtonGroup h-align-center">
            <button className="DEWSButton" onClick={onClose}>
              취소
            </button>
            <button
              className={`DEWSButton ${projectTitle === "" ? "blue disabled" : "blue"}`}
              onClick={() => {
                const project_id = uuid();
                const newProject = {
                  project_id: project_id,
                  project_name: projectTitle,
                  created_at: new Date().toISOString(),
                };
                addProject(newProject);
                onClose();
                router.push(
                  `/chat/${ChatType}/p/${project_id}?projectName=${projectTitle}`,
                );
                setProjectTitle("");
              }}
            >
              생성
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
