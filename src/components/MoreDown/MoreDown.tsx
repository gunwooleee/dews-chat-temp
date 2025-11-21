import Project from "@/components/Project";
import { useChatManager } from "@/context/ChatManager";
import { useRouter } from "next/navigation";
import DEWSAlert from "@/components/DEWSAlert/DEWSAlert";
import React, { useState } from "react";

type MoreDownProps = {
  isOpen: boolean;
  onToggle: () => void;
  activeProjectId?: string | null;
};

const MoreDown = ({ isOpen, onToggle, activeProjectId }: MoreDownProps) => {
  const {
    projects,
    updateRoomToProject,
    updateProject,
    removeProject,
    ChatType,
    isSending,
    streamCancle,
    setActiveProjectId,
  } = useChatManager();
  const router = useRouter();
  const [isSendingCancel, setIsSendingCancel] = useState(false);
  const [pendingNavigationPath, setPendingNavigationPath] = useState<
    string | null
  >(null);

  const handleProjectClick = (id: string, name: string) => {
    // router.push(`/chat/${ChatType}/p/${id}?projectName=${name}`);
    setActiveProjectId(id);
    const targetPath = `/chat/${ChatType}/p/${id}?projectName=${name}`;
    if (isSending) {
      setPendingNavigationPath(targetPath);
      setIsSendingCancel(true);
    } else {
      router.push(targetPath);
    }
    onToggle();
  };

  const sortedProjects = projects.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
  const restProjects = sortedProjects.slice(6);
  const handleStreamCancel = () => {
    setIsSendingCancel(false);
    streamCancle();
    if (pendingNavigationPath) {
      router.push(pendingNavigationPath);
      setPendingNavigationPath(null);
    }
  };

  return (
    <>
      {/*<div className={`more ${isOpen ? "up" : "down"}`}>간략히</div>*/}
      {isOpen ? (
        <div className="more up" onClick={onToggle}>
          간략히
        </div>
      ) : (
        <div className="more down" onClick={onToggle}>
          더보기
        </div>
      )}
      <dl style={{ display: isOpen ? "block" : "none" }}>
        {restProjects.map((project) => (
          <Project
            key={project.project_id}
            projectId={project.project_id}
            projectName={project.project_name}
            onClick={handleProjectClick}
            isActive={project.project_id === activeProjectId}
            onProjectEdit={(projectId, newProjectName) => {
              updateProject(projectId, newProjectName, {
                project_id: projectId,
                project_name: newProjectName,
                created_at: new Date().toISOString(),
              });
            }}
            onDeleteClick={(projectId) => {
              removeProject(projectId);
            }}
          />
        ))}
      </dl>
      <DEWSAlert
        isOpen={isSendingCancel}
        handleAlertClose={() => setIsSendingCancel(false)}
        onConfirm={handleStreamCancel}
        type="warning"
        width="340px"
        title=""
        text={
          <>
            진행 중인 대화와 답변이 <br /> 저장되지 않고 모두 사라집니다. <br />{" "}
            새 대화를 시작하시겠습니까?
          </>
        }
        cancelBtn="취소"
        confirmBtn="확인"
      />
    </>
  );
};

export default MoreDown;
