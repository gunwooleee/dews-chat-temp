import React from "react";

type FAQBoxProps = {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
};
const FAQBox = ({ title, isOpen, onToggle, children }: FAQBoxProps) => {
  return (
    <dl>
      <dt className={` ${isOpen ? "up" : "down"}`} onClick={onToggle}>
        {title}
      </dt>
      {isOpen && <div className="faqContent">{children}</div>}
    </dl>
  );
};

export default FAQBox;
