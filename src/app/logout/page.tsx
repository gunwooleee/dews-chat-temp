"use client";

import { useRouter } from "next/navigation";

import { useEffect } from "react";

import Cookie from "@/lib/cookie";

export default function Logout() {
  const router = useRouter();

  useEffect(() => {
    sessionStorage.removeItem("autoLogin");
    Cookie.remove("DID_AUT");
    Cookie.remove("DID_RAUT");
    localStorage.removeItem("userId");
    sessionStorage.removeItem("loginId");

    router.push("/login");
  }, [router]);

  return null;
}
