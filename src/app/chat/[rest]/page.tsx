import Client from "@/app/chat/[rest]/client";
import { cookies } from "next/headers";
export default async function Page(props: any) {
  // const cookieStore = await cookies();
  // const token = cookieStore.get("DID_AUT")?.value || "";
  // console.log(token);

  // const userInfo = await fetch(
  //   "https://genaidews.dozuone.com/api/getDetailed",
  //   {
  //     headers: {
  //       "Content-Type": "application/json",
  //       "x-authenticate-token": token,
  //     },
  //   },
  // );
  // userInfo;

  return <Client />;
}
