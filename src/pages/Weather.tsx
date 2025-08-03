import { useState } from "react";
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
    const [fcstData, setFcstData]= useState<IForecast[]>([]);           // 여기에다가 기상청 데이터 저장

    // 공공데이터포털의 단기예보의 단기예보조회
    async function handleGetFcst()
    {
        // 공공데이터포털 로그인 -> 단기예보 검색 -> Open API -> 단기예보조회
        let res = await fetch('https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst?serviceKey=IutNHOj6m80UZSIGCtN0PqM1VAJ2fky%2BhPh6pSHWgy1dAqtZ6WhUQfh%2Bq38RPvlGxwmx1Jo%2FTsvKDBZ4FyxGfw%3D%3D&pageNo=1&numOfRows=10000&dataType=JSON&base_date=20250803&base_time=0500&nx=55&ny=125')
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

    return(
        <div className="flex flex-col justify-center items-center">
            <button className="bg-purple-500
            hover:bg-purple-400 p-2
            cursor-pointer"
            onClick={handleGetFcst}>날씨받아오기</button>

            <div className="w-full h-[500px] bg-gray-500">
                {/* 막대그래프 */}
                <Bar 
                    data={{
                        labels: ["2025-08-01", "2025-08-02", "2025-08-03"],
                        datasets:[
                            {
                                label:"회사 1",
                                data: [100, 200, 300],
                            },
                            {
                                label:"회사 2",
                                data: [150, 150, 250],

                            }
                        ]
                    }}
                />
            </div>

            <div className="w-full h-[500px] bg-gray-500">
                {/* 선그래프 */}
                <Line 
                    data={{
                        labels: sampleData.map((item)=>{return item.label}),
                        datasets:[
                            {
                                label:"온도",
                                data: sampleData.map((item)=>{return item.fcstValue}),
                            },
                            {
                                label:"습도",
                                data: [77, 89, 82],
                            }
                        ]
                    }}
                />
            </div>

            <div className="">
                <ul>
                    {
                        fcstData.map((item, index)=>{
                            return (
                                <li key={index} className="p-4 bg-fuchsia-600 rounded-2xl">
                                    category: {item.category}
                                    <br/>
                                    예측시간: {item.fcstDate} {item.fcstTime}
                                    <br/>
                                    fcstValue: {item.fcstValue}
                                </li>
                            )
                        })
                    }
                </ul>
            </div>
            
        </div>
    )
}
