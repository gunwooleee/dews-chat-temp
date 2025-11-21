import React, { useState, useCallback } from "react";

type TooltipProps = {
  labelText?: React.ReactNode;
  position?: "bottom" | "top" | "left" | "right";
  tooltipStyle?: React.CSSProperties;
  mouseHover?: boolean;
  fixedPosition?: { top: number; left: number };
} & React.HTMLAttributes<HTMLDivElement>;

export default function DEWSTooltip({
  labelText,
  position = "bottom",
  tooltipStyle,
  mouseHover = true,
  fixedPosition = { top: 0, left: 0 },
  className = "",
  style,
  onClick,
  children,
  ...rest
}: TooltipProps) {
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!mouseHover) return;

      const { clientX, clientY } = event;
      let top = clientY;
      let left = clientX;

      switch (position) {
        case "top":
          top -= 15;
          break;
        case "bottom":
          top += 25;
          break;
        case "left":
          left -= 15;
          break;
        case "right":
          left += 15;
          break;
        default:
          top += 10;
      }

      setTooltipPosition({ top, left });
    },
    [mouseHover, position],
  );

  const positionStyle = mouseHover ? tooltipPosition : fixedPosition;

  return (
    <div
      className={`DEWSTooltip ${className ? ` ${className}` : ""}`}
      style={style}
      onClick={onClick}
      onMouseMove={mouseHover ? handleMouseMove : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...rest}
    >
      {children}
      {isHovered && (
        <div
          className={`tooltipBox animated05s fadeIn ${position}`}
          style={{
            position: "fixed",
            ...tooltipStyle,
            ...positionStyle,
          }}
        >
          {labelText}
        </div>
      )}
    </div>
  );
}
