npThis is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Product image storage

Product uploads are stored in Supabase Storage rather than the app's filesystem:

1. In the Supabase Dashboard, create a **public** Storage bucket named `product-images` (or set `SUPABASE_STORAGE_BUCKET` to your chosen bucket name). Set its file size limit to 5 MB and, if desired, allow only JPEG, PNG, WEBP, GIF, and AVIF.
2. Set `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` for local development and in the hosting provider's server-side environment variables for deployment. `SUPABASE_SERVICE_ROLE_KEY` must never use a `NEXT_PUBLIC_` prefix or be exposed to browser code.
3. Restart the development server or redeploy after setting the variables.

The upload endpoint checks that the requester is staff or owner, then uploads to the bucket using the server-only service role key. The resulting public URL is saved as the product image URL.

## Supabase database source of truth

The app now reads and writes products, categories, users, orders, store settings, inventory, and sales analytics directly in Supabase. It no longer silently falls back to `data/db.json`; database/configuration errors are returned instead of pretending a write succeeded.

To switch an existing installation:

1. In the Supabase Dashboard for the project you intend to use, open **SQL Editor** and run the updated `supabase_schema.sql`. It creates/seeds the tables, applies the private-table policies, configures the `product-images` bucket, and installs payment/refund RPC functions.
2. Make sure `.env.local` has that same project's URL and anon key, plus a newly rotated service-role key. Never expose the service-role key to browser code.
3. From the project root, run `npm run migrate:supabase` once. This copies `data/db.json` into Supabase (categories, users, products, orders, and settings) using the IDs already present; it can be rerun safely to update matching IDs. Keep the JSON file as a backup until you verify the records in Supabase.
4. In Vercel, set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` to credentials from that exact project, then redeploy.

The service-role key is used only in server-side code and the one-time local migration script. The `users` and `orders` tables are not directly readable or writable with the public anon key.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
