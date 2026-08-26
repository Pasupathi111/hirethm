CREATE TYPE "public"."match_notification_channel" AS ENUM('in_app', 'email', 'both');--> statement-breakpoint
ALTER TABLE "org_settings" ADD COLUMN "match_notification_channel" "match_notification_channel" DEFAULT 'in_app' NOT NULL;--> statement-breakpoint
ALTER TABLE "org_settings" ADD COLUMN "min_readiness_score" integer DEFAULT 70 NOT NULL;--> statement-breakpoint
ALTER TABLE "org_settings" ADD COLUMN "consent_expiry_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "org_settings" ADD COLUMN "consent_expiry_days" integer DEFAULT 90 NOT NULL;