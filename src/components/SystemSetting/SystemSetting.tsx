import React, { useEffect, useRef, useState } from "react";
import DEWSTooltip from "../DEWSTooltip/DEWSTooltip";
import DEWSSnackbar from "@/components/DEWSSnackbar/DEWSSnackbar";
import DEWSDropDownList from "@/components/DEWSDropDownList/DEWSDropDownList";
import { Theme, useTheme } from "@/context/ThemeManager";

type SystemSettingProps = {
  onApply: (val1: string, val2: string) => void;
  isOpen: boolean;
  onClose?: () => void;
};

const dropdownlist01 = [
  { value: "0", text: "0.1 (낮은 창의성,안정적인 답변)" },
  { value: "1", text: "0.2 (낮은 창의성,안정적인 답변)" },
  { value: "2", text: "0.3 (낮은 창의성,안정적인 답변)" },
  { value: "3", text: "0.4 (중간 창의성)" },
  { value: "4", text: "0.5 (중간 창의성)" },
  { value: "5", text: "0.6 (중간 창의성)" },
  { value: "6", text: "0.7 (높은 창의성)" },
  { value: "7", text: "0.8 (높은 창의성)" },
  { value: "8", text: "0.9 (높은 창의성)" },
  { value: "9", text: "1.0 (높은 창의성)" },
];

const dropdownlist02 = [
  { value: "0", text: "0.1 (예측 가능한 어휘 활용)" },
  { value: "1", text: "0.2 (예측 가능한 어휘 활용)" },
  { value: "2", text: "0.3 (예측 가능한 어휘 활용)" },
  { value: "3", text: "0.4 (보통의 어휘 활용)" },
  { value: "4", text: "0.5 (보통의 어휘 활용)" },
  { value: "5", text: "0.6 (보통의 어휘 활용)" },
  { value: "6", text: "0.7 (폭넓은 어휘 활용)" },
  { value: "7", text: "0.8 (폭넓은 어휘 활용)" },
  { value: "8", text: "0.9 (폭넓은 어휘 활용)" },
  { value: "9", text: "1.0 (폭넓은 어휘 활용)" },
];

const themeOptions = [
  { value: "lightTheme", text: "라이트 테마" },
  { value: "darkTheme", text: "다크 테마" },
  // { value: "lightgray", text: "라이트 그레이 테마" },
  // { value: "system", text: "시스템 테마" },
];

const SystemSetting = ({ onApply, isOpen, onClose }: SystemSettingProps) => {
  const [selectedValue1, setSelectedValue1] = useState("2");
  const [selectedValue2, setSelectedValue2] = useState("6");
  const [selectedTheme, setSelectedTheme] = useState("light");
  const [isSettingSave, setIsSettingSave] = useState(false);
  const [isSettingReset, setIsSettingReset] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<null | string>(null);
  const settingRef = useRef<HTMLDivElement>(null);
  const { setTheme } = useTheme();

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme) {
      setSelectedTheme(storedTheme);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        settingRef.current &&
        !settingRef.current.contains(event.target as Node)
      ) {
        onClose?.();
      }
    };
    if (isOpen) {
      window.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleSave = () => {
    onApply(selectedValue1, selectedValue2);
    setIsSettingSave(true);
    setTheme(selectedTheme as Theme);
    onClose?.();
  };

  const handleClose = () => {
    onClose?.();
  };

  const toggleDropdown = (key: string) => {
    setOpenDropdown((prev) => (prev === key ? null : key));
  };

  const handleReset = () => {
    setSelectedValue1("2");
    setSelectedValue2("6");
    setIsSettingReset(true);
    onClose?.();
  };

  return (
    <>
      {isOpen && (
        <div
          ref={settingRef}
          className="DEWSContextPop flex-1 v-box"
          style={{
            top: "50px",
            left: "0px",
            width: "320px",
            height: "auto",
          }}
        >
          <div className="promptPop">
            <div className="title h-box v-align-center">
              <div className="v-box flex-1">
                <div className="tit">시스템 설정</div>
                <div className="txt">이 설정은 모든 대화에 적용됩니다.</div>
              </div>
              <div className="btns h-box v-align-center">
                <DEWSTooltip
                  className="btnIco reset"
                  labelText={"새로고침"}
                  position="bottom"
                  onClick={handleReset}
                />
                <DEWSTooltip
                  className="btnIco close"
                  labelText={"닫기"}
                  position="bottom"
                  onClick={onClose}
                />
              </div>
            </div>
            <div className="con v-box">
              <div className="tit h-box v-align-center">
                <div className="txt">답변의 창의성</div>
                <DEWSTooltip
                  className="info"
                  labelText={
                    <div>
                      답변의 창의성 : AI가 생성하는 답변의 창의성과 다양성을
                      조절하는 설정입니다.
                      <br />
                      답변의 창의성을 높이면 AI가 더욱 창의적인 답변을
                      생성합니다.
                    </div>
                  }
                  position="bottom"
                />
              </div>
              <DEWSDropDownList
                options={dropdownlist01}
                value={selectedValue1}
                isOpen={openDropdown === "creativity"}
                onToggle={() => toggleDropdown("creativity")}
                onSelect={(item) => setSelectedValue1(item.value)}
              />
              <div className="tit h-box v-align-center">
                <div className="txt">어휘력 조절</div>
                <DEWSTooltip
                  className="info"
                  labelText={
                    <div>
                      어휘력 조절 : AI가 답변을 생성할 때 참고하는 단어의 범위를
                      조절하는 설정입니다.
                      <br />
                      어휘력 조절을 낮추면 AI가 한정된 단어를 사용합니다.
                    </div>
                  }
                  position="bottom"
                />
              </div>
              <DEWSDropDownList
                options={dropdownlist02}
                value={selectedValue2}
                isOpen={openDropdown === "vocab"}
                onToggle={() => toggleDropdown("vocab")}
                onSelect={(item) => setSelectedValue2(item.value)}
              />
              <div className="tit h-box v-align-center">
                <div className="txt">테마</div>
                {/*<DEWSTooltip*/}
                {/*  className="info"*/}
                {/*  labelText={*/}
                {/*    <div>*/}
                {/*      테마를 선택 할수 있는*/}
                {/*      <br />*/}
                {/*      버튼입니다.*/}
                {/*    </div>*/}
                {/*  }*/}
                {/*  position="bottom"*/}
                {/*/>*/}
              </div>
              <DEWSDropDownList
                options={themeOptions}
                value={selectedTheme}
                isOpen={openDropdown === "theme"}
                onToggle={() => toggleDropdown("theme")}
                onSelect={(item) => {
                  setSelectedTheme(item.value);
                  // setTheme(item.value as Theme);
                }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignContent: "center",
                }}
              >
                <div className="DEWSButtonGroup">
                  <button
                    className="DEWSButton"
                    onClick={() => {
                      window.location.href = "/logout";
                    }}
                  >
                    로그아웃
                  </button>
                </div>
                <div className="DEWSButtonGroup ">
                  <button className="DEWSButton" onClick={handleClose}>
                    취소
                  </button>
                  <button className="DEWSButton blue" onClick={handleSave}>
                    저장
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <DEWSSnackbar
        type="success"
        text="설정이 저장되었습니다."
        snackbar={isSettingSave}
        onClose={() => setIsSettingSave(false)}
      />
      <DEWSSnackbar
        type="success"
        text="설정이 리셋되었습니다."
        snackbar={isSettingReset}
        onClose={() => setIsSettingReset(false)}
      />
    </>
  );
};

export default SystemSetting;
