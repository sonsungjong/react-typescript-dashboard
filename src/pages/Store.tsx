import { useState } from "react";
import NaverMap from "../components/NaverMap/NaverMap";

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

    async function handleGetStore(){
        // 여기서 fetch해서 받아오기
        let res = await fetch('https://apis.data.go.kr/B553077/api/open/sdsc2/storeListInDong?serviceKey=IutNHOj6m80UZSIGCtN0PqM1VAJ2fky%2BhPh6pSHWgy1dAqtZ6WhUQfh%2Bq38RPvlGxwmx1Jo%2FTsvKDBZ4FyxGfw%3D%3D&pageNo=1&numOfRows=10000&divId=signguCd&key=28237&indsLclsCd=I2&type=json')
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
            <NaverMap />
        </div>
    )
}
