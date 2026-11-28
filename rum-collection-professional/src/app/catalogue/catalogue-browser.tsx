"use client";

import { useMemo, useState } from "react";
import {useLocale} from "../../components/language-provider";

type JsonObject = Record<string, unknown>;
type SourceReference = {
  url: string;
  title: string;
  publisher?: string;
  source_type?: string;
  supports?: string[];
};

export type Bottle = {
  id: string;
  slug: string;
  official_name: string;
  producer: string | null;
  distillery: string | null;
  bottler: string | null;
  country: string | null;
  vintage_year: number | null;
  age_statement: string | null;
  abv: number | null;
  volume_ml: number | null;
  series_name: string | null;
  edition_name: string | null;
  description: string | null;
  data_confidence: string;
  technical_profile: JsonObject | null;
  sensory_profile: JsonObject | null;
  collector_profile: JsonObject | null;
  source_references: SourceReference[] | null;
  profile_version: string | null;
};

function labelFor(key: string, it=false) {
  const labels: Record<string, string> = {
    abv_percent: "Alcohol by volume",
    bottle_size_ml: "Bottle size (ml)",
    total_age_statement_years: "Total age (years)",
    duration_years: "Duration (years)",
    cask_capacity_l: "Cask capacity (L)",
    esters_g_hl_aa: "Esters (g/hl AA)",
    volatile_substances_g_hl_aa: "Volatile substances (g/hl AA)",
    dosage_g_l: "Dosage (g/L)",
    cane_sugar_caramel_e150a: "E150a caramel colouring",
    cane_sugar_caramel_e150a_reported: "E150a specification",
    selected_casks: "Selected casks",
    selected_casks_unit: "Selected cask unit",
  };
  const italian: Record<string,string> = {abv_percent:"Gradazione alcolica",bottle_size_ml:"Formato bottiglia (ml)",total_age_statement_years:"Età totale (anni)",duration_years:"Durata (anni)",cask_capacity_l:"Capacità della botte (L)",esters_g_hl_aa:"Esteri (g/hl AA)",volatile_substances_g_hl_aa:"Sostanze volatili (g/hl AA)",dosage_g_l:"Dosaggio (g/L)",selected_casks:"Botti selezionate"};
  return it ? (italian[key] ?? key.replaceAll("_"," ")) : (labels[key] ?? key.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()));
}

function ProfileValue({ value, it=false }: { value: unknown; it?:boolean }) {
  if (value === null || value === undefined || value === "") return <>{it?"Non registrato":"Not recorded"}</>;
  if (typeof value === "boolean") return <>{value ? (it?"Sì":"Yes") : "No"}</>;
  if (Array.isArray(value)) {
    return <ul className="profile-list">{value.map((item, index) => <li key={index}><ProfileValue value={item} it={it} /></li>)}</ul>;
  }
  if (typeof value === "object") {
    const entries = Object.entries(value as JsonObject).filter(([key]) => key !== "source_type");
    if ("value" in (value as JsonObject)) return <ProfileValue value={(value as JsonObject).value} it={it} />;
    return (
      <dl className="profile-nested">
        {entries.map(([key, nested]) => (
          <div key={key}>
            <dt>{labelFor(key,it)}</dt>
            <dd><ProfileValue value={nested} it={it} /></dd>
          </div>
        ))}
      </dl>
    );
  }
  return <>{String(value)}</>;
}

function ProfileSection({ title, value, it }: { title: string; value: JsonObject | null; it:boolean }) {
  if (!value || Object.keys(value).length === 0) return null;
  return (
    <section className="profile-section">
      <h3>{title}</h3>
      <ProfileValue value={value} it={it} />
    </section>
  );
}

