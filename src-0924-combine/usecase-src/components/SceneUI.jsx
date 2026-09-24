import {createContext,useContext} from 'react';
export const SceneUIContext=createContext(null);
export const useSceneUI=()=>useContext(SceneUIContext);
