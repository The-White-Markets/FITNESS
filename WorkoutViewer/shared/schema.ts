import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const workoutDays = pgTable("workout_days", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dayNumber: integer("day_number").notNull(),
  title: text("title").notNull(),
  focus: text("focus").notNull(),
});

export const exercises = pgTable("exercises", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workoutDayId: varchar("workout_day_id").notNull().references(() => workoutDays.id),
  name: text("name").notNull(),
  sets: integer("sets").notNull(),
  reps: text("reps").notNull(),
  rpe: text("rpe").notNull(),
  progressionRule: text("progression_rule").notNull(),
  videoUrl: text("video_url").notNull(),
  currentWeight: text("current_weight"),
  lastWorkout: text("last_workout"),
  completedSets: jsonb("completed_sets").default([]),
  order: integer("order").notNull(),
});

export const insertWorkoutDaySchema = createInsertSchema(workoutDays).omit({
  id: true,
});

export const insertExerciseSchema = createInsertSchema(exercises).omit({
  id: true,
});

export type InsertWorkoutDay = z.infer<typeof insertWorkoutDaySchema>;
export type WorkoutDay = typeof workoutDays.$inferSelect;
export type InsertExercise = z.infer<typeof insertExerciseSchema>;
export type Exercise = typeof exercises.$inferSelect;

export type WorkoutDayWithExercises = WorkoutDay & {
  exercises: Exercise[];
};
