CREATE TYPE "public"."interview_template_status" AS ENUM('active', 'draft', 'archived');--> statement-breakpoint
CREATE TABLE "interview_template" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"name" text NOT NULL,
	"type" "interview_type" DEFAULT 'video' NOT NULL,
	"duration" integer DEFAULT 60 NOT NULL,
	"questions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" "interview_template_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "interview_template" ADD CONSTRAINT "interview_template_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "interview_template_organization_id_idx" ON "interview_template" USING btree ("organization_id");