"use client";
import React, { createContext, ReactNode, useEffect, useState } from "react";
import api from "@/lib/api";
import uuid from "react-uuid";
import { usePathname, useRouter } from "next/navigation";

export type ChatType =
  | "dnx"
  | "dnxflow";

type Payload = {
  text: string;
  room_id: string;
  stream: boolean;
  llm_type: string;
  chat_type: string;
  upload_files?: File[];
  project_id?: string;
  system_msg?: string;
  hyperparameter?: {
    max_tokens?: string;
  };
  textdic?: {};
};

interface Project {
  project_id: string;
  project_name: string;
  created_at: string;
  updated_at?: string;
}

export interface Room {
  project_id?: string;
  room_id: string;
  room_name: string;
  created_at?: string;
  updated_at: string;
}
export type MessageContent =
  | string
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

export type MsgType = {
  id: string;
  role: "user" | "assistant";
  content: string | MessageContent[];
  date: string;
  uuid: string;
  thinking?: string;
};

export type Code = {
  code_id: string;
  room_id: string;
  content: string;
  room_name: string;
  language: string;
  created_at: string;
};

export type MessageInputType = {
  text: string;
  roomId: string;
  files?: File[];
  projectId?: string;
};

type ChatManagerContextType = {
  projects: Project[];
  addProject: (project: Project) => void;
  removeProject: (id: string) => void;
  updateProject: (id: string, name: string, updatedProject: Project) => void;
  rooms: Room[];
  addRoom: (room: Room) => void;
  removeRoom: (id: string) => void;
  updateRoom: (id: string, name: string, updatedRoom: Room) => void;
  projectInrooms: Room[];
  removeProjectInRoom: (id: string) => void;
  updateProjectInRoom: (id: string, name: string, updatedRoom: Room) => void;
  updateProjectInRoomToRoom: (id: string, room: Room) => void;
  updateRoomToProject: (roomId: string, projectId: string) => void;
  codes: Code[];
  addCode: (code: Code) => void;
  removeCode: (id: string) => void;
  getCodelist: () => Promise<void>;
  updateCodeRoomName: (codeId: string, newRoomName: string) => Promise<void>;
  getProjectInRoomList: (projectId: string) => Promise<void>;
  chatMessages: MsgType[];
  // sendMessage: (txt: string, roomId: string) => Promise<void>;
  deleteMessage: (index: number, roomId: string) => void;
  EditSendMessage: (
    index: number,
    roomId: string,
    data: MessageInputType,
  ) => void;
  uploadFile: (file: File) => void;
  sendMessage: (data: {
    text: string;
    roomId: string;
    files?: File[];
    projectId?: string;
  }) => Promise<void>;
  setRoomId: (roomId: string) => void;
  getRoomMessages: (roomId: string) => Promise<void>;
  changeModel: (model: string) => void;
  llmModel: string;
  changeHyperParameter: (top_p: string, temperatuer: string) => void;
  streamCancle: () => void;
  clearChatMessages: () => void;
  isSending: boolean;
  chatLoadingAnalytic: boolean;
  chatLoadingGenerating: boolean;
  chatLoadingThinking: boolean;
  chatInputRef: React.RefObject<HTMLTextAreaElement | null>;
  //퍼블리싱 이후
  subPanelToggle: boolean;
  setSubPanelToggle: (val: boolean) => void;
  dragOn: boolean;
  setDragOn: (val: boolean) => void;
  sidebarIsOpen: boolean;
  setSidebarIsOpen: (val: boolean) => void;
  ChatType: ChatType;
  notAllowed: boolean;
  activeProjectId: string | null;
  setActiveProjectId: (projectId: string | null) => void;
  changeSystemMessage: (system_message: string) => void;
  commandMessage: (textdict: { [key: string]: string }) => void;
};

export const ChatManagerContext = createContext<
  ChatManagerContextType | undefined
>(undefined);

