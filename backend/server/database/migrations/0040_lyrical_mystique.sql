ALTER TABLE "document" ALTER COLUMN "organization_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "retention_audit" ALTER COLUMN "organization_id" DROP NOT NULL;