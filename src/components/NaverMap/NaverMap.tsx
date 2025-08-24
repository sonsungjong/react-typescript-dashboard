// components/NaverMap/NaverMap.tsx
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    naver: any;
  }
}

interface NaverMapProps {
  stores?: { lat: number; lon: number; bizesNm: string }[];
}

export default function NaverMap({ stores = [] }: NaverMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const naver_api_key = import.meta.env.VITE_NAVER_MAP;

  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current || !window.naver?.maps) return;

      // 지도 초기화
      const map = new window.naver.maps.Map(mapRef.current, {
        center: new window.naver.maps.LatLng(37.5, 127.0),
        zoom: 13,
      });

      // 마커 표시
      stores.forEach((store) => {
        const marker = new window.naver.maps.Marker({
          position: new window.naver.maps.LatLng(store.lat, store.lon),
          map,
          title: store.bizesNm,
        });

        // 간단한 InfoWindow
        const info = new window.naver.maps.InfoWindow({
          content: `<div style="padding:5px;font-size:12px;">${store.bizesNm}</div>`,
        });

        window.naver.maps.Event.addListener(marker, "click", () => {
          info.open(map, marker);
        });
      });
    };

    const scriptID = "naver-sdk-map";
    if (!document.getElementById(scriptID)) {
      const script = document.createElement("script");
      script.id = scriptID;
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
