"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type CollectionBottle = { id: string; official_name: string; country: string | null; vintage_year: number | null; abv: number | null };
type Owned = { id: string; quantity: number; condition: "sealed" | "opened" | "empty" | "unknown"; bottle: CollectionBottle | null };

export default function CollectionManager({ collectionId, bottles, owned }: { collectionId: string; bottles: CollectionBottle[]; owned: Owned[] }) {
  const [bottleId,setBottleId] = useState(bottles[0]?.id ?? ""); const [quantity,setQuantity] = useState(1); const [condition,setCondition] = useState<Owned["condition"]>("sealed");
  const [error,setError] = useState(""); const [busy,setBusy] = useState(false);
  async function add(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const supabase = createClient();
      const { error } = await supabase.from("collection_items").insert({ collection_id: collectionId, bottle_id: bottleId, quantity, condition });
      if (error) throw error;
      window.location.reload();
    } catch(e) { setError(e instanceof Error ? e.message : "Unable to add bottle."); }
    finally { setBusy(false); }
  }
  return <section className="collection-manager"><div className="collection-add"><h2>Add a bottle</h2>{bottles.length ? <form onSubmit={add} className="collection-add-form"><label>Bottle<select value={bottleId} onChange={e=>setBottleId(e.target.value)}>{bottles.map(b=><option key={b.id} value={b.id}>{b.official_name}</option>)}</select></label><label>Quantity<input type="number" min={1} max={100} value={quantity} onChange={e=>setQuantity(Math.max(1,Number(e.target.value)))} /></label><label>Condition<select value={condition} onChange={e=>setCondition(e.target.value as Owned["condition"])}><option value="sealed">Sealed</option><option value="opened">Opened</option><option value="empty">Empty</option><option value="unknown">Unknown</option></select></label><button className="button primary" disabled={busy || !bottleId}>{busy ? "Adding…" : "Add to collection"}</button></form> : <p>No published bottles are available yet. Visit the catalogue soon.</p>}{error && <p className="form-error" role="alert">{error}</p>}</div><div className="collection-list-heading"><h2>Your bottles</h2><span>{owned.length} records</span></div>{owned.length ? <div className="bottle-grid">{owned.map(item=><article className="bottle-card owned-card" key={item.id}><span className="bottle-country">{item.bottle?.country ?? "Origin not listed"}</span><strong>{item.bottle?.official_name ?? "Bottle record"}</strong><span className="bottle-distillery">{item.bottle?.vintage_year ?? "Vintage n/a"} · {item.bottle?.abv != null ? item.bottle.abv+"% ABV" : "ABV n/a"}</span><span className="bottle-facts">Quantity: {item.quantity} · {item.condition}</span></article>)}</div> : <div className="catalogue-empty"><h2>Your collection starts here.</h2><p>Add your first bottle using the form above. Purchase price, bottle number, photographs and valuation history will be added in a later step.</p></div>}</section>;
}
