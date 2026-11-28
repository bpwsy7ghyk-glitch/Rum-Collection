const pillars = [
  { title: "Discover", text: "Explore a structured catalogue of rum bottles, distilleries, origins, vintages and independent bottlers." },
  { title: "Collect", text: "Build a private collection, record bottle details, purchase history, condition and personal photographs." },
  { title: "Connect", text: "Share selected parts of your collection and discover collectors and specialist releases around the world." },
];

export default function HomePage() {
  return (
    <main className="shell">
      <header className="topbar">
        <a className="brand" href="/">RUM COLLECTION</a>
        <nav className="nav" aria-label="Main navigation">
          <a href="#catalogue">Catalogue</a>
          <a href="#community">Community</a>
          <a href="#about">About</a>
          <a href="/login">Sign in</a>
        </nav>
      </header>

      <section className="hero">
        <div className="kicker">The international rum collector's archive</div>
        <h1>Every bottle has<br />a story.</h1>
        <p className="lead">
          Discover rare releases, document your collection and preserve the stories
          behind the world's most remarkable rums.
        </p>
        <div className="actions">
          <a className="button primary" href="/catalogue">Explore the catalogue</a>
          <a className="button" href="/signup">Create your collection</a>
        </div>
      </section>

      <section className="section" id="catalogue">
        <div className="kicker">A collector-first platform</div>
        <h2>One archive. Your collection.</h2>
        <div className="cards">
          {pillars.map((item) => (
            <article className="card" key={item.title}>
              <strong>{item.title}</strong>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section" id="community">
        <div className="kicker">Built for the long term</div>
        <h2>A reliable record for every collector.</h2>
        <p className="lead">
          Public catalogue information is kept separate from each member's private
          ownership, purchase and valuation records.
        </p>
      </section>

      <footer className="footer" id="about">
        RUM COLLECTION · Independent collector platform · Foundational build
      </footer>
    </main>
  );
}
