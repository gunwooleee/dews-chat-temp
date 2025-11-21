"use client";
import React from "react";
import FAQBox from "@/components/FAQBox/FAQBox";
import { useTheme } from "@/context/ThemeManager";
import Image from "next/image";
import { useChatManager } from "@/context/ChatManager";
import useIsMobile from "@/hooks/useIsMobile";
import { useRouter } from "next/navigation";
import DEWSTooltip from "@/components/DEWSTooltip/DEWSTooltip";

import logo_genai_32_wh_2x from "@/assets/images/bg/logo_genai_32_wh@2x.png";
import img_guide_01_2x_dark from "@/assets/images/dark/img_guide_01@2x.png";
import img_guide_01_2x from "@/assets/images/bg/img_guide_01@2x.png";
import img_guide_02_2x_dark from "@/assets/images/dark/img_guide_02@2x.png";
import img_guide_02_2x from "@/assets/images/bg/img_guide_02@2x.png";
import img_guide_05_2x from "@/assets/images/bg/img_guide_02@2x.png";
import img_guide_03_2x_dark from "@/assets/images/dark/img_guide_03@2x.png";
import img_guide_03_2x from "@/assets/images/bg/img_guide_03@2x.png";
import img_guide_04_2x_dark from "@/assets/images/dark/img_guide_04@2x.png";
import img_guide_04_2x from "@/assets/images/bg/img_guide_04@2x.png";
import img_guide_05_2x_dark from "@/assets/images/dark/img_guide_05@2x.png";

type FAQProps = {
  closeModal?: () => void;
};

