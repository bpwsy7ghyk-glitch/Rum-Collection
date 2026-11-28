import { createClient } from "@/lib/supabase/server";
import CatalogueBrowser, { type Bottle } from "./catalogue-browser";
import SiteHeader from "../../components/site-header";
import SiteFooter from "../../components/site-footer";

export const metadata = {
  title: "Rum Catalogue | Rum Collection",
  description: "Explore an international archive of rum bottles, producers, distilleries and limited editions.",
};

export default async function CataloguePage() {
  let bottles: Bottle[] = [];
  let loadError = false;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("bottles")
      .select("id,slug,official_name,producer,distillery,bottler,country,vintage_year,age_statement,abv,volume_ml,series_name,edition_name,description,data_confidence,technical_profile,sensory_profile,collector_profile,source_references,profile_version")
      .eq("status", "published")
      .order("official_name", { ascending: true });
    if (error) throw error;
    bottles = (data ?? []) as Bottle[];
  } catch {
    loadError = true;
  }

  return (
    <main className="shell catalogue-shell">
      <SiteHeader active="catalogue"/>
      <section className="catalogue-intro">
        <div className="kicker">The international rum collector&apos;s archive</div>
        <h1>Explore the catalogue.</h1>
        <p className="lead">A structured archive of releases, distilleries, origins and bottlers. Search the records and open each bottle for its technical profile.</p>
      </section>
      {loadError ? (
        <div className="catalogue-empty" role="alert">
          <h2>Catalogue temporarily unavailable</h2>
          <p>We could not load the bottle records from the archive. Please try again in a moment.</p>
        </div>
      ) : (
        <CatalogueBrowser bottles={bottles} />
      )}
      <SiteFooter/>
    </main>
  );
}
