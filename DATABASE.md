# Drizzle ORM Setup Guide

## 🚀 Quick Start

### 1. Database Setup

First, make sure PostgreSQL is running on your machine:

```bash
brew services start postgresql
```

### 2. Environment Configuration

Update your `.env.local` file with your local PostgreSQL credentials:

```env
DATABASE_URL="postgresql://your_username:your_password@localhost:5432/publio_db"
```

### 3. Initialize Database

Run the setup script to create the database:

```bash
./scripts/setup-db.sh
```

Or manually:

```bash
createdb publio_db
```

### 4. Push Schema to Database

```bash
npm run db:push
```

## 📚 Available Commands

- `npm run db:generate` - Generate migrations from schema changes
- `npm run db:migrate` - Run pending migrations
- `npm run db:push` - Push schema directly to database (good for development)
- `npm run db:studio` - Open Drizzle Studio (database GUI)

## 🗂️ File Structure

```
src/lib/db/
├── index.ts        # Database connection
├── schema.ts       # Database schema definitions
├── queries.ts      # Example CRUD operations
└── migrations/     # Generated migration files
```

## 📖 Usage Examples

### Import the database connection:

```typescript
import { db } from "@/lib/db";
import { users, posts } from "@/lib/db/schema";
```

### Use the helper functions:

```typescript
import { createUser, getUserByEmail } from "@/lib/db/queries";

// Create a user
const newUser = await createUser({
  email: "user@example.com",
  name: "John Doe",
});
```

### Direct database queries:

```typescript
import { eq } from "drizzle-orm";

// Find user by ID
const user = await db.select().from(users).where(eq(users.id, 1));

// Create a post
const post = await db
  .insert(posts)
  .values({
    title: "My First Post",
    content: "Hello World!",
    authorId: 1,
  })
  .returning();
```

## 🔧 Schema Updates

When you modify the schema in `src/lib/db/schema.ts`:

1. Generate migration: `npm run db:generate`
2. Apply migration: `npm run db:migrate`

Or for development, you can push directly: `npm run db:push`

## 📊 Database GUI

Launch Drizzle Studio to view and edit your data:

```bash
npm run db:studio
```

This will open a web interface at `https://local.drizzle.studio`