const FAQ = ({ closeModal }: FAQProps) => {
  const { theme } = useTheme();
  const { ChatType, sidebarIsOpen, setSidebarIsOpen } = useChatManager();
  const isMobile = useIsMobile();
  const router = useRouter();
  const [selectedTab, setSelectedTab] = React.useState("전체");
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  const handleTabClick = (tab: string) => {
    setSelectedTab(tab);
    setOpenIndex(null);
  };

  const handleLogoClick = () => {
    {
      closeModal?.();
      router.push(`/chat/${ChatType}`);
      setSidebarIsOpen(true);
    }
  };

  const faqItems = [
    {
      category: "GEN AI DEWS",
      title: "GEN AI DEWS는 무엇인가요?",
      content: (
        <dd>
          GEN AI DEWS는 GPT나 Claude처럼 사용할 수 있는 사내 전용 생성형 AI
          서비스로, 코드 생성에 특화된 독립형 LLM 서비스입니다. 프롬프트
          기반으로 다양한 프로그래밍 작업을 도와주며, 개발자의 생산성을 높이는
          데 초점을 맞췄습니다.
        </dd>
      ),
    },
    {
      category: "GEN AI DEWS",
      title: "서비스 이용 시 주의사항이 있나요?",
      content: (
        <dd>
          네, GEN AI DEWS를 보다 안전하고 효율적으로 사용하시려면 다음 사항을 꼭
          지켜주세요.
          <ol>
            <li>
              민감한 정보는 절대 입력하지 마세요.
              <br />→ 개인정보, 고객 정보, 내부 기밀 등은 입력을 피해주세요.
            </li>
            <li>
              업무 목적 외 사용은 지양해 주세요.
              <br />→ GEN AI DEWS는 사내 업무 효율을 위한 도구입니다.
            </li>
            <li>
              생성된 코드는 반드시 검토 후 적용해 주세요.
              <br />→ AI가 생성한 코드라도 실제 시스템에 적용하기 전에는 꼭
              검토가 필요합니다.
            </li>
            <li>
              히스토리는 최대 7일까지만 저장돼요.
              <br />→ 그 이전의 기록은 자동으로 삭제되기 때문에, 더 오래
              보관하고 싶은 내용이 있다면 [코드 보관함] 기능을 활용해 주세요.
            </li>
          </ol>
          <span>
            ※ 올바른 사용이 서비스 품질 유지와 보안에 큰 도움이 됩니다.
          </span>
        </dd>
      ),
    },
    {
      category: "GEN AI DEWS",
      title: "어떤 작업을 도와주나요?",
      content: (
        <dd>
          <ul>
            <li>특정 기능 구현을 위한 코드 생성</li>
            <li>기존 코드의 설명, 주석 추가</li>
            <li>간단한 리팩토링 제안</li>
            <li>SQL 쿼리 작성</li>
            <li>프론트/백엔드 로직 초안 구성</li>
          </ul>
          등 자유롭게 대화하듯 요청할 수 있습니다.
        </dd>
      ),
    },
    {
      category: "GEN AI DEWS",
      title: "지원하는 모델을 선택할 수 있나요?",
      content: (
        <dd>
          네, GEN AI DEWS는 총 3개의 모델을 지원하고 있어요.
          <ul>
            <li>
              EXAONE-3-5-32b : 한국어 최적화, 다양한 산업 분야에서의 활용이
              가능합니다.
            </li>
            <li>
              ChatGPT4o : GEN AI DEWS에 최적화되어 대부분의 질문에 탁월합니다.
            </li>
            <li>
              Llama-douzone-3.3-70b : 효율적인 학습과 추론, 높은 성능, 다양한
              언어를 지원합니다.
            </li>
          </ul>
        </dd>
      ),
    },
    {
      category: "채팅",
      title: "어떤 언어의 코드를 생성할 수 있나요?",
      content: (
        <dd>
          현재 GEN AI DEWS는 다음 언어들을 지원합니다.
          <br />: html, python, javascript, css, java, json, typescript, sql,
          xml, txt
        </dd>
      ),
    },
    {
      category: "채팅",
      title: "코드를 생성할 때 어떤 정보를 입력해야 하나요?",
      content: (
        <dd>
          GEN AI DEWS는 자연어로 요청해도 이해하지만, <br />
          다음과 같이 구체적인 지시를 주면 더 좋습니다.
          <ul>
            <li>
              “Java로 고객 리스트를 페이징 처리해서 출력하는 코드 작성해줘”
            </li>
            <li>“이 SQL 쿼리를 더 최적화할 수 있을까?”</li>
            <li>“아래 코드를 리팩토링해서 가독성 좋게 바꿔줘”</li>
          </ul>
        </dd>
      ),
    },
    {
      category: "채팅",
      title: "GEN AI DEWS가 코딩을 도울 수 있나요?",
      content: (
        <dd>
          GEN AI DEWS는 매우 유용한 '페어 프로그래머'가 될 수 있습니다. GEN AI
          DEWS는 Python에 가장 능숙하지만, 모든 주요 프로그래밍 언어로 코딩할 수
          있습니다.
        </dd>
      ),
    },
    {
      category: "채팅",
      title: "GEN AI DEWS에서 채팅 기록을 검색하려면 어떻게 해야하나요?",
      content: (
        <dd>
          채팅 기록이 많을 때는 검색 기능을 활용해 원하는 대화를 빠르게 찾을 수
          있어요.
          <br />
          방법은 아래와 같습니다.
          {theme === "darkTheme" ? (
            <Image
              src={img_guide_01_2x_dark}
              alt=""
              width={1100}
              height={740}
            />
          ) : (
            <Image src={img_guide_01_2x} alt="" width={1100} height={740} />
          )}
        </dd>
      ),
    },
    {
      category: "채팅",
      title: "‘프로젝트 챗‘이란 무엇인가요?",
      content: (
        <dd>
          ‘프로젝트 챗’은 주제별로 AI와 대화를 정리할 수 있는 작업 공간입니다.
          원하는 주제에 따라 프로젝트를 생성하면, <br />
          아이디어 정리, 코드 생성, 수정 요청 등 모든 대화를 하나의 채팅방에
          모아 관리할 수 있어요.
          <div>
            예를 들어,
            <ul>
              <li>“고객 조회 기능 개선”</li>
              <li>“프론트엔드 테이블 구성”</li>
            </ul>
            처럼 주제별로 나눠 두면 협업이나 회고 시에도 매우 유용하답니다.
          </div>
        </dd>
      ),
    },
    {
      category: "채팅",
      title: "채팅을 삭제하고 싶어요.",
      content: (
        <dd>
          채팅을 삭제하려면 아래 단계를 따라 주세요.
          {theme === "darkTheme" ? (
            <Image
              src={img_guide_02_2x_dark}
              alt=""
              width={1100}
              height={740}
            />
          ) : (
            <Image src={img_guide_02_2x} alt="" width={1100} height={740} />
          )}
        </dd>
      ),
    },
    {
      category: " 채팅",
      title: "코드를 보관하고 싶어요.",
      content: (
        <dd>
          GEN AI DEW에서는 답변 코드 전체와 선택한 코드를 보관할 수 있으며,
          보관을 해제할 때 까지 계정에 저장됩니다. <br />
          GEN AI DEWS에서는 답변 코드 전체 또는 원하는 일부 코드만 선택하여
          보관할 수 있어요. <br />
          보관한 코드는 보관 해제 전까지 내 계정에 저장되며, 언제든 다시 확인할
          수 있습니다.
          {theme === "darkTheme" ? (
            <>
              <Image
                src={img_guide_03_2x_dark}
                alt=""
                width={1100}
                height={740}
              />
              <Image
                src={img_guide_04_2x_dark}
                alt=""
                width={1100}
                height={740}
              />
            </>
          ) : (
            <>
              <Image src={img_guide_03_2x} alt="" width={1100} height={740} />

              <Image src={img_guide_04_2x} alt="" width={1100} height={740} />
            </>
          )}
        </dd>
      ),
    },
    {
      category: "채팅",
      title: "코드 보관을 해제하고 싶어요.",
      content: (
        <dd>
          보관한 코드를 더 이상 저장하고 싶지 않다면, 아래 방법으로 보관 해제할
          수 있어요.
          {theme === "darkTheme" ? (
            <Image
              src={img_guide_05_2x_dark}
              alt=""
              width={1100}
              height={740}
            />
          ) : (
            <Image src={img_guide_05_2x} alt="" width={1100} height={740} />
          )}
        </dd>
      ),
    },
    {
      category: "파일첨부",
      title: "파일 업로드 용량 제한이 있나요?",
      content: (
        <dd>
          네, GEN AI DEWS에서는 최대 10MB까지의 파일 업로드를 지원합니다. <br />
          업로드한 파일은 AI가 내용을 분석해 질문에 대한 더 정확한 답변을
          제공하는 데 활용됩니다.
          <span>
            ※ 파일이 너무 클 경우, 필요한 부분만 나누어 업로드해 주세요!
          </span>
        </dd>
      ),
    },
    {
      category: "파일첨부",
      title: "파일이나 이미지를 첨부하여 질문할 수 있나요?",
      content: (
        <dd>
          네, GEN AI DEWS에서는 파일이나 이미지를 첨부하여 질문할 수 있습니다.{" "}
          <br />
          관련된 코드나 문서 파일을 AI가 분석해 이해한 뒤, 그에 맞는 답변을
          제공해드려요.
          <div>
            지원하는 파일 형식은 아래와 같습니다.
            <ul>
              <li>문서 파일 : .txt, .md, .json, .xml, .yaml, .yml, .pdf</li>
              <li>
                코드 파일 : .py, .js, .java, .cpp, .c, .rb, .go, .rs, .php,
                .html, .css 등 일반적인 코드 파일
              </li>
              <li>이미지 파일 : .png, .jpeg, .jpg</li>
            </ul>
          </div>
          <span>
            ※ 첨부된 파일의 내용을 기반으로 질문하면 더욱 정확하고 맥락에 맞는
            답변을 받을 수 있습니다.
          </span>
        </dd>
      ),
    },
    {
      category: "파일첨부",
      title: "파일이나 이미지를 첨부하여 질문할 수 있나요?",
      content: (
        <dd>
          네, GEN AI DEWS에서는 파일이나 이미지를 첨부하여 질문할 수 있습니다.{" "}
          <br />
          관련된 코드나 문서 파일을 AI가 분석해 이해한 뒤, 그에 맞는 답변을
          제공해드려요.
          <div>
            지원하는 파일 형식은 아래와 같습니다.
            <ul>
              <li>문서 파일 : .txt, .md, .json, .xml, .yaml, .yml, .pdf</li>
              <li>
                코드 파일 : .py, .js, .java, .cpp, .c, .rb, .go, .rs, .php,
                .html, .css 등 일반적인 코드 파일
              </li>
              <li>이미지 파일 : .png, .jpeg, .jpg</li>
            </ul>
          </div>
          <span>
            ※ 첨부된 파일의 내용을 기반으로 질문하면 더욱 정확하고 맥락에 맞는
            답변을 받을 수 있습니다.
          </span>
        </dd>
      ),
    },
  ];

  const filteredFaqs =
    selectedTab === "전체"
      ? faqItems
      : faqItems.filter((item) => item.category === selectedTab);

  const handleToggle = (index: number) => {
    setOpenIndex((prevIndex) => (prevIndex === index ? null : index));
  };
  return (
    <div className={`faqWrap v-box`}>
      {!sidebarIsOpen && !isMobile && (
        <DEWSTooltip labelText={"열기"} position="bottom">
          <div className="foldingWrap">
            <button
              className={`DEWSTooltip btnIco folding`}
              onClick={() => setSidebarIsOpen(!sidebarIsOpen)}
            />
          </div>
        </DEWSTooltip>
      )}
      <div className={`topWrap`}>
        <div className={`box`}>
          <Image
            className={`logo`}
            src={logo_genai_32_wh_2x}
            alt=""
            width={1100}
            height={740}
            // onClick={() => (window.location.href = "???")}
            onClick={handleLogoClick}
          />
          <div className={`logo`}>
            <div className={`textBox`}>
              <div className={`title`}>FAQ</div>
              <div className={`text`}>
                GEN AI DEWS에 궁금한 점이 있으신가요?
              </div>
              <br />
              <br />
              <div className={`text`}>
                사용 중 불편을 겪으셨나요?
                <br /> ChatBot 관련 오류나 개선이 필요한 사항을 자유롭게
                남겨주세요.
              </div>
              <div
                className={`text`}
                onClick={() =>
                  window.open(
                    "http://wiki.duzon.com:8080/pages/viewpage.action?pageId=297113077",
                    "_blank",
                  )
                }
              >
                [오류 및 불편사항 접수 게시판 바로가기]
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={`conWrap v-box`}>
        <ul className={`tabs h-box v-align-center`}>
          {["전체", "GEN AI DEWS", "채팅", "파일첨부"].map((tab) => (
            <li
              key={tab}
              className={`tab ${selectedTab === tab ? "on" : ""}`}
              onClick={() => handleTabClick(tab)}
            >
              {tab}
            </li>
          ))}
        </ul>
        <div className={`conList v-box down`}>
          {filteredFaqs.map((item, index) => (
            <FAQBox
              key={index}
              title={item.title}
              isOpen={openIndex === index}
              onToggle={() => handleToggle(index)}
            >
              {item.content}
            </FAQBox>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;
