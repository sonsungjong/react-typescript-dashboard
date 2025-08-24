// 리액트 관련 함수를 사용하기 위해서는 'use client' 를 파일 상단에 기록

// 네이버 지도 API
// https://www.ncloud.com/
// 로그인 -> 콘솔 -> Services -> Maps 검색
// Maps -> Application -> Application 등록 버튼
// 애플리케이션 이름 적기, Dynamic Map 선택
// Web서비스 URL에 웹주소 입력 후 추가 (http://localhost:3000)
// 등록 버튼 클릭
// 인증 정보 클릭 (Client ID 기록)

import { useEffect, useRef } from "react";

// 일반 JS는 global로 위치 (npm install 설치 X)
declare global
{
    interface Window{
        // naver는 어떤 자료형이든 가능하게
        naver:any;
    }
}

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

export default function NaverMapStore({ stores }: { stores: IStoreData[] }) {
  const naver_api_key = import.meta.env.VITE_NAVER_MAP;
  const mapRef = useRef<HTMLDivElement>(null);
  const mapObjRef = useRef<any>(null);          // map 인스턴스
  const markersRef = useRef<any[]>([]);         // 생성된 마커 보관

  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current || !window.naver?.maps) return;

      // 지도 1회 생성 + 재사용
      if (!mapObjRef.current) {
        mapObjRef.current = new window.naver.maps.Map(mapRef.current, {
          center: new window.naver.maps.LatLng(37.4563, 126.7052),
          zoom: 13,
        });
      }

      const map = mapObjRef.current;

      // 기존 마커 제거
      markersRef.current.forEach(m => m.setMap(null));
      markersRef.current = [];

      // bounds 계산용
      const bounds = new window.naver.maps.LatLngBounds();

      stores.forEach(store => {
        if (!store.lat || !store.lon) return;
        const position = new window.naver.maps.LatLng(store.lat, store.lon);

        const marker = new window.naver.maps.Marker({ map, position });
        markersRef.current.push(marker);
        bounds.extend(position);

        const infoWindow = new window.naver.maps.InfoWindow({
          content: `
            <div style="color:#111;padding:6px 8px;line-height:1.4">
              <div style="font-weight:700">${store.bizesNm || "-"}</div>
              <div>${store.indsLclsNm || "-"} ${store.indsMclsNm || ""}</div>
              <div style="font-size:12px;color:#555">${store.rdnmAdr || store.lnoAdr || "-"}</div>
            </div>
          `,
        });

        window.naver.maps.Event.addListener(marker, "click", () => {
          if (infoWindow.getMap()) infoWindow.close();
          else infoWindow.open(map, marker);
        });
      });

      // 마커가 1개 이상이면 화면을 자동으로 맞춤
      if (stores.length > 0 && !bounds.isEmpty?.()) {
        map.fitBounds(bounds);
      }
    };

    const scriptID = "naver-sdk-map";
    if (!document.getElementById(scriptID)) {
      const script = document.createElement("script");
      script.id = scriptID;
      // ✅ 최신 파라미터: ncpKeyId
      script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${naver_api_key}`;
      script.async = true;
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      initMap();
    }
  }, [stores]);

  return <div ref={mapRef} style={{ width: "500px", height: "500px" }} />;
}