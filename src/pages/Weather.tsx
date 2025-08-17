import { useEffect, useState } from "react";
// 그래프 라이브러리
// npm install --save chart.js react-chartjs-2
import { Chart as ChartJS, defaults } from "chart.js/auto";
import { Doughnut, Bar, Line } from "react-chartjs-2";

import sampleData from './../data/sample.json';

interface IForecast
{
    baseDate: string,
    baseTime: string,
    category: string,
    fcstDate: string,
    fcstTime: string,
    fcstValue: string,
    nx: number,
    ny: number
}

export default function Weather(){
    const api_key = import.meta.env.VITE_GOV_API_KEY;
    const [fcstData, setFcstData]= useState<IForecast[]>([]);           // 여기에다가 기상청 데이터 저장
    const [pageNo, setPageNo] = useState(1);
    const [numOfRows, setNumOfRows] = useState(10000);
    const [baseDate, setBaseDate] = useState('20250816');
    const [baseTime, setBaseTime] = useState('0500');
    const [nx, setNx] = useState(55);
    const [ny, setNy] = useState(125);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // 공공데이터포털의 단기예보의 단기예보조회
    async function handleGetFcst()
    {
        // 공공데이터포털 로그인 -> 단기예보 검색 -> Open API -> 단기예보조회
        let res = await fetch(`https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst?serviceKey=${api_key}&pageNo=${pageNo}&numOfRows=${numOfRows}&dataType=JSON&base_date=${baseDate}&base_time=${baseTime}&nx=${nx}&ny=${ny}`)
        let data = await res.json();

        console.log(data);          // data.

        // state에 저장하고
        console.log(data.response?.body?.items?.item)
        if(data.response?.body?.items?.item.length > 0){
            setFcstData(data.response.body.items.item);

            // 카테고리 TMP : 온도
            // 카테고리 REH : 습도

        }
    }

    useEffect(()=>{
        handleGetFcst();
    }, [])

    return(
        <div className="">

        </div>
    )
}
