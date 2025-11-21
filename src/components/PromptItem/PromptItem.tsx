"use client";

import React from "react";
import Image from "next/image";

type PromptItemProps = {
  icon: any;
  text: string;
  onClick: () => void;
};

const PromptItem = ({ icon, text, onClick }: PromptItemProps) => {
  return (
    <div className="prompt h-box v-align-center" onClick={onClick}>
      <Image src={icon} alt="" width={24} />
      <div className="txt">{text}</div>
    </div>
  );
};

export default PromptItem;
