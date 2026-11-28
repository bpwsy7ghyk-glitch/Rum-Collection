# Architecture

## Main domains

1. Identity: authentication, profiles, language preference and roles.
2. Catalogue: canonical bottle records, producers, distilleries, origins, series and images.
3. Collections: private ownership records, quantities, condition, purchase details and owner photos.
4. Community: public profiles and collections, sharing and moderation.
5. Administration: bottle review, catalogue curation, user moderation and auditability.
6. Valuations: dated observations with explicit method and source; never present estimates as guaranteed market prices.

## Data separation

A bottle is a canonical catalogue entity. A collector's ownership is a separate `collection_items` record.
This avoids duplicate bottle records and prevents private purchase data from leaking into the public catalogue.

## Security principles

- Supabase Row Level Security is mandatory for every user-facing table.
- Never expose the Supabase service-role key in browser code.
- Admin privileges are assigned only through trusted server-side administration.
- Private collection records and owner photographs remain private unless explicitly shared.
- Validate all submitted fields server-side.
- Keep audit trails for moderation and important catalogue changes before public launch.

## Planned application routes

- `/` public homepage
- `/catalogue` searchable public catalogue
- `/bottles/[slug]` public bottle detail
- `/login`, `/signup`, `/forgot-password`
- `/dashboard` member dashboard
- `/my-collections` and `/my-collections/[id]`
- `/profile/[username]` public profile
- `/admin` protected admin area
- `/admin/proposals` catalogue proposal review
