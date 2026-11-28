"use client";
import {useLocale} from "./language-provider";
import LanguageSwitch from "./language-switch";
export default function SiteFooter(){const {locale}=useLocale();return <footer className="footer"><span>{locale==="it"?"RUM COLLECTION · Piattaforma indipendente per collezionisti":"RUM COLLECTION · Independent collector platform"}</span><LanguageSwitch/></footer>}