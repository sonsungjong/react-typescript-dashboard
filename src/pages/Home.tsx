import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";

// 백엔드에서 받아올 채팅방 데이터의 타입 정의
interface Room {
  _id: string;
  title: string;
  userId: string;
  createdAt: string;
  lastChatAt: string;
}

// 백엔드에서 받아올 메시지 데이터의 타입 정의
interface Message {
  _id: string;
  roomId: string;
  userId: string;
  role: "user" | "assistant";
  text: string;
  createdAt: string;
}

// Home 컴포넌트의 상태를 위한 타입 정의
interface HomeState {
  isLoading: boolean;
  error: string | null;
  rooms: Room[] | null;
  selectedRoomId: string | null;
  messages: Message[] | null;
  isMessagesLoading: boolean;
  messagesError: string | null;
  inputMessage: string;
  isSending: boolean; // 메시지 전송 중 상태 추가
}

/**
 * @description
 * Home 컴포넌트는 사용자가 로그인한 후 보이는 페이지입니다.
 * 이 컴포넌트는 백엔드 `/api/chat/room` API를 호출하여 사용자의 채팅방 목록을 가져옵니다.
 * 채팅방을 선택하면 `/api/chat/room_chats` API를 호출하여 해당 채팅방의 메시지를 가져옵니다.
 * 또한, 사용자가 메시지를 입력하고 전송할 수 있는 UI를 제공합니다.
 */