export const ChatManagerProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const ChatType: ChatType = pathname.split("/")[2]?.toLowerCase() as ChatType;
  const [chatMessages, setChatMessages] = useState<MsgType[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("activeProjectId");
    }
    return null;
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  const [projectInrooms, setProjectInrooms] = useState<Room[]>([]);
  const [roomId, setRoomId] = useState<string | undefined>(undefined);
  // projectId 도 [roomId, setRoomId] 처럼 관리...
  const [codes, setCodes] = useState<Code[]>([]);
  const [llmModel, setLlmModel] = useState<string>("llama_douzone");

  const [toppvalue, setTopPValue] = useState<string>("0.95");
  const [tempvalue, setTempValue] = useState<string>("0.2");
  const [maxTokens, setMaxTokens] = useState<string>("4000");
  const [controller, setController] = useState<AbortController | null>(null);
  const [sidebarIsOpen, setSidebarIsOpen] = useState(true);
  const [isSending, setIsSending] = useState(false); // 전송중
  const [chatLoadingAnalytic, setChatLoadingAnalytic] = useState(false); // 분석중
  const [chatLoadingGenerating, setChatLoadingGenerating] = useState(false); // 답변중
  const [chatLoadingThinking, setChatLoadingThinking] = useState(false); // 생각중
  const [systemMessage, setSystemMessage] = useState<string>("");
  const [textdic, setTextDic] = useState<{ [key: string]: string }>({});
  const chatInputRef = React.useRef<HTMLTextAreaElement>(null);
  const [notAllowed, setNotAllowed] = useState<boolean>(false);
  const [subPanelToggle, setSubPanelToggle] = useState(true);
  const [dragOn, setDragOn] = useState(false);

  useEffect(() => {
    getProjectList();
    getRoomList();
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("llm_type");
    if (stored) {
      setLlmModel(stored);
    }
  }, []);

  useEffect(() => {
    if (activeProjectId) {
      localStorage.setItem("activeProjectId", activeProjectId);
    } else {
      localStorage.removeItem("activeProjectId");
    }
  }, [activeProjectId]);

  useEffect(() => {
    const deptPathNm = localStorage.getItem("deptPathNm");
    if (deptPathNm) {
      const parts = deptPathNm.split("|");
      const companyName = parts[0];

      if (companyName === "더존협력업체") {
        setNotAllowed(true);
        // router.push("/chat/dnx");
        console.log("pathname", pathname);
        const isAllowedPath =
          pathname.startsWith("/chat/dnx") ||
          pathname.startsWith("/chat/dnxflow");

        if (!isAllowedPath) {
          router.push("/chat/dnx");
        }
      }
    }
  }, []);

  // useEffect(() => {
  //   streamCancle();
  //   if (isSending) {
  //     setIsSending(false);
  //
  //   }
  // }, [pathname]);

  const getRoomList = async () => {
    const res = await api.get(`/api/rooms?chat_type=${ChatType}`);
    const sortData = res.data.room_list.sort(
      (a: Room, b: Room) =>
        new Date(a.updated_at).getTime() > new Date(b.updated_at).getTime(),
    );
    setRooms(sortData);
  };
  const getProjectList = async () => {
    const res = await api.get(`/api/project?chat_type=${ChatType}`);
    const sortData = res.data.project_list.sort(
      (a: Project, b: Project) =>
        new Date(a.created_at || 0).getTime() >
        new Date(b.created_at || 0).getTime(),
    );
    setProjects(sortData);
  };
  const getProjectInRoomList = async (projectId: string) => {
    const res = await api.get(
      `/api/projectroom/roomlist/${projectId}?chat_type=${ChatType}`,
    );
    // const data = await res.data;
    // setProjectInrooms(data.project_list as Room[]);
    const sortData = res.data.room_list
      .filter((room: Room) => !!room.updated_at)
      .sort(
        (a: Room, b: Room) =>
          new Date(a.updated_at).getTime() > new Date(b.updated_at).getTime(),
      );

    setProjectInrooms(sortData);
  };

  const addProject = async (project: Project) => {
    const res = await api.post(`/api/project`, {
      project_id: project.project_id,
      text: project.project_name,
      chat_type: ChatType,
    });
    const newProject = res.data;
    // setProjects((prevProjects) => [...prevProjects, project]);
    setProjects((prevProjects) => [newProject, ...prevProjects]);
  };

  const removeProject = async (id: string) => {
    await api.delete(`/api/project/${id}`);

    router.push(`/chat/${ChatType}`);
    setProjects((prevProjects) =>
      prevProjects.filter((project) => project.project_id !== id),
    );
  };

  const updateProject = async (
    id: string,
    name: string,
    updatedProject: Project,
  ) => {
    await api.put(`/api/project/${id}`, {
      project_id: id,
      project_name: name,
    });
    setProjects((prevProjects) =>
      prevProjects.map((project) =>
        project.project_id === id ? { ...project, ...updatedProject } : project,
      ),
    );
  };

  const addRoom = (room: Room) => {
    // 메세지 전송시에 작업되고있음...
    setRooms((prevRooms) => [...prevRooms, room]);
  };

  const removeRoom = async (id: string) => {
    const res = await api.delete(`/api/room/${id}`);
    setRooms((prevRooms) => prevRooms.filter((room) => room.room_id !== id));
    return res;
  };

  const updateRoom = (id: string, name: string, updatedRoom: Room) => {
    api.put(`/api/room/${id}`, {
      room_id: id,
      room_name: name,
    });
    setRooms((prevRooms) =>
      prevRooms.map((room) =>
        room.room_id === id ? { ...room, ...updatedRoom } : room,
      ),
    );
  };

  const removeProjectInRoom = async (id: string) => {
    const res = await api.delete(`/api/room/${id}`);
    setProjectInrooms((prevRooms) =>
      prevRooms.filter((room) => room.room_id !== id),
    );
    return res;
  };

  const updateProjectInRoomToRoom = async (id: string, room: Room) => {
    const res = await api.put(`/api/projectroom/${id}`); // 프로젝트 id 를 null 로 만드는 api. (삭제 하지 않고 업데이트만)
    setProjectInrooms((prevRooms) =>
      prevRooms.filter((room) => room.room_id !== id),
    );

    // setRooms((prevRooms) => [room, ...prevRooms]);
    getRoomList();
    return res;
  };

  // const updateRoomToProject = async (roomId: string, projectId: string, updatedRoom: Room) => {
  const updateRoomToProject = async (roomId: string, projectId: string) => {
    // 룸 id 를 찾아서 project id 를 update 하는 쿼리 api
    const res = await api.put(`/api/roomtoproject`, {
      room_id: roomId,
      project_id: projectId,
    });

    setRooms((prevRooms) => {
      const removedRoom = prevRooms.find((room) => room.room_id === roomId);
      const updatedRooms = prevRooms
        .filter((room) => room.room_id !== roomId)
        .sort(
          (a, b) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
        );

      if (removedRoom) {
        setProjectInrooms((prevPrjInroom) => {
          const PrjInRoom = [...prevPrjInroom, removedRoom];
          PrjInRoom.sort(
            (a, b) =>
              new Date(b.updated_at).getTime() -
              new Date(a.updated_at).getTime(),
          );
          return PrjInRoom;
        });
      }
      return updatedRooms;
    });

    // setRooms((prevRooms) =>
    //   prevRooms.filter((room) => room.room_id !== roomId),
    // );
    // //추후 수정해야함
    // setProjectInrooms((prevRooms) =>
    //     prevRooms.map((room) => (room.room_id === id ? {...room, ...updatedRoom} : room))
    // );
    return res;
  };

  const updateProjectInRoom = (id: string, name: string, updatedRoom: Room) => {
    api.put(`/api/room/${id}`, {
      room_id: id,
      room_name: name,
    });
    setProjectInrooms((prevRooms) =>
      prevRooms.map((room) =>
        room.room_id === id ? { ...room, ...updatedRoom } : room,
      ),
    );
  };

  const streamCancle = () => {
    if (controller) {
      try {
        controller.abort();
        setChatLoadingGenerating(false);
        setChatLoadingAnalytic(false);
        setChatLoadingThinking(false);
        setIsSending(false);
      } catch (e) {
        if (!(e instanceof DOMException && e.name === "AbortError")) {
          console.error("Abort 중 예외 발생:", e);
        }
      }
      setController(null);
    }
  };

  const getCodelist = async () => {
    const res = await api.get(`/api/history/codelist`);
    const sortData = res.data.code_list.sort(
      (a: Code, b: Code) =>
        new Date(a.created_at).getTime() > new Date(b.created_at).getTime(),
    );
    setCodes(sortData);
  };

  const addCode = async (code: Code) => {
    await api.post(`/api/history/code`, {
      room_id: code.room_id,
      code_id: code.code_id,
      language: code.language,
      text: code.content,
      chat_type: ChatType,
    });

    setCodes((prevCodes) => [...prevCodes, code]);
    await getCodelist();
  };

  const removeCode = (id: string) => {
    api.delete(`/api/history/${id}`);
    setCodes((prevCodes) => prevCodes.filter((code) => code.code_id !== id));
  };

  const updateCodeRoomName = async (codeId: string, newRoomName: string) => {
    try {
      // 백엔드에 저장
      const res = await api.put(`/api/history/${codeId}`, {
        room_name: newRoomName,
      });

      // res 가 200 OK 응답을 받으면 상태 업데이트
      if (res.status === 200) {
        setCodes((prevCodes) =>
          prevCodes.map((code) =>
            code.code_id === codeId
              ? { ...code, room_name: newRoomName }
              : code,
          ),
        );
      } else {
        console.error("코드 이름 업데이트 실패:", res.statusText);
      }
    } catch (error) {
      console.error("코드 이름 업데이트 실패:", error);
    }
  };

  // const getProjectInRoomMessages = async (_roomId: string) => {
  //     // const hasRoomId = projectInrooms.find(room=>room.room_id === _roomId);
  //     // if (roomId === _roomId || !hasRoomId) return;
  //     const hasRoomId = projectInrooms.find(room=>room.room_id === _roomId);
  //     if (roomId === _roomId || hasRoomId) return;
  //     setRoomId(_roomId);
  //     const response = await api.get(`/api/message/${_roomId}`);
  //     const messages = response.data.messages;
  //     setChatMessages(messages);
  // }

  const getRoomMessages = async (_roomId: string) => {
    const isNewRoom =
      // !rooms.find(room => room.room_id === _roomId) && roomId === "";
      //rooms 에 없고 roomId가 빈값, null이면 true 가 맞아 근데 projectInrooms안에까지 없으면 true가 되게
      //rooms와 projectInrooms 둘 다 _roomId를 포함하지 않고, 현재 열려있는 roomId가 비어 있으면 isNewRoom은 true
      !rooms.find((room) => room.room_id === _roomId) &&
      (roomId === "" || roomId === null) &&
      !projectInrooms.find((room) => room.room_id === _roomId);
    if (!isNewRoom) {
      const response = await api.get(`/api/message/${_roomId}`);
      const messages = response.data.messages;
      setChatMessages(messages);
    }
  };

  const clearChatMessages = () => {
    setChatMessages([]);
  };

  const deleteMessage = async (index: number, roomId: string) => {
    // 예: 해당 index가 user면 [index, index+1] 삭제
    const res = await api.delete(`/api/message/${index}?room_id=${roomId}`);
    const msg = chatMessages[index];
    if (msg.role !== "user") return;
    // status 200 이면 삭제 성공
    if (res.status !== 200) {
      console.error("메세지 삭제 실패");
      return;
    }
    if (res.status === 200) {
      await getRoomMessages(roomId);
      if (chatMessages.length === 0) {
        console.error("완전히 빔");
        return;
      }
    }
  };

  //EditSendMessage (유저의 메세지 수정한것을 전송하는 메세지임)
  // deleteMessage (메서드에서 geRoomMessages를 빼고) 호출 하고서 SendMessage를 호출하는 구조로 변경
  const EditSendMessage = async (
    index: number,
    roomId: string,
    data: MessageInputType,
  ) => {
    const res = await api.delete(`/api/message/${index}?room_id=${roomId}`);
    const msg = chatMessages[index];
    if (msg.role !== "user") return;
    if (res.status !== 200) {
      console.error("메세지 삭제 실패");
      return;
    }
    // chatMessages.splice(0, index);
    const updatedMessages = chatMessages.filter((_, i) => i < index);
    setChatMessages(updatedMessages);
    await sendMessage(data);
    await getRoomMessages(roomId);
  };

  //개별 업로드 함수(사용안함)
  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    // console.log("formData : ", formData);
    const res = await api.post(`api/uploadedit`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "Media-Type": "application/x-www-form-urlencoded",
      },
    });
  };

  const uploadFiles = async (files: File[]): Promise<File[]> => {
    const fileArray = Array.from(files);
    const formData = new FormData();
    fileArray.forEach((file) => {
      formData.append("files", file);
    });
    // 파일 업로드중 상태값 true
    const res = await api.post(`/api/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "Media-Type": "application/x-www-form-urlencoded",
      },
    });

    // 파일 업로드 성공시 파일 업로드중 상태값 false

    return res.data.files;
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsDataURL(file);
    });
  };
  const sendMessage = async (data: MessageInputType) => {
    const { text, roomId, files } = data;
    if (isSending) return; // 이미 보내는 중이면 그냥 무시
    setIsSending(true); // 전송 시작
    setChatLoadingAnalytic(true); // 분석중
    setChatLoadingGenerating(true); // 답변 생성중
    setChatLoadingThinking(true); //생각 시작
    const storedModel = localStorage.getItem("llm_type") || llmModel;
    const storedTopP = localStorage.getItem("top_p") || toppvalue;
    const storedTemp = localStorage.getItem("temperature") || tempvalue;

    try {
      // 파일 업로드 처리 먼저
      const uploadedFiles: {
        file_name: string;
        file_url: string;
      }[] = files?.length ? ((await uploadFiles(files)) as any) : [];

      const upload = uploadedFiles
        .filter((file) => {
          const ext = file.file_name.split(".").pop()?.toLowerCase();
          return ["png", "jpeg", "jpg", "pdf"].includes(ext || "");
        })
        .map((file) => ({
          type: "image_url",
          image_url: { url: file.file_url },
        }));
      setChatLoadingAnalytic(false);

      // 메세지 세팅
      const userMsg = {
        id: "id",
        role: "user",
        content: [{ text: data.text, type: "text" }, ...upload],
        date: new Date().toDateString(),
        uuid: uuid(),
      } as MsgType;

      const assistantMsg = {
        id: "id",
        role: "assistant",
        content: "",
        date: new Date().toDateString(),
        uuid: uuid(),
        thinking: "",
      } as MsgType;

      const payload: Payload = {
        text: text,
        room_id: roomId,
        stream: true,
        llm_type: storedModel,
        // system_msg: systemMessage,
        // upload_files: uploadedFiles,
        chat_type: ChatType,
      };
      if (systemMessage.length > 0) {
        payload.system_msg = systemMessage;
        setSystemMessage(""); // 전송 후 시스템 메세지 초기화
      }
      if (data.projectId) {
        payload.project_id = data.projectId;
      }
      if (payload.llm_type === "gpt_oss_120b") {
        payload.hyperparameter = {
          max_tokens: "10000",
        };
      }
      if (uploadedFiles.length > 0 && storedModel === "gpt4") {
        // @ts-ignore
        payload.upload_files = uploadedFiles;
      }
      if (textdic && Object.keys(textdic).length > 0) {
        payload.textdic = textdic;
      }

      setChatMessages((prevChatMessages) => [
        ...prevChatMessages,
        userMsg,
        assistantMsg,
      ]);
      const _controller = new AbortController();

      //`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/message`,
      // `/api/message`,
      const response = await api.stream(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/message`, payload, {
        signal: _controller.signal,
      });
      setController(_controller);

      const handleStream = async (
        reader: ReadableStreamDefaultReader<Uint8Array<ArrayBufferLike>>,
      ) => {
        const decoder = new TextDecoder("utf-8");
        let firstChunk = true;
        let checkedStreamingFailed = false;

        // 누적 버퍼
        let thinkingAcc = "";
        let messageAcc = "";

        // 최초 message 토큰 도착 여부
        let hasMessageStarted = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            setController(null);
            setChatLoadingThinking(false);
            break;
          }
          if (firstChunk) {
            setChatLoadingAnalytic(false);
            setChatLoadingGenerating(false);
            firstChunk = false;
          }

          const decodedChunk = decoder.decode(value, { stream: true });
          const parts = decodedChunk
            .split("data: ")
            .filter((item) => item.trim() !== "");

          // 이번 청크에서 message 토큰이 처음 도착했는지 추적
          let sawMessageThisChunk = false;

          for (const part of parts) {
            try {
              const itemJson = JSON.parse(part);

              if (
                !checkedStreamingFailed &&
                itemJson?.message === "Streaming failed"
              ) {
                checkedStreamingFailed = true;
                setChatMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (
                    last?.role === "assistant" &&
                    typeof last.content === "string"
                  ) {
                    last.content += "[스트리밍 실패]";
                  }
                  return updated;
                });
                setController(null);
              }

              if (typeof itemJson?.thinking === "string")
                thinkingAcc += itemJson.thinking;

              if (typeof itemJson?.message === "string") {
                const msgChunk = itemJson.message;
                messageAcc += msgChunk;
                if (!hasMessageStarted && itemJson.message.length > 0) {
                  sawMessageThisChunk = true;
                }
              }
            } catch (e) {
              console.error("JSON parse error:", e, "Original item:", part);
            }
          }

          // 최초 message 토큰이 감지되면 thinking 로딩 해제
          if (sawMessageThisChunk && !hasMessageStarted) {
            hasMessageStarted = true;
            setChatLoadingThinking(false); // 추가
          }

          // 매 청크마다 마지막 assistant 메시지 즉시 갱신
          setChatMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];

            if (last && last.role === "assistant") {
              last.content = messageAcc;
              last.thinking = thinkingAcc;
            }
            return updated;
          });
        }
      };

      const reader = response.body?.getReader();
      if (reader) {
        // setChatLoadingGenerating(false); // 답변 생성중 상태 해제
        await handleStream(reader);
        await getRoomList();
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        console.info("스트리밍이 사용자에 의해 중단");
      } else {
        console.error("스트림 처리 중 에러 발생:", error);
      }
    } finally {
      setSystemMessage("");
      setTextDic({}); // textdic 초기화
      setIsSending(false); // 무조건 전송 끝내줌
      setChatLoadingThinking(false);
    }
  };

  // 두개를 같이 할지도 고려
  // 헤더에서 모델 받는 부분 구현
  const changeModel = async (model: string) => {
    localStorage.setItem("llm_type", model);
    setLlmModel(model);
  };

  const changeSystemMessage = (system_message: string) => {
    setSystemMessage(system_message);
  };

  // textdic 의 예: { "/fix": "aaaaa" }
  const commandMessage = (textdict = {}): string | undefined => {
    const hasInvalidValues = Object.values(textdict).some(
      (value) => typeof value !== "string" || value.trim() === "",
    );

    if (!textdict || Object.keys(textdict).length === 0 || hasInvalidValues) {
      // console.error("textdict 이 빈값이거나, 값에 공백/빈 문자열이 포함됨");
      return "";
    }
    setTextDic((prev) => {
      const isSame = JSON.stringify(prev) === JSON.stringify(textdict);
      if (isSame) return prev;
      return textdict; // 이전 값과 같으면 업데이트 하지 않음
    });
  };

  // 헤더에서 하이퍼파라미터 받는 부분 구현
  const changeHyperParameter = async (
    top_p?: string,
    temperature?: string,
    max_token?: string,
  ) => {
    if (
      top_p === undefined ||
      temperature === undefined ||
      max_token === undefined
    )
      return;
    setTopPValue(top_p);
    setTempValue(temperature);
    localStorage.setItem("top_p", top_p);
    localStorage.setItem("temperature", temperature);
  };

  return (
    <ChatManagerContext.Provider
      value={{
        projects,
        removeProject,
        addProject,
        updateProject,
        addRoom,
        rooms,
        updateRoom,
        removeRoom,
        projectInrooms,
        removeProjectInRoom,
        updateProjectInRoom,
        updateProjectInRoomToRoom,
        updateRoomToProject,
        chatMessages,
        deleteMessage,
        EditSendMessage,
        uploadFile,
        sendMessage,
        getRoomMessages,
        setRoomId,
        codes,
        addCode,
        getProjectInRoomList,
        removeCode,
        getCodelist,
        updateCodeRoomName,
        changeModel,
        llmModel,
        changeHyperParameter,
        streamCancle,
        isSending,
        chatLoadingAnalytic,
        chatLoadingGenerating,
        chatLoadingThinking,
        chatInputRef,
        clearChatMessages,
        subPanelToggle,
        setSubPanelToggle,
        dragOn,
        setDragOn,
        sidebarIsOpen,
        setSidebarIsOpen,
        ChatType,
        notAllowed,
        activeProjectId,
        setActiveProjectId,
        changeSystemMessage,
        commandMessage,
      }}
    >
      {children}
    </ChatManagerContext.Provider>
  );
};

export const useChatManager = () => {
  const context = React.useContext(ChatManagerContext);
  if (!context) {
    throw new Error("useChatManager는 ChatManagerProvider 내에서 사용해야 함");
  }
  return context;
};
