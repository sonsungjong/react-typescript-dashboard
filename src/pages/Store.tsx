import { useState } from "react";
import NaverMap from "../components/NaverMap/NaverMap";
import NaverMapStore from "../components/NaverMap/NaverMapStore";

interface IStoreData
{
    adongCd : string
    adongNm : string
    bizesId : string
    bizesNm : string
    bldMngNo : string
    bldMnno : number
    bldNm : string
    bldSlno : string
    brchNm : string
    ctprvnCd : string
    ctprvnNm : string
    dongNo : string
    flrNo : string
    hoNo : string
    indsLclsCd : string
    indsLclsNm : string
    indsMclsCd : string
    indsMclsNm : string
    indsSclsCd : string
    indsSclsNm : string
    ksicCd : string
    ksicNm : string
    lat : number
    ldongCd : string
    ldongNm : string
    lnoAdr : string
    lnoCd : string
    lnoMnno : number
    lnoSlno : number
    lon : number
    newZipcd : string
    oldZipcd : string
    plotSctCd : string
    plotSctNm : string
    rdnm : string
    rdnmAdr : string
    rdnmCd : string
    signguCd : string
    signguNm : string
}

export default function Store(){
    const [storeList, setStoreList] = useState<IStoreData[]>([]);
    const [pageNo, setPageNo] = useState(1);
    const [key, setKey] = useState(28237);
    const [indsLclsCd, setIndsLclsCd] = useState('I2');

    async function handleGetStore(){
        // 여기서 fetch해서 받아오기
        // import.meta.env.VITE_GOV_API_KEY
        let res = await fetch(`https://apis.data.go.kr/B553077/api/open/sdsc2/storeListInDong?serviceKey=${import.meta.env.VITE_GOV_API_KEY}&pageNo=${pageNo}&numOfRows=10000&divId=signguCd&key=${key}&indsLclsCd=${indsLclsCd}&type=json`)
        let data = await res.json();

        console.log(data)

        // state에 저장
        if(data.body?.items && data.body?.items.length > 0){
            setStoreList(data.body?.items);
        }
    }

    return(
        <div className="flex flex-col justify-center items-center">
            <button className="bg-purple-500 hover:bg-purple-400 p-2 cursor-pointer"
            onClick={handleGetStore}>상가정보 받아오기</button>
            <p>{storeList.length}</p>
            <NaverMapStore stores={storeList} />



        </div>
    )
}
