"use client";
import SiteHeader from "../components/site-header";
import SiteFooter from "../components/site-footer";
import {useLocale} from "../components/language-provider";
const pillars = [
 {title:"Discover",it:"Scopri",text:"Explore a structured catalogue of rum bottles, distilleries, origins, vintages and independent bottlers.",itText:"Esplora un catalogo organizzato di bottiglie di rum, distillerie, provenienze, annate e imbottigliatori indipendenti."},
 {title:"Collect",it:"Colleziona",text:"Build a private collection, record bottle details, purchase history, condition and personal photographs.",itText:"Crea una collezione privata e registra dettagli delle bottiglie, acquisti, condizioni e fotografie personali."},
 {title:"Connect",it:"Connettiti",text:"Share selected parts of your collection and discover collectors and specialist releases around the world.",itText:"Condividi parti della tua collezione e scopri collezionisti ed edizioni speciali in tutto il mondo."}
];
export default function HomePage(){
 const {locale}=useLocale(); const it=locale==="it";
 return <main className="shell">
  <SiteHeader/>
  <section className="hero">
   <div className="kicker">{it?"L'archivio internazionale dei collezionisti di rum":"The international rum collector's archive"}</div>
   <h1>{it?<>Ogni bottiglia<br/>ha una storia.</>:<>Every bottle has<br/>a story.</>}</h1>
   <p className="lead">{it?"Scopri edizioni rare, documenta la tua collezione e conserva le storie dei rum più straordinari del mondo.":"Discover rare releases, document your collection and preserve the stories behind the world's most remarkable rums."}</p>
   <div className="actions"><a className="button primary" href="/catalogue">{it?"Esplora il catalogo":"Explore the catalogue"}</a><a className="button" href="/signup">{it?"Crea la tua collezione":"Create your collection"}</a></div>
  </section>
  <section className="section" id="catalogue"><div className="kicker">{it?"Una piattaforma pensata per i collezionisti":"A collector-first platform"}</div><h2>{it?"Un archivio. La tua collezione.":"One archive. Your collection."}</h2>
   <div className="cards">{pillars.map(item=><article className="card" key={item.title}><strong>{it?item.it:item.title}</strong><p>{it?item.itText:item.text}</p></article>)}</div>
  </section>
  <section className="section" id="community"><div className="kicker">{it?"Pensato per durare nel tempo":"Built for the long term"}</div><h2>{it?"Un registro affidabile per ogni collezionista.":"A reliable record for every collector."}</h2><p className="lead">{it?"Le informazioni pubbliche del catalogo sono separate dai dati privati di proprietà, acquisto e valutazione di ogni membro.":"Public catalogue information is kept separate from each member's private ownership, purchase and valuation records."}</p></section>
  <SiteFooter/>
 </main>;
}