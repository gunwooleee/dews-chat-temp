import React, { useRef, useState } from "react";

type Option = {
  value: string;
  text: string;
};

type DEWSDropDownListProps = {
  options: Option[];
  value?: React.ReactNode;
  onSelect?: (option: Option) => void;
  disabled?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
};

export default function DEWSDropDownList({
  options,
  value,
  onSelect,
  disabled,
  isOpen = false,
  onToggle,
}: DEWSDropDownListProps) {
  // const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<Option | undefined>(
    options.find((opt) => opt.value === value),
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSelect = (option: Option) => {
    setSelected(option);
    onSelect?.(option);
    onToggle?.();
  };

  return (
    <div
      className={`DEWSDropDownList ${disabled ? "disabled" : ""}`}
      ref={dropdownRef}
    >
      <div className="selected" onClick={onToggle} tabIndex={0}>
        {selected?.text || "선택하세요"}
      </div>
      {isOpen && !disabled && (
        <ul
          className="dropdownList"
          style={{
            // height: "**",
            paddingLeft: 0,
            margin: 0,
          }}
        >
          {/*{" "}*/}
          {/* 스크롤 필요 시 height 추가하기*/}
          {options.map((option, index) => (
            <li
              key={index}
              onClick={() => handleSelect(option)}
              style={{ paddingLeft: "40px" }}
            >
              {option.text}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
