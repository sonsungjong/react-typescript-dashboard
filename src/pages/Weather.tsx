import { useEffect, useState } from "react";
// 그래프 라이브러리
// npm install --save chart.js react-chartjs-2
import { Chart as ChartJS, defaults, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend } from "chart.js/auto";
import { Bar, Line } from "react-chartjs-2";
import { SunDim, CloudSun, Cloud, CloudRain, CloudDrizzle, CloudSnow } from 'lucide-react';

// Chart.js에 필요한 스케일 및 요소 등록
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend);

type CategoryKey = 'TMP' | 'REH' | 'WSD' | 'SKY' | 'PTY' | 'POP';

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

interface IForecastView
{
    region : string;
    fcstDate : string;
    fcstTime : string;
    TMP : string;
    REH : string;
    WSD : string;
    SKY : string;
    PTY : string;
    POP : string;
}

interface IGroupedForecast {
    [key: string]: IForecastView[];
}

// 지역 이름과 좌표를 매핑하는 객체
const regions : { [key: string]: { nx: number; ny: number; } } = {
    '서울': { nx: 60, ny: 127 },
    '부산': { nx: 98, ny: 76 },
    '제주': { nx: 52, ny: 38 },
    '대구': { nx: 89, ny: 90 },
    '광주': { nx: 58, ny: 74 },
    '대전': { nx: 67, ny: 100 },
    '울산': { nx: 102, ny: 84 },
    '세종': { nx: 66, ny: 103 },
    '인천': { nx: 55, ny: 124 },
    '수원': { nx: 60, ny: 121 },
};

// SKY (하늘 상태) 값에 따라 아이콘을 반환하는 함수
const getSkyIcon = (skyValue: string) => {
    switch(skyValue) {
        case '1': // 맑음
            return <SunDim className="w-10 h-10 text-yellow-500" />;
        case '3': // 구름많음
            return <CloudSun className="w-10 h-10 text-gray-500" />;
        case '4': // 흐림
            return <Cloud className="w-10 h-10 text-gray-400" />;
        default:
            return null;
    }
}

// PTY (강수 형태) 값에 따라 아이콘을 반환하는 함수
const getPtyIcon = (ptyValue: string) => {
    switch(ptyValue) {
        case '1': // 비
        case '4': // 소나기
        case '5': // 빗방울
            return <CloudRain className="w-10 h-10 text-blue-500" />;
        case '2': // 비/눈
        case '6': // 빗방울눈날림
            return <CloudDrizzle className="w-10 h-10 text-blue-400" />;
        case '3': // 눈
        case '7': // 눈날림
            return <CloudSnow className="w-10 h-10 text-blue-300" />;
        default:
            return null;
    }
}

// 강수 형태(PTY)와 하늘 상태(SKY)를 기반으로 하나의 아이콘을 선택하는 함수
const getWeatherIcon = (skyValue: string, ptyValue: string) => {
    // PTY(강수 형태) 값이 '0'이 아니면(강수 예보가 있으면) 강수 아이콘을 반환
    if (ptyValue !== '0') {
        return getPtyIcon(ptyValue);
    }
    // PTY 값이 '0'이면(강수 예보가 없으면) SKY(하늘 상태) 아이콘을 반환
    return getSkyIcon(skyValue);
}

