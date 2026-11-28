"use client";

import { useMemo, useState } from "react";

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

function labelFor(key: string) {
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
  return labels[key] ?? key.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function ProfileValue({ value }: { value: unknown }) {
  if (value === null || value === undefined || value === "") return <>Not recorded</>;
  if (typeof value === "boolean") return <>{value ? "Yes" : "No"}</>;
  if (Array.isArray(value)) {
    return <ul className="profile-list">{value.map((item, index) => <li key={index}><ProfileValue value={item} /></li>)}</ul>;
  }
  if (typeof value === "object") {
    const entries = Object.entries(value as JsonObject).filter(([key]) => key !== "source_type");
    if ("value" in (value as JsonObject)) return <ProfileValue value={(value as JsonObject).value} />;
    return (
      <dl className="profile-nested">
        {entries.map(([key, nested]) => (
          <div key={key}>
            <dt>{labelFor(key)}</dt>
            <dd><ProfileValue value={nested} /></dd>
          </div>
        ))}
      </dl>
    );
  }
  return <>{String(value)}</>;
}

function ProfileSection({ title, value }: { title: string; value: JsonObject | null }) {
  if (!value || Object.keys(value).length === 0) return null;
  return (
    <section className="profile-section">
      <h3>{title}</h3>
      <ProfileValue value={value} />
    </section>
  );
}

export default function CatalogueBrowser({ bottles }: { bottles: Bottle[] }) {
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
          <span>Search bottles</span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Name, distillery, producer, vintage…" />
        </label>
        <label className="filter-field">
          <span>Origin</span>
          <select value={country} onChange={(e) => setCountry(e.target.value)}>
            {countries.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label className="filter-field">
          <span>Collection</span>
          <select value={collection} onChange={(e) => setCollection(e.target.value)}>
            {collections.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
      </section>
      <div className="catalogue-summary">
        <span>{filtered.length} {filtered.length === 1 ? "bottle" : "bottles"}</span>
        <span>International archive · Technical records</span>
      </div>
      {filtered.length === 0 ? (
        <div className="catalogue-empty"><h2>No bottles found</h2><p>Try another name, distillery, country or collection.</p></div>
      ) : (
        <section className="bottle-grid" aria-label="Bottle catalogue">
          {filtered.map((bottle) => (
            <button className="bottle-card" key={bottle.id} onClick={() => setSelected(bottle)}>
              <span className="bottle-card-mark" aria-hidden="true">RC</span>
              <span className="bottle-country">{bottle.country ?? "Origin not listed"}</span>
              <strong>{bottle.edition_name ?? bottle.official_name}</strong>
              <span className="bottle-distillery">{bottle.distillery ?? bottle.producer ?? "Producer not listed"}</span>
              <span className="bottle-facts">
                {bottle.vintage_year ?? "—"} <i>·</i> {bottle.age_statement ?? "Age not stated"} <i>·</i> {bottle.abv != null ? `${bottle.abv}% ABV` : "ABV n/a"}
              </span>
              <span className="bottle-open">View bottle profile ↗</span>
            </button>
          ))}
        </section>
      )}
      {selected && (
        <div className="detail-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setSelected(null); }}>
          <section className="detail-panel" role="dialog" aria-modal="true" aria-labelledby="detail-title">
            <button className="detail-close" onClick={() => setSelected(null)} aria-label="Close profile">×</button>
            <div className="kicker">Bottle profile · {selected.country ?? "Origin not listed"}</div>
            <h2 id="detail-title">{selected.edition_name ?? selected.official_name}</h2>
            <p className="detail-lead">{selected.distillery ?? "Distillery not listed"}{selected.producer ? ` · ${selected.producer}` : ""}</p>
            {selected.description && <p className="detail-lead">{selected.description}</p>}
            <dl className="detail-facts">
              <div><dt>Official release</dt><dd>{selected.official_name}</dd></div>
              <div><dt>Vintage</dt><dd>{selected.vintage_year ?? "Not recorded"}</dd></div>
              <div><dt>Age statement</dt><dd>{selected.age_statement ?? "Not recorded"}</dd></div>
              <div><dt>Alcohol</dt><dd>{selected.abv != null ? `${selected.abv}% ABV` : "Not recorded"}</dd></div>
              <div><dt>Bottle size</dt><dd>{selected.volume_ml ? `${selected.volume_ml} ml` : "Not recorded"}</dd></div>
              <div><dt>Bottler</dt><dd>{selected.bottler ?? "Not recorded"}</dd></div>
              <div><dt>Collection</dt><dd>{selected.series_name ?? "Not recorded"}</dd></div>
              <div><dt>Edition</dt><dd>{selected.edition_name ?? "Not recorded"}</dd></div>
            </dl>
            <ProfileSection title="Technical profile" value={selected.technical_profile} />
            <ProfileSection title="Tasting profile" value={selected.sensory_profile} />
            <ProfileSection title="Collector information" value={selected.collector_profile} />
            {selected.source_references && selected.source_references.length > 0 && (
              <section className="profile-section">
                <h3>Sources</h3>
                <ul className="profile-sources">
                  {selected.source_references.map((source, index) => (
                    <li key={`${source.url}-${index}`}>
                      <a href={source.url} target="_blank" rel="noreferrer">{source.title}</a>
                      {source.publisher && <span>{source.publisher}</span>}
                      {source.supports && <small>Supports: {source.supports.join(" · ")}</small>}
                    </li>
                  ))}
                </ul>
              </section>
            )}
            <div className="profile-note">
              <strong>Data quality: {labelFor(selected.data_confidence)}</strong>
              <p>Technical and tasting details are shown with their recorded source references. Any field not supported by the available sources remains unrecorded.</p>
              {selected.profile_version && <p>Profile version: {selected.profile_version}</p>}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
