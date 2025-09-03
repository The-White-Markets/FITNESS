import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import { 
  type WorkoutDay, 
  type Exercise, 
  type InsertWorkoutDay, 
  type InsertExercise, 
  type WorkoutDayWithExercises,
  workoutDays,
  exercises
} from "@shared/schema";
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;
  private pool: Pool;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is required");
    }
    
    this.pool = new Pool({ connectionString: process.env.DATABASE_URL });
    this.db = drizzle(this.pool);
  }

  async getWorkoutDays(): Promise<WorkoutDay[]> {
    return await this.db.select().from(workoutDays).orderBy(workoutDays.dayNumber);
  }

  async getWorkoutDay(id: string): Promise<WorkoutDay | undefined> {
    const result = await this.db.select().from(workoutDays).where(eq(workoutDays.id, id)).limit(1);
    return result[0];
  }

  async getWorkoutDayWithExercises(id: string): Promise<WorkoutDayWithExercises | undefined> {
    const workoutDay = await this.getWorkoutDay(id);
    if (!workoutDay) return undefined;

    const exercisesList = await this.db
      .select()
      .from(exercises)
      .where(eq(exercises.workoutDayId, id))
      .orderBy(exercises.order);

    return {
      ...workoutDay,
      exercises: exercisesList,
    };
  }

  async createWorkoutDay(workoutDay: InsertWorkoutDay): Promise<WorkoutDay> {
    const result = await this.db.insert(workoutDays).values(workoutDay).returning();
    return result[0];
  }

  async updateWorkoutDay(id: string, updates: Partial<InsertWorkoutDay>): Promise<WorkoutDay | undefined> {
    const result = await this.db
      .update(workoutDays)
      .set(updates)
      .where(eq(workoutDays.id, id))
      .returning();
    return result[0];
  }

  async getExercisesByWorkoutDay(workoutDayId: string): Promise<Exercise[]> {
    return await this.db
      .select()
      .from(exercises)
      .where(eq(exercises.workoutDayId, workoutDayId))
      .orderBy(exercises.order);
  }

  async getExercise(id: string): Promise<Exercise | undefined> {
    const result = await this.db.select().from(exercises).where(eq(exercises.id, id)).limit(1);
    return result[0];
  }

  async createExercise(exercise: InsertExercise): Promise<Exercise> {
    const result = await this.db.insert(exercises).values(exercise).returning();
    return result[0];
  }

  async updateExercise(id: string, updates: Partial<InsertExercise>): Promise<Exercise | undefined> {
    const result = await this.db
      .update(exercises)
      .set(updates)
      .where(eq(exercises.id, id))
      .returning();
    return result[0];
  }

  async deleteExercise(id: string): Promise<boolean> {
    const result = await this.db.delete(exercises).where(eq(exercises.id, id)).returning();
    return result.length > 0;
  }
}