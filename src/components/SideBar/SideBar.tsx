import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Room from "@/components/Room";
import Project from "@/components/Project";
import { useChatManager } from "@/context/ChatManager";
import MoreDropdown from "../MoreDropdown";
import DEWSTooltip from "@/components/DEWSTooltip/DEWSTooltip";
import StartNewChat from "@/components/StratNewChat/StartNewChat";
import SearchModal from "@/components/SearchModal/SearchModal";
import { Popup } from "@/components/Popup/Popup";
import SystemSetting from "@/components/SystemSetting/SystemSetting";
import ProjectCreate from "@/components/ProjectCreate/ProjectCreate";
import MoreDown from "@/components/MoreDown/MoreDown";
import useIsMobile from "@/hooks/useIsMobile";
import FAQ from "@/components/FAQPage/FAQ";
import PortalModal from "@/components/PortalModal/PortalModal";
import img_empty_chat_filled_64_2x_dark from "@/assets/images/dark/img_empty_chat_filled_64@2x.png";
import img_empty_chat_filled_64_2x from "@/assets/images/bg/img_empty_chat_filled_64@2x.png";
import Image from "next/image";
import { useTheme } from "@/context/ThemeManager";
import DEWSAlert from "@/components/DEWSAlert/DEWSAlert";

//     <img src={require("../src/assets/images/dark/img_empty_chat_filled_64@2x.png")} alt="" />

//     <img src={require("../src/assets/images/bg/img_empty_chat_filled_64@2x.png")} alt="" />
// }

