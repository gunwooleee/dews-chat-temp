"use client";
import { useRouter } from "next/navigation";
import { useChatManager } from "@/context/ChatManager";
import DEWSAlert from "@/components/DEWSAlert/DEWSAlert";
import React, { useState } from "react";

export default function StartNewChat() {
  const router = useRouter();
  const { ChatType, isSending, streamCancle } = useChatManager();
  const [isSendingCancel, setIsSendingCancel] = useState(false);
  const [pendingNavigationPath, setPendingNavigationPath] = useState<
    string | null
  >(null);

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
      <button
        className="DEWSButton"
        // onClick={() => router.push(`/chat/${ChatType}`)}
        onClick={() => {
          const targetPath = `/chat/${ChatType}`;
          if (isSending) {
            setPendingNavigationPath(targetPath);
            setIsSendingCancel(true);
          } else {
            router.push(targetPath);
          }
        }}
      >
        새 대화 시작하기
      </button>
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
}
