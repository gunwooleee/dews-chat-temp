import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type DEWSSnackbarProps = {
  text: React.ReactNode;
  moveLink?: string;
  moveText?: string;
  type: "success" | "warning" | "error" | "progress" | "information";
  snackbar: boolean;
  onClose?: () => void;
  style?: React.CSSProperties;
  onShowChange?: (visible: boolean) => void;
};

export default function DEWSSnackbar({
  type,
  moveLink,
  moveText,
  text,
  snackbar,
  onClose,
  onShowChange,
}: DEWSSnackbarProps) {
  const router = useRouter();
  const [opacity, setOpacity] = React.useState(0);
  const [transform, setTransform] = React.useState(
    "translateX(-50%) translateY(0px)",
  );
  const [visible, setVisible] = React.useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (snackbar) {
      showToast();
    }
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [snackbar]);

  const showToast = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setVisible(true);
    onShowChange?.(true);

    setTimeout(() => {
      setOpacity(1);
      setTransform("translateY(0px)");
    }, 10);

    const timer = setTimeout(() => {
      setOpacity(0);
      setTransform("translateY(50px)");

      setTimeout(() => {
        setVisible(false);
        onShowChange?.(false);
        if (onClose) onClose(); // 부모에서 상태 초기화
      }, 300);
    }, 1500);
  };
  const handleClick = () => {
    if (moveLink) {
      router.push(moveLink);
    }
  };

  if (!visible) return null;

  return (
    <div
      className="DEWSSnackbar h-box v-align-center"
      style={{ transform: `translateX(-50%) ${transform}`, opacity: opacity }}
    >
      <span
        className={`${type === "success" ? "success" : type === "warning" ? "warning" : type === "error" ? "error" : type === "progress" ? "progress" : type === "information" ? "information" : ""}`}
      />
      <div className="text mr10">{text}</div>
      {moveLink && (
        <div
          // style={{ color: "white", textDecoration: "underline" }}
          className={"btnType01 flex-1 text"}
          onClick={() => router.push(moveLink)}
        >
          &nbsp; {moveText}으로 이동
        </div>
      )}
    </div>
  );
}
