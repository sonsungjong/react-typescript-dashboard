// AccountSlice.js

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { IUser } from "../../model/AccountModel";

// initialState는 하나의 변수만
let initialState : { user : IUser } = {
    user : JSON.parse(sessionStorage.getItem('user') 
            || '{"id":"", "password":"", "loading":false, "message":""}')
};

// *비동기*로 리덕스 동작 : async ==> 로그인 정보를 확인받는 동안 화면 멈춤을 방지하기 위해
// 첫번째 인자 : 곂치지않는 고유이름
// 두번째 인자 : 비동기로 실행할 함수
export const login = createAsyncThunk('auth/login', 
    async (data : IUser)=>{
       let email = data.id;
       let password = data.password;
       let id : string = '';

        try{
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/signin`, {
                method:'POST',          // 요청방식 POST
                headers: {'Content-Type': 'application/json'},      // JSON 형태로 전달
                body: JSON.stringify({'email':email, 'password':password}),                         // JSON 형태로 전달
            });  
        
            if(res.ok){
                const data = await res.json();
                console.log('서버응답: ',data);
                let email : string | null = data.email;
                id = data.token;
            }
            else{
                const data = await res.json();
                let err = data.error;
                alert(err)
            }
        }catch(error){
            alert('ERROR')
        }
        
        return id;
    }
);

// 비동기로 전송하는 함수 ==> 슬라이스에서 extraRedcuer

// 계정 정보를 처리할 리덕스 툴킷
// 슬라이스를 생성
const slice = createSlice({
    // name, initialState, reducers
    name: "auth",               // 슬라이스의 고유이름
    initialState: initialState,  // useSelector 로 사용될 변수들
    reducers:{
        loginTest(state, action){
            // 로그인정보 리덕스에 저장
            state.user = action.payload;
            // 새로고침하면 세션스토리지에서 가져오게
            sessionStorage.setItem('user', JSON.stringify(action.payload));
        },
        // useDispatch 로 사용될 함수들
        // 로그아웃 할때 사용할 함수
        logout(state){
            // state : 이전값(원래값)
            // action : 값을 변경하기 위한 부분
            console.log('로그아웃')
            state.user.id = '';
            state.user.password = '';
            state.user.loading = false;
            state.user.message = '';
            // 세션스토리지에 담긴 정보도 없앤다
            sessionStorage.removeItem('user');
        },
        // 세션스토리지에도 계정정보를 보관했다가 새로고침하면 다시 넣어줄
        restore(state, action){
            // state : 이전값(원래값)
            // action : 값을 변경하기 위한 부분
            console.log('새로고침')
            // 세션스토리지의 user에서 값을 받아와서 state를 업데이트
            state.user = action.payload;            // 값을 변경
            console.log()
        }
    },
    extraReducers:(builder)=>{
        // 비동기로 실행되는 함수
        // pending(대기), fulfilled(성공), reject(거절)
        builder.addCase(
            // login 대기일때 사용시킬 함수
            login.pending, (state, action)=>{
                state.user.loading = true;
            }
        )
        .addCase(
            // login 거절됬을때 사용시킬 함수
            login.rejected,(state, action)=>{
                console.log('FAILED');
                state.user.loading = false;
            }
        )
        .addCase(
            // login 성공했을때 사용시킬 함수
            login.fulfilled, (state, action)=>{
                console.log(action.payload);
                
                
                state.user.id = action.payload;
                state.user.loading = false;
                state.user.password = ''
                state.user.message = ''
                console.log(state.user.id);

                // 세션스토리지나 로컬스트로지는 보통 JSON형태로 저장을 한다
                // 로그인 정보는 웹창을 닫았을 때 제거가 되어야하기 때문에 로컬스토리지가 아닌 세션스토리지에 저장
                // 새로고침을 하면 정보가 날라가서 새로고침 완료되면 세션스토리지에서 다시 받아오기
                sessionStorage.setItem('user', JSON.stringify(state.user));
            }
        )
    }
});

export const {logout, restore, loginTest} = slice.actions;      // dispatch로 사용하기 위해 export
export default slice.reducer;                        // createSlice한 것의 reducer를 내보낸다