"use client";

import { useChatManager } from "@/context/ChatManager";
import { useRouter } from "next/navigation";
import Project from "@/components/Project/Project";
import React, { useEffect } from "react";
import "../../../src/assets/css/scroll.scss";

interface Project {
  project_id: string;
  project_name: string;
  created_at: string;
  updated_at?: string;
}

type MorePanelProps = {
  isShow: boolean;
  mode: "navigate" | "addRoom";
  selectedRoomId: string | null;
  onClose: () => void;
  isProjectUpOpen?: boolean;
  projects?: Project[];
};

const MoreDropdown = ({
  isShow,
  mode,
  selectedRoomId,
  onClose,
  isProjectUpOpen,
}: MorePanelProps) => {
  const {
    projects,
    updateRoomToProject,
    updateProject,
    removeProject,
    ChatType,
  } = useChatManager();
  const router = useRouter();

  const handleProjectClick = (id: string, name: string) => {
    if (mode === "navigate") {
      router.push(`/chat/${ChatType}/p/${id}?projectName=${name}`);
      onClose();
    } else if (mode === "addRoom" && selectedRoomId) {
      updateRoomToProject(selectedRoomId, id);
    }
    onClose();
  };

  // const orderProjects = isProjectUpOpen ? [...projects].reverse() : projects;
  return (
    <>
      {isShow && projects.length > 0 && (
        <div
          className={"DEWSContextPop flex-1 v-box disappearScrollbar"}
          style={{
            position: "absolute",
            bottom: isProjectUpOpen ? "calc(100% - 120px)" : undefined,
            left: "100%",
            maxHeight: "480px",
            overflowY: "auto",
          }}
        >
          {projects.map((project) => (
            <ul className={"dataFileSel "} key={project.project_id}>
              <li
                className={`roomAdd`}
                style={{ maxWidth: "150px", minWidth: "110px" }}
              >
                <Project
                  key={project.project_id}
                  projectId={project.project_id}
                  projectName={project.project_name}
                  onClick={handleProjectClick}
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
              </li>
            </ul>
          ))}
        </div>
      )}
    </>
  );
};

export default MoreDropdown;
