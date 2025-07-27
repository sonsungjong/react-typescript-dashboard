import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar/Sidebar";
import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Store from "./pages/Store";
import Weather from "./pages/Weather";
import Login from "./components/Login";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "./store/store";
import { restore } from "./store/slices/AccountSlice";

export default function App() {

  let {user} = useSelector((state:any) => state.auth)
  const dispatch = useDispatch<AppDispatch>();
  
  // 로그인 후에 새로고침하면 리덕스 내용이 날라가는 문제를
  // 세션스토리지에서 받아와서 로그인 안풀리게
  useEffect(()=>{
    // 새로고침으로 처음 시작되면
    // 세션스토리지에서 'user' 를 받아온다음 getItem('user')
    let json_user = sessionStorage.getItem('user');
    if(json_user){
      dispatch(restore(JSON.parse(json_user)));
    }

  }, [])

  if(user?.id === ''){
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