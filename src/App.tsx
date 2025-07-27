import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar/Sidebar";
import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Store from "./pages/Store";
import Weather from "./pages/Weather";
import Login from "./components/Login";

export default function App() {

  const [isLogin, setIsLogin] = useState(false);    // 처음에는 로그인X

  if(isLogin == false){
    // 로그인 화면
    return(
      <Login />
    )
  }

  // 대시보드 + 홈화면
  return (
    <div className="flex flex-row h-screen w-full">
      <Sidebar />

      <div className="flex-1 bg-gray-800 ps-8 h-screen
       overflow-auto text-white">
        <Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path="/store" element={<Store />}></Route>
          <Route path="/weather" element={<Weather />}></Route>

          {/* 그 외에 페이지는 / 페이지로 이동 */}
          <Route path="*" element={<Navigate to='/' replace />}></Route>
        </Routes>
      </div>
    </div>
  )
}