import { useEffect, useState } from "react";

interface Store
{
    상호명 : string;
    상권업종대분류명 : string;
    법정동명 : string;
    도로명 : string;
    경도 : number;
    위도 : number;
}

export default function Store(){

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

    return(
        <div>
            Store Page
        </div>
    )
}