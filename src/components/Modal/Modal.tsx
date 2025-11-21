"use client";
import React, { ReactNode, useEffect } from "react";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: ReactNode;
  actions?: ReactNode;
};

const Modal = ({ isOpen, onClose, title, children, actions }: ModalProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="DEWSContextPop flex-1 v-box popupCenter"
      onClick={onClose}
      style={{ width: "680px", height: "444px" }}
    >
      <div onClick={(e) => e.stopPropagation()}>
        {title && (
          <div>
            <h2>{title}</h2>
            <button onClick={onClose} aria-label="닫기">
              &times;
            </button>
          </div>
        )}

        {/* 본문 내용 */}
        <div>{children}</div>

        {/* 액션 버튼들 */}
        <div>{actions ? actions : <button onClick={onClose}>확인</button>}</div>
      </div>
    </div>

    // <div
    //   className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    //   onClick={onClose}
    // >
    //   <div
    //     className="bg-white rounded-xl shadow-lg p-6 max-w-xl w-full"
    //     onClick={(e) => e.stopPropagation()}
    //   >
    //     {title && (
    //       <div className="flex justify-between items-center mb-2">
    //         <h2 className="text-xl font-semibold">{title}</h2>
    //         <button
    //           onClick={onClose}
    //           className="text-black hover:text-gray-600 text-2xl mb-4"
    //           aria-label="닫기"
    //         >
    //           &times;
    //         </button>
    //       </div>
    //     )}
    //
    //     {/* 본문 내용 */}
    //     <div className="mb-4">
    //       {children}
    //     </div>
    //
    //     {/* 액션 버튼들 */}
    //     <div className="flex justify-center gap-2 text-center">
    //       {actions ? actions : (
    //         <button
    //           className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    //           onClick={onClose}
    //         >
    //           확인
    //         </button>
    //       )}
    //     </div>
    //   </div>
    // </div>
  );
};

export default Modal;
