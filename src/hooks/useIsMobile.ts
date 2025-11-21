import { useEffect, useState } from "react";

/**
 * 모바일 뷰포트 감지 훅
 * @returns boolean - 현재 화면이 768px 이하인 경우 true
 */
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 10px)");

    const handleChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };

    setIsMobile(mediaQuery.matches);

    mediaQuery.addEventListener("change", handleChange);

    // 클린업
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return isMobile;
};

export default useIsMobile;
