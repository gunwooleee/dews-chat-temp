import axios, { AxiosRequestConfig } from "axios";
import Cookie from "@/lib/cookie";
import { tokenDecode } from "@/lib/token";
import _ from "lodash";

// import {parseHashToKeyValue, refreshTokenExpiry, tokenExpiry} from "../Router/TokenExpiry";

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
        `/api/refresh`,
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

// async function getStreamHeader() {
//   const baseHeader = await getHeader();
//   return {
//       ...baseHeader,
//       "Accept": "text/event-stream"
//   };
// }

// export default class api {
//     static post = (async <T = any>(url: string, data?: any, option?: AxiosRequestConfig<AxiosRequestConfig>)=>{
//         const defaultOptions: AxiosRequestConfig = { headers: await getHeader() };
//         return  axios.post<T>(url,data,_.merge(defaultOptions,option));
//     })

//     static get = async <T = any>(url: string,option?: AxiosRequestConfig<AxiosRequestConfig>)=>{
//         const defaultOptions: AxiosRequestConfig = { headers: await getHeader() };
//         return  axios.get<T>(url,_.merge(defaultOptions,option));
//     }

//     static delete = async <T = any>(url: string,option?: AxiosRequestConfig<AxiosRequestConfig>)=>{
//         const defaultOptions: AxiosRequestConfig = { headers: await getHeader() };
//         return  axios.delete<T>(url,_.merge(defaultOptions,option));
//     }
//     static stream = async (url: string,data: any,option?: RequestInit)=> {
//         const defaultOptions: RequestInit = { headers: await getHeader() ,method: "POST",body: JSON.stringify(data)};
//         return fetch(url,_.merge(defaultOptions,option));
//     }
// }

// a = {A:1}
// b = {A:2}
// c = _.merge(a,b) ==== {A:2}

const api = {
  post: async (
    url: string,
    data = {},
    option?: AxiosRequestConfig<AxiosRequestConfig>,
  ) => {
    const defaultOptions: AxiosRequestConfig = { headers: await getHeader() };
    return axios.post(url, data, _.merge(defaultOptions, option));
  },

  get: async (url: string) => {
    const headers = await getHeader();
    return axios.get(url, { headers });
  },

  delete: async (url: string) => {
    const headers = await getHeader();
    return axios.delete(url, { headers });
  },

  put: async (url: string, data = {}) => {
    const headers = await getHeader();
    return axios.put(url, data, { headers });
  },
  stream: async (url: string, data = {}, option?: RequestInit) => {
    const defaultOptions: RequestInit = {
      headers: await getHeader(),
      method: "POST",
      body: JSON.stringify(data),
    };
    return fetch(url, _.merge(defaultOptions, option));
  },
};

export default api;
