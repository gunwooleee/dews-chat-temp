"use client";
import React, { useEffect, useRef, useState } from "react";
import { useChatManager } from "@/context/ChatManager";
import Image from "next/image";
import ic_check_outlined_bd_18_vl_enabled_2x from "@/assets/images/ico/ic_check_outlined_bd_18_vl_enabled@2x.png";
import lg_dnx_dark from "@/assets/images/dark/lg-sbjdnx@2x.png";
import lg_dnx from "@/assets/images/ico/lg-sbjdnx@2x.png";

type ModelOption = {
  label: string;
  value: string;
  description: string;
};
const logoData: Record<
  | "dnx"
  | "dnxflow"
  | "default",
  {
    dark: { icon: any; width: number; height: number };
    light: { icon: any; width: number; height: number };
  }
> = {
  dnx: {
    dark: { icon: lg_dnx_dark, width: 125, height: 33 },
    light: { icon: lg_dnx, width: 125, height: 33 },
  },
  dnxflow: {
    dark: { icon: lg_dnx_dark, width: 125, height: 33 },
    light: { icon: lg_dnx, width: 125, height: 33 },
  },
  default: {
    dark: { icon: lg_dnx_dark, width: 155, height: 33 },
    light: { icon: lg_dnx, width: 155, height: 33 },
  },
};
const options: ModelOption[] = [
  {
    label: "GPT-4o",
    value: "gpt4",
    description: "GEN AI DEWS에 최적화되어 대부분의 질문에 탁월함",
  },
  // {
  //   label: "Llama-Douzone-3.3-70b",
  //   value: "llama_douzone",
  //   description: "효율적인 학습과 추론, 높은 성능, 다양한 언어 지원",
  // },
  {
    label: "GPT-OSS-120b",
    value: "gpt_oss_120b",
    description: "폭넓은 언어 이해와 추론 생성 능력 제공",
  },
];

const ModelSelection = () => {
  const { changeModel, sidebarIsOpen, ChatType, llmModel } = useChatManager();
  // const [selectedModel, setSelectedModel] = useState("gpt4");
  const [isModelSettingOpen, setIsModelSettingOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // useEffect(() => {
  //   const storedModel = localStorage.getItem("llm_type");
  //   if (storedModel && options.some((option) => option.value === storedModel)) {
  //     setSelectedModel(storedModel);
  //     changeModel(storedModel);
  //   }
  // }, [changeModel]);

  const selectedLabel =
    options.find((opt) => opt.value === llmModel)?.label || "";

  const handleDropdownToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsModelSettingOpen((prev) => !prev);
  };

  const handleModelSelect = (option: ModelOption) => {
    // setSelectedModel(option.value);
    changeModel(option.value);
    setIsModelSettingOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsModelSettingOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={dropdownRef}
      className={`modelSel h-box v-align-center`}
      style={{
        left: sidebarIsOpen ? "12px" : "56px",
        marginLeft: logoData[ChatType].light.width,
      }}
      onClick={handleDropdownToggle}
    >
      <div className={"selTxt"}>{selectedLabel}</div>
      <div className={`toggleArrow ${isModelSettingOpen ? "on" : ""}`} />

      {isModelSettingOpen && (
        <div
          className="DEWSContextPop"
          style={{ top: "55px", left: "16px", width: "300px", height: "auto" }}
        >
          <div className="modelTitle h-box v-align-center">
            <div className="tit">모델</div>
          </div>
          <div className="contextModelSel v-box">
            {options.map((option) => (
              <div
                key={option.value}
                className="menuItem v-box h-align-center"
                onMouseDown={() => handleModelSelect(option)}
              >
                <div className="h-box v-align-center">
                  <div className="v-box flex-1">
                    <div className="txt">{option.label}</div>
                    <div className="subTxt">{option.description}</div>
                  </div>
                  {llmModel === option.value && (
                    <Image
                      src={ic_check_outlined_bd_18_vl_enabled_2x}
                      alt=""
                      width={18}
                      // height={}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelSelection;
