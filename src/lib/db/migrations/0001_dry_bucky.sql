CREATE TYPE "public"."media_type" AS ENUM('image', 'video', 'carousel', 'text_only');--> statement-breakpoint
CREATE TYPE "public"."platform" AS ENUM('facebook', 'instagram', 'tiktok');--> statement-breakpoint
CREATE TYPE "public"."post_status" AS ENUM('draft', 'scheduled', 'publishing', 'published', 'failed');--> statement-breakpoint
CREATE TABLE "media_files" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" integer NOT NULL,
	"file_url" text NOT NULL,
	"file_type" varchar(50) NOT NULL,
	"file_size" integer NOT NULL,
	"width" integer,
	"height" integer,
	"duration" integer,
	"thumbnail_url" text,
	"order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post_destinations" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" integer NOT NULL,
	"social_account_id" integer NOT NULL,
	"platform" "platform" NOT NULL,
	"platform_post_id" varchar(255),
	"post_type" varchar(50),
	"status" "post_status" DEFAULT 'scheduled' NOT NULL,
	"published_at" timestamp,
	"error" text,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "social_accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"platform" "platform" NOT NULL,
	"account_name" varchar(255) NOT NULL,
	"platform_account_id" varchar(255) NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text,
	"token_expires_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "posts" DROP CONSTRAINT "posts_author_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "content" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "user_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "media_type" "media_type" NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "status" "post_status" DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "scheduled_at" timestamp;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "published_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password_hash" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "media_files" ADD CONSTRAINT "media_files_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_destinations" ADD CONSTRAINT "post_destinations_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_destinations" ADD CONSTRAINT "post_destinations_social_account_id_social_accounts_id_fk" FOREIGN KEY ("social_account_id") REFERENCES "public"."social_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_accounts" ADD CONSTRAINT "social_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" DROP COLUMN "title";--> statement-breakpoint
ALTER TABLE "posts" DROP COLUMN "published";--> statement-breakpoint
ALTER TABLE "posts" DROP COLUMN "author_id";