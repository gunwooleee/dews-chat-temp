"use client";

import React, { Fragment, useEffect, useState } from "react";
import axios from "axios";
import api from "@/lib/api";
import Cookie from "@/lib/cookie";
import Crypto from "@/lib/crypto";
import "@/assets/css/login.scss";

export default function Login() {
  const [userId, setUserId] = useState("");
  const [userPw, setUserPw] = React.useState("");
  const [autoLogin, setAutoLogin] = useState(false);
  const [saveLoginId, setSaveLoginId] = useState(false);
  const [isError, setIsError] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [loadingProcess, setLoadingProcess] = React.useState(0);
  const passwordRef = React.useRef<HTMLInputElement>(null);
  const setAutoLoginFunc = () => {
    setAutoLogin(!autoLogin);
    if (autoLogin) {
      sessionStorage.removeItem("autoLogin");
    } else {
      sessionStorage.setItem("autoLogin", "true");
      setSaveLoginId(true);
      sessionStorage.setItem("loginId", userId);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const didAut = Cookie.get("DID_AUT");
      const didRaut = Cookie.get("DID_RAUT");

      if (didAut && didRaut) {
        const target = sessionStorage.getItem("beforePage") ?? "/";
        window.location.replace(target);
        return;
      }

      const savedId = sessionStorage.getItem("loginId") ?? "";
      const savedAutoLogin = sessionStorage.getItem("autoLogin") === "true";

      setUserId(savedId);
      setAutoLogin(savedAutoLogin);
      setSaveLoginId(savedId !== "");

      if (savedAutoLogin) {
        autoLoginFunc();
      }
    }
  }, []);

  const autoLoginFunc = () => {
    axios
      .post(
        `/api/refresh`,
        {},
        { headers: { "x-authenticate-token": Cookie.get("DID_RAUT") } },
      )
      .then((res) => {
        Cookie.set("DID_AUT", res.data.access_token, 1);
        Cookie.set("DID_RAUT", res.data.refresh_token, 15);
        window.location.href = sessionStorage.getItem("beforePage") ?? "/";
      });
  };

  const login = async () => {
    setIsLoading(true);
    let count = 0;
    const timer = setInterval(() => {
      if (count <= 100) {
        setLoadingProcess(count++);
      } else {
        window.clearInterval(timer);
      }
    }, 10);
    try {
      const crypto = Crypto.getInstace();
      const key = await crypto.encode(userPw);
      const res = await api.post(`/api/login`, {
        group_seq: "douzone",
        user_id: userId,
        password: key,
        extra_options: { type: "webchat" },
      });
      Cookie.set("DID_AUT", res.data.access_token, 1);
      Cookie.set("DID_RAUT", res.data.refresh_token, 15);

      const decodeJWT = (token: string) => {
        try {
          const base64Url = token.split(".")[1];
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split("")
              .map((c) => {
                return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
              })
              .join(""),
          );
          return JSON.parse(jsonPayload);
        } catch (e) {
          console.error("Failed to decode JWT", e);
          return null;
        }
      };

      const decoded = decodeJWT(res.data.access_token);
      if (decoded?.deptPathNm) {
        localStorage.setItem("deptPathNm", decoded.deptPathNm); // 부서정보 저장
      }

      // setContextUserId(userId);
      localStorage.setItem("userId", userId);
      localStorage.setItem("llm_type", "gpt_oss_120b");
      localStorage.setItem("top_p", "0.95");
      localStorage.setItem("temperature", "0.7");

      setIsLoading(false);
      window.location.href = sessionStorage.getItem("beforePage") ?? "/";
    } catch (e) {
      console.error(e);
      setIsError(true);
      setIsLoading(false);
    } finally {
      setLoadingProcess(0);
    }
  };

  return (
    <div id={"root"}>
      <Fragment>
        {/* 로그인 입력 */}
        <div className="login_bg" />
        {!isLoading && (
          <div className={"loginWrap v-box v-align-center h-align-center"}>
            {/* logo */}
            <div className="logo" />

            {/* 로그인 입력 */}
            <div className="v-box">
              {/* input */}
              <div className="inputBox">
                <input
                  type="text"
                  id="compID"
                  disabled={true}
                  value={"SBJ DNX"}
                  placeholder="회사ID"
                />
                {/*<div className='resetBtn' />*/}
              </div>
              <div className="inputBox ">
                <input
                  type="text"
                  id="userID"
                  value={userId}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      passwordRef.current?.focus();
                    }
                  }}
                  onChange={(e) => {
                    setUserId(e.target.value);
                    if (saveLoginId) {
                      sessionStorage.setItem("loginId", e.target.value);
                    }
                  }}
                  placeholder="사원ID"
                />
                <div
                  className="resetBtn"
                  onClick={() => {
                    setUserId("");
                  }}
                />
              </div>
              <div className="inputBox ">
                <input
                  type="password"
                  ref={passwordRef}
                  id="userPW"
                  value={userPw}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") login();
                  }}
                  onChange={(e) => {
                    setUserPw(e.target.value);
                  }}
                  placeholder="PW"
                />
                <div
                  className="resetBtn"
                  onClick={() => {
                    setUserPw("");
                  }}
                />
              </div>
              {/* checkbox */}
              <div className="chkWrap h-box h-align-center">
                <div className="h-box">
                  <input
                    type="checkbox"
                    id="chk01"
                    onChange={setAutoLoginFunc}
                    className="chk01 hidden"
                    checked={autoLogin}
                    name="chk01"
                  />
                  <label htmlFor="chk01">자동로그인</label>
                </div>
                <div className="h-box">
                  <input
                    type="checkbox"
                    id="chk02"
                    onChange={() => {
                      if (saveLoginId) {
                        sessionStorage.removeItem("loginId");
                      } else {
                        sessionStorage.setItem("loginId", userId);
                      }
                      setSaveLoginId(!saveLoginId);
                    }}
                    disabled={autoLogin}
                    checked={saveLoginId}
                    className="chk02 hidden"
                    name="chk02"
                  />
                  <label htmlFor="chk02">아이디저장</label>
                </div>
              </div>
              {/* error msg */}
              {isError && (
                <div className="errorMsg">
                  올바른 로그인 정보가 아닙니다.
                  <br />
                  입력하신 내용을 다시 확인해주세요.
                </div>
              )}
              {/* login btn */}
              <button
                className="loginBtn"
                disabled={userId === "" || userPw === ""}
                onClick={login}
              >
                로그인
              </button>
            </div>
          </div>
        )}

        {/* 로그인 로딩 */}
        {isLoading && (
          <div className="loadingBoxWrap v-box v-align-center">
            {/* logo */}
            <div className="logo" />
            <div className="loadingBox h-box v-align-center">
              <div className="loadingProgress">
                <div className="bar" style={{ width: loadingProcess + "%" }} />
              </div>
              <div className="per">{loadingProcess + "%"}</div>
            </div>
            <div className="loadingTxt">로그인 중</div>
          </div>
        )}
      </Fragment>
    </div>
  );
}
