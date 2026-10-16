CREATE TYPE "public"."audio_variant" AS ENUM('normal', 'slow');--> statement-breakpoint
CREATE TYPE "public"."block_kind" AS ENUM('text', 'vocabulary', 'phrase', 'concept', 'example', 'dialogue', 'exercise');--> statement-breakpoint
CREATE TYPE "public"."block_status" AS ENUM('productive', 'chunk', 'recognition');--> statement-breakpoint
CREATE TYPE "public"."cefr_level" AS ENUM('A1', 'A2', 'B1', 'B2');--> statement-breakpoint
CREATE TYPE "public"."concept_type" AS ENUM('grammar', 'pronunciation', 'pattern');--> statement-breakpoint
CREATE TYPE "public"."exercise_type" AS ENUM('multiple_choice', 'matching', 'fill_blank', 'sentence_ordering', 'translation', 'listening_selection', 'listening_dictation', 'article_selection', 'gender_selection', 'vocabulary_recall', 'sentence_building', 'reading_comprehension', 'writing', 'speaking', 'pronunciation_repetition', 'dialogue_completion', 'roleplay', 'image_labelling');--> statement-breakpoint
CREATE TYPE "public"."noun_article" AS ENUM('der', 'die', 'das');--> statement-breakpoint
CREATE TYPE "public"."production_method" AS ENUM('synthetic', 'human');--> statement-breakpoint
CREATE TYPE "public"."register" AS ENUM('neutral', 'formal', 'informal');--> statement-breakpoint
CREATE TYPE "public"."review_mode" AS ENUM('recognise', 'recall', 'produce');--> statement-breakpoint
CREATE TYPE "public"."section_weight" AS ENUM('heavy', 'normal', 'light');--> statement-breakpoint
CREATE TYPE "public"."vocabulary_tier" AS ENUM('core_active', 'secondary_active', 'recognition');--> statement-breakpoint
CREATE TYPE "public"."word_class" AS ENUM('noun', 'verb', 'adjective', 'adverb', 'function_word');--> statement-breakpoint
CREATE TABLE "audio_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vocabulary_item_id" uuid,
	"phrase_id" uuid,
	"example_id" uuid,
	"dialogue_line_id" uuid,
	"voice_id" uuid NOT NULL,
	"variant" "audio_variant" DEFAULT 'normal' NOT NULL,
	"production_method" "production_method" NOT NULL,
	"storage_key" text NOT NULL,
	"duration_ms" integer,
	"text_hash" text NOT NULL,
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "audio_assets_storage_key_key" UNIQUE("storage_key"),
	CONSTRAINT "audio_assets_one_owner_check" CHECK (num_nonnulls("audio_assets"."vocabulary_item_id", "audio_assets"."phrase_id", "audio_assets"."example_id", "audio_assets"."dialogue_line_id") = 1),
	CONSTRAINT "audio_assets_duration_ms_check" CHECK ("audio_assets"."duration_ms" > 0)
);
--> statement-breakpoint
CREATE TABLE "concept_prerequisites" (
	"concept_id" uuid NOT NULL,
	"requires_concept_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "concept_prerequisites_concept_id_requires_concept_id_pk" PRIMARY KEY("concept_id","requires_concept_id"),
	CONSTRAINT "concept_prerequisites_not_self_check" CHECK ("concept_prerequisites"."concept_id" <> "concept_prerequisites"."requires_concept_id")
);
--> statement-breakpoint
CREATE TABLE "concepts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"slug" text NOT NULL,
	"type" "concept_type" NOT NULL,
	"title" text NOT NULL,
	"explanation_en" text NOT NULL,
	"level" "cefr_level" NOT NULL,
	CONSTRAINT "concepts_code_key" UNIQUE("code"),
	CONSTRAINT "concepts_slug_key" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "dialogue_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"dialogue_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"speaker_role" text NOT NULL,
	"german" text NOT NULL,
	"meaning_en" text NOT NULL,
	"voice_id" uuid NOT NULL,
	CONSTRAINT "dialogue_lines_code_key" UNIQUE("code"),
	CONSTRAINT "dialogue_lines_dialogue_id_position_key" UNIQUE("dialogue_id","position")
);
--> statement-breakpoint
CREATE TABLE "dialogues" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"register" "register" NOT NULL,
	CONSTRAINT "dialogues_code_key" UNIQUE("code"),
	CONSTRAINT "dialogues_slug_key" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "example_concepts" (
	"example_id" uuid NOT NULL,
	"concept_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "example_concepts_example_id_concept_id_pk" PRIMARY KEY("example_id","concept_id")
);
--> statement-breakpoint
CREATE TABLE "example_vocabulary" (
	"example_id" uuid NOT NULL,
	"vocabulary_item_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "example_vocabulary_example_id_vocabulary_item_id_pk" PRIMARY KEY("example_id","vocabulary_item_id")
);
--> statement-breakpoint
CREATE TABLE "examples" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"german" text NOT NULL,
	"meaning_en" text NOT NULL,
	"level" "cefr_level" NOT NULL,
	CONSTRAINT "examples_code_key" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "exercise_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"exercise_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"payload" jsonb NOT NULL,
	"feedback_en" text,
	"example_id" uuid,
	CONSTRAINT "exercise_items_code_key" UNIQUE("code"),
	CONSTRAINT "exercise_items_exercise_id_position_key" UNIQUE("exercise_id","position")
);
--> statement-breakpoint
CREATE TABLE "exercise_targets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"exercise_id" uuid NOT NULL,
	"concept_id" uuid,
	"vocabulary_item_id" uuid,
	"phrase_id" uuid,
	"objective_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "exercise_targets_one_target_check" CHECK (num_nonnulls("exercise_targets"."concept_id", "exercise_targets"."vocabulary_item_id", "exercise_targets"."phrase_id", "exercise_targets"."objective_id") = 1)
);
--> statement-breakpoint
CREATE TABLE "exercises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"type" "exercise_type" NOT NULL,
	"skill" "skill" NOT NULL,
	"instruction_en" text NOT NULL,
	CONSTRAINT "exercises_code_key" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "lesson_blocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"section_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"kind" "block_kind" NOT NULL,
	"role" "block_role",
	"status" "block_status",
	"text_en" text,
	"vocabulary_item_id" uuid,
	"phrase_id" uuid,
	"concept_id" uuid,
	"example_id" uuid,
	"dialogue_id" uuid,
	"exercise_id" uuid,
	"mode" "review_mode",
	CONSTRAINT "lesson_blocks_code_key" UNIQUE("code"),
	CONSTRAINT "lesson_blocks_section_id_position_key" UNIQUE("section_id","position"),
	CONSTRAINT "lesson_blocks_one_target_check" CHECK (num_nonnulls("lesson_blocks"."vocabulary_item_id", "lesson_blocks"."phrase_id", "lesson_blocks"."concept_id", "lesson_blocks"."example_id", "lesson_blocks"."dialogue_id", "lesson_blocks"."exercise_id") = ("lesson_blocks"."kind" <> 'text')::int),
	CONSTRAINT "lesson_blocks_kind_target_check" CHECK (("lesson_blocks"."kind" <> 'vocabulary' or "lesson_blocks"."vocabulary_item_id" is not null)
        and ("lesson_blocks"."kind" <> 'phrase' or "lesson_blocks"."phrase_id" is not null)
        and ("lesson_blocks"."kind" <> 'concept' or "lesson_blocks"."concept_id" is not null)
        and ("lesson_blocks"."kind" <> 'example' or "lesson_blocks"."example_id" is not null)
        and ("lesson_blocks"."kind" <> 'dialogue' or "lesson_blocks"."dialogue_id" is not null)
        and ("lesson_blocks"."kind" <> 'exercise' or "lesson_blocks"."exercise_id" is not null))
);
--> statement-breakpoint
CREATE TABLE "lesson_sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"lesson_id" uuid NOT NULL,
	"stage" smallint NOT NULL,
	"weight" "section_weight" DEFAULT 'normal' NOT NULL,
	CONSTRAINT "lesson_sections_code_key" UNIQUE("code"),
	CONSTRAINT "lesson_sections_lesson_id_stage_key" UNIQUE("lesson_id","stage"),
	CONSTRAINT "lesson_sections_stage_check" CHECK ("lesson_sections"."stage" between 1 and 9)
);
--> statement-breakpoint
CREATE TABLE "phrases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"slug" text NOT NULL,
	"german" text NOT NULL,
	"meaning_en" text NOT NULL,
	"register" "register" DEFAULT 'neutral' NOT NULL,
	"level" "cefr_level" NOT NULL,
	CONSTRAINT "phrases_code_key" UNIQUE("code"),
	CONSTRAINT "phrases_slug_key" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "topics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	CONSTRAINT "topics_code_key" UNIQUE("code"),
	CONSTRAINT "topics_slug_key" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "vocabulary_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"slug" text NOT NULL,
	"lemma" text NOT NULL,
	"word_class" "word_class" NOT NULL,
	"article" "noun_article",
	"plural" text,
	"meaning_en" text NOT NULL,
	"tier" "vocabulary_tier" NOT NULL,
	"level" "cefr_level" NOT NULL,
	CONSTRAINT "vocabulary_items_code_key" UNIQUE("code"),
	CONSTRAINT "vocabulary_items_slug_key" UNIQUE("slug"),
	CONSTRAINT "vocabulary_items_article_check" CHECK (("vocabulary_items"."article" is not null) = ("vocabulary_items"."word_class" = 'noun'))
);
--> statement-breakpoint
CREATE TABLE "vocabulary_topics" (
	"vocabulary_item_id" uuid NOT NULL,
	"topic_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "vocabulary_topics_vocabulary_item_id_topic_id_pk" PRIMARY KEY("vocabulary_item_id","topic_id")
);
--> statement-breakpoint
CREATE TABLE "voices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"gender" text,
	"age_band" text,
	"region" text,
	CONSTRAINT "voices_code_key" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "audio_assets" ADD CONSTRAINT "audio_assets_vocabulary_item_id_vocabulary_items_id_fk" FOREIGN KEY ("vocabulary_item_id") REFERENCES "public"."vocabulary_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audio_assets" ADD CONSTRAINT "audio_assets_phrase_id_phrases_id_fk" FOREIGN KEY ("phrase_id") REFERENCES "public"."phrases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audio_assets" ADD CONSTRAINT "audio_assets_example_id_examples_id_fk" FOREIGN KEY ("example_id") REFERENCES "public"."examples"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audio_assets" ADD CONSTRAINT "audio_assets_dialogue_line_id_dialogue_lines_id_fk" FOREIGN KEY ("dialogue_line_id") REFERENCES "public"."dialogue_lines"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audio_assets" ADD CONSTRAINT "audio_assets_voice_id_voices_id_fk" FOREIGN KEY ("voice_id") REFERENCES "public"."voices"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "concept_prerequisites" ADD CONSTRAINT "concept_prerequisites_concept_id_concepts_id_fk" FOREIGN KEY ("concept_id") REFERENCES "public"."concepts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "concept_prerequisites" ADD CONSTRAINT "concept_prerequisites_requires_concept_id_concepts_id_fk" FOREIGN KEY ("requires_concept_id") REFERENCES "public"."concepts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dialogue_lines" ADD CONSTRAINT "dialogue_lines_dialogue_id_dialogues_id_fk" FOREIGN KEY ("dialogue_id") REFERENCES "public"."dialogues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dialogue_lines" ADD CONSTRAINT "dialogue_lines_voice_id_voices_id_fk" FOREIGN KEY ("voice_id") REFERENCES "public"."voices"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "example_concepts" ADD CONSTRAINT "example_concepts_example_id_examples_id_fk" FOREIGN KEY ("example_id") REFERENCES "public"."examples"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "example_concepts" ADD CONSTRAINT "example_concepts_concept_id_concepts_id_fk" FOREIGN KEY ("concept_id") REFERENCES "public"."concepts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "example_vocabulary" ADD CONSTRAINT "example_vocabulary_example_id_examples_id_fk" FOREIGN KEY ("example_id") REFERENCES "public"."examples"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "example_vocabulary" ADD CONSTRAINT "example_vocabulary_vocabulary_item_id_vocabulary_items_id_fk" FOREIGN KEY ("vocabulary_item_id") REFERENCES "public"."vocabulary_items"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_items" ADD CONSTRAINT "exercise_items_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_items" ADD CONSTRAINT "exercise_items_example_id_examples_id_fk" FOREIGN KEY ("example_id") REFERENCES "public"."examples"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_targets" ADD CONSTRAINT "exercise_targets_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_targets" ADD CONSTRAINT "exercise_targets_concept_id_concepts_id_fk" FOREIGN KEY ("concept_id") REFERENCES "public"."concepts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_targets" ADD CONSTRAINT "exercise_targets_vocabulary_item_id_vocabulary_items_id_fk" FOREIGN KEY ("vocabulary_item_id") REFERENCES "public"."vocabulary_items"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_targets" ADD CONSTRAINT "exercise_targets_phrase_id_phrases_id_fk" FOREIGN KEY ("phrase_id") REFERENCES "public"."phrases"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_targets" ADD CONSTRAINT "exercise_targets_objective_id_learning_objectives_id_fk" FOREIGN KEY ("objective_id") REFERENCES "public"."learning_objectives"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_blocks" ADD CONSTRAINT "lesson_blocks_section_id_lesson_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."lesson_sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_blocks" ADD CONSTRAINT "lesson_blocks_vocabulary_item_id_vocabulary_items_id_fk" FOREIGN KEY ("vocabulary_item_id") REFERENCES "public"."vocabulary_items"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_blocks" ADD CONSTRAINT "lesson_blocks_phrase_id_phrases_id_fk" FOREIGN KEY ("phrase_id") REFERENCES "public"."phrases"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_blocks" ADD CONSTRAINT "lesson_blocks_concept_id_concepts_id_fk" FOREIGN KEY ("concept_id") REFERENCES "public"."concepts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_blocks" ADD CONSTRAINT "lesson_blocks_example_id_examples_id_fk" FOREIGN KEY ("example_id") REFERENCES "public"."examples"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_blocks" ADD CONSTRAINT "lesson_blocks_dialogue_id_dialogues_id_fk" FOREIGN KEY ("dialogue_id") REFERENCES "public"."dialogues"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_blocks" ADD CONSTRAINT "lesson_blocks_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_sections" ADD CONSTRAINT "lesson_sections_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vocabulary_topics" ADD CONSTRAINT "vocabulary_topics_vocabulary_item_id_vocabulary_items_id_fk" FOREIGN KEY ("vocabulary_item_id") REFERENCES "public"."vocabulary_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vocabulary_topics" ADD CONSTRAINT "vocabulary_topics_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "audio_assets_vocabulary_item_id_voice_id_variant_key" ON "audio_assets" USING btree ("vocabulary_item_id","voice_id","variant") WHERE "audio_assets"."vocabulary_item_id" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "audio_assets_phrase_id_voice_id_variant_key" ON "audio_assets" USING btree ("phrase_id","voice_id","variant") WHERE "audio_assets"."phrase_id" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "audio_assets_example_id_voice_id_variant_key" ON "audio_assets" USING btree ("example_id","voice_id","variant") WHERE "audio_assets"."example_id" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "audio_assets_dialogue_line_id_voice_id_variant_key" ON "audio_assets" USING btree ("dialogue_line_id","voice_id","variant") WHERE "audio_assets"."dialogue_line_id" is not null;--> statement-breakpoint