const Sidebar = () => {
  const router = useRouter();
  const isMobile = useIsMobile();
  const { theme } = useTheme();
  const {
    rooms,
    removeRoom,
    updateRoom,
    projects,
    updateProject,
    removeProject,
    sidebarIsOpen,
    setSidebarIsOpen,
    changeHyperParameter,
    ChatType,
    chatInputRef,
    activeProjectId,
    setActiveProjectId,
    isSending,
    streamCancle,
  } = useChatManager();
  const [isClient, setIsClient] = React.useState(false);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSendingCancel, setIsSendingCancel] = useState(false);
  const [pendingNavigationPath, setPendingNavigationPath] = useState<
    string | null
  >(null);
  const [isMoreDropdownOpen, setIsMoreDropdownOpen] = useState(false);
  const [isMoreDownOpen, setIsMoreDownOpen] = useState(false);
  const [isSystemSettingOpen, setIsSystemSettingOpen] = useState(false);
  const [morePanelMode, setMorePanelMode] = useState<"navigate" | "addRoom">(
    "navigate",
  );
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [isFaqOpen, setIsFaqOpen] = useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isYesterday = (date: Date) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    );
  };

  const todayRooms = rooms.filter((room) => {
    if (!room.updated_at) return false;
    return isToday(new Date(room.updated_at));
  });
  const yesterdayRooms = rooms.filter((room) => {
    if (!room.updated_at) return false;
    return isYesterday(new Date(room.updated_at));
  });
  const otherRooms = rooms.filter((room) => {
    if (!room.updated_at) return false;
    return (
      !isToday(new Date(room.updated_at)) &&
      !isYesterday(new Date(room.updated_at))
    );
  });
  const handleSettingValueChange = (val1: string, val2: string) => {
    changeHyperParameter(val1, val2);
  };

  const pathname = usePathname(); // ex)  /chat/gpt/c/abcd1234
  const activeRoomId = React.useMemo(() => {
    const m = pathname.match(/\/c\/([^/?]+)/);
    return m ? m[1] : null;
  }, [pathname]);

  const handleStreamCancel = () => {
    setIsSendingCancel(false);
    streamCancle();
    if (pendingNavigationPath) {
      router.push(pendingNavigationPath);
      setPendingNavigationPath(null);
    }
  };

  // const activeProjectId = React.useMemo(() => {
  //   const m = pathname.match(/\/p\/([^/?]+)/);
  //   return m ? m[1] : null;
  // }, [pathname]);
  return (
    <>
      {!isMobile ? (
        <div className={`leftSide v-box`}>
          {sidebarIsOpen && (
            <div className="lnbSidePanel v-box flex-1">
              {/* 헤더 */}
              <div className="header h-box v-align-center">
                <div className="h-box flex-1 h-align-start">
                  <DEWSTooltip labelText={"접기"} position="bottom">
                    <button
                      className={`DEWSTooltip btnIco folding`}
                      onClick={() => setSidebarIsOpen(!sidebarIsOpen)}
                    />
                  </DEWSTooltip>
                </div>
                <div className={`lnbBtns h-box v-align-center`}>
                  <DEWSTooltip labelText={"검색"} position="bottom">
                    <button
                      className={`DEWSTooltip btnIco search ${isSearchOpen ? "on" : ""}`}
                      onClick={() => {
                        setIsSearchOpen(true);
                        setIsNewProjectOpen(false);
                        setIsSystemSettingOpen(false);
                      }}
                    ></button>
                  </DEWSTooltip>
                  <div
                    className={`DEWSTooltip btnIco setting ${isSystemSettingOpen ? "on" : ""}`}
                    onMouseUp={() => {
                      setIsSystemSettingOpen(true);
                      setIsSearchOpen(false);
                      setIsNewProjectOpen(false);
                    }}
                  >
                    <SystemSetting
                      isOpen={isSystemSettingOpen}
                      onClose={() => {
                        setIsSystemSettingOpen(false);
                      }}
                      onApply={handleSettingValueChange}
                    />
                  </div>

                  {/*<DEWSTooltip className={`btnIco setting`} labelText={'시스템 프롬프트'} position='bottom'/>*/}
                </div>
              </div>

              <>
                {/* 새 대화 시작 */}
                <div
                  className={"btnChatNew"}
                  onClick={() => {
                    setIsSearchOpen(false);
                    setIsNewProjectOpen(false);
                    setIsSystemSettingOpen(false);
                    setActiveProjectId("");
                    setTimeout(() => {
                      chatInputRef.current?.focus();
                    }, 100);
                  }}
                >
                  <StartNewChat />
                </div>

                {/* 컨텐츠 영역 */}
                <div className="lnbConBox v-box flex-1">
                  {/* 프로젝트 */}
                  <div className="projectCon">
                    <div className="titleBox h-box">
                      <p className="title ellipsis flex-1">프로젝트</p>
                      {/* 프로젝트 Add버튼 */}
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsNewProjectOpen(true);
                        }}
                        className="addBtn"
                      ></div>
                    </div>
                    <div
                      className="listItem"
                      // style={{ overflowY: "auto", height: "calc(100% - 40px)" }}
                    >
                      {projects
                        .sort(
                          (a, b) =>
                            new Date(b.created_at).getTime() -
                            new Date(a.created_at).getTime(),
                        )
                        .slice(0, 6)
                        .map((project) => (
                          <dl key={project.project_id}>
                            <Project
                              key={project.project_id}
                              projectId={project.project_id}
                              projectName={project.project_name}
                              isActive={project.project_id === activeProjectId}
                              onClick={(project_id, project_name) => {
                                setActiveProjectId(project_id);
                                // router.push(
                                //   `/chat/${ChatType}/p/${project_id}?projectName=${project_name}`,
                                // );
                                const targetPath = `/chat/${ChatType}/p/${project_id}?projectName=${project_name}`;
                                if (isSending) {
                                  setPendingNavigationPath(targetPath);
                                  setIsSendingCancel(true);
                                } else {
                                  router.push(targetPath);
                                }
                              }}
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
                          </dl>
                        ))}
                      {projects.length > 6 && (
                        <div
                          onClick={() => {
                            setMorePanelMode("navigate");
                            // setIsMoreDownOpen((prev) => !prev);
                          }}
                        >
                          {/*<div className={"more down"}>더보기</div>*/}
                          {/* 더보기 버튼 영역 */}
                          <MoreDown
                            activeProjectId={activeProjectId}
                            isOpen={isMoreDownOpen}
                            onToggle={() => {
                              setIsMoreDownOpen((prev) => !prev);
                            }}
                          ></MoreDown>
                        </div>
                      )}
                      {isMoreDropdownOpen && (
                        <MoreDropdown
                          isShow={isMoreDropdownOpen}
                          mode={morePanelMode}
                          selectedRoomId={selectedRoomId}
                          onClose={() => setIsMoreDropdownOpen(false)}
                        />
                      )}
                    </div>
                  </div>

                  {/* 히스토리 */}
                  <div className="historyCon flex-1 v-box">
                    <div className="titleBox h-box">
                      <p className="title ellipsis flex-1">히스토리</p>
                    </div>
                    <div
                      className="scrollWrapper"
                      style={{
                        position: "relative",
                        // flex: 1,
                        overflowY: "auto",
                      }}
                    >
                      <div
                        className="listItem"
                        style={{
                          position: "relative",
                          // minHeight: "100%",
                        }}
                      >
                        <dl>
                          {/* 오늘 어제 7일전 전부 다 없으면 조건*/}
                          {todayRooms.length === 0 &&
                            yesterdayRooms.length === 0 &&
                            otherRooms.length === 0 && (
                              <>
                                <div className="emptySet v-box mt30">
                                  {theme === "darkTheme" ? (
                                    <Image
                                      src={img_empty_chat_filled_64_2x_dark}
                                      alt=""
                                      width={64}
                                      height={64}
                                    />
                                  ) : (
                                    <Image
                                      src={img_empty_chat_filled_64_2x}
                                      alt=""
                                      width={64}
                                      height={64}
                                    />
                                  )}
                                  <div className="emptySet v-box mt30">
                                    <div className="bText">
                                      대화가 없습니다.
                                    </div>
                                    <div className="sText">
                                      새로운 대화를 시작해보세요.
                                    </div>
                                  </div>
                                </div>
                              </>
                            )}

                          {todayRooms.length > 0 && <dt>오늘</dt>}
                          {todayRooms.map((room) => (
                            <Room
                              id={room.room_id}
                              name={room.room_name}
                              isActive={room.room_id === activeRoomId}
                              onClick={(roomId) => {
                                setActiveProjectId("");
                                const targetPath = `/chat/${ChatType}/c/${roomId}`;
                                if (isSending) {
                                  setPendingNavigationPath(targetPath);
                                  setIsSendingCancel(true);
                                } else {
                                  router.push(targetPath);
                                }
                              }}
                              onDeleteClick={(roomId) => {
                                removeRoom(roomId);
                                setTimeout(() => {
                                  // 언마운트 시점 오류로 강제 시간부여
                                  router.push(`/chat/${ChatType}`);
                                }, 0);
                              }}
                              onEdit={(roomId, roomName) => {
                                updateRoom(roomId, roomName, {
                                  room_id: roomId,
                                  room_name: roomName,
                                  updated_at: new Date().toISOString(),
                                });
                              }}
                              key={room.room_id}
                              showAddToProject={true}
                              onAddToProjectClick={(roomId) => {
                                setMorePanelMode("addRoom");
                                setSelectedRoomId(roomId);
                                setIsMoreDropdownOpen(true);
                              }}
                            />
                          ))}
                          {yesterdayRooms.length > 0 && (
                            <dt style={{ marginTop: "16px" }}>어제</dt>
                          )}
                          {yesterdayRooms.map((room) => (
                            <Room
                              id={room.room_id}
                              name={room.room_name}
                              isActive={room.room_id === activeRoomId}
                              onClick={(roomId) => {
                                setActiveProjectId("");
                                const targetPath = `/chat/${ChatType}/c/${roomId}`;
                                if (isSending) {
                                  setPendingNavigationPath(targetPath);
                                  setIsSendingCancel(true);
                                } else {
                                  router.push(targetPath);
                                }
                              }}
                              onDeleteClick={(roomId) => {
                                removeRoom(roomId);
                                setTimeout(() => {
                                  // 언마운트 시점 오류로 강제 시간부여
                                  router.push(`/chat/${ChatType}`);
                                }, 0);
                              }}
                              onEdit={(roomId, roomName) => {
                                updateRoom(roomId, roomName, {
                                  room_id: roomId,
                                  room_name: roomName,
                                  updated_at: new Date().toISOString(),
                                });
                              }}
                              key={room.room_id}
                              showAddToProject={true}
                              onAddToProjectClick={(roomId) => {
                                setMorePanelMode("addRoom");
                                setSelectedRoomId(roomId);
                                setIsMoreDropdownOpen(true);
                              }}
                            />
                          ))}
                          {otherRooms.length > 0 && (
                            <dt style={{ marginTop: "16px" }}>지난 7일</dt>
                          )}
                          {otherRooms.map((room) => (
                            <Room
                              id={room.room_id}
                              name={room.room_name}
                              isActive={room.room_id === activeRoomId}
                              onClick={(roomId) => {
                                setActiveProjectId("");
                                const targetPath = `/chat/${ChatType}/c/${roomId}`;
                                if (isSending) {
                                  setPendingNavigationPath(targetPath);
                                  setIsSendingCancel(true);
                                } else {
                                  router.push(targetPath);
                                }
                              }}
                              onDeleteClick={(roomId) => {
                                removeRoom(roomId);
                                setTimeout(() => {
                                  // 언마운트 시점 오류로 강제 시간부여
                                  router.push(`/chat/${ChatType}`);
                                }, 0);
                              }}
                              onEdit={(roomId, roomName) => {
                                updateRoom(roomId, roomName, {
                                  room_id: roomId,
                                  room_name: roomName,
                                  updated_at: new Date().toISOString(),
                                });
                              }}
                              key={room.room_id}
                              showAddToProject={true}
                              onAddToProjectClick={(roomId) => {
                                setMorePanelMode("addRoom");
                                setSelectedRoomId(roomId);
                                setIsMoreDropdownOpen(true);
                              }}
                            />
                          ))}
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
                {/* 검색 모달 */}
                {isClient && (
                  <Popup
                    // target={document.querySelector(".commonChat") as HTMLElement}
                    open={isSearchOpen}
                  >
                    <SearchModal
                      isOpen={isSearchOpen}
                      onClose={() => setIsSearchOpen(false)}
                    />
                  </Popup>
                )}
                {isNewProjectOpen && (
                  <Popup
                    // target={document.querySelector(".commonChat") as HTMLElement}
                    open={isNewProjectOpen}
                  >
                    <ProjectCreate
                      isOpen={isNewProjectOpen}
                      onClose={() => setIsNewProjectOpen(false)}
                    />
                  </Popup>
                )}

                {isFaqOpen && (
                  <PortalModal onClose={() => setIsFaqOpen(false)}>
                    <FAQ closeModal={() => setIsFaqOpen(false)} />
                  </PortalModal>
                )}

                {/* FAQ */}
                <div
                  className="titleBox h-box"
                  onClick={() => {
                    // router.push(`/chat/${ChatType}/faq`);
                    setSidebarIsOpen(true);
                    setIsFaqOpen(true);
                  }}
                >
                  <p className="title faq ellipsis flex-1">FAQ</p>
                </div>
              </>
            </div>
          )}
          <DEWSAlert
            isOpen={isSendingCancel}
            handleAlertClose={() => setIsSendingCancel(false)}
            onConfirm={handleStreamCancel}
            type="warning"
            width="340px"
            title=""
            text={
              <>
                진행 중인 대화와 답변이 <br /> 저장되지 않고 모두 사라집니다.{" "}
                <br /> 새 대화를 시작하시겠습니까?
              </>
            }
            cancelBtn="취소"
            confirmBtn="확인"
          />
        </div>
      ) : (
        <div></div>
      )}
    </>
  );
};

export default Sidebar;
