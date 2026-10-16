-- Hand-written (decision 0005, DB-OQ-15): drizzle-kit cannot generate deferrable constraints.
-- Position uniqueness (DB-UQ-03 to 05) is checked at commit, so the importer can reorder rows in one transaction.
-- Code uniqueness stays non-deferrable, because upserts use it as the conflict target.
-- PostgreSQL can only change the deferrability of foreign keys in place, so each constraint is dropped and re-added under the same name.
ALTER TABLE "course_parts" DROP CONSTRAINT "course_parts_level_id_position_key";--> statement-breakpoint
ALTER TABLE "course_parts" ADD CONSTRAINT "course_parts_level_id_position_key" UNIQUE ("level_id", "position") DEFERRABLE INITIALLY DEFERRED;--> statement-breakpoint
ALTER TABLE "units" DROP CONSTRAINT "units_course_part_id_position_key";--> statement-breakpoint
ALTER TABLE "units" ADD CONSTRAINT "units_course_part_id_position_key" UNIQUE ("course_part_id", "position") DEFERRABLE INITIALLY DEFERRED;--> statement-breakpoint
ALTER TABLE "lessons" DROP CONSTRAINT "lessons_unit_id_position_key";--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_unit_id_position_key" UNIQUE ("unit_id", "position") DEFERRABLE INITIALLY DEFERRED;
