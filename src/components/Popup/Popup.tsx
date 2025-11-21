import React from "react";
import { createPortal } from "react-dom";

type PopupProps = {
  // target: HTMLElement;
  open: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

export function Popup(props: PopupProps) {
  return (
    <>
      {props.open &&
        createPortal(
          <div
            className="DEWSContextPop flex-1 v-box popupCenter"
            style={{ ...props.style }}
          >
            {props.children}
          </div>,
          document.body,
        )}
    </>
  );
}
