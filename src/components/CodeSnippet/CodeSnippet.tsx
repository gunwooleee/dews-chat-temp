import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import api from "@/lib/api";
import { Code } from "@/context/ChatManager";
import Image from "next/image";
import { useTheme } from "@/context/ThemeManager";
import oneDarkRaw from "react-syntax-highlighter/dist/esm/styles/prism/one-dark";
import ic_pencil_outlined_18_bk_enabled_2x from "@/assets/images/ico/ic_pencil_outlined_18_bk_enabled@2x.png";
import ic_unarchive_outlined_18_bk_2x from "@/assets/images/ico/ic_unarchive_outlined_18_bk@2x.png";
import DEWSAlert from "@/components/DEWSAlert/DEWSAlert";
import DEWSTooltip from "@/components/DEWSTooltip/DEWSTooltip";
import styles from "./MarkDown.module.css";
import ic_pencil_outlined_18_bk_enabled_2x_dark from "@/assets/images/dark/ic_pencil_outlined_18_bk_enabled@2x.png";
import ic_unarchive_outlined_18_bk_2x_dark from "@/assets/images/dark/ic_unarchive_outlined_18_bk@2x.png";
import clas from "classnames";
import ic_squares_outlined_18_wh_enabled_2x from "@/assets/images/ico/ic_squares_outlined_18_wh_enabled@2x.png";
import DEWSSnackbar from "@/components/DEWSSnackbar/DEWSSnackbar";

type CodeSnippetProps = Code & {
  isAreaOpen: boolean;
  onToggle: () => void;
  onDelete?: (codeId: string) => void;
  onEditRoomName?: (codeId: string, newName: string) => void;
};

