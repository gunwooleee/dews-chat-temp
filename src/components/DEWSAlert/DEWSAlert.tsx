import React from "react";

type DEWSAlertProps = {
  width?: string;
  height?: string;
  type?: "success" | "error" | "warning";
  title?: string;
  text: React.ReactNode;
  cancelBtn?: string;
  confirmBtn?: string;
  handleAlertClose?: () => void;
  onConfirm?: () => void;
  isOpen?: boolean;
};

export default function DEWSAlert({
  width,
  height,
  type,
  title,
  text,
  cancelBtn,
  confirmBtn,
  handleAlertClose,
  onConfirm,
  isOpen,
}: DEWSAlertProps) {
  return (
    <>
      {isOpen && (
        <>
          <div
            className="DEWSAlert v-box animated03s fadeIn"
            style={{ width, height }}
          >
            {type && (
              <span
                className={`ico ${
                  type === "success"
                    ? "success"
                    : type === "error"
                      ? "error"
                      : type === "warning"
                        ? "warning"
                        : ""
                }`}
              />
            )}
            <div className="popCon v-box flex-1">
              {title && <div className="title">{title}</div>}
              {text && <div className="text">{text}</div>}
            </div>
            <div className="DEWSButtonGroup h-box">
              {cancelBtn && (
                <button
                  className="DEWSButton"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAlertClose?.();
                  }}
                >
                  {cancelBtn}
                </button>
              )}
              {confirmBtn && (
                <button
                  className="DEWSButton blue"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAlertClose?.();
                    onConfirm?.();
                  }}
                >
                  {confirmBtn}
                </button>
              )}
            </div>
          </div>
          <div className="dimFixed" />
        </>
      )}
    </>
  );
}
