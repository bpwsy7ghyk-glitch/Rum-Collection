"use client";

import { useMemo, useState } from "react";

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
};

export default function CatalogueBrowser({ bottles }: { bottles: Bottle[] }) {
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("All origins");
  const [selected, setSelected] = useState<Bottle | null>(null);
  const countries = useMemo(
    () => ["All origins", ...Array.from(new Set(bottles.map((b) => b.country).filter(Boolean) as string[])).sort()],
    [bottles]
  );
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bottles.filter((b) => {
      const matchesCountry = country === "All origins" || b.country === country;
      const haystack = [b.official_name, b.producer, b.distillery, b.bottler, b.country, b.vintage_year, b.series_name, b.edition_name].join(" ").toLowerCase();
      return matchesCountry && (!q || haystack.includes(q));
    });
  }, [bottles, country, query]);

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
      </section>
      <div className="catalogue-summary">
        <span>{filtered.length} {filtered.length === 1 ? "bottle" : "bottles"}</span>
        <span>International archive · Technical records</span>
      </div>
      {filtered.length === 0 ? (
        <div className="catalogue-empty"><h2>No bottles found</h2><p>Try another name, distillery or country.</p></div>
      ) : (
        <section className="bottle-grid" aria-label="Bottle catalogue">
          {filtered.map((bottle) => (
            <button className="bottle-card" key={bottle.id} onClick={() => setSelected(bottle)}>
              <span className="bottle-card-mark" aria-hidden="true">RC</span>
              <span className="bottle-country">{bottle.country ?? "Origin not listed"}</span>
              <strong>{bottle.official_name}</strong>
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
            <h2 id="detail-title">{selected.official_name}</h2>
            <p className="detail-lead">{selected.distillery ?? "Distillery not listed"}{selected.producer ? ` · ${selected.producer}` : ""}</p>
            <dl className="detail-facts">
              <div><dt>Vintage</dt><dd>{selected.vintage_year ?? "Not recorded"}</dd></div>
              <div><dt>Age statement</dt><dd>{selected.age_statement ?? "Not recorded"}</dd></div>
              <div><dt>Alcohol</dt><dd>{selected.abv != null ? `${selected.abv}% ABV` : "Not recorded"}</dd></div>
              <div><dt>Bottle size</dt><dd>{selected.volume_ml ? `${selected.volume_ml} ml` : "Not recorded"}</dd></div>
              <div><dt>Bottler</dt><dd>{selected.bottler ?? "Not recorded"}</dd></div>
              <div><dt>Series</dt><dd>{selected.series_name ?? selected.edition_name ?? "Not recorded"}</dd></div>
            </dl>
            <div className="profile-note">
              <strong>Data quality: partially verified</strong>
              <p>This initial record is based on the collector catalogue export. Missing production, maturation, cask and tasting details are deliberately left blank until supported by reliable sources.</p>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
