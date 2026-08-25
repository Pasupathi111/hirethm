CREATE TYPE "public"."candidate_match_status" AS ENUM('new', 'waiting', 'accepted', 'rejected', 'in_progress');--> statement-breakpoint
CREATE TYPE "public"."candidate_notification_category" AS ENUM('matches', 'applications', 'interviews', 'profile', 'system');--> statement-breakpoint
CREATE TYPE "public"."candidate_work_mode" AS ENUM('remote', 'hybrid', 'onsite', 'any');--> statement-breakpoint
CREATE TABLE "candidate_match" (
	"id" text PRIMARY KEY NOT NULL,
	"candidate_id" text NOT NULL,
	"job_id" text NOT NULL,
	"score" integer NOT NULL,
	"criteria" jsonb NOT NULL,
	"reasons" jsonb NOT NULL,
	"gap" text,
	"status" "candidate_match_status" DEFAULT 'new' NOT NULL,
	"matched_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "candidate_notification" (
	"id" text PRIMARY KEY NOT NULL,
	"candidate_id" text NOT NULL,
	"category" "candidate_notification_category" NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"action_label" text,
	"action_href" text,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "candidate_preference" (
	"candidate_id" text PRIMARY KEY NOT NULL,
	"desired_titles" text[] DEFAULT '{}'::text[] NOT NULL,
	"locations" text[] DEFAULT '{}'::text[] NOT NULL,
	"work_mode" "candidate_work_mode" DEFAULT 'any' NOT NULL,
	"min_salary" integer,
	"max_salary" integer,
	"employment_types" text[] DEFAULT '{}'::text[] NOT NULL,
	"notify_matches" boolean DEFAULT true NOT NULL,
	"notify_applications" boolean DEFAULT true NOT NULL,
	"notify_interviews" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "candidate" ADD COLUMN "skills" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "skills" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "candidate_match" ADD CONSTRAINT "candidate_match_candidate_id_candidate_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidate"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidate_match" ADD CONSTRAINT "candidate_match_job_id_job_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidate_notification" ADD CONSTRAINT "candidate_notification_candidate_id_candidate_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidate"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidate_preference" ADD CONSTRAINT "candidate_preference_candidate_id_candidate_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidate"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "candidate_match_candidate_id_idx" ON "candidate_match" USING btree ("candidate_id");--> statement-breakpoint
CREATE INDEX "candidate_match_job_id_idx" ON "candidate_match" USING btree ("job_id");--> statement-breakpoint
CREATE UNIQUE INDEX "candidate_match_candidate_job_idx" ON "candidate_match" USING btree ("candidate_id","job_id");--> statement-breakpoint
CREATE INDEX "candidate_notification_candidate_id_idx" ON "candidate_notification" USING btree ("candidate_id");--> statement-breakpoint
CREATE INDEX "candidate_notification_candidate_read_idx" ON "candidate_notification" USING btree ("candidate_id","is_read");