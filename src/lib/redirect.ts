// src/lib/redirect.ts
"use client";

import Cookie from "@/lib/cookie";

export type CustomObject = {
    [key: string]: string | CustomObject | undefined;
};

// 부서명 -> 기본 URL 매핑
const defaultDeptUrl: Record<string, string> = {
    // 예: "DEWSAI개발Unit": "/chat/dnx",
};

// JWT payload 디코딩
function decodeJWT(token: string) {
    try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => {
                    return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
                })
                .join(""),
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Failed to decode JWT", e);
        return null;
    }
}

/**
 * DID_AUT 쿠키의 JWT를 읽어서 deptPathNm 기준으로 이동할 URL을 계산
 * @param urlObj 부서 경로 트리를 나타내는 객체
 * @param fallbackDefaultUrl 모든 계산이 실패했을 때 사용할 최종 기본 URL
 * @returns 계산된 URL (없으면 fallbackDefaultUrl 또는 null)
 */
export function getDeptRedirectUrl(
    urlObj: CustomObject,
    fallbackDefaultUrl: string = "/chat/dnx",
): string | null {
    const didAut = Cookie.get("DID_AUT");
    if (!didAut) {
        console.warn("DID_AUT 쿠키가 없습니다.");
        return fallbackDefaultUrl;
    }

    const decodedToken = decodeJWT(didAut);
    const deptPathNm: string | undefined = decodedToken?.deptPathNm;

    if (!deptPathNm) {
        console.warn("deptPathNm 정보가 없습니다.");
        return fallbackDefaultUrl;
    }

    const parts: string[] = deptPathNm.split("|");

    let tempPart: CustomObject | undefined;
    let url: string | undefined;

    // 1순위: 부서 트리(urlObj)에서 탐색
    parts.find((part) => {
        const urlObjPart = tempPart ? tempPart[part] : urlObj[part];

        if (urlObjPart && typeof urlObjPart === "string") {
            url = urlObjPart;
            return true;
        }

        if (urlObjPart && typeof urlObjPart === "object") {
            tempPart = urlObjPart;
        }
        return false;
    });

    // 2순위: defaultDeptUrl 에서 fallback 찾기
    const fallbackKey = parts.find((p) => p in defaultDeptUrl);
    const fallbackUrl = fallbackKey ? defaultDeptUrl[fallbackKey] : undefined;

    console.log("deptPathNm parts:", parts);
    console.log("matched url:", url);
    console.log("fallbackUrl:", fallbackUrl);

    return url ?? fallbackUrl ?? fallbackDefaultUrl ?? null;
}

/**
 * 실제로 window.location.href 로 이동까지 수행하는 헬퍼
 */
export function redirectByDept(
    urlObj: CustomObject,
    fallbackDefaultUrl: string = "/chat/dnx",
) {
    const target = getDeptRedirectUrl(urlObj, fallbackDefaultUrl);
    if (target) {
        window.location.href = target;
    }
}