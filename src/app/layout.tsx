"use client";
import { ChatManagerProvider } from "@/context/ChatManager";
import React, { useEffect, useState } from "react";
import "@/app/globals.css";
import { ThemeProvider } from "@/context/ThemeManager";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/assets/DEWS_32@2x.png" type="image/png"></link>
        <title>GEN AI DEWS ChatBot</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>

      <body>
        {/*<script types={"text/javascript"}>*/}
        {/*    {`window.setToken = (token, refreshToken) => {*/}
        {/*        const assesTokenDate = new Date();*/}
        {/*        const refreshTokenDate = new Date();*/}
        {/*        assesTokenDate.setTime(assesTokenDate.getTime() + (1 * 24 * 60 * 60 * 1000));*/}
        {/*        const expires = "; expires=" + assesTokenDate.toUTCString();*/}
        {/*        document.cookie = "DID_AUT" + "=" + token + expires + "; path=/";*/}
        {/*        refreshTokenDate.setTime(refreshTokenDate.getTime() + (15 * 24 * 60 * 60 * 1000));*/}
        {/*        const rfexpires = "; expires=" + refreshTokenDate.toUTCString();*/}
        {/*        document.cookie = "DID_RAUT" + "=" + refreshToken + rfexpires + "; path=/";*/}
        {/*    };`}*/}
        {/*</script>*/}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                window.addEventListener("message", function(event) {
                  var data = event.data || {};
                  if (data.type === "SET_TOKEN" && typeof data.token === "string" && typeof data.refreshToken === "string") {
                    var now = new Date();
                    var accessTokenDate = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
                    document.cookie = "DID_AUT=" + data.token + "; expires=" + accessTokenDate.toUTCString() + "; path=/";

                    var refreshTokenDate = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
                    document.cookie = "DID_RAUT=" + data.refreshToken + "; expires=" + refreshTokenDate.toUTCString() + "; path=/";

                    console.log("[TokenInjector] Cookie set via postMessage");
                  }
                }, false);
              })();
            `,
          }}
        />
        <ThemeProvider>
          <ChatManagerProvider>
            {/*<div id={"root"}>*/}
            {/*<div className={"commonChat flexBox h-box"}>{children}</div>*/}
            {children}
            {/*</div>*/}
          </ChatManagerProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
