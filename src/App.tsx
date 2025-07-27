import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar/Sidebar";
import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Store from "./pages/Store";
import Weather from "./pages/Weather";

interface Store
{
    상호명 : string;
    상권업종대분류명 : string;
    법정동명 : string;
    도로명 : string;
    경도 : number;
    위도 : number;
}

export default function App() {

    const [stores, setStores] = useState<Store[]>([]);

    useEffect(()=>{
    // http://localhost:3000/api/store/incheon 로 get요청
    async function fetchStores(){
      let res = await fetch('http://localhost:3000/api/store/incheon');
      let data = await res.json();

      // 받아온 데이터 console.log
      console.log(data);        // 실행중인 nextjs 에다가 REST API 요청을 해서 store정보를 리액트로 받아오자
      setStores(data);
    }

    fetchStores();
  }, [])

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