export default function Home() {
  // Redux 스토어에서 사용자 인증 정보를 가져옵니다.
  const { user } = useSelector((state: RootState) => state.auth);

  // 컴포넌트의 로컬 상태를 관리합니다.
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

  // 메시지 스크롤을 위한 Ref
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 채팅방 목록을 가져오는 useEffect
  useEffect(() => {
    if (!user || user.id === '') {
      setState(prevState => ({ ...prevState, isLoading: false, error: "로그인 정보가 없습니다." }));
      return;
    }

    const fetchChatRooms = async () => {
      setState(prevState => ({ ...prevState, isLoading: true, error: null }));

      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat/room`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user.id
          },
        });

        if (response.ok) {
          const rooms: Room[] = await response.json();
          setState(prevState => ({
            ...prevState,
            isLoading: false,
            error: null,
            rooms: rooms,
          }));
        } else {
          const errorData = await response.json();
          setState(prevState => ({
            ...prevState,
            isLoading: false,
            error: errorData.error || "채팅방 목록 로딩 중 오류가 발생했습니다.",
            rooms: null,
          }));
        }
      } catch (e) {
        setState(prevState => ({
          ...prevState,
          isLoading: false,
          error: "네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
          rooms: null,
        }));
        console.error("채팅방 목록 로딩 중 오류 발생:", e);
      }
    };

    fetchChatRooms();
  }, [user.id]);

  // 선택된 채팅방 ID가 변경될 때 메시지 목록을 가져오는 useEffect
  useEffect(() => {
    if (!state.selectedRoomId || !user || user.id === '') {
      return;
    }

    const fetchMessages = async () => {
      setState(prevState => ({ ...prevState, isMessagesLoading: true, messagesError: null }));

      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat/room_chats`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            roomId: state.selectedRoomId,
            userId: user.id
          }),
        });

        if (response.ok) {
          const messages: Message[] = await response.json();
          setState(prevState => ({
            ...prevState,
            isMessagesLoading: false,
            messagesError: null,
            messages: messages.reverse(),
          }));
        } else {
          const errorData = await response.json();
          setState(prevState => ({
            ...prevState,
            isMessagesLoading: false,
            messagesError: errorData.error || "메시지 로딩 중 오류가 발생했습니다.",
            messages: null,
          }));
        }
      } catch (e) {
        setState(prevState => ({
          ...prevState,
          isMessagesLoading: false,
          messagesError: "메시지 로딩 중 네트워크 오류가 발생했습니다.",
          messages: null,
        }));
        console.error("메시지 로딩 중 오류 발생:", e);
      }
    };

    fetchMessages();
  }, [state.selectedRoomId, user.id]);

  // 메시지 목록이 업데이트될 때마다 스크롤을 맨 아래로 이동
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [state.messages]);

  // 채팅방 항목 클릭 시 호출되는 핸들러
  const handleRoomClick = (roomId: string) => {
    setState(prevState => ({ ...prevState, selectedRoomId: roomId }));
  };

  // 메시지 입력창 내용 변경 핸들러
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState(prevState => ({ ...prevState, inputMessage: e.target.value }));
  };

  // 메시지 전송 버튼 클릭 핸들러
  const handleSendMessage = async () => {
    if (!state.selectedRoomId || !user || user.id === '' || state.inputMessage.trim() === '' || state.isSending) {
      return;
    }

    const newMessage: Message = {
      _id: `temp-${Date.now()}`, // 임시 ID
      roomId: state.selectedRoomId,
      userId: user.id,
      role: "user",
      text: state.inputMessage.trim(),
      createdAt: new Date().toISOString(),
    };
    
    // UI에 즉시 사용자 메시지 추가
    setState(prevState => ({
      ...prevState,
      messages: [...(prevState.messages || []), newMessage],
      inputMessage: "",
      isSending: true, // 전송 시작
    }));

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat/gpt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: newMessage.text,
          roomId: state.selectedRoomId,
          userId: user.id,
          role: "user",
        }),
      });

      if (response.ok) {
        const aiResponse = await response.json();
        const aiMessage: Message = {
          _id: aiResponse.AIDoc._id, // 실제 ID
          roomId: aiResponse.AIDoc.roomId,
          userId: aiResponse.AIDoc.userId,
          role: aiResponse.AIDoc.role,
          text: aiResponse.AIDoc.text,
          createdAt: aiResponse.AIDoc.createdAt,
        };
        
        // 서버에서 받은 AI 메시지를 UI에 추가
        setState(prevState => {
          const updatedMessages = prevState.messages?.map(msg => msg._id === newMessage._id ? { ...msg, _id: aiResponse.userDoc._id } : msg);
          return {
            ...prevState,
            messages: [...(updatedMessages || []), aiMessage],
            isSending: false, // 전송 완료
          };
        });
        
      } else {
        const errorData = await response.json();
        console.error(`메시지 전송 실패: ${errorData.text}`);
        // 실패 시 임시 메시지 제거
        setState(prevState => ({
          ...prevState,
          messages: prevState.messages?.filter(msg => msg._id !== newMessage._id) || null,
          isSending: false,
        }));
      }
    } catch (e) {
      console.error("메시지 전송 중 오류 발생:", e);
      // 실패 시 임시 메시지 제거
      setState(prevState => ({
        ...prevState,
        messages: prevState.messages?.filter(msg => msg._id !== newMessage._id) || null,
        isSending: false,
      }));
    }
  };

  // Enter 키로 메시지 전송
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !state.isSending) {
      handleSendMessage();
    }
  };

  // 로딩 중일 때 표시할 UI
  if (state.isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-xl text-gray-400">채팅방 목록을 불러오는 중...</p>
      </div>
    );
  }

  // 에러가 발생했을 때 표시할 UI
  if (state.error) {
    return (
      <div className="flex flex-col justify-center items-center h-full p-4 text-center">
        <p className="text-xl font-bold text-red-500">오류 발생:</p>
        <p className="mt-2 text-red-400">{state.error}</p>
        <p className="mt-4 text-gray-500">로그인 상태를 확인하고 다시 시도해 주세요.</p>
      </div>
    );
  }

  // 데이터가 성공적으로 로드되었을 때 표시할 UI
  return (
    <div className="flex flex-row h-full w-full">
      {/* 왼쪽: 채팅방 목록 */}
      <div className="w-1/3 bg-gray-900 overflow-y-auto p-4 rounded-lg shadow-lg">
        <h1 className="text-3xl font-extrabold text-blue-400 mb-6 text-center">채팅방 목록</h1>
        {state.rooms && state.rooms.length > 0 ? (
          <ul className="divide-y divide-gray-700">
            {state.rooms.map((room) => (
              <li
                key={room._id}
                onClick={() => handleRoomClick(room._id)}
                className={`p-4 flex flex-col items-start cursor-pointer transition-colors duration-200 ease-in-out
                          ${state.selectedRoomId === room._id ? "bg-gray-700 rounded-md" : "hover:bg-gray-800 rounded-md"}`}
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

      {/* 오른쪽: 채팅 메시지 목록 또는 안내 메시지 */}
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
              // 채팅 메시지 목록
              <div className="flex-1 overflow-y-auto p-4 bg-gray-900 rounded-lg shadow-inner mb-4 flex flex-col-reverse" style={{ flexDirection: 'column-reverse' }}>
                <div ref={messagesEndRef} />
                {state.messages && state.messages.length > 0 ? (
                  state.messages.map((message) => (
                    <div key={message._id} className={`mb-4 p-3 rounded-lg max-w-2/3 ${message.role === "user" ? "self-end bg-blue-600 text-white" : "self-start bg-gray-700 text-gray-200"}`}>
                      <p className="font-semibold">{message.role === "user" ? "나" : "AI"}</p>
                      <p className="mt-1">{message.text}</p>
                    </div>
                  ))
                ) : (
                  <div className="flex-grow flex items-center justify-center">
                    <p className="text-lg text-gray-400">메시지가 없습니다. 새로운 대화를 시작하세요.</p>
                  </div>
                )}
              </div>
            )}
            {/* 메시지 입력창과 전송 버튼 */}
            <div className="flex flex-row gap-2">
              <input
                type="text"
                value={state.inputMessage}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className="flex-1 p-3 rounded-lg bg-gray-900 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
                placeholder={state.isSending ? "메시지 전송 중..." : "메시지를 입력하세요..."}
                disabled={state.isSending}
              />
              <button
                onClick={handleSendMessage}
                className={`p-3 text-white font-bold rounded-lg transition-colors duration-200 ${state.isSending ? "bg-gray-600 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
                disabled={state.isSending}
              >
                {state.isSending ? "전송 중..." : "전송"}
              </button>
            </div>
          </div>
        ) : (
          // 채팅방이 선택되지 않았을 때의 안내 메시지
          <div className="flex flex-col items-center justify-center h-full">
            <h2 className="text-3xl font-bold text-gray-400 mb-4">채팅방을 선택해주세요</h2>
            <p className="text-lg text-gray-500">왼쪽 목록에서 채팅방을 클릭하면 대화를 볼 수 있습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
