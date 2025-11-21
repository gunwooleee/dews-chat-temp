import React from "react";
import { createPortal } from "react-dom";
import styles from "./modal.module.css";

const PortalModal = ({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) => {
  return createPortal(
    <div
      className={styles.backdrop}
      onClick={onClose}
      style={{ overflowY: "scroll", display: "grid" }}
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>

        {children}
      </div>
    </div>,
    document.body,
  );
};

export default PortalModal;
