"use client";
import {createContext,useContext,useEffect,useState} from "react";
type Locale="en"|"it";
const C=createContext<{locale:Locale;setLocale:(v:Locale)=>void}>({locale:"en",setLocale:()=>{}});
export function LanguageProvider({children}:{children:React.ReactNode}){const [locale,setState]=useState<Locale>("en");useEffect(()=>{const v=localStorage.getItem("rum-locale");if(v==="it"||v==="en")setState(v)},[]);const setLocale=(v:Locale)=>{setState(v);localStorage.setItem("rum-locale",v)};useEffect(()=>{document.documentElement.lang=locale},[locale]);return <C.Provider value={{locale,setLocale}}>{children}</C.Provider>}
export function useLocale(){return useContext(C)}