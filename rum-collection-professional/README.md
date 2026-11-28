# Rum Collection

Professional foundation for an international rum collector platform.

## Product defaults

- Shared, centrally curated bottle catalogue.
- Members can propose new bottles; administrators review and publish them.
- Each member owns one or more collections, private by default, with optional public visibility.
- English-first interface with a planned multilingual architecture.
- Responsive web application, with PWA installation as a later milestone.
- Free core product; Premium features can be introduced after validation.

## Stack

- Next.js + TypeScript
- Supabase: PostgreSQL, Auth, Row Level Security and Storage
- Vercel: hosting and deployments
- GitHub: source control and review workflow

## Local setup

1. Install Node.js LTS.
2. Create a Supabase project.
3. Copy `.env.example` to `.env.local`.
4. Add the Supabase project URL and publishable/anon key.
5. Install dependencies with `npm install`.
6. Start with `npm run dev`.

The initial homepage is a visual foundation. Authentication, catalogue CRUD, collection management,
admin review, image upload, valuation history and PWA support are planned implementation milestones;
they are not represented as finished features yet.

## Database

Review `supabase/migrations/0001_initial_schema.sql` before applying it to Supabase.
The schema includes row-level security policies. Test policies with separate member and admin
accounts before any public launch.

## Data quality

Do not publish guessed bottle facts. Keep source references and a confidence state:
`unverified`, `partially_verified`, or `verified`. Keep personal purchase data and ownership
photographs separate from public catalogue records.

## Legacy material

The `legacy-sources/` directory preserves the previous Rum Collection HTML archive and the
Plantation/Planteray collector catalogue for controlled migration. They are source material,
not production code.

## Deployment

See `docs/DEPLOYMENT.md`.
