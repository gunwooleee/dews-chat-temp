"use client";
import React, { useEffect, useRef, useState } from "react";
import { useChatManager } from "@/context/ChatManager";
import { useRouter } from "next/navigation";
import Image from "next/image";
import img_empty_chat_filled_64_2x_dark from "@/assets/images/dark/img_empty_chat_filled_64@2x.png";
import img_empty_chat_filled_64_2x from "@/assets/images/bg/img_empty_chat_filled_64@2x.png";
import img_empty_search_filled_64_2x_dark from "@/assets/images/dark/img_empty_search_filled_64@2x.png";
import img_empty_search_filled_64_2x from "@/assets/images/bg/img_empty_search_filled_64@2x.png";
import { useTheme } from "@/context/ThemeManager";

type SearchModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const SearchModal = ({ isOpen, onClose }: SearchModalProps) => {
  const router = useRouter();
  const { theme } = useTheme();
  const { rooms, projects, ChatType, chatInputRef, setActiveProjectId } =
    useChatManager();
  const [search, setSearch] = useState("");
  const focusRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        focusRef.current?.focus();
      }, 200);
    }
  }, [isOpen]);

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

  if (!isOpen) return null;

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

  // 검색어로 필터링
  const filteredRooms = rooms.filter((room) =>
    room.room_name.toLowerCase().includes(search.toLowerCase()),
  );

  const todayRooms = filteredRooms.filter((room) =>
    isToday(new Date(room.updated_at)),
  );
  const yesterdayRooms = filteredRooms.filter((room) =>
    isYesterday(new Date(room.updated_at)),
  );
  const otherRooms = filteredRooms.filter(
    (room) =>
      !isToday(new Date(room.updated_at)) &&
      !isYesterday(new Date(room.updated_at)),
  );

  const filteredProjects = projects.filter((project) =>
    project.project_name.toLowerCase().includes(search.toLowerCase()),
  );
  const hasAnyData = rooms.length > 0 || projects.length > 0;
  const hasSearchResults =
    filteredRooms.length > 0 || filteredProjects.length > 0;
  return (
    <div
      className="DEWSContextPop flex-1 v-box popupCenter"
      onClick={onClose}
      style={{ width: "680px", height: "444px" }} //width는 원래  680임 (임시)
      ref={modalRef}
    >
      {/*<Modal isOpen={isOpen} onClose={onClose} title="채팅 검색">*/}
      <div className="searchPop v-box flex-1">
        <div className="searchBox" onClick={(e) => e.stopPropagation()}>
          <div className="DEWSTextFieldIcon">
            <input
              // ref={focusRef}
              type="text"
              placeholder="대화한 내용을 검색해 보세요."
              onFocus={(e) => (e.currentTarget.placeholder = "")}
              onBlur={(e) => {
                if (!search) {
                  e.currentTarget.placeholder = "대화한 내용을 검색해 보세요.";
                }
              }}
              autoComplete="off"
              name="new-field-1234"
              autoCorrect="off"
              spellCheck="false"
              className={`DEWSTextField flex-1`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="ico search" />
          </div>
        </div>

        {/*<div>새 대화 시작하기</div>*/}

        {/* 검색 결과 리스트 */}
        <div className="searchList v-box flex-1">
          <p
            className="NewChat"
            onClick={() => {
              router.push(`/chat/${ChatType}`);
              chatInputRef.current?.focus();
            }}
          >
            새 대화 시작하기
          </p>
          {/*{filteredRooms.length === 0 && filteredProjects.length === 0 && (*/}
          {/*  <div className="emptySet v-box flex-1">*/}
          {/*    /!*<Image src={"../assets/images/bg/img_empty_search_filled_64@2x.png"} alt="" width={24}/>*!/*/}
          {/*    <div className="bText">검색 결과가 없습니다.</div>*/}
          {/*    <div className="sText">검색어를 확인 후 다시 검색해 보세요.</div>*/}
          {/*  </div>*/}
          {/*)}*/}
          {!hasAnyData && (
            <div className="emptySet v-box flex-1">
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
              <div className="bText">대화 내역이나 프로젝트가 없습니다.</div>
              <div className="sText">새 대화를 시작해보세요.</div>
            </div>
          )}

          {hasAnyData && !hasSearchResults && (
            <div className="emptySet v-box flex-1">
              {theme === "darkTheme" ? (
                <Image
                  src={img_empty_search_filled_64_2x_dark}
                  alt=""
                  width={64}
                  height={64}
                />
              ) : (
                <Image
                  src={img_empty_search_filled_64_2x}
                  alt=""
                  width={64}
                  height={64}
                />
              )}
              <div className="bText">검색 결과가 없습니다.</div>
              <div className="sText">검색어를 확인 후 다시 검색해 보세요.</div>
            </div>
          )}
          <div className="ListBox v-box">
            <div className={"projectCon"}>
              {filteredProjects.length > 0 && (
                <p className={"title "} style={{ marginBottom: "2px" }}>
                  프로젝트
                </p>
              )}
              {filteredProjects.map((project) => (
                <div className={"listItem"} style={{ margin: 0, padding: 0 }}>
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: "10px",
                      listStyle: "none",
                    }}
                    key={project.project_id}
                    onClick={() => {
                      onClose();
                      setActiveProjectId(project.project_id);
                      router.push(
                        `/chat/${ChatType}/p/${project.project_id}?projectName=${project.project_name}`,
                      );
                    }}
                  >
                    {/*<li className='ellipsis flex-1'>*/}
                    <li className="pj ellipsis flex-1">
                      {project.project_name}
                    </li>
                  </ul>
                </div>
              ))}
            </div>
            <div className="historyCon flex-1 v-box">
              {filteredRooms.length > 0 && (
                <p className="title mb10">히스토리</p>
              )}
              {filteredRooms.length > 0 && (
                <div className="listItem">
                  <dl>
                    {todayRooms.length > 0 && <dt>오늘</dt>}
                    {todayRooms.map((room) => (
                      <dd
                        key={room.room_id}
                        onClick={() => {
                          onClose();
                          router.push(`/chat/${ChatType}/c/${room.room_id}`);
                          setActiveProjectId("");
                        }}
                      >
                        {room.room_name}
                      </dd>
                    ))}

                    {yesterdayRooms.length > 0 && <dt>어제</dt>}
                    {yesterdayRooms.map((room) => (
                      <dd
                        key={room.room_id}
                        onClick={() => {
                          onClose();
                          router.push(`/chat/${ChatType}/c/${room.room_id}`);
                        }}
                      >
                        {room.room_name}
                      </dd>
                    ))}

                    {otherRooms.length > 0 && <dt>지난 7일</dt>}
                    {otherRooms.map((room) => (
                      <dd
                        key={room.room_id}
                        onClick={() => {
                          onClose();
                          router.push(`/chat/${ChatType}/c/${room.room_id}`);
                        }}
                      >
                        {room.room_name}
                      </dd>
                    ))}
                  </dl>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
