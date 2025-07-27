// 로그인 정보를 관리할 형태(자료형)
export interface IUser
{
    id : string;
    password : string;
    loading : boolean;
    message : string;
}