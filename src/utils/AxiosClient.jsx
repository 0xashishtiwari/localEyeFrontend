import axios from 'axios';
import { getitem, KEY_ACCESS_TOKEN, removeitem, setitem } from './LocalStorageManager';

export const AxiosClient = axios.create({
    baseURL:import.meta.env.VITE_BASE_URL_SERVER,
    withCredentials:true
})


AxiosClient.interceptors.request.use(
    (request)=>{
        const accesstoken=getitem(KEY_ACCESS_TOKEN);
        if(accesstoken){
        request.headers['Authorization']=`Bearer ${accesstoken}`;
        }
        return request;
    }
)

AxiosClient.interceptors.response.use(
    async (response)=>{
        const data=response.data;
        if(data.status==="ok") {
            return data;
        }
        const originalRequest=response.config;
        const statusCode=data.statusCode;
        const error=data.error;


        //refresh token expires
        if(statusCode==404){
            removeitem(KEY_ACCESS_TOKEN);
            //reload to login page
            window.location.replace('/login')
            return Promise.reject(error);
        }
        if(statusCode===401 && originalRequest.url===`${import.meta.env.VITE_BASE_URL_SERVER}/auth/refresh`){
            removeitem(KEY_ACCESS_TOKEN);
            //reload to login page
            window.location.replace('/login')
            return Promise.reject(error);
        }
        if(statusCode===401){
            const response= await AxiosClient.get('/auth/refresh');
            if(response.status==='ok'){
                setitem(KEY_ACCESS_TOKEN,response.result.accesstoken);
                originalRequest.headers['Authorization']=`Bearer ${response.result.accesstoken}`;
                return axios(originalRequest);
            }
        }
        return Promise.reject(error);
    }
);