export default function CatalogueBrowser({ bottles }: { bottles: Bottle[] }) {
  const {locale}=useLocale(); const it=locale==="it";
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("All origins");
  const [collection, setCollection] = useState("All collections");
  const [selected, setSelected] = useState<Bottle | null>(null);
  const countries = useMemo(
    () => ["All origins", ...Array.from(new Set(bottles.map((b) => b.country).filter(Boolean) as string[])).sort()],
    [bottles]
  );
  const collections = useMemo(
    () => ["All collections", ...Array.from(new Set(bottles.map((b) => b.series_name).filter(Boolean) as string[])).sort()],
    [bottles]
  );
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bottles.filter((b) => {
      const matchesCountry = country === "All origins" || b.country === country;
      const matchesCollection = collection === "All collections" || b.series_name === collection;
      const haystack = [b.official_name, b.producer, b.distillery, b.bottler, b.country, b.vintage_year, b.series_name, b.edition_name].join(" ").toLowerCase();
      return matchesCountry && matchesCollection && (!q || haystack.includes(q));
    });
  }, [bottles, country, collection, query]);

  return (
    <>
      <section className="catalogue-tools" aria-label="Catalogue filters">
        <label className="search-field">
          <span>{it?"Cerca bottiglie":"Search bottles"}</span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={it?"Nome, distilleria, produttore, annata…":"Name, distillery, producer, vintage…"} />
        </label>
        <label className="filter-field">
          <span>{it?"Provenienza":"Origin"}</span>
          <select value={country} onChange={(e) => setCountry(e.target.value)}>
            {countries.map((item) => <option key={item} value={item}>{item==="All origins"?(it?"Tutte le provenienze":item):item}</option>)}
          </select>
        </label>
        <label className="filter-field">
          <span>{it?"Collezione":"Collection"}</span>
          <select value={collection} onChange={(e) => setCollection(e.target.value)}>
            {collections.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
      </section>
      <div className="catalogue-summary">
        <span>{filtered.length} {filtered.length === 1 ? (it?"bottiglia":"bottle") : (it?"bottiglie":"bottles")}</span>
        <span>{it?"Archivio internazionale · Schede tecniche":"International archive · Technical records"}</span>
      </div>
      {filtered.length === 0 ? (
        <div className="catalogue-empty"><h2>{it?"Nessuna bottiglia trovata":"No bottles found"}</h2><p>{it?"Prova un altro nome, una distilleria, un paese o una collezione.":"Try another name, distillery, country or collection."}</p></div>
      ) : (
        <section className="bottle-grid" aria-label="Bottle catalogue">
          {filtered.map((bottle) => (
            <button className="bottle-card" key={bottle.id} onClick={() => setSelected(bottle)}>
              <span className="bottle-card-mark" aria-hidden="true">RC</span>
              <span className="bottle-country">{bottle.country ?? (it?"Provenienza non indicata":"Origin not listed")}</span>
              <strong>{bottle.edition_name ?? bottle.official_name}</strong>
              <span className="bottle-distillery">{bottle.distillery ?? bottle.producer ?? (it?"Produttore non indicato":"Producer not listed")}</span>
              <span className="bottle-facts">
                {bottle.vintage_year ?? "—"} <i>·</i> {bottle.age_statement ?? (it?"Età non indicata":"Age not stated")} <i>·</i> {bottle.abv != null ? `${bottle.abv}% ABV` : (it?"Gradazione n/d":"ABV n/a")}
              </span>
              <span className="bottle-open">{it?"Apri scheda bottiglia ↗":"View bottle profile ↗"}</span>
            </button>
          ))}
        </section>
      )}
      {selected && (
        <div className="detail-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setSelected(null); }}>
          <section className="detail-panel" role="dialog" aria-modal="true" aria-labelledby="detail-title">
            <button className="detail-close" onClick={() => setSelected(null)} aria-label={it?"Chiudi scheda":"Close profile"}>×</button>
            <div className="kicker">{it?"Scheda bottiglia":"Bottle profile"} · {selected.country ?? (it?"Provenienza non indicata":"Origin not listed")}</div>
            <h2 id="detail-title">{selected.edition_name ?? selected.official_name}</h2>
            <p className="detail-lead">{selected.distillery ?? "Distillery not listed"}{selected.producer ? ` · ${selected.producer}` : ""}</p>
            {selected.description && <p className="detail-lead">{selected.description}</p>}
            <dl className="detail-facts">
              <div><dt>{it?"Edizione ufficiale":"Official release"}</dt><dd>{selected.official_name}</dd></div>
              <div><dt>{it?"Annata":"Vintage"}</dt><dd>{selected.vintage_year ?? "Not recorded"}</dd></div>
              <div><dt>{it?"Invecchiamento dichiarato":"Age statement"}</dt><dd>{selected.age_statement ?? "Not recorded"}</dd></div>
              <div><dt>{it?"Gradazione alcolica":"Alcohol"}</dt><dd>{selected.abv != null ? `${selected.abv}% ABV` : "Not recorded"}</dd></div>
              <div><dt>{it?"Formato bottiglia":"Bottle size"}</dt><dd>{selected.volume_ml ? `${selected.volume_ml} ml` : "Not recorded"}</dd></div>
              <div><dt>{it?"Imbottigliatore":"Bottler"}</dt><dd>{selected.bottler ?? "Not recorded"}</dd></div>
              <div><dt>{it?"Collezione":"Collection"}</dt><dd>{selected.series_name ?? "Not recorded"}</dd></div>
              <div><dt>{it?"Edizione":"Edition"}</dt><dd>{selected.edition_name ?? "Not recorded"}</dd></div>
            </dl>
            <ProfileSection title={it?"Profilo tecnico":"Technical profile"} value={selected.technical_profile} it={it} />
            <ProfileSection title={it?"Profilo degustativo":"Tasting profile"} value={selected.sensory_profile} it={it} />
            <ProfileSection title={it?"Informazioni per collezionisti":"Collector information"} value={selected.collector_profile} it={it} />
            {selected.source_references && selected.source_references.length > 0 && (
              <section className="profile-section">
                <h3>{it?"Fonti":"Sources"}</h3>
                <ul className="profile-sources">
                  {selected.source_references.map((source, index) => (
                    <li key={`${source.url}-${index}`}>
                      <a href={source.url} target="_blank" rel="noreferrer">{source.title}</a>
                      {source.publisher && <span>{source.publisher}</span>}
                      {source.supports && <small>{it?"Supporta:":"Supports:"} {source.supports.join(" · ")}</small>}
                    </li>
                  ))}
                </ul>
              </section>
            )}
            <div className="profile-note">
              <strong>Data quality: {labelFor(selected.data_confidence,it)}</strong>
              <p>{it?"I dettagli tecnici e degustativi sono mostrati con le relative fonti. I campi non supportati dalle fonti disponibili restano non registrati.":"Technical and tasting details are shown with their recorded source references. Any field not supported by the available sources remains unrecorded."}</p>
              {selected.profile_version && <p>{it?"Versione scheda:":"Profile version:"} {selected.profile_version}</p>}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
