# Deployment checklist

## Supabase

1. Create a new project.
2. Review and apply `supabase/migrations/0001_initial_schema.sql`.
3. Configure email authentication and allowed redirect URLs.
4. Create storage buckets:
   - `catalogue-images` (public read; admin-only writes)
   - `collection-photos` (private; owner-only access)
5. Add and test Storage object policies. Do not make private ownership photos public.
6. Create the first administrator through a trusted, controlled SQL operation after verifying the account ID.
7. Test every RLS policy with at least two ordinary users and one administrator.

## GitHub

1. Create a private repository named `rum-collection`.
2. Upload the project files.
3. Keep `.env.local` out of Git.
4. Use pull requests or reviewed commits for production changes.

## Vercel

1. Import the GitHub repository.
2. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Deploy a preview first.
4. Test login, access control, catalogue visibility and private collection access.
5. Attach a domain only after the production checks pass.

## Before public launch

- Complete authentication and account recovery.
- Complete server-side authorization and admin workflows.
- Test storage policies and upload limits.
- Add privacy policy, terms, cookie notice where applicable, contact and deletion/export workflows.
- Add backups, monitoring, rate limits and abuse controls.
- Verify catalogue data rights and image permissions.
- Run accessibility, mobile and security checks.
