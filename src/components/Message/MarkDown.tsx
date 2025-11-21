import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import oneDarkRaw from "react-syntax-highlighter/dist/esm/styles/prism/one-dark";
import styles from "./MarkDown.module.css";
import clas from "classnames";
import Image from "next/image";
import ic_codestorage_outlined_18_wh_enabled_2x from "@/assets/images/ico/ic_codestorage_outlined_18_wh_enabled@2x.png";
import ic_squares_outlined_18_wh_enabled_2x from "@/assets/images/ico/ic_squares_outlined_18_wh_enabled@2x.png";
import DEWSSnackbar from "@/components/DEWSSnackbar/DEWSSnackbar";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import useIsMobile from "@/hooks/useIsMobile";

type MarkDownProps = {
  onSelectedText?: (code: string, language?: string) => void;
  text?: string;
  className?: string;
  onClick?: () => void;
  onCopy?: () => void;
  onStop?: () => void;
  onRemove?: () => void;
  citations?: Array<{ title: string; url: string }>;
  edit?: boolean;
};

// \[ ... \], \( ... \) 형태의 수식 구분자를 $$ ... $$, $ ... $ 로 정규화
function normalizeMathDelimiters(src?: string) {
  if (!src) return "";
  let s = src;

  // 블록 수식: \[ ... \] -> $$ ... $$
  s = s.replace(/\\\[(.+?)\\\]/gs, (_m, p1) => `\n$$\n${p1}\n$$\n`);

  // 인라인 수식: \( ... \) -> $ ... $
  s = s.replace(/\\\((.+?)\\\)/gs, (_m, p1) => `$${p1}$`);

  return s;
}

export function MarkDown(props: MarkDownProps) {
  const isMobile = useIsMobile();
  const [selectedText, setSelectedText] = useState("");
  const [isCodeStorage, setIsCodeStorage] = useState(false);
  const [isCodeCopied, setIsCodeCopied] = useState(false);
  const [isSnackbarActive, setIsSnackbarActive] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // 수식/표 렌더링을 위한 텍스트 전처리
  const normalizedText = useMemo(
    () => normalizeMathDelimiters(props.text),
    [props.text],
  );

  // 테이블의 각 셀에 data-label(헤더 텍스트) 자동 설정
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const tables = root.querySelectorAll("table");
    tables.forEach((table) => {
      const headerCells = Array.from(
        table.querySelectorAll<HTMLTableCellElement>("thead th"),
      ).map((th) => (th.textContent || "").trim());

      // 헤더가 없는 테이블은 스킵
      if (headerCells.length === 0) return;

      const bodyRows = table.querySelectorAll<HTMLTableRowElement>("tbody tr");
      bodyRows.forEach((tr) => {
        const tds = Array.from(tr.querySelectorAll<HTMLTableCellElement>("td"));
        tds.forEach((td, idx) => {
          const label = headerCells[idx] || "";
          if (label) td.setAttribute("data-label", label);
        });
      });
    });
  }, [normalizedText]);

  return (
    <div className={styles.MarkDownWrapper} ref={rootRef}>
      <ReactMarkdown
        // 수식 파싱을 먼저 수행하도록 순서 조정
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[
          [
            rehypeKatex,
            {
              throwOnError: false, // 수식 오류 시 실패하지 않고 계속 렌더
              strict: false, // 엄격 모드 비활성화
              trust: true, // 일부 매크로나 HTML 허용
              output: "html",
            },
          ],
        ]}
        children={normalizedText}
        components={{
          // 코드 블록(기존 로직 유지)
          pre({ node, ...props }) {
            return (
              <pre
                {...props}
                style={{
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  overflowWrap: "anywhere",
                }}
              />
            );
          },
          code({ node, className, children, ..._props }) {
            const match = /language-(\w+)/.exec(className || "");
            const language = match ? match[1] : "";
            const isInline =
              node?.position?.start?.line === node?.position?.end?.line;
            let code = String(children).replace(/\n$/, "");
            const handleCopy = async () => {
              if (isSnackbarActive) return;
              try {
                await navigator.clipboard.writeText(code);
                setIsCodeCopied(true);
              } catch (err) {
                console.error("복사 실패:", err);
              }
            };
            const handleCopiedToHistory = async () => {
              if (isSnackbarActive) return;
              try {
                setSelectedText(code);
                props.onSelectedText?.(code, language);
                setIsCodeStorage(true);
              } catch (err) {
                console.error("코드 보관 실패:", err);
              }
            };
            if (!isInline && match) {
              return (
                <div className={styles.CodeWrapper}>
                  <div className={styles.CodeHeader}>
                    <div
                      className={clas(
                        "category",
                        "icon-" + language,
                        styles.IconWrapper,
                      )}
                    ></div>
                    <div className={`${styles.CodeTitle}`}>{language}</div>
                    <div className={styles.CodeButtonGroup}>
                      <div className="markdownText h-box">
                        {isMobile ? (
                          <>
                            <p className={"reply"}>답변</p>
                            <p className={"check"}>적용</p>
                            <p className={"copy"}>복사</p>
                          </>
                        ) : (
                          <>
                            <p
                              onClick={handleCopiedToHistory}
                              style={{ cursor: "pointer" }}
                            >
                              <Image
                                src={ic_codestorage_outlined_18_wh_enabled_2x}
                                alt=""
                                width={18}
                                height={18}
                              />
                              코드 보관
                            </p>
                            <p
                              onClick={handleCopy}
                              style={{ cursor: "pointer" }}
                            >
                              <Image
                                src={ic_squares_outlined_18_wh_enabled_2x}
                                alt=""
                                width={24}
                                height={18}
                              />
                              복사
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <SyntaxHighlighter
                    // @ts-ignore
                    style={oneDarkRaw}
                    language={language}
                    PreTag="pre"
                    codeTagProps={{
                      style: {
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        overflowWrap: "anywhere",
                      },
                    }}
                    customStyle={{
                      margin: "0",
                      borderRadius: "0 0 8px 8px",
                      background: "#282c34",
                      maxWidth: "100%",
                    }}
                    {..._props}
                  >
                    {code}
                  </SyntaxHighlighter>
                </div>
              );
            } else {
              return children;
            }
          },

          // 테이블 렌더링 개선: 클래스/역할 부여
          table: ({ node, ...props }) => (
            <div className={styles.TableWrapper}>
              <table className={styles.Table} {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className={styles.TableHead} {...props} />
          ),
          tbody: ({ node, ...props }) => (
            <tbody className={styles.TableBody} {...props} />
          ),
          tr: ({ node, ...props }) => (
            <tr className={styles.TableRow} {...props} />
          ),
          th: ({ node, ...props }) => (
            <th scope="col" className={styles.TableHeaderCell} {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className={styles.TableCell} {...props} />
          ),
        }}
      />

      <DEWSSnackbar
        type="success"
        text="보관되었습니다."
        moveLink={`../history`}
        moveText={"코드 보관함"}
        snackbar={isCodeStorage}
        onClose={() => setIsCodeStorage(false)}
        onShowChange={(visible) => setIsSnackbarActive(visible)}
      />
      <DEWSSnackbar
        type="success"
        text="복사되었습니다."
        snackbar={isCodeCopied}
        onClose={() => setIsCodeCopied(false)}
        onShowChange={(visible) => setIsSnackbarActive(visible)}
      />
    </div>
  );
}