export default function Weather(){
    const [fcstData, setFcstData]= useState<IForecast[]>([]);           // 여기에다가 기상청 데이터 저장
    const [fcstView, setFcstView] = useState<IForecastView[]>([]);          // 보여주기를 위한 기상청 데이터
    const [groupedFcstView, setGroupedFcstView] = useState<IGroupedForecast>({});
    const [selectedRegion, setSelectedRegion] = useState('인천');
    const [nx, setNx] = useState(regions['인천'].nx);
    const [ny, setNy] = useState(regions['인천'].ny);
    const [pageNo, setPageNo] = useState(1);
    const [baseDate, setBaseDate] = useState(getYesterdayForDisplay());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function buildFcstView(items: IForecast[], nx: number, ny: number): IForecastView[] {
        const want: CategoryKey[] = ['TMP', 'REH', 'WSD', 'SKY', 'PTY', 'POP'];
        const wantSet = new Set(want);
        const map = new Map<string, IForecastView>();

        for (const it of items) {
            if (!wantSet.has(it.category as CategoryKey)) continue;

            const key = `${it.fcstDate}-${it.fcstTime}`;
            if (!map.has(key)) {
            map.set(key, {
                region: `${nx},${ny}`,          // 필요 없으면 ""로 변경
                fcstDate: it.fcstDate,
                fcstTime: it.fcstTime,
                TMP: '',
                REH: '',
                WSD: '',
                SKY: '',
                PTY: '',
                POP: '',
            });
            }

            const row = map.get(key)!;
            // 같은 키에서 카테고리별 값 채우기 (마지막 값 우선)
            (row as any)[it.category] = it.fcstValue;
        }

        // 날짜+시간 순 정렬
        const out = Array.from(map.values()).sort((a, b) => {
            const ax = a.fcstDate + a.fcstTime;
            const bx = b.fcstDate + b.fcstTime;
            return ax.localeCompare(bx);
        });

        return out;
    }

    // 날짜를 기준으로 데이터를 그룹화하는 함수
    function groupFcstByDate(items: IForecastView[]): IGroupedForecast {
        return items.reduce((acc: IGroupedForecast, item) => {
            const date = item.fcstDate;
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(item);
            return acc;
        }, {});
    }

    // 어제 날짜를 yyyy-mm-dd 형식으로 반환 (달력 입력용)
    function getYesterdayForDisplay(){
        const d = new Date();
        d.setDate(d.getDate() - 1);
        return d.toISOString().split('T')[0];
    }

    // YYYY-MM-DD 형식의 날짜를 YYYYMMDD 형식으로 변환
    function formatDateForAPI(dateStr: string) {
        return dateStr.replace(/-/g, '');
    }

    // 공공데이터포털의 단기예보의 단기예보조회 (공공데이터포털 API 호출)
    async function handleGetFcst()
    {
        // 공공데이터포털 로그인 -> 단기예보 검색 -> Open API -> 단기예보조회
        setLoading(true);
        setError(null);
        try{
            const serviceKey ="IutNHOj6m80UZSIGCtN0PqM1VAJ2fky%2BhPh6pSHWgy1dAqtZ6WhUQfh%2Bq38RPvlGxwmx1Jo%2FTsvKDBZ4FyxGfw%3D%3D";
            const formattedDate = formatDateForAPI(baseDate);
            const url = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst?serviceKey=${serviceKey}&pageNo=${pageNo}&numOfRows=1000&dataType=JSON&base_date=${formattedDate}&base_time=0500&nx=${nx}&ny=${ny}`;

            const res = await fetch(url);
            const obj_data = await res.json();
            console.log(obj_data)

            // state에 저장하고
            if(obj_data.response?.body?.items?.item)
            {
                setFcstData(obj_data.response.body.items.item);
                const items: IForecast[] = obj_data?.response?.body?.items?.item;
                if (items.length > 0) {
                    const view = buildFcstView(items, nx, ny);
                    setFcstView(view);
                    setGroupedFcstView(groupFcstByDate(view));
                }else{
                    setError("날씨 데이터를 불러오는 데 실패했습니다. 날짜와 좌표를 확인해주세요.");
                    setFcstData([]);
                    setFcstView([]);
                    setGroupedFcstView({});
                }

                // fcstDate : 해당 날짜
                // fcstTime : 해당 시간
                // TMP : 온도
                // REH : 습도
                // WSD : 풍속
                // SKY : 하늘 상태
                // PTY : 강수 형태
                // POP : 강수 확률
            }
        }catch(e){
            console.error(e);
            setError("네트워크 오류가 발생했습니다.");
            setFcstData([]);
            setFcstView([]);
            setGroupedFcstView({});
        }finally {
            setLoading(false);
        }

    }

    useEffect(()=>{
        handleGetFcst();
    }, [])

    const handleRegionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const regionName = event.target.value;
        setSelectedRegion(regionName);
        const { nx, ny } = regions[regionName];
        setNx(nx);
        setNy(ny);
    }

    const temperatureData = {
        labels: fcstView.map(item => item.fcstTime.slice(0, 2) + '시'),
        datasets: [
            {
                label: '기온 (℃)',
                data: fcstView.map(item => item.TMP),
                backgroundColor: 'rgba(239, 68, 68, 0.6)',
                borderColor: 'rgba(239, 68, 68, 1)',
                borderWidth: 1,
            },
        ],
    };

    const popData = {
        labels: fcstView.map(item => item.fcstTime.slice(0, 2) + '시'),
        datasets: [
            {
                label: '강수 확률 (%)',
                data: fcstView.map(item => item.POP),
                fill: false,
                borderColor: 'rgb(59, 130, 246)',
                tension: 0.1,
            },
        ],
    };

    return(
        <div className="bg-gray-800 min-h-screen p-8 antialiased text-[#374151]">
            <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-2xl p-6 md:p-10 transition-all duration-300">
                <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-6">
                    오늘의 날씨 예보 ☀️
                </h2>

                {/* 입력 컨트롤 섹션 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-600 mb-1">Base Date:</label>
                        <input
                            type="date"
                            value={baseDate}
                            onChange={(e) => setBaseDate(e.target.value)}
                            className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-600 mb-1">지역 선택:</label>
                        <select
                            value={selectedRegion}
                            onChange={handleRegionChange}
                            className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                        >
                            {Object.keys(regions).map(region => (
                                <option key={region} value={region}>{region}</option>
                            ))}
                        </select>
                    </div>
                    {/* 위도, 경도는 표시만 하도록 변경 */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-600 mb-1">NX:</label>
                        <input
                            type="number"
                            value={nx}
                            readOnly
                            className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-100 transition duration-200"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-600 mb-1">NY:</label>
                        <input
                            type="number"
                            value={ny}
                            readOnly
                            className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-100 transition duration-200"
                        />
                    </div>
                </div>

                <button
                    className="w-full px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition duration-300 transform hover:scale-105 mb-8"
                    onClick={handleGetFcst}
                    disabled={loading}
                >
                    {loading ? '데이터 로딩 중...' : '날씨 예보 보기'}
                </button>
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}
                
                {/* 날짜별로 그룹화된 날씨 데이터 섹션 */}
                <div className="space-y-8">
                    {Object.entries(groupedFcstView).length > 0 ? (
                        Object.entries(groupedFcstView).map(([date, items]) => (
                            <div key={date} className="bg-white p-4 rounded-xl shadow-lg">
                                <h3 className="text-xl font-bold text-gray-800 mb-4">{date.slice(4,6)}월 {date.slice(6,8)}일 날씨 예보</h3>
                                <div className="flex flex-nowrap space-x-4 overflow-x-auto pb-4">
                                    {items.map((item, index) => (
                                        <div
                                            key={index}
                                            className="min-w-[150px] p-4 bg-gray-50 border border-gray-200 rounded-xl shadow-md flex-shrink-0 flex flex-col items-center text-center hover:shadow-xl transition-shadow duration-300"
                                        >
                                            <div className="flex flex-col items-center">
                                                {/* 하늘 상태와 강수 형태에 따라 하나의 아이콘만 표시 */}
                                                {getWeatherIcon(item.SKY, item.PTY)}
                                                <div className="mt-2 text-2xl font-bold text-gray-800">{item.TMP}℃</div>
                                                <div className="text-sm font-medium text-gray-500">{item.fcstTime.slice(0, 2)}:00</div>
                                            </div>
                                            <div className="mt-4 w-full text-left text-sm text-gray-600">
                                                <p><span className="font-semibold text-gray-700">습도:</span> {item.REH}%</p>
                                                <p><span className="font-semibold text-gray-700">풍속:</span> {item.WSD} m/s</p>
                                                <p><span className="font-semibold text-gray-700">강수 확률:</span> {item.POP}%</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        !loading && <p className="text-center text-gray-500">데이터가 없습니다.</p>
                    )}
                </div>

                {/* 그래프 섹션 */}
                {fcstView.length > 0 && (
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl shadow-md">
                            <h3 className="text-lg font-bold text-center mb-4">시간별 기온 변화</h3>
                            <Bar data={temperatureData} />
                        </div>
                        <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl shadow-md">
                            <h3 className="text-lg font-bold text-center mb-4">시간별 강수 확률</h3>
                            <Line data={popData} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
