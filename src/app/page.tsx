"use client";
import { useEffect } from "react";
import { redirectByDept, CustomObject } from "@/lib/redirect";


export default function Home() {
  useEffect(() => {
    // 부서별(또는 부서 경로별) URL 매핑
    const urlObj: CustomObject = {
      더존협력업체: "/chat/dnx",
      // 필요 시 중첩 구조도 가능
      // "성장전략부문": {
      //   "어떤팀": "/chat/dnxflow",
      // },
    };

    redirectByDept(urlObj, "/chat/dnx");

  }, []);
  return <div className=""></div>;
}
