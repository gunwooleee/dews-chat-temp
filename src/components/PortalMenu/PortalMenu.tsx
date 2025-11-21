import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type PortalMenuProps = {
  locationRef?: React.RefObject<HTMLDivElement | null>;
  isOpen?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

//transform the locationRef to a position
//container 위치까지 올려야함

const PortalMenu = (props: PortalMenuProps) => {
  const [position, setPosition] = useState<React.CSSProperties>({});
  useEffect(() => {
    if (props.isOpen && props.locationRef?.current) {
      const rect = props.locationRef.current.getBoundingClientRect();

      // 예를들어 가장 아래쪽이면 rect.bottom 은 902, window.innerHeight는 968이고,  dropdownHeight 는 120 이므로
      // availableHeight 는 66 이다. 즉, 120 보다 작으므로 아래로 내려갈 수 없다.
      // 따라서 위로 올려야 한다.
      // 두번째 예) 중간쪽에 rect.bottom 이 500 이고, window.innerHeight 는 968 이고, dropdownHeight 는 120 이면
      // availableHeight 는 468 이다. 즉, 120 보다 크므로 아래로 내려갈 수 있다.

      setPosition({
        position: "absolute",
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX + 5,
        zIndex: 1000,
        ...props.style,
      });
    }
  }, [props.isOpen, props.locationRef]);
  return (
    <>
      {props.isOpen &&
        createPortal(
          <div style={position}>{props.children}</div>,
          document.body,
        )}
    </>
  );
};

export default PortalMenu;
