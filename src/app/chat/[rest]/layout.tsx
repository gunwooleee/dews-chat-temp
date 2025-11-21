import ClientLayout from "@/components/SideBarLayout";
import "katex/dist/katex.min.css";
import "../../../assets/css/common.scss";
import "../../../assets/css/contents.scss";
import "../../../assets/css/icon.scss";
import "../../../assets/css/contents-responsive.scss";
import "../../../assets/css/common-responsive.scss";
import React from "react";

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <ClientLayout>{children}</ClientLayout>;
}
