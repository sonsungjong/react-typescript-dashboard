import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, loginTest } from '../store/slices/AccountSlice';
import type { IUser } from '../model/AccountModel';
import type { AppDispatch, RootState } from '../store/store';
import { Star } from 'lucide-react';

// 로그인 및 회원가입 컴포넌트
export default function Login(){
  // 현재 폼 상태 (로그인 또는 회원가입)
  const [isLogin, setIsLogin] = useState<boolean>(true);
  // 이메일 또는 사용자 이름 상태
  const [email, setEmail] = useState<string>('');
  // 비밀번호 상태
  const [password, setPassword] = useState<string>('');
  // 비밀번호 확인 상태 (회원가입 시 사용)
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  // 비밀번호 표시/숨김 상태
  const [showPassword, setShowPassword] = useState<boolean>(false);
  // 비밀번호 확인 표시/숨김 상태 (회원가입 시 사용)
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  // 리덕스
  //let {user} = useSelector<RootState>((state) => state.auth);
  let dispatch = useDispatch<AppDispatch>();

  // 로그인 버튼 클릭 핸들러
  async function handleLogin(e: React.FormEvent){   
    e.preventDefault(); // 폼 제출 기본 동작 방지
    
    if(email === 'test@example.com' && password === "1234"){
        // 슈퍼유저 로그인
        dispatch(loginTest({id:email, password:password, loading:false, message:''}))
    }
    else{
        // 로그인 체크
        await dispatch(login({id:email, password:password, loading:false, message:''}))
    }
  };

  // 회원가입 버튼 클릭 핸들러
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); // 폼 제출 기본 동작 방지
    if (password !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.'); // 비밀번호 불일치 시 알림
      return;
    }
    console.log('회원가입 시도:', { email, password });
    
    // fetch를 사용할거니까 async function (await 사용을 위해서)
    try{
      let res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",  // JSON으로 보낼 것임을 명시
        },
        body: JSON.stringify({               // 실제로 전송할 payload
          email,
          password,
        }),
      });

      if(res.ok)
      {
        // 2xx
        let data = await res.json();
        console.log(data);

        setEmail('')
        setPassword('')
        setConfirmPassword('')

        alert("회원가입에 성공했습니다")
        setIsLogin(true);         // 로그인 화면
      }else{
        // 실패
        alert("회원가입에 실패했습니다")
      }
    }catch(error){
      alert("회원가입에 실패했습니다")
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 font-sans">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
        {/* 로고 섹션 */}
        <div className="flex flex-col items-center mb-8">
          <Star className='w-24 h-24 text-white' />
          <h1 className="text-white text-3xl font-bold">Project에 오신 것을 환영합니다</h1>
        </div>

        {/* 폼 토글 버튼 */}
        <div className="flex justify-center mb-6">
          <button
            className={`px-6 py-2 rounded-l-md font-semibold transition duration-300 ${
              isLogin ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            onClick={() => setIsLogin(true)}
          >
            로그인
          </button>
          <button
            className={`px-6 py-2 rounded-r-md font-semibold transition duration-300 ${
              !isLogin ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            onClick={() => setIsLogin(false)}
          >
            회원가입
          </button>
        </div>

        {/* 로그인 폼 */}
        {isLogin ? (
          <form onSubmit={handleLogin}>
            {/* 이메일 또는 사용자 이름 입력 필드 */}
            <div className="mb-6">
              <label htmlFor="email" className="block text-gray-300 text-sm font-semibold mb-2">
                이메일 또는 사용자 이름
              </label>
              <input
                type="text"
                id="email"
                className="w-full px-4 py-3 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600"
                placeholder="이메일 또는 사용자 이름"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* 비밀번호 입력 필드 */}
            <div className="mb-6">
              <label htmlFor="password" className="block text-gray-300 text-sm font-semibold mb-2">
                비밀번호
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="w-full px-4 py-3 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600 pr-10"
                  placeholder="비밀번호"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {/* 비밀번호 표시/숨김 토글 버튼 */}
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 표시'}
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5"
                    >
                      <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                      <path
                        fillRule="evenodd"
                        d="M1.323 11.447C2.811 6.976 7.027 3.75 12.001 3.75c4.974 0 9.19 3.226 10.678 7.697a11.992 11.992 0 01-1.322 3.438 8.136 8.136 0 01-1.329 1.329c-1.353 1.352-2.83 2.503-4.385 3.484-1.556.98-3.179 1.58-4.852 1.58-.918 0-1.807-.12-2.659-.357a11.992 11.992 0 01-3.438-1.322 8.136 8.136 0 01-1.329-1.329c-1.353-1.352-2.503-2.83-3.484-4.385-.98-1.556-1.58-3.179-1.58-4.852 0-.918.12-1.807.357-2.659zM12 18.75c-1.933 0-3.794-.784-5.127-2.117A7.5 7.5 0 014.5 12c0-1.933.784-3.794 2.117-5.127A7.5 7.5 0 0112 4.5c1.933 0 3.794.784 5.127 2.117A7.5 7.5 0 0119.5 12c0 1.933-.784 3.794-2.117 5.127A7.5 7.5 0 0112 18.75z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5"
                    >
                      <path d="M3.53 2.47a.75.75 0 00-1.06 1.06L18.94 22.53a.75.75 0 101.06-1.06L3.53 2.47zM12 15a3 3 0 100-6 3 3 0 000 6z" />
                      <path
                        fillRule="evenodd"
                        d="M1.323 11.447C2.811 6.976 7.027 3.75 12.001 3.75c4.974 0 9.19 3.226 10.678 7.697a11.992 11.992 0 01-1.322 3.438 8.136 8.136 0 01-1.329 1.329c-1.353 1.352-2.83 2.503-4.385 3.484-1.556.98-3.179 1.58-4.852 1.58-.918 0-1.807-.12-2.659-.357a11.992 11.992 0 01-3.438-1.322 8.136 8.136 0 01-1.329-1.329c-1.353-1.352-2.503-2.83-3.484-4.385-.98-1.556-1.58-3.179-1.58-4.852 0-.918.12-1.807.357-2.659zm1.833-.092A9.75 9.75 0 0112 5.25c1.994 0 3.89 1.027 4.932 2.72.365.59.662 1.23.882 1.898l1.76-1.76a.75.75 0 011.06 1.06l-2.094 2.093a11.992 11.992 0 00.31 1.252c.214.63.367 1.29.458 1.968.36.276.677.587.954.915.283.33.535.68.747 1.048a11.992 11.992 0 01-1.322 3.438 8.136 8.136 0 01-1.329-1.329c-1.353-1.352-2.83-2.503-4.385-3.484-1.556-.98-3.179-1.58-4.852-1.58-.918 0-1.807-.12-2.659-.357a11.992 11.992 0 01-3.438-1.322 8.136 8.136 0 01-1.329-1.329c-1.353-1.352-2.503-2.83-3.484-4.385-.98-1.556-1.58-3.179-1.58-4.852 0-.918.12-1.807.357-2.659z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* 로그인 버튼 */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
            >
              로그인
            </button>
          </form>
        ) : (
          /* 회원가입 폼 */
          <form onSubmit={handleRegister}>
            {/* 이메일 입력 필드 */}
            <div className="mb-6">
              <label htmlFor="regEmail" className="block text-gray-300 text-sm font-semibold mb-2">
                이메일
              </label>
              <input
                type="email"
                id="regEmail"
                className="w-full px-4 py-3 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600"
                placeholder="이메일 주소"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* 비밀번호 입력 필드 */}
            <div className="mb-6">
              <label htmlFor="regPassword" className="block text-gray-300 text-sm font-semibold mb-2">
                비밀번호
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="regPassword"
                  className="w-full px-4 py-3 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600 pr-10"
                  placeholder="비밀번호"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {/* 비밀번호 표시/숨김 토글 버튼 */}
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 표시'}
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5"
                    >
                      <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                      <path
                        fillRule="evenodd"
                        d="M1.323 11.447C2.811 6.976 7.027 3.75 12.001 3.75c4.974 0 9.19 3.226 10.678 7.697a11.992 11.992 0 01-1.322 3.438 8.136 8.136 0 01-1.329 1.329c-1.353 1.352-2.83 2.503-4.385 3.484-1.556.98-3.179 1.58-4.852 1.58-.918 0-1.807-.12-2.659-.357a11.992 11.992 0 01-3.438-1.322 8.136 8.136 0 01-1.329-1.329c-1.353-1.352-2.503-2.83-3.484-4.385-.98-1.556-1.58-3.179-1.58-4.852 0-.918.12-1.807.357-2.659zM12 18.75c-1.933 0-3.794-.784-5.127-2.117A7.5 7.5 0 014.5 12c0-1.933.784-3.794 2.117-5.127A7.5 7.5 0 0112 4.5c1.933 0 3.794.784 5.127 2.117A7.5 7.5 0 0119.5 12c0 1.933-.784 3.794-2.117 5.127A7.5 7.5 0 0112 18.75z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5"
                    >
                      <path d="M3.53 2.47a.75.75 0 00-1.06 1.06L18.94 22.53a.75.75 0 101.06-1.06L3.53 2.47zM12 15a3 3 0 100-6 3 3 0 000 6z" />
                      <path
                        fillRule="evenodd"
                        d="M1.323 11.447C2.811 6.976 7.027 3.75 12.001 3.75c4.974 0 9.19 3.226 10.678 7.697a11.992 11.992 0 01-1.322 3.438 8.136 8.136 0 01-1.329 1.329c-1.353 1.352-2.83 2.503-4.385 3.484-1.556.98-3.179 1.58-4.852 1.58-.918 0-1.807-.12-2.659-.357a11.992 11.992 0 01-3.438-1.322 8.136 8.136 0 01-1.329-1.329c-1.353-1.352-2.503-2.83-3.484-4.385-.98-1.556-1.58-3.179-1.58-4.852 0-.918.12-1.807.357-2.659z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* 비밀번호 확인 입력 필드 */}
            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block text-gray-300 text-sm font-semibold mb-2">
                비밀번호 확인
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  className="w-full px-4 py-3 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600 pr-10"
                  placeholder="비밀번호 확인"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                {/* 비밀번호 확인 표시/숨김 토글 버튼 */}
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? '비밀번호 확인 숨기기' : '비밀번호 확인 표시'}
                >
                  {showConfirmPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5"
                    >
                      <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                      <path
                        fillRule="evenodd"
                        d="M1.323 11.447C2.811 6.976 7.027 3.75 12.001 3.75c4.974 0 9.19 3.226 10.678 7.697a11.992 11.992 0 01-1.322 3.438 8.136 8.136 0 01-1.329 1.329c-1.353 1.352-2.83 2.503-4.385 3.484-1.556.98-3.179 1.58-4.852 1.58-.918 0-1.807-.12-2.659-.357a11.992 11.992 0 01-3.438-1.322 8.136 8.136 0 01-1.329-1.329c-1.353-1.352-2.503-2.83-3.484-4.385-.98-1.556-1.58-3.179-1.58-4.852 0-.918.12-1.807.357-2.659zM12 18.75c-1.933 0-3.794-.784-5.127-2.117A7.5 7.5 0 014.5 12c0-1.933.784-3.794 2.117-5.127A7.5 7.5 0 0112 4.5c1.933 0 3.794.784 5.127 2.117A7.5 7.5 0 0119.5 12c0 1.933-.784 3.794-2.117 5.127A7.5 7.5 0 0112 18.75z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5"
                    >
                      <path d="M3.53 2.47a.75.75 0 00-1.06 1.06L18.94 22.53a.75.75 0 101.06-1.06L3.53 2.47zM12 15a3 3 0 100-6 3 3 0 000 6z" />
                      <path
                        fillRule="evenodd"
                        d="M1.323 11.447C2.811 6.976 7.027 3.75 12.001 3.75c4.974 0 9.19 3.226 10.678 7.697a11.992 11.992 0 01-1.322 3.438 8.136 8.136 0 01-1.329 1.329c-1.353 1.352-2.83 2.503-4.385 3.484-1.556.98-3.179 1.58-4.852 1.58-.918 0-1.807-.12-2.659-.357a11.992 11.992 0 01-3.438-1.322 8.136 8.136 0 01-1.329-1.329c-1.353-1.352-2.503-2.83-3.484-4.385-.98-1.556-1.58-3.179-1.58-4.852 0-.918.12-1.807.357-2.659z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* 회원가입 버튼 */}
            <button
              type="submit"
              className="cursor-pointer w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
            >
              회원가입
            </button>
          </form>
        )}

        {/* 비밀번호 찾기 링크 (로그인 폼일 때만 표시) */}
        {isLogin && (
          <div className="text-center mt-6">
            <a href="#" className="text-blue-400 hover:underline text-sm">
              비밀번호를 잊으셨나요?
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

