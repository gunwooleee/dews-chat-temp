"use client";
import React, { useEffect } from "react";
import SideBar from "@/components/SideBar/SideBar";
import { useChatManager } from "@/context/ChatManager";
import { useTheme } from "@/context/ThemeManager";

export type SideBarLayoutProps = {
  children: React.ReactNode;
};

export default function SideBarLayout({ children }: SideBarLayoutProps) {
  const { sidebarIsOpen, setSidebarIsOpen } = useChatManager();
  const { theme } = useTheme();

  useEffect(() => {
    if (window.innerWidth >= 10) setSidebarIsOpen(true);
  }, []);

  useEffect(() => {
    document.body.style.overflow = sidebarIsOpen ? "hidden" : "";
  }, [sidebarIsOpen]);

  return (
    <div id={"root"}>
      <div className={`commonChat flexBox h-box ${theme}`}>
        <SideBar></SideBar>
        <div className={"container h-box flex-1"}>{children}</div>
      </div>
    </div>
  );
}
