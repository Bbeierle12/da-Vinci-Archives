# da Vinci Archives

Art studio management system for tracking paintings, supplies, and planning.

## Tech Stack

- **Framework**: Astro 5 with Vercel adapter
- **Database**: Neon PostgreSQL via Drizzle ORM
- **Storage**: Vercel Blob for images
- **Auth**: Single-user with Argon2id password hashing

## Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Connect Neon Database

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project → Storage → Connect Database
3. Choose "Neon" from the marketplace
4. Create a new Neon database or connect existing
5. Vercel will automatically inject `DATABASE_URL` and `DATABASE_URL_UNPOOLED`

### 3. Run Migrations

```bash
# Generate migration files (already done)
pnpm db:generate

# Apply migrations to Neon
pnpm db:migrate
```

### 4. Connect Vercel Blob

1. Vercel Dashboard → Storage → Connect Database
2. Choose "Blob"
3. `BLOB_READ_WRITE_TOKEN` will be auto-injected

### 5. Set Auth Password

Generate a password hash:
```bash
npx argon2 hash "your-secure-password"
```

Add to Vercel environment variables:
```
STUDIO_PASSWORD_HASH=$argon2id$v=19$m=65536,t=3,p=4$...
```

### 6. Local Development

Copy `.env.example` to `.env.local` and fill in values:
```bash
cp .env.example .env.local
```

Run the dev server:
```bash
pnpm dev
```

## Database Schema

- **paintings** - Artwork records with images and status
- **supplies** - Inventory with flexible units (ml, each, g)
- **painting_supplies** - Links paintings to supplies used
- **supply_consumption_log** - Immutable inventory change history
- **plans** - Canvas planning documents with tldraw
- **canvas_snapshots** - Full version history for time-travel
- **sessions** - Single-user auth tokens

## Key Features

- **Unit Types**: Supplies support ml, each, or g units
- **Full-Text Search**: GIN indexes on paintings, supplies, and plans
- **Concurrency-Safe**: Trigger prevents negative stock
- **Canvas Versioning**: All snapshots kept for complete history
