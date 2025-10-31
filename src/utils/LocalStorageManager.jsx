export const KEY_ACCESS_TOKEN ="access_token";

export function getitem(key){
    return localStorage.getItem(key);
}
export function setitem(key,value){
    localStorage.setItem(key,value);
}

export function removeitem(key){
    localStorage.removeItem(key);
}