import { useEffect, useState } from "react";
import NaverMapStore from "../components/NaverMap/NaverMapStore";

interface IStoreData {
    adongCd: string;
    adongNm: string;
    bizesId: string;
    bizesNm: string;
    bldMngNo: string;
    bldMnno: number;
    bldNm: string;
    bldSlno: string;
    brchNm: string;
    ctprvnCd: string;
    ctprvnNm: string;
    dongNo: string;
    flrNo: string;
    hoNo: string;
    indsLclsCd: string;
    indsLclsNm: string;
    indsMclsCd: string;
    indsMclsNm: string;
    indsSclsCd: string;
    indsSclsNm: string;
    ksicCd: string;
    ksicNm: string;
    lat: number;
    ldongCd: string;
    ldongNm: string;
    lnoAdr: string;
    lnoCd: string;
    lnoMnno: number;
    lnoSlno: number;
    lon: number;
    newZipcd: string;
    oldZipcd: string;
    plotSctCd: string;
    plotSctNm: string;
    rdnm: string;
    rdnmAdr: string;
    rdnmCd: string;
    signguCd: string;
    signguNm: string;
}

export default function Store() {
    const [storeList, setStoreList] = useState<IStoreData[]>([]);
    const [pageNo, setPageNo] = useState(1);
    const [signguCd, setSignguCd] = useState('28237');
    const [indsLclsCd, setIndsLclsCd] = useState('I2');
    const [ldongCd, setLdongCd] = useState('');
    const [numOfRows, setNumOfRows] = useState(100);

    const handleGetStore = async (page: number) => {
        try {
            const url = `https://apis.data.go.kr/B553077/api/open/sdsc2/storeListInDong?serviceKey=${import.meta.env.VITE_GOV_API_KEY}&pageNo=${page}&numOfRows=${numOfRows}&divId=signguCd&key=${signguCd}&indsLclsCd=${indsLclsCd}&type=json&${ldongCd ? `divId=ldongCd&key=${ldongCd}` : ''}`;
            const res = await fetch(url);
            const data = await res.json();

            if (data.body?.items && data.body.items.length > 0) {
                setStoreList(data.body.items);
                setPageNo(page);
            } else {
                setStoreList([]);
            }
        } catch (error) {
            console.error("Failed to fetch store data:", error);
            setStoreList([]);
        }
    };

    // 컴포넌트가 처음 렌더링될 때 데이터 받아오기
    useEffect(() => {
        handleGetStore(pageNo);
    }, []);

    // 페이지 목록 생성 (예: 1부터 10까지)
    const pages = Array.from({ length: 10 }, (_, i) => i + 1);

    return (
        <div className="flex flex-col justify-center items-center p-4">
            <h1 className="text-2xl font-bold mb-4">상가 정보 조회</h1>
            <div className="flex space-x-4 mb-4 items-center">
                <label>
                    지역 선택 (SignguCd):
                    <select
                        className="p-2 border rounded ml-2"
                        value={signguCd}
                        onChange={(e) => setSignguCd(e.target.value)}
                    >
                        <option className="text-black" value="28237">인천 남동구 (28237)</option>
                        <option className="text-black" value="11620">서울 관악구 (11620)</option>
                        <option className="text-black" value="41135">경기 성남시 분당구 (41135)</option>
                    </select>
                </label>
                
                <button
                    className="bg-purple-500 hover:bg-purple-400 text-white font-bold py-2 px-4 rounded cursor-pointer"
                    onClick={() => handleGetStore(pageNo)}
                >
                    상가정보 받아오기
                </button>
            </div>
            
            <p className="text-lg mb-4">현재 상가 수: {storeList.length}</p>

            <NaverMapStore stores={storeList} />

            <div className="flex space-x-2 my-4">
                {pages.map((page) => (
                    <button
                        key={page}
                        className={`py-2 px-4 rounded ${
                            page === pageNo ? 'bg-blue-500 text-white font-bold' : 'bg-gray-200 text-black'
                        }`}
                        onClick={() => handleGetStore(page)}
                    >
                        {page}
                    </button>
                ))}
            </div>

            <div className="mt-8 w-full max-w-4xl">
                <h2 className="text-xl font-bold mb-2">상가 목록</h2>
                {storeList.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {storeList.map((store) => (
                            <div key={store.bizesId} className="bg-gray-100 p-3 rounded shadow-sm">
                                <p className="font-semibold text-purple-700">{store.bizesNm}</p>
                                <p className="text-sm text-gray-600">{store.rdnmAdr}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">정보가 없습니다. 검색 버튼을 누르거나 페이지를 선택해주세요.</p>
                )}
            </div>
        </div>
    );
}