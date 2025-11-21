"use client";

import React, { useEffect, useState } from "react";
import { useChatManager } from "@/context/ChatManager";
import CodeSnippet from "@/components/CodeSnippet/CodeSnippet";
import DEWSSnackbar from "@/components/DEWSSnackbar/DEWSSnackbar";
import { useRouter } from "next/navigation";
import DEWSTooltip from "@/components/DEWSTooltip/DEWSTooltip";
import img_empty_code_storage_filled_64_2x from "@/assets/images/ico/img_empty_code_storage_filled_64@2x.png";
import Image from "next/image";

export default function ArchivedPage() {
  const router = useRouter();
  const [openId, setOpenId] = useState<string | null>(null); // 누른 항목 ID 저장
  const [isCodeDeleted, setIsCodeDeleted] = useState(false); // 코드 삭제 상태
  const [searchTerm, setSearchTerm] = useState(""); // 검색어 저장할 상태 추가
  const beforePage = sessionStorage.getItem("beforePage") || ""; // 이전 페이지 URL 저장
  const {
    codes,
    getCodelist,
    removeCode,
    updateCodeRoomName,
    sidebarIsOpen,
    setSidebarIsOpen,
    ChatType,
  } = useChatManager();

  useEffect(() => {
    // sessionStorage.setItem("beforePage", window.location.href);
    getCodelist();
  }, []);

  // /* 검색 필터 */
  const filtered = codes
    .filter((s) => s.room_name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

  const handleDelete = async (code_id: string) => {
    try {
      removeCode(code_id);
      setIsCodeDeleted(true);
      setTimeout(() => {
        setIsCodeDeleted(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to delete code snippet:", err);
    }
  };

  const handleToggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <>
      {!sidebarIsOpen && (
        <DEWSTooltip labelText={"열기"} position="bottom">
          <div className="foldingWrap">
            <button
              className={`DEWSTooltip btnIco folding`}
              onClick={() => setSidebarIsOpen(!sidebarIsOpen)}
            />
          </div>
        </DEWSTooltip>
      )}
      {/*<ModelSelection />*/}

      <div className="viewSell h-box v-align-center">
        <div
          className="btn chat h-box v-align-center"
          onClick={() => {
            console.log("beforePage", beforePage);
            if (beforePage) {
              router.push(beforePage);
            } else {
              router.push(`/chat/${ChatType}`);
            }
          }}
        >
          <div className="ico"></div>
          <div className="txt">대화</div>
        </div>
        <div
          className="btn code h-box v-align-center on"
          onClick={() => router.push(`/chat/${ChatType}/history`)}
        >
          <div className="ico"></div>
          <div className="txt">코드 보관함</div>
        </div>
      </div>

      <div className={"codeArchive"}>
        <div className="title">코드 보관함</div>
        <div className="textStickyBox">
          <div className="DEWSTextFieldIcon">
            <input
              type="text"
              placeholder="검색어를 입력하세요."
              className="DEWSTextField big flex-1"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} // 검색어 상태 업데이트
            />
            <div
              className="ico delete"
              style={{ right: "45px" }}
              onClick={() => setSearchTerm("")}
            />
            <div className="ico search" />
          </div>
        </div>
        <div
          className="codeList v-box"
          style={{
            // maxHeight: "calc(100vh - 325px)",
            maxHeight: openId
              ? "calc(100vh - 383px)" // 325px + 300px
              : "calc(100vh - 325px)",
            minWidth: "950px",
            overflowY: "auto",
          }}
        >
          {filtered.length === 0 ? (
            codes.length === 0 ? (
              <div className="emptySet v-box">
                <Image src={img_empty_code_storage_filled_64_2x} alt="" />
                <div className="bText">저장된 코드가 아직 없습니다.</div>
                <div className="sText">자주 쓰는 코드를 보관해 보세요!</div>
              </div>
            ) : (
              <div className="emptySet v-box">
                <Image src={img_empty_code_storage_filled_64_2x} alt="" />
                <div className="bText">
                  '{searchTerm}'에 대한 보관 코드가 없습니다.
                </div>
                <div className="sText">다른 검색어를 입력해 주세요.</div>
              </div>
            )
          ) : (
            <>
              {filtered.map((s) => (
                <CodeSnippet
                  key={s.code_id}
                  code_id={s.code_id}
                  room_id={s.room_id}
                  language={s.language}
                  content={s.content}
                  room_name={s.room_name}
                  created_at={s.created_at}
                  isAreaOpen={openId === s.code_id}
                  onToggle={() => handleToggle(s.code_id)}
                  onDelete={() => handleDelete(s.code_id)}
                  onEditRoomName={updateCodeRoomName}
                />
              ))}
            </>
          )}
        </div>

        {/*<Toast show={isCodeDeleted} message="코드가 삭제되었습니다."/>*/}
        <DEWSSnackbar
          type="success"
          text="코드가 삭제되었습니다."
          snackbar={isCodeDeleted}
          onClose={() => setIsCodeDeleted(false)}
        />
      </div>
    </>
  );
}
