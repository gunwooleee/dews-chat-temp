import DEWSTooltip from "@/components/DEWSTooltip/DEWSTooltip";
import dot_loading from "@/json/dot_loading.json";
import spinner_loading_18 from "@/json/spinner_loading_18.json";
import Image from "next/image";
// import LottieAnimation from "@/lottie/LottieAnimation";
import dynamic from "next/dynamic";
//img List
import pdf_img from "../../assets/images/file/ic_pdf_filled_32@2x.png";
import ppt_img from "../../assets/images/file/ic_pptx_filled_32@2x.png";
import xls_img from "../../assets/images/file/ic_xls_filled_32@2x.png";
import onex_img from "../../assets/images/file/ic_onex_filled_32@2x.png";
import ones_img from "../../assets/images/file/ic_ones_filled_32@2x.png";
import hwp_img from "../../assets/images/file/ic_hwp_filled_32@2x.png";
import doc_img from "../../assets/images/file/ic_doc_filled_32@2x.png";
import html_img from "../../assets/images/file/ic_html_filled_32@2x.png";
import txt_img from "../../assets/images/file/ic_txt_filled_32@2x.png";
import csv_img from "../../assets/images/file/ic_csv_filled_32@2x.png";
import img_img from "../../assets/images/temp/temp_prod_3.png";
//lottie list
import ic_check_16_gn from "../../json/ic_check_16_gn.json";

// SSR 비활성화하고 클라이언트에서만 로드
const LottieAnimation = dynamic(() => import("@/lottie/LottieAnimation"), {
  ssr: false,              // 이게 핵심!
  loading: () => <div style={{ width: 18, height: 18 }} />, // 로딩 중 대체 UI (선택)
});

type UploadItemProps = {
  name: string;
  // ext: "pdf" | "ppt" | "xlsx" | "onex" | "ones" | "hwp" | "doc" | "html" | "txt" | "csv" | "etc" | "img";
  ext: string;
  onRemove?: (name: string) => void;
  status: "loading" | "success" | "error";
};

const extImage: Record<UploadItemProps["ext"], any> = {
  pdf: pdf_img,
  ppt: ppt_img,
  xlsx: xls_img,
  onex: onex_img,
  ones: ones_img,
  hwp: hwp_img,
  doc: doc_img,
  html: html_img,
  txt: txt_img,
  csv: csv_img,
  img: img_img,
  etc: img_img,
};

export default function UploadItem(props: UploadItemProps) {
  const iconList = {
    loading: dot_loading,
    success: spinner_loading_18,
    error: "spinner_loading_30",
  };
  const statusIcon = props.status;
  const imageSrc = extImage[props.ext];
  console.log("imgSrc", imageSrc);
  const extSplit = props.ext.split("/");

  const extension = extSplit[1] || props.ext;
  const imageSrc2 = extImage[extension];
  return (
    <>
      <div
        className="fileItem flex-1 h-box v-align-center"
        style={{ maxWidth: "250px" }}
      >
        {/*<div className={`icon h-box flex-center ${extension}`}>*/}
        {/*  로티 에니메이션 */}
        {/* 로딩중일때 아래꺼 보여주다가 로딩완료되면 imgSrc 보여주기 */}
        {/*  <LottieAnimation loop={true} autoPlay={true} animationData={iconList[props.status]}  width={18} height={18} />*/}
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={props.ext.toUpperCase()}
            width={32}
            height={32}
          />
        ) : (
          <div className={`icon ${extension}`}></div>
        )}
        {/*</div>*/}
        {/*<div className="flex-1 v-box">*/}
        <DEWSTooltip
          className="txt flex-1"
          labelText={props.name}
          position="top"
        >
          <div className="ellipsis txt01">{props.name}</div>
        </DEWSTooltip>
        <div className="txt txt01">{extension}</div>
        {/*</div>*/}
        <DEWSTooltip
          className="deleteBtn"
          labelText={"삭제"}
          onClick={() => {
            props.onRemove?.(props.name);
          }}
          position="top"
        ></DEWSTooltip>
        {/* 업로드 로딩중/로딩완료/로딩실패 */}
        <LottieAnimation
          loop={false}
          autoPlay={true}
          animationData={ic_check_16_gn}
          width={16}
          height={16}
        />
        <DEWSTooltip
          className="delBtn"
          labelText={"삭제"}
          position="top"
          onClick={() => {
            props.onRemove?.(props.name);
          }}
        />
      </div>
    </>
  );
}
