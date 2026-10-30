import React,{useEffect,useSyncExternalStore} from 'react';

const key='office-preview-role-v1';
const changed='office-preview-role-change';
export function getUserRole(){try{return localStorage.getItem(key)==='admin'?'admin':'normal'}catch{return 'normal'}}
export function setUserRole(role){if(role!=='normal'&&role!=='admin')return;try{localStorage.setItem(key,role)}catch{}window.dispatchEvent(new Event(changed))}
function subscribe(listener){window.addEventListener('storage',listener);window.addEventListener(changed,listener);return()=>{window.removeEventListener('storage',listener);window.removeEventListener(changed,listener)}}
export function useUserRole(){return useSyncExternalStore(subscribe,getUserRole,()=>'normal')}
export function AdminOnly({children}){const role=useUserRole();useEffect(()=>{if(role!=='admin')window.location.replace('./dashboard.html')},[role]);return role==='admin'?children:null}
