import { type WorkoutDay, type Exercise, type InsertWorkoutDay, type InsertExercise, type WorkoutDayWithExercises } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Workout Days
  getWorkoutDays(): Promise<WorkoutDay[]>;
  getWorkoutDay(id: string): Promise<WorkoutDay | undefined>;
  getWorkoutDayWithExercises(id: string): Promise<WorkoutDayWithExercises | undefined>;
  createWorkoutDay(workoutDay: InsertWorkoutDay): Promise<WorkoutDay>;
  updateWorkoutDay(id: string, workoutDay: Partial<InsertWorkoutDay>): Promise<WorkoutDay | undefined>;
  
  // Exercises
  getExercisesByWorkoutDay(workoutDayId: string): Promise<Exercise[]>;
  getExercise(id: string): Promise<Exercise | undefined>;
  createExercise(exercise: InsertExercise): Promise<Exercise>;
  updateExercise(id: string, exercise: Partial<InsertExercise>): Promise<Exercise | undefined>;
  deleteExercise(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private workoutDays: Map<string, WorkoutDay>;
  private exercises: Map<string, Exercise>;

  constructor() {
    this.workoutDays = new Map();
    this.exercises = new Map();
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Initialize with the new CSV data
    const workoutDaysData = [
      { dayNumber: 1, title: "Push Day", focus: "Chest, Shoulders, Triceps" },
      { dayNumber: 2, title: "Pull Day", focus: "Back, Biceps, Rear Delts" },
      { dayNumber: 3, title: "Core Day", focus: "Abs and Core Stability" },
      { dayNumber: 4, title: "Upper Body", focus: "Push/Pull Mix" },
      { dayNumber: 5, title: "Lower Body", focus: "Legs and Core" },
    ];

    const exercisesData = [
      // Day 1 - Push Day (Chest, Shoulders, Triceps)
      { workoutDayId: "fcb6c14b-3b2b-44ef-a38a-0d7fa92262c5", name: "Dumbbell Bench Press", sets: 4, reps: "8-12", rpe: "RPE 7-8", progressionRule: "Add reps until top of range, then increase weight", videoUrl: "https://www.youtube.com/watch?v=VmB1G1K7v94", order: 1, currentWeight: "45 lb" },
      { workoutDayId: "fcb6c14b-3b2b-44ef-a38a-0d7fa92262c5", name: "Seated Overhead Dumbbell Press", sets: 3, reps: "8-12", rpe: "RPE 7-8", progressionRule: "Add reps until top, then increase weight", videoUrl: "https://www.youtube.com/watch?v=B-aVuyhvLHU", order: 2, currentWeight: "30 lb" },
      { workoutDayId: "fcb6c14b-3b2b-44ef-a38a-0d7fa92262c5", name: "Cable Chest Fly", sets: 3, reps: "12-15", rpe: "RPE 8", progressionRule: "Increase reps before weight", videoUrl: "https://www.youtube.com/watch?v=e8PzP4y-bnM", order: 3, currentWeight: "25 lb" },
      { workoutDayId: "fcb6c14b-3b2b-44ef-a38a-0d7fa92262c5", name: "Dumbbell Lateral Raise", sets: 3, reps: "12-15", rpe: "RPE 8", progressionRule: "Slow tempo, increase reps then weight", videoUrl: "https://www.youtube.com/watch?v=kDqklk1ZESo", order: 4, currentWeight: "20 lb" },
      { workoutDayId: "fcb6c14b-3b2b-44ef-a38a-0d7fa92262c5", name: "Triceps Rope Pushdown (Cable)", sets: 3, reps: "10-15", rpe: "RPE 8", progressionRule: "Add reps, then weight", videoUrl: "https://www.youtube.com/watch?v=2-LAMcpzODU", order: 5, currentWeight: "30 lb" },
      
      // Day 2 - Pull Day (Back, Biceps, Rear Delts)
      { workoutDayId: "f94a79c0-63e7-4e4f-9b4d-69b94379249d", name: "Lat Pulldown (Cable)", sets: 4, reps: "8-12", rpe: "RPE 7-8", progressionRule: "Add reps then weight", videoUrl: "https://www.youtube.com/watch?v=CAwf7n6Luuc", order: 1, currentWeight: "80 lb" },
      { workoutDayId: "f94a79c0-63e7-4e4f-9b4d-69b94379249d", name: "Cable Row", sets: 4, reps: "8-12", rpe: "RPE 7-8", progressionRule: "Add reps then weight", videoUrl: "https://www.youtube.com/watch?v=GZbfZ033f74", order: 2, currentWeight: "70 lb" },
      { workoutDayId: "f94a79c0-63e7-4e4f-9b4d-69b94379249d", name: "Dumbbell Bicep Curl", sets: 3, reps: "10-12", rpe: "RPE 8", progressionRule: "Add reps then weight", videoUrl: "https://www.youtube.com/watch?v=ykJmrZ5v0Oo", order: 3, currentWeight: "25 lb" },
      { workoutDayId: "f94a79c0-63e7-4e4f-9b4d-69b94379249d", name: "Face Pull (Cable)", sets: 3, reps: "12-15", rpe: "RPE 8", progressionRule: "Add reps then weight", videoUrl: "https://www.youtube.com/watch?v=rep-qVOkqgk", order: 4, currentWeight: "20 lb" },
      
      // Day 3 - Core Day (Abs and Core Stability)
      { workoutDayId: "9f606d0b-b72b-40b6-b09e-2725c1a12fa9", name: "Hanging Knee Raise (or Bench Leg Raise)", sets: 4, reps: "12-15", rpe: "RPE 8", progressionRule: "Add reps or hold ankle weights", videoUrl: "https://www.youtube.com/watch?v=l4kQd9eWclE", order: 1, currentWeight: "Bodyweight" },
      { workoutDayId: "9f606d0b-b72b-40b6-b09e-2725c1a12fa9", name: "Cable Crunch", sets: 4, reps: "12-15", rpe: "RPE 8", progressionRule: "Increase reps then weight", videoUrl: "https://www.youtube.com/watch?v=SUt8q0EKbms", order: 2, currentWeight: "25 lb" },
      { workoutDayId: "9f606d0b-b72b-40b6-b09e-2725c1a12fa9", name: "Russian Twist (Dumbbell)", sets: 3, reps: "20 total", rpe: "RPE 8", progressionRule: "Add reps then weight", videoUrl: "https://www.youtube.com/watch?v=wkD8rjkodUI", order: 3, currentWeight: "15 lb" },
      { workoutDayId: "9f606d0b-b72b-40b6-b09e-2725c1a12fa9", name: "Mountain Climbers", sets: 3, reps: "30-45 sec", rpe: "RPE 8", progressionRule: "Increase duration", videoUrl: "https://www.youtube.com/watch?v=nmwgirgXLYM", order: 4, currentWeight: "Bodyweight" },
      
      // Day 4 - Upper Body (Push/Pull Mix)
      { workoutDayId: "8a19f4dc-1b8c-4b84-86b6-107f7b8b31ec", name: "Incline Dumbbell Press", sets: 4, reps: "8-12", rpe: "RPE 7-8", progressionRule: "Add reps then weight", videoUrl: "https://www.youtube.com/watch?v=8iPEnn-ltC8", order: 1, currentWeight: "40 lb" },
      { workoutDayId: "8a19f4dc-1b8c-4b84-86b6-107f7b8b31ec", name: "Dumbbell Row (One Arm)", sets: 4, reps: "8-12", rpe: "RPE 7-8", progressionRule: "Add reps then weight", videoUrl: "https://www.youtube.com/watch?v=pYcpY20QaE8", order: 2, currentWeight: "40 lb" },
      { workoutDayId: "8a19f4dc-1b8c-4b84-86b6-107f7b8b31ec", name: "Arnold Press", sets: 3, reps: "8-12", rpe: "RPE 7-8", progressionRule: "Add reps then weight", videoUrl: "https://www.youtube.com/watch?v=vj2w851ZHRM", order: 3, currentWeight: "25 lb" },
      { workoutDayId: "8a19f4dc-1b8c-4b84-86b6-107f7b8b31ec", name: "Hammer Curl (Dumbbell)", sets: 3, reps: "10-12", rpe: "RPE 8", progressionRule: "Add reps then weight", videoUrl: "https://www.youtube.com/watch?v=zC3nLlEvin4", order: 4, currentWeight: "25 lb" },
      { workoutDayId: "8a19f4dc-1b8c-4b84-86b6-107f7b8b31ec", name: "Plank Hold", sets: 3, reps: "30-60 sec", rpe: "RPE 8", progressionRule: "Increase time", videoUrl: "https://www.youtube.com/watch?v=pSHjTRCQxIw", order: 5, currentWeight: "Bodyweight" },
      
      // Day 5 - Lower Body (Legs and Core)
      { workoutDayId: "67ef2d59-2f56-4f8a-87d6-2b1e3ed2a9f1", name: "Dumbbell Romanian Deadlift", sets: 4, reps: "10-12", rpe: "RPE 7-8", progressionRule: "Add reps then weight", videoUrl: "https://www.youtube.com/watch?v=DJ0IxEzB2xI", order: 1, currentWeight: "60 lb" },
      { workoutDayId: "67ef2d59-2f56-4f8a-87d6-2b1e3ed2a9f1", name: "Dumbbell Split Squat", sets: 3, reps: "8-10 each leg", rpe: "RPE 8", progressionRule: "Add reps then weight", videoUrl: "https://www.youtube.com/watch?v=2C-uNgKwPLE", order: 2, currentWeight: "35 lb" },
      { workoutDayId: "67ef2d59-2f56-4f8a-87d6-2b1e3ed2a9f1", name: "Bench Hip Thrust (Dumbbell on hips)", sets: 3, reps: "12-15", rpe: "RPE 8", progressionRule: "Add reps then weight", videoUrl: "https://www.youtube.com/watch?v=SEdqd1n0cvg", order: 3, currentWeight: "50 lb" },
      { workoutDayId: "67ef2d59-2f56-4f8a-87d6-2b1e3ed2a9f1", name: "Weighted Sit-Up (Dumbbell)", sets: 3, reps: "12-15", rpe: "RPE 8", progressionRule: "Add reps then weight", videoUrl: "https://www.youtube.com/watch?v=1fbU_MkV7NE", order: 4, currentWeight: "20 lb" },
      { workoutDayId: "67ef2d59-2f56-4f8a-87d6-2b1e3ed2a9f1", name: "Side Plank", sets: 3, reps: "20-30 sec per side", rpe: "RPE 8", progressionRule: "Increase time", videoUrl: "https://www.youtube.com/watch?v=K2VljzCC16g", order: 5, currentWeight: "Bodyweight" },
    ];

    // Create workout days
    workoutDaysData.forEach(dayData => {
      const id = randomUUID();
      const workoutDay: WorkoutDay = { ...dayData, id };
      this.workoutDays.set(id, workoutDay);
    });

    // Create exercises and assign to workout days
    const workoutDayIds = Array.from(this.workoutDays.keys());
    
    // Create exercises using the new data structure
    exercisesData.forEach((exerciseData, index) => {
      const id = randomUUID();
      const exercise: Exercise = {
        id,
        workoutDayId: workoutDayIds[Math.floor(index / 5)], // Distribute exercises across 5 days
        name: exerciseData.name,
        sets: exerciseData.sets,
        reps: exerciseData.reps,
        rpe: exerciseData.rpe,
        progressionRule: exerciseData.progressionRule,
        videoUrl: exerciseData.videoUrl,
        currentWeight: exerciseData.currentWeight,
        currentReps: Array(exerciseData.sets).fill(10), // Default to 10 reps for each set
        lastWorkout: null,
        completedSets: [],
        order: exerciseData.order,
      };
      this.exercises.set(id, exercise);
    });
  }

  async getWorkoutDays(): Promise<WorkoutDay[]> {
    return Array.from(this.workoutDays.values()).sort((a, b) => a.dayNumber - b.dayNumber);
  }

  async getWorkoutDay(id: string): Promise<WorkoutDay | undefined> {
    return this.workoutDays.get(id);
  }

  async getWorkoutDayWithExercises(id: string): Promise<WorkoutDayWithExercises | undefined> {
    const workoutDay = this.workoutDays.get(id);
    if (!workoutDay) return undefined;

    const exercises = await this.getExercisesByWorkoutDay(id);
    return { ...workoutDay, exercises };
  }

  async createWorkoutDay(insertWorkoutDay: InsertWorkoutDay): Promise<WorkoutDay> {
    const id = randomUUID();
    const workoutDay: WorkoutDay = { ...insertWorkoutDay, id };
    this.workoutDays.set(id, workoutDay);
    return workoutDay;
  }

  async updateWorkoutDay(id: string, updates: Partial<InsertWorkoutDay>): Promise<WorkoutDay | undefined> {
    const workoutDay = this.workoutDays.get(id);
    if (!workoutDay) return undefined;

    const updated = { ...workoutDay, ...updates };
    this.workoutDays.set(id, updated);
    return updated;
  }

  async getExercisesByWorkoutDay(workoutDayId: string): Promise<Exercise[]> {
    return Array.from(this.exercises.values())
      .filter(exercise => exercise.workoutDayId === workoutDayId)
      .sort((a, b) => a.order - b.order);
  }

  async getExercise(id: string): Promise<Exercise | undefined> {
    return this.exercises.get(id);
  }

  async createExercise(insertExercise: InsertExercise): Promise<Exercise> {
    const id = randomUUID();
    const exercise: Exercise = { ...insertExercise, id };
    this.exercises.set(id, exercise);
    return exercise;
  }

  async updateExercise(id: string, updates: Partial<InsertExercise>): Promise<Exercise | undefined> {
    const exercise = this.exercises.get(id);
    if (!exercise) return undefined;

    const updated = { ...exercise, ...updates };
    this.exercises.set(id, updated);
    return updated;
  }

  async deleteExercise(id: string): Promise<boolean> {
    return this.exercises.delete(id);
  }
}

export const storage = new MemStorage();
