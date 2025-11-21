"use client";

import {
  tabContents,
  tabContents2,
  tabContents3,
  tabContents4,
  tabContents5,
} from "@/data/prompts";

// 더미 데이터 받아서 넣어주게

type TabContentProps = {
  index: number;
  onSelect: (text: string) => void;
};

const TabContent = ({ index, onSelect }: TabContentProps) => {
  const tabDataMap = [
    tabContents,
    tabContents2,
    tabContents3,
    tabContents4,
    tabContents5,
  ];
  const currentContents = tabDataMap[index] || [];

  return (
    <div className="tab-content flex flex-col space-y-2">
      {currentContents.map((item, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(item)}
          className="text-left p-2 bg-gray-100 rounded hover:bg-gray-200"
        >
          {item}
        </button>
      ))}
    </div>
  );
};

export default TabContent;
