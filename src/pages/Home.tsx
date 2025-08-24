import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";

// ---- 타입 ----
interface Room {
  _id: string;
  title: string;
  userId: string;
  createdAt: string;
  lastChatAt: string;
}
interface Message {
  _id: string;
  roomId: string;
  userId: string;
  role: "user" | "assistant";
  text: string;
  createdAt: string;
}
interface HomeState {
  isLoading: boolean;
  error: string | null;
  rooms: Room[] | null;
  selectedRoomId: string | null;
  messages: Message[] | null;
  isMessagesLoading: boolean;
  messagesError: string | null;
  inputMessage: string;
  isSending: boolean;
}

export default function Home() {
  const { user } = useSelector((state: RootState) => state.auth);

  const [state, setState] = useState<HomeState>({
    isLoading: true,
    error: null,
    rooms: null,
    selectedRoomId: null,
    messages: null,
    isMessagesLoading: false,
    messagesError: null,
    inputMessage: "",
    isSending: false,
  });

  // 새 채팅방 UI 상태
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [newRoomTitle, setNewRoomTitle] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 공용: 채팅방 목록 로드
  const loadRooms = async (selectRoomIdAfter?: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat/room`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
      });
      if (!res.ok) {
        const e = await res.json();
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: e.error || "채팅방 목록 로딩 중 오류가 발생했습니다.",
          rooms: null,
        }));
        return;
      }
      const rooms: Room[] = await res.json();

      // 최신 생성 방 선택 우선순위: selectRoomIdAfter → 방금 만든 방 → 기존 선택 유지
      let nextSelected = state.selectedRoomId;
      if (selectRoomIdAfter) nextSelected = selectRoomIdAfter;

      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: null,
        rooms,
        selectedRoomId: nextSelected ?? prev.selectedRoomId,
      }));
    } catch (e) {
      console.error("채팅방 목록 로딩 중 오류:", e);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
        rooms: null,
      }));
    }
  };

  // 최초/사용자 변경 시 방 로드
  useEffect(() => {
    if (!user || user.id === "") {
      setState((prev) => ({ ...prev, isLoading: false, error: "로그인 정보가 없습니다." }));
      return;
    }
    loadRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  // 방 선택 시 메시지 로드
  useEffect(() => {
    if (!state.selectedRoomId || !user || user.id === "") return;

    const fetchMessages = async () => {
      setState((prev) => ({ ...prev, isMessagesLoading: true, messagesError: null }));
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat/room_chats`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomId: state.selectedRoomId, userId: user.id }),
        });

        if (!response.ok) {
          const e = await response.json();
          setState((prev) => ({
            ...prev,
            isMessagesLoading: false,
            messagesError: e.error || "메시지 로딩 중 오류가 발생했습니다.",
            messages: null,
          }));
          return;
        }

        const messages: Message[] = await response.json();
        // 오래된 → 최신 정렬
        const asc = messages
          .slice()
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

        setState((prev) => ({
          ...prev,
          isMessagesLoading: false,
          messagesError: null,
          messages: asc,
        }));
      } catch (e) {
        console.error("메시지 로딩 오류:", e);
        setState((prev) => ({
          ...prev,
          isMessagesLoading: false,
          messagesError: "메시지 로딩 중 네트워크 오류가 발생했습니다.",
          messages: null,
        }));
      }
    };

    fetchMessages();
  }, [state.selectedRoomId, user.id]);

  // 스크롤 하단 고정
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    });
    return () => cancelAnimationFrame(id);
  }, [state.messages]);

  const handleRoomClick = (roomId: string) => {
    setState((prev) => ({ ...prev, selectedRoomId: roomId }));
  };

  const handleCreateRoom = async () => {
    if (!user || user.id === "" || creatingRoom) return;
    setCreatingRoom(true);
    try {
      const title =
        newRoomTitle.trim() ||
        `새 채팅 ${new Date().toLocaleString()}`;

      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat/room`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
        body: JSON.stringify({ title }),
      });

      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        console.error("채팅방 생성 실패:", e);
        setCreatingRoom(false);
        return;
      }

      // 백엔드가 생성된 room을 반환하는 경우
      let createdRoomId: string | undefined;
      try {
        const data = await res.json();
        // 응답이 { _id, ... } 또는 { room: { _id, ... } } 등일 수 있으니 방어적으로
        if (data?._id) createdRoomId = data._id;
        else if (data?.room?._id) createdRoomId = data.room._id;
      } catch {
        /* ignore json parse errors */
      }

      setNewRoomTitle("");
      setCreatingRoom(false);

      // 목록 재로딩 + 새 방 선택
      await loadRooms(createdRoomId);
      // createdRoomId가 없으면, 백엔드에서 최신 방이 목록 마지막일 확률이 높음.
      // selectedRoomId를 못 정했으면 마지막 방을 선택하도록 한번 더 조정
      setState((prev) => {
        if (prev.selectedRoomId || !prev.rooms || prev.rooms.length === 0) return prev;
        const last = prev.rooms[prev.rooms.length - 1];
        return { ...prev, selectedRoomId: last?._id ?? null };
      });
    } catch (e) {
      console.error("채팅방 생성 중 오류:", e);
      setCreatingRoom(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState((prev) => ({ ...prev, inputMessage: e.target.value }));
  };

  const handleSendMessage = async () => {
    if (!state.selectedRoomId || !user || user.id === "" || state.inputMessage.trim() === "" || state.isSending) {
      return;
    }

    const newMessage: Message = {
      _id: `temp-${Date.now()}`,
      roomId: state.selectedRoomId,
      userId: user.id,
      role: "user",
      text: state.inputMessage.trim(),
      createdAt: new Date().toISOString(),
    };

    // UI 즉시 반영
    setState((prev) => ({
      ...prev,
      messages: [...(prev.messages || []), newMessage],
      inputMessage: "",
      isSending: true,
    }));

    try {
      const max_context = 20;

      // 전송용 히스토리(방금 메시지 포함)
      const baseMessages: Message[] = [...(state.messages || []), newMessage];
      const messagesForLLM = baseMessages
        .slice()
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        .slice(-max_context)
        .map((m) => ({ role: m.role, content: m.text }));

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat/gpt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: state.selectedRoomId,
          userId: user.id,
          messages: messagesForLLM, // 백엔드에서 messages 배열 처리
        }),
      });

      if (response.ok) {
        const aiResponse = await response.json();

        const aiMessage: Message = {
          _id: aiResponse.AIDoc._id,
          roomId: aiResponse.AIDoc.roomId,
          userId: aiResponse.AIDoc.userId,
          role: aiResponse.AIDoc.role,
          text: aiResponse.AIDoc.text,
          createdAt: aiResponse.AIDoc.createdAt,
        };

        setState((prev) => {
          const updated = (prev.messages ?? []).map((msg) =>
            msg._id === newMessage._id ? { ...msg, _id: aiResponse.userDoc?._id ?? msg._id } : msg
          );
          return { ...prev, messages: [...updated, aiMessage], isSending: false };
        });
      } else {
        const errorData = await response.json();
        console.error(`메시지 전송 실패: ${errorData.text}`);
        setState((prev) => ({
          ...prev,
          messages: (prev.messages ?? []).filter((m) => m._id !== newMessage._id),
          isSending: false,
        }));
      }
    } catch (e) {
      console.error("메시지 전송 오류:", e);
      setState((prev) => ({
        ...prev,
        messages: (prev.messages ?? []).filter((m) => m._id !== newMessage._id),
        isSending: false,
      }));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !state.isSending) handleSendMessage();
  };

  // ---- 로딩/에러 ----
  if (state.isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-xl text-gray-400">채팅방 목록을 불러오는 중...</p>
      </div>
    );
  }
  if (state.error) {
    return (
      <div className="flex flex-col justify-center items-center h-full p-4 text-center">
        <p className="text-xl font-bold text-red-500">오류 발생:</p>
        <p className="mt-2 text-red-400">{state.error}</p>
        <p className="mt-4 text-gray-500">로그인 상태를 확인하고 다시 시도해 주세요.</p>
      </div>
    );
  }

  // ---- UI ----
  return (
    <div className="flex flex-row h-full w-full">
      {/* 왼쪽: 채팅방 목록 + 생성 */}
      <div className="w-1/3 bg-gray-900 overflow-y-auto p-4 rounded-lg shadow-lg">
        <h1 className="text-3xl font-extrabold text-blue-400 mb-4 text-center">채팅방 목록</h1>

        {/* 새 채팅방 생성 UI */}
        <div className="mb-4 flex gap-2">
          <input
            type="text"
            value={newRoomTitle}
            onChange={(e) => setNewRoomTitle(e.target.value)}
            className="flex-1 p-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
            placeholder="채팅방 제목 (미입력 시 자동 생성)"
            disabled={creatingRoom}
          />
          <button
            onClick={handleCreateRoom}
            className={`px-3 py-2 text-white font-bold rounded-lg transition-colors duration-200 ${
              creatingRoom ? "bg-gray-600 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
            }`}
            disabled={creatingRoom}
            title="새 채팅방 만들기"
          >
            {creatingRoom ? "생성중..." : "새 채팅"}
          </button>
        </div>

        {state.rooms && state.rooms.length > 0 ? (
          <ul className="divide-y divide-gray-700">
            {state.rooms.map((room) => (
              <li
                key={room._id}
                onClick={() => handleRoomClick(room._id)}
                className={`p-4 flex flex-col items-start cursor-pointer transition-colors duration-200 ease-in-out ${
                  state.selectedRoomId === room._id ? "bg-gray-700 rounded-md" : "hover:bg-gray-800 rounded-md"
                }`}
              >
                <p className="text-lg font-medium text-green-400">{room.title}</p>
                <div className="w-full flex justify-between items-center text-sm text-gray-400 mt-2">
                  <span>생성일: {new Date(room.createdAt).toLocaleString()}</span>
                  <span>마지막 채팅: {new Date(room.lastChatAt).toLocaleString()}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-lg text-gray-400 mt-8 text-center">생성된 채팅방이 없습니다.</p>
        )}
      </div>

      {/* 오른쪽: 채팅 영역 */}
      <div className="flex-1 bg-gray-800 p-8 flex flex-col">
        {state.selectedRoomId ? (
          <div className="flex flex-col h-full">
            {state.isMessagesLoading ? (
              <div className="flex flex-grow items-center justify-center">
                <p className="text-xl text-gray-400">메시지를 불러오는 중...</p>
              </div>
            ) : state.messagesError ? (
              <div className="flex flex-grow items-center justify-center">
                <p className="text-xl text-red-500">{state.messagesError}</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-4 bg-gray-900 rounded-lg shadow-inner mb-4 flex flex-col">
                {state.messages && state.messages.length > 0 ? (
                  state.messages.map((message) => (
                    <div
                      key={message._id}
                      className={`mb-4 p-3 rounded-lg max-w-2/3 ${
                        message.role === "user" ? "self-end bg-blue-600 text-white" : "self-start bg-gray-700 text-gray-200"
                      }`}
                    >
                      <p className="font-semibold">{message.role === "user" ? "나" : "AI"}</p>
                      <p className="mt-1 whitespace-pre-wrap break-words">{message.text}</p>
                    </div>
                  ))
                ) : (
                  <div className="flex-grow flex items-center justify-center">
                    <p className="text-lg text-gray-400">메시지가 없습니다. 새로운 대화를 시작하세요.</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}

            {/* 입력창 */}
            <div className="flex flex-row gap-2">
              <input
                type="text"
                value={state.inputMessage}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="flex-1 p-3 rounded-lg bg-gray-900 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
                placeholder={state.isSending ? "메시지 전송 중..." : "메시지를 입력하세요..."}
                disabled={state.isSending}
              />
              <button
                onClick={handleSendMessage}
                className={`p-3 text-white font-bold rounded-lg transition-colors duration-200 ${
                  state.isSending ? "bg-gray-600 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                }`}
                disabled={state.isSending}
              >
                {state.isSending ? "전송 중..." : "전송"}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <h2 className="text-3xl font-bold text-gray-400 mb-4">채팅방을 선택하거나 새로 만드세요</h2>
            <p className="text-lg text-gray-500">왼쪽 상단의 “새 채팅” 버튼으로 방을 만들 수 있습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
