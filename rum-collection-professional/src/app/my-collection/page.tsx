import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CollectionManager, { type CollectionBottle } from "./collection-manager";

export const metadata = { title: "My Collection | Rum Collection" };

export default async function MyCollectionPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  let collection: { id: string; name: string } | null = null;
  const { data: existing } = await supabase.from("collections").select("id,name").eq("owner_id", user.id).order("created_at").limit(1).maybeSingle();
  if (existing) collection = existing;
  else {
    const { data: created } = await supabase.from("collections").insert({ owner_id: user.id, name: "My Rum Collection", visibility: "private" }).select("id,name").single();
    collection = created;
  }
  if (!collection) return <main className="shell"><p>Unable to create your private collection. Please refresh the page.</p></main>;
  const { data: bottleRows } = await supabase.from("bottles").select("id,official_name,country,vintage_year,abv").eq("status","published").order("official_name");
  const { data: ownedRows } = await supabase.from("collection_items").select("id,quantity,condition,bottle:bottles(id,official_name,country,vintage_year,abv)").eq("collection_id",collection.id).order("created_at",{ascending:false});
  return <main className="shell catalogue-shell"><header className="topbar"><a className="brand" href="/">RUM COLLECTION</a><nav className="nav"><a href="/catalogue">Catalogue</a><form action="/auth/signout" method="post"><button className="text-button">Sign out</button></form></nav></header><section className="catalogue-intro"><div className="kicker">Private collector space</div><h1>{collection.name}.</h1><p className="lead">Your ownership records are private by default and separate from the public bottle archive.</p></section><CollectionManager collectionId={collection.id} bottles={(bottleRows ?? []) as CollectionBottle[]} owned={(ownedRows ?? []) as never[]} /></main>;
}
