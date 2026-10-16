-- Hand-written (decision 0005, DB-OQ-15): drizzle-kit cannot generate deferrable constraints.
-- Position uniqueness of blocks, dialogue lines and exercise items (DB-UQ-07 to 09) is checked at commit, so the
-- importer can reorder rows in one transaction. Code uniqueness and one section per stage (DB-UQ-06) stay immediate.
-- PostgreSQL can only change the deferrability of foreign keys in place, so each constraint is dropped and re-added under the same name.
ALTER TABLE "lesson_blocks" DROP CONSTRAINT "lesson_blocks_section_id_position_key";--> statement-breakpoint
ALTER TABLE "lesson_blocks" ADD CONSTRAINT "lesson_blocks_section_id_position_key" UNIQUE ("section_id", "position") DEFERRABLE INITIALLY DEFERRED;--> statement-breakpoint
ALTER TABLE "dialogue_lines" DROP CONSTRAINT "dialogue_lines_dialogue_id_position_key";--> statement-breakpoint
ALTER TABLE "dialogue_lines" ADD CONSTRAINT "dialogue_lines_dialogue_id_position_key" UNIQUE ("dialogue_id", "position") DEFERRABLE INITIALLY DEFERRED;--> statement-breakpoint
ALTER TABLE "exercise_items" DROP CONSTRAINT "exercise_items_exercise_id_position_key";--> statement-breakpoint
ALTER TABLE "exercise_items" ADD CONSTRAINT "exercise_items_exercise_id_position_key" UNIQUE ("exercise_id", "position") DEFERRABLE INITIALLY DEFERRED;
