import React, { useEffect, useRef, useState } from "react";
import DEWSTooltip from "../DEWSTooltip/DEWSTooltip";
import DEWSSnackbar from "@/components/DEWSSnackbar/DEWSSnackbar";
import DEWSDropDownList from "@/components/DEWSDropDownList/DEWSDropDownList";
import { Theme, useTheme } from "@/context/ThemeManager";

type SystemSettingProps = {
  onApply: (topP: string, temperature: string) => void;
  isOpen: boolean;
  onClose?: () => void;
};

const TEMPERATURE_OPTIONS = [
  { value: "0.1", text: "0.1 (낮은 창의성,안정적인 답변)" },
  { value: "0.2", text: "0.2 (낮은 창의성,안정적인 답변)" },
  { value: "0.3", text: "0.3 (낮은 창의성,안정적인 답변)" },
  { value: "0.4", text: "0.4 (중간 창의성)" },
  { value: "0.5", text: "0.5 (중간 창의성)" },
  { value: "0.6", text: "0.6 (중간 창의성)" },
  { value: "0.7", text: "0.7 (높은 창의성)" },
  { value: "0.8", text: "0.8 (높은 창의성)" },
  { value: "0.9", text: "0.9 (높은 창의성)" },
  { value: "1.0", text: "1.0 (높은 창의성)" },
];

const TOP_P_OPTIONS = [
  { value: "0.1", text: "0.1 (예측 가능한 어휘 활용)" },
  { value: "0.2", text: "0.2 (예측 가능한 어휘 활용)" },
  { value: "0.3", text: "0.3 (예측 가능한 어휘 활용)" },
  { value: "0.4", text: "0.4 (보통의 어휘 활용)" },
  { value: "0.5", text: "0.5 (보통의 어휘 활용)" },
  { value: "0.6", text: "0.6 (보통의 어휘 활용)" },
  { value: "0.7", text: "0.7 (폭넓은 어휘 활용)" },
  { value: "0.8", text: "0.8 (폭넓은 어휘 활용)" },
  { value: "0.9", text: "0.9 (폭넓은 어휘 활용)" },
  { value: "0.95", text: "1.0 (폭넓은 어휘 활용)" },
];

const THEME_OPTIONS = [
  { value: "lightTheme", text: "라이트 테마" },
  { value: "darkTheme", text: "다크 테마" },
  // { value: "lightgray", text: "라이트 그레이 테마" },
  // { value: "system", text: "시스템 테마" },
];

const DEFAULT_TEMPERATURE = "0.2";
const DEFAULT_TOP_P = "0.95";

