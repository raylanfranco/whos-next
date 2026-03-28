# @victory-rush/whos-next-core

Clover-decoupled booking platform PWA — NestJS + React + Prisma v7.

Published to [GitHub Packages](https://github.com/orgs/victory-rush/packages) as `@victory-rush/whos-next-core`.

## Structure

```
backend/   ← NestJS API (Railway)
frontend/  ← React + Vite PWA (Vercel)
```

## Installing as a dependency

Add an `.npmrc` to your project:

```
@victory-rush:registry=https://npm.pkg.github.com
```

Then install:

```bash
npm install @victory-rush/whos-next-core
```

## Local Development

```bash
# Install all workspace dependencies
npm install

# Backend
npm run dev:backend

# Frontend
npm run dev:frontend

# Build everything
npm run build
```

## Backend Setup

```bash
cd backend
cp .env.example .env   # fill in values
npx prisma migrate dev
npm run start:dev
```

## Frontend Setup

```bash
cd frontend
cp .env.example .env   # fill in values
npm run dev
```

## Publishing

Packages are published automatically via GitHub Actions when a [release is created](https://github.com/victory-rush/whosnext-core/releases/new).

To publish manually:

```bash
npm publish
```

## Deployment

- **Backend:** Railway (root: `/backend`, Procfile included)
- **Frontend:** Vercel (root: `/frontend`, vercel.json included)

## Extending with Adapters

Who's Next? Core is designed to be extended with vertical-specific adapters:

- `@victory-rush/whosnext-automotive` — Vehicle intake, fitment DB, parts tracking
- More verticals coming soon

Adapters add domain-specific services, components, and Prisma schema extensions on top of the core booking platform.
