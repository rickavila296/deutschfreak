CREATE TYPE "public"."block_role" AS ENUM('introduces', 'reinforces', 'applies', 'assesses');--> statement-breakpoint
CREATE TYPE "public"."lesson_archetype" AS ENUM('conversation', 'grammar', 'vocabulary', 'pronunciation', 'reading', 'listening', 'writing', 'integrated', 'checkpoint');--> statement-breakpoint
CREATE TYPE "public"."lesson_status" AS ENUM('planned', 'published', 'retired');--> statement-breakpoint
CREATE TYPE "public"."skill" AS ENUM('listening', 'reading', 'spoken_interaction', 'spoken_production', 'writing', 'vocabulary', 'grammar', 'pronunciation');--> statement-breakpoint
CREATE TABLE "course_parts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"level_id" uuid NOT NULL,
	"title" text NOT NULL,
	"tagline" text NOT NULL,
	"position" integer NOT NULL,
	CONSTRAINT "course_parts_code_key" UNIQUE("code"),
	CONSTRAINT "course_parts_level_id_position_key" UNIQUE("level_id","position")
);
--> statement-breakpoint
CREATE TABLE "learning_objectives" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"can_do_en" text NOT NULL,
	"skill" "skill" NOT NULL,
	CONSTRAINT "learning_objectives_code_key" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "lesson_objectives" (
	"lesson_id" uuid NOT NULL,
	"objective_id" uuid NOT NULL,
	"role" "block_role" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lesson_objectives_lesson_id_objective_id_pk" PRIMARY KEY("lesson_id","objective_id")
);
--> statement-breakpoint
CREATE TABLE "lessons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"unit_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"archetypes" "lesson_archetype"[] NOT NULL,
	"mastery_task_en" text NOT NULL,
	"status" "lesson_status" DEFAULT 'planned' NOT NULL,
	"revision" integer DEFAULT 1 NOT NULL,
	"position" integer NOT NULL,
	CONSTRAINT "lessons_code_key" UNIQUE("code"),
	CONSTRAINT "lessons_slug_key" UNIQUE("slug"),
	CONSTRAINT "lessons_unit_id_position_key" UNIQUE("unit_id","position"),
	CONSTRAINT "lessons_archetypes_check" CHECK (cardinality("lessons"."archetypes") >= 1)
);
--> statement-breakpoint
CREATE TABLE "levels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"title" text NOT NULL,
	CONSTRAINT "levels_code_key" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "units" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"course_part_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"subtitle_en" text NOT NULL,
	"context_en" text,
	"position" integer NOT NULL,
	CONSTRAINT "units_code_key" UNIQUE("code"),
	CONSTRAINT "units_slug_key" UNIQUE("slug"),
	CONSTRAINT "units_course_part_id_position_key" UNIQUE("course_part_id","position")
);
--> statement-breakpoint
ALTER TABLE "course_parts" ADD CONSTRAINT "course_parts_level_id_levels_id_fk" FOREIGN KEY ("level_id") REFERENCES "public"."levels"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_objectives" ADD CONSTRAINT "lesson_objectives_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_objectives" ADD CONSTRAINT "lesson_objectives_objective_id_learning_objectives_id_fk" FOREIGN KEY ("objective_id") REFERENCES "public"."learning_objectives"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "units" ADD CONSTRAINT "units_course_part_id_course_parts_id_fk" FOREIGN KEY ("course_part_id") REFERENCES "public"."course_parts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "lesson_objectives_objective_id_idx" ON "lesson_objectives" USING btree ("objective_id");