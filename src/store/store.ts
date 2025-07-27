// 각 리덕스의 정보를 보내줄 파일
// 로그인, 장바구니, 다크모드, ... : 항상 기억하고 있어야할 정보들
// 주제에 맞게끔 슬라이스를 생성해서 분리
// slices 폴더

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/AccountSlice";         // export default 로 내보낸건 {} 없이


// 슬라이스의 내용들을 store에 담는다
// App 컴포넌트를 Provider로 감싸서 범위를 설정
// <Provider store={store}><App /></Provider>
export const store = configureStore({
    // reducer : {}
    reducer:{
        auth: authReducer,          // 슬라이스에서 authReducer를 export
        //cart: cartReducer,
        //darkmode: darkmodeReducer,
    }
});

// redux 타입스크립트용 자료형
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;