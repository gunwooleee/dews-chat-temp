import axios, { AxiosRequestConfig } from "axios";
import Cookie from "@/lib/cookie";
import { tokenDecode } from "@/lib/token";
import _ from "lodash";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export function tokenExpiry() {
  let access_token = Cookie.get("DID_AUT");
  return !!access_token && tokenDecode(access_token).exp > Date.now() / 1000;
}

export function refreshTokenExpiry(refresh_token?: string) {
  let _refresh_token = refresh_token ?? Cookie.get("DID_RAUT");
  return (
    !!_refresh_token && tokenDecode(_refresh_token).exp > Date.now() / 1000
  );
}

async function getToken() {
  if (!tokenExpiry()) {
    let DID_RAUT = Cookie.get("DID_RAUT");
    if (DID_RAUT && refreshTokenExpiry(DID_RAUT)) {
      const res = await axios.post(
        `${BASE_URL}/api/refresh`,
        {},
        { headers: { "x-authenticate-token": DID_RAUT } },
      );
      Cookie.set("DID_AUT", res.data.access_token, 0.5);
      Cookie.set("DID_RAUT", res.data.refresh_token, 15);
    } else {
      goLogin();
    }
  }
  let token = Cookie.get("DID_AUT");
  return token || "";
}

function goLogin() {
  // /login 으로 이동하는 코드 원래는)
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}

async function getHeader() {
  return {
    "Content-Type": "application/json",
    "X-Authenticate-Token": await getToken(),
  };
}

const api = {
  post: async (
    url: string,
    data = {},
    option?: AxiosRequestConfig<AxiosRequestConfig>,
  ) => {
    const defaultOptions: AxiosRequestConfig = { headers: await getHeader() };
    return axios.post(`${BASE_URL}${url}`, data, _.merge(defaultOptions, option));
  },

  get: async (url: string) => {
    const headers = await getHeader();
    return axios.get(`${BASE_URL}${url}`, { headers });
  },

  delete: async (url: string) => {
    const headers = await getHeader();
    return axios.delete(`${BASE_URL}${url}`, { headers });
  },

  put: async (url: string, data = {}) => {
    const headers = await getHeader();
    return axios.put(`${BASE_URL}${url}`, data, { headers });
  },
  stream: async (url: string, data = {}, option?: RequestInit) => {
    const defaultOptions: RequestInit = {
      headers: await getHeader(),
      method: "POST",
      body: JSON.stringify(data),
    };
    return fetch(`${BASE_URL}${url}`, _.merge(defaultOptions, option));
  },
};

export default api;
