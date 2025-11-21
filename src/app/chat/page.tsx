"use client";

import { useEffect } from "react";
import { redirectByDept, CustomObject } from "@/lib/redirect";

const ChatMainPage = () => {
  useEffect(() => {
    const urlObj: CustomObject = {
      더존협력업체: "/chat/dnx",
      // 필요 시 /chat 에서만 다른 매핑을 쓰고 싶으면 여기서만 다르게 정의 가능
    };

    redirectByDept(urlObj, "/chat/dnx");
  }, []);

  return <div></div>;
};

export default ChatMainPage;