const CodeSnippet = ({
  code_id,
  language,
  room_name,
  created_at,
  isAreaOpen,
  onToggle,
  onDelete,
  onEditRoomName,
}: CodeSnippetProps) => {
  const { theme } = useTheme();
  const d = new Date(created_at);
  const koDate = `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

  const [code, setCode] = useState<string>("");
  const [isCodeCopied, setIsCodeCopied] = useState(false);
  const [isSnackbarActive, setIsSnackbarActive] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedRoomName, setEditedRoomName] = useState(room_name);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isAreaOpen && !hasFetched) {
      const fetchCode = async () => {
        try {
          const res = await api.get(`/api/history/${code_id}`);
          setCode(res.data.content ?? "");
          setHasFetched(true);
        } catch (err) {
          console.error("코드 get 실패:", err);
        }
      };
      fetchCode();
    }
  }, [isAreaOpen, hasFetched, code_id]);

  const handleDelete = async () => {
    try {
      onDelete?.(code_id);
    } catch (err) {
      console.error("코드 delete 실패:", err);
    } finally {
      setIsAlertOpen(false);
    }
  };

  const handleCopy = async () => {
    if (isSnackbarActive) return;
    try {
      await navigator.clipboard.writeText(code);
      setIsCodeCopied(true);
    } catch (err) {
      console.error("복사 실패:", err);
    }
  };

  return (
    <div
      className="listItem v-box h-align-center"
      style={{
        // height: "auto",
        display: "flex",
        gap: "0px",
        flexDirection: "column",
        justifyContent: "flex-start",
        minHeight: isAreaOpen ? "max-content" : "",
        maxHeight: isAreaOpen ? "max-content" : "none",
      }}
    >
      {/* infoBox: 항상 고정 */}
      <div
        className="infoBox h-box v-align-center"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={
          {
            // marginTop: isAreaOpen ? "12px" : "0px",
            // padding: isAreaOpen ? "3px" : "0px",
          }
        }
      >
        <div className={`category ${language}`}>
          <span>{language}</span>
        </div>
        <div className="line" />
        <div
          className="DEWSTooltip txt flex-1"
          title="더블 클릭하여 수정가능"
          onDoubleClick={() => setIsEditing(true)}
        >
          {isEditing ? (
            <input
              className="DEWSTextField check flex-1"
              autoFocus
              type="text"
              value={editedRoomName}
              onChange={(e) => setEditedRoomName(e.target.value)}
              onBlur={() => {
                setIsEditing(false);
                if (editedRoomName !== room_name) {
                  onEditRoomName?.(code_id, editedRoomName);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setIsEditing(false);
                  if (editedRoomName !== room_name) {
                    onEditRoomName?.(code_id, editedRoomName);
                  }
                }
              }}
            />
          ) : (
            <div className="ellipsis">{editedRoomName}</div>
          )}
        </div>

        <div className="btns h-box v-align-center">
          {isHovered && (
            <>
              {theme === "darkTheme" ? (
                <>
                  <DEWSTooltip
                    className="eventLink"
                    labelText={"수정"}
                    position="top"
                    onClick={() => setIsEditing(true)}
                  >
                    <Image
                      src={ic_pencil_outlined_18_bk_enabled_2x_dark}
                      alt="edit"
                      width={18}
                      height={18}
                      // onClick={() => setIsEditing(true)}
                    />
                  </DEWSTooltip>
                  <DEWSTooltip
                    className="eventLink"
                    labelText={"보관해제"}
                    position="top"
                    onClick={() => setIsAlertOpen(true)}
                  >
                    <Image
                      src={ic_unarchive_outlined_18_bk_2x_dark}
                      alt="unarchive"
                      width={18}
                      height={18}
                      // onClick={() => setIsAlertOpen(true)}
                    />
                  </DEWSTooltip>
                </>
              ) : (
                <>
                  <DEWSTooltip
                    className="eventLink"
                    labelText={"수정"}
                    position="top"
                    onClick={() => setIsEditing(true)}
                  >
                    <Image
                      src={ic_pencil_outlined_18_bk_enabled_2x}
                      alt="edit"
                      width={18}
                      height={18}
                      // onClick={() => setIsEditing(true)}
                    />
                  </DEWSTooltip>
                  <DEWSTooltip
                    className="eventLink"
                    labelText={"보관해제"}
                    position="top"
                    onClick={() => setIsAlertOpen(true)}
                  >
                    <Image
                      src={ic_unarchive_outlined_18_bk_2x}
                      alt="unarchive"
                      width={18}
                      height={18}
                      // onClick={() => setIsAlertOpen(true)}
                    />
                  </DEWSTooltip>
                </>
              )}
            </>
          )}
        </div>
        <div className="date">{koDate}</div>
        <div
          className={`arrow ${isAreaOpen ? "up" : "down"}`}
          onClick={onToggle}
        />
      </div>

      {/* codeBox: 토글 대상 */}
      <div>
        {isAreaOpen && (
          <>
            <div className={styles.CodeWrapper}>
              <div className={styles.CodeHeader}>
                <div
                  className={clas(
                    "category",
                    "icon-" + language,
                    styles.IconWrapper,
                  )}
                >
                  {/*<img src={}></img>*/}
                </div>
                <div className={`${styles.CodeTitle}`}>{language}</div>
                <div className={styles.CodeButtonGroup}>
                  <div className="markdownText h-box">
                    <p onClick={handleCopy} style={{ cursor: "pointer" }}>
                      <Image
                        src={ic_squares_outlined_18_wh_enabled_2x}
                        alt=""
                        width={24}
                        height={18}
                      />
                      복사
                    </p>
                  </div>
                </div>
              </div>
              <motion.div
                key="codeBox"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="codeBox"
                style={{ width: "100%", overflow: "auto" }}
              >
                <SyntaxHighlighter
                  // @ts-ignore
                  style={oneDarkRaw}
                  language={language}
                  PreTag="div"
                  customStyle={{
                    padding: "1em",
                    margin: "0",
                    borderRadius: "0 0 8px 8px",
                    background: "#282c34",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                  codeTagProps={{
                    style: {
                      whiteSpace: "pre-wrap",
                    },
                  }}
                >
                  {code}
                </SyntaxHighlighter>
                {/*</pre>*/}
              </motion.div>
            </div>
            {/*<motion.div*/}
            {/*  key="codeBox"*/}
            {/*  initial={{ height: 0, opacity: 0 }}*/}
            {/*  animate={{ height: "auto", opacity: 1 }}*/}
            {/*  exit={{ height: 0, opacity: 0 }}*/}
            {/*  transition={{ duration: 0.3, ease: "easeInOut" }}*/}
            {/*  className="codeBox"*/}
            {/*  style={{ width: "100%", overflow: "auto" }}*/}
            {/*>*/}
            {/*  <SyntaxHighlighter*/}
            {/*    // @ts-ignore*/}
            {/*    style={oneDarkRaw}*/}
            {/*    language={language}*/}
            {/*    PreTag="div"*/}
            {/*    customStyle={{*/}
            {/*      padding: "1em",*/}
            {/*      margin: "0",*/}
            {/*      borderRadius: "8px",*/}
            {/*      background: "#282c34",*/}
            {/*      whiteSpace: "pre-wrap",*/}
            {/*      wordBreak: "break-word",*/}
            {/*    }}*/}
            {/*    codeTagProps={{*/}
            {/*      style: {*/}
            {/*        whiteSpace: "pre-wrap",*/}
            {/*      },*/}
            {/*    }}*/}
            {/*  >*/}
            {/*    {code}*/}
            {/*  </SyntaxHighlighter>*/}
            {/*  /!*</pre>*!/*/}
            {/*</motion.div>*/}
          </>
        )}
      </div>

      {/* Alert */}
      {isAlertOpen && (
        <DEWSAlert
          isOpen={isAlertOpen}
          handleAlertClose={() => setIsAlertOpen(false)}
          onConfirm={handleDelete}
          type="warning"
          width="340px"
          title=""
          text={<>선택한 코드의 보관을 해제하시겠습니까?</>}
          cancelBtn="취소"
          confirmBtn="확인"
        />
      )}
      <DEWSSnackbar
        type="success"
        text="복사되었습니다."
        snackbar={isCodeCopied}
        onClose={() => setIsCodeCopied(false)}
        onShowChange={(visible) => setIsSnackbarActive(visible)}
      />
    </div>
  );
};

export default CodeSnippet;