CREATE INDEX "audio_assets_voice_id_idx" ON "audio_assets" USING btree ("voice_id");--> statement-breakpoint
CREATE INDEX "concept_prerequisites_requires_concept_id_idx" ON "concept_prerequisites" USING btree ("requires_concept_id");--> statement-breakpoint
CREATE INDEX "dialogue_lines_voice_id_idx" ON "dialogue_lines" USING btree ("voice_id");--> statement-breakpoint
CREATE INDEX "example_concepts_concept_id_idx" ON "example_concepts" USING btree ("concept_id");--> statement-breakpoint
CREATE INDEX "example_vocabulary_vocabulary_item_id_idx" ON "example_vocabulary" USING btree ("vocabulary_item_id");--> statement-breakpoint
CREATE INDEX "exercise_items_example_id_idx" ON "exercise_items" USING btree ("example_id");--> statement-breakpoint
CREATE UNIQUE INDEX "exercise_targets_exercise_id_concept_id_key" ON "exercise_targets" USING btree ("exercise_id","concept_id") WHERE "exercise_targets"."concept_id" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "exercise_targets_exercise_id_vocabulary_item_id_key" ON "exercise_targets" USING btree ("exercise_id","vocabulary_item_id") WHERE "exercise_targets"."vocabulary_item_id" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "exercise_targets_exercise_id_phrase_id_key" ON "exercise_targets" USING btree ("exercise_id","phrase_id") WHERE "exercise_targets"."phrase_id" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "exercise_targets_exercise_id_objective_id_key" ON "exercise_targets" USING btree ("exercise_id","objective_id") WHERE "exercise_targets"."objective_id" is not null;--> statement-breakpoint
CREATE INDEX "exercise_targets_exercise_id_idx" ON "exercise_targets" USING btree ("exercise_id");--> statement-breakpoint
CREATE INDEX "exercise_targets_concept_id_idx" ON "exercise_targets" USING btree ("concept_id");--> statement-breakpoint
CREATE INDEX "exercise_targets_vocabulary_item_id_idx" ON "exercise_targets" USING btree ("vocabulary_item_id");--> statement-breakpoint
CREATE INDEX "exercise_targets_phrase_id_idx" ON "exercise_targets" USING btree ("phrase_id");--> statement-breakpoint
CREATE INDEX "exercise_targets_objective_id_idx" ON "exercise_targets" USING btree ("objective_id");--> statement-breakpoint
CREATE INDEX "lesson_blocks_vocabulary_item_id_idx" ON "lesson_blocks" USING btree ("vocabulary_item_id");--> statement-breakpoint
CREATE INDEX "lesson_blocks_phrase_id_idx" ON "lesson_blocks" USING btree ("phrase_id");--> statement-breakpoint
CREATE INDEX "lesson_blocks_concept_id_idx" ON "lesson_blocks" USING btree ("concept_id");--> statement-breakpoint
CREATE INDEX "lesson_blocks_example_id_idx" ON "lesson_blocks" USING btree ("example_id");--> statement-breakpoint
CREATE INDEX "lesson_blocks_dialogue_id_idx" ON "lesson_blocks" USING btree ("dialogue_id");--> statement-breakpoint
CREATE INDEX "lesson_blocks_exercise_id_idx" ON "lesson_blocks" USING btree ("exercise_id");--> statement-breakpoint
CREATE INDEX "vocabulary_topics_topic_id_idx" ON "vocabulary_topics" USING btree ("topic_id");