const SystemSetting = ({ onApply, isOpen, onClose}: SystemSettingProps) => {
  // 실제 적용된 값
  const [appliedTemperature, setAppliedTemperature] = useState(DEFAULT_TEMPERATURE);
  const [appliedTopP, setAppliedTopP] = useState(DEFAULT_TOP_P);
  const [appliedTheme, setAppliedTheme] = useState("lightTheme");

  // 모달 내 임시 값
  const [draftTemperature, setDraftTemperature] = useState(DEFAULT_TEMPERATURE);
  const [draftTopP, setDraftTopP] = useState(DEFAULT_TOP_P);
  const [draftTheme, setDraftTheme] = useState("lightTheme");

  // const [selectedTheme, setSelectedTheme] = useState("light");
  const [showSaveSuccessMessage, setShowSaveSuccessMessage] = useState(false);
  const [showResetSuccessMessage, setShowResetSuccessMessage] = useState(false);
  const [activeDropdownKey, setActiveDropdownKey] = useState<null | string>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const { setTheme } = useTheme();

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme) {
      setAppliedTheme(storedTheme);
      setDraftTheme(storedTheme);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedTemperature = localStorage.getItem("temperature");
    const storedTopP = localStorage.getItem("top_p");

    if(storedTemperature) {
      setAppliedTemperature(storedTemperature);
      setDraftTemperature(storedTemperature);
    }
    if(storedTopP) {
      setAppliedTopP(storedTopP);
      setDraftTopP(storedTopP);
    }
  }, []);

  // 모달이 열릴 때마다 현재 적용값을 임시값에 복사
  useEffect(() => {
    if(isOpen) {
      setDraftTemperature(appliedTemperature);
      setDraftTopP(appliedTopP);
      setDraftTheme(appliedTheme);
    }
  }, [isOpen, appliedTemperature, appliedTopP]);


  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
          modalRef.current &&
          !modalRef.current.contains(event.target as Node)
      ) {
        handleModalClose();
      }
    };
    if (isOpen) {
      window.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      window.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen]);

  const handleSettingsSave = () => {
    // 저장 시에만 임시값을 실제값으로 반영
    setAppliedTemperature(draftTemperature);
    setAppliedTopP(draftTopP);
    setAppliedTheme(draftTheme);

    onApply(draftTopP, draftTemperature);

    localStorage.setItem("temperature", draftTemperature);
    localStorage.setItem("top_p", draftTopP);
    localStorage.setItem("theme", draftTheme);

    setShowSaveSuccessMessage(true);
    setTheme(draftTheme as Theme);
    onClose?.();
  };

  const handleModalClose = () => {
    //취소 시에는 임시값 버리고, 실제값은 그대로 둠
    setDraftTemperature(appliedTemperature);
    setDraftTopP(appliedTopP);
    setDraftTheme(appliedTheme);
    onClose?.();
  };

  const handleDropdownToggle = (dropdownKey: string) => {
    setActiveDropdownKey((prev) => (prev === dropdownKey ? null : dropdownKey));
  };

  const handleSettingsReset = () => {
    // 실제값, 임시값 모두 초기화
    setAppliedTemperature(DEFAULT_TEMPERATURE);
    setAppliedTopP(DEFAULT_TOP_P);
    setDraftTemperature(DEFAULT_TEMPERATURE);
    setDraftTopP(DEFAULT_TOP_P);
    setAppliedTheme("lightTheme");
    setDraftTheme("lightTheme");

    onApply(DEFAULT_TOP_P, DEFAULT_TEMPERATURE);
    localStorage.setItem("temperature", DEFAULT_TEMPERATURE);
    localStorage.setItem("top_p", DEFAULT_TOP_P);
    localStorage.setItem("theme", "lightTheme");
    setTheme("lightTheme");

    setShowResetSuccessMessage(true);
    onClose?.();
  };

  const handleLogout = () => {
    window.location.href = "/logout";
  };

  return (
      <>
        {isOpen && (
            <div
                ref={modalRef}
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
                        onClick={handleSettingsReset}
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
                      options={TEMPERATURE_OPTIONS}
                      value={draftTemperature}
                      isOpen={activeDropdownKey === "creativity"}
                      onToggle={() => handleDropdownToggle("creativity")}
                      onSelect={(item) => setDraftTemperature(item.value)}
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
                      options={TOP_P_OPTIONS}
                      value={draftTopP}
                      isOpen={activeDropdownKey === "vocab"}
                      onToggle={() => handleDropdownToggle("vocab")}
                      onSelect={(item) => setDraftTopP(item.value)}
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
                      options={THEME_OPTIONS}
                      value={draftTheme}
                      isOpen={activeDropdownKey === "theme"}
                      onToggle={() => handleDropdownToggle("theme")}
                      onSelect={(item) => {
                        setDraftTheme(item.value);
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
                          onClick={handleLogout}
                      >
                        로그아웃
                      </button>
                    </div>
                    <div className="DEWSButtonGroup ">
                      <button className="DEWSButton" onClick={handleModalClose}>
                        취소
                      </button>
                      <button className="DEWSButton blue" onClick={handleSettingsSave}>
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
            snackbar={showSaveSuccessMessage}
            onClose={() => setShowSaveSuccessMessage(false)}
        />
        <DEWSSnackbar
            type="success"
            text="설정이 리셋되었습니다."
            snackbar={showResetSuccessMessage}
            onClose={() => setShowResetSuccessMessage(false)}
        />
      </>
  );
};

export default SystemSetting;