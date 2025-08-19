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
    // Initialize with the CSV data
    const workoutDaysData = [
      { dayNumber: 1, title: "Upper Body", focus: "Horizontal Focus" },
      { dayNumber: 2, title: "Lower + Core", focus: "Variation A" },
      { dayNumber: 3, title: "Upper Body", focus: "Vertical/Back Focus" },
      { dayNumber: 4, title: "Lower + Core", focus: "Variation B" },
      { dayNumber: 5, title: "Full-Body", focus: "Pump + Core" },
    ];

    const exercisesData = [
      // Day 1 - Upper (horizontal focus)
      { workoutDayId: "", name: "Dumbbell Bench Press", sets: 4, reps: "6-10", rpe: "RPE 7-8", progressionRule: "When all 4 sets hit 10 reps for 2 workouts → +5 lb per dumbbell", videoUrl: "https://www.youtube.com/shorts/8RGZJKLcATU", order: 1, currentWeight: "45 lb" },
      { workoutDayId: "", name: "One-Arm Dumbbell Row (each side)", sets: 3, reps: "8-12", rpe: "RPE 7-8", progressionRule: "Top of range for 2 workouts → +5 lb per dumbbell", videoUrl: "https://www.youtube.com/shorts/haDEmdUKfrs", order: 2, currentWeight: "40 lb" },
      { workoutDayId: "", name: "Seated Dumbbell Shoulder Press", sets: 3, reps: "8-12", rpe: "RPE 7-8", progressionRule: "When all sets hit 12 reps → +2.5 lb per dumbbell", videoUrl: "https://www.youtube.com/shorts/E9ShwbwZ1zw", order: 3, currentWeight: "30 lb" },
      { workoutDayId: "", name: "Cable Chest Fly (mid height)", sets: 3, reps: "12-15", rpe: "RPE ~8", progressionRule: "When all sets reach 15 reps → next cable plate (~5 lb)", videoUrl: "https://www.youtube.com/shorts/xDVD1Cy3Nqs", order: 4, currentWeight: "25 lb" },
      { workoutDayId: "", name: "Face Pull (rope)", sets: 3, reps: "12-15", rpe: "RPE ~8", progressionRule: "When all sets hit 15 reps → next cable plate (~5 lb)", videoUrl: "https://www.youtube.com/shorts/Et3eTWO2kQE", order: 5, currentWeight: "20 lb" },
      { workoutDayId: "", name: "Dumbbell Preacher Curl", sets: 3, reps: "10-15", rpe: "RPE 7-8", progressionRule: "When you get 15 reps on all sets → +2.5-5 lb per dumbbell", videoUrl: "https://www.youtube.com/shorts/54kF4fR-ObE", order: 6, currentWeight: "25 lb" },
      { workoutDayId: "", name: "Cable Triceps Pushdown (rope)", sets: 3, reps: "10-15", rpe: "RPE 7-8", progressionRule: "When you reach 15 reps on all sets → next cable plate (~5 lb)", videoUrl: "https://www.youtube.com/shorts/Hn7An4PDLYQ", order: 7, currentWeight: "30 lb" },
      { workoutDayId: "", name: "Cable Crunch (abs)", sets: 3, reps: "12-15", rpe: "RPE 7-8", progressionRule: "When you hit 15 reps comfortably → next cable plate (~5 lb)", videoUrl: "https://www.youtube.com/shorts/dkGwcfo9zto", order: 8, currentWeight: "15 lb" },
      
      // Day 2 - Lower + Core (A)
      { workoutDayId: "", name: "Goblet Squat", sets: 4, reps: "8-12", rpe: "RPE 7-8", progressionRule: "When all sets reach 12 reps twice → +5 lb (next dumbbell/plate)", videoUrl: "https://www.youtube.com/shorts/EUrU0HcPkQ8", order: 1, currentWeight: "50 lb" },
      { workoutDayId: "", name: "Dumbbell Romanian Deadlift", sets: 3, reps: "8-12", rpe: "RPE 7-8", progressionRule: "When all sets reach 12 reps twice → +5-10 lb total", videoUrl: "https://www.youtube.com/shorts/uYIlkIHksyk", order: 2, currentWeight: "60 lb" },
      { workoutDayId: "", name: "Bulgarian Split Squat (each leg)", sets: 3, reps: "8-12", rpe: "RPE 7-8", progressionRule: "When all sets reach 12 reps → +5 lb per dumbbell", videoUrl: "https://www.youtube.com/shorts/Us52wOAui2Q", order: 3, currentWeight: "35 lb" },
      { workoutDayId: "", name: "Leg Extension (bench attachment)", sets: 3, reps: "12-15", rpe: "RPE ~8", progressionRule: "When sets hit 15 reps → next plate (~5 lb)", videoUrl: "https://www.youtube.com/shorts/dNMUtQ6Fy4U", order: 4, currentWeight: "45 lb" },
      { workoutDayId: "", name: "Lying Leg Curl (bench attachment)", sets: 3, reps: "12-15", rpe: "RPE ~8", progressionRule: "When sets hit 15 reps → next plate (~5 lb)", videoUrl: "https://www.youtube.com/shorts/d6sg829PgNs", order: 5, currentWeight: "40 lb" },
      { workoutDayId: "", name: "Standing Calf Raise (dumbbells)", sets: 3, reps: "12-20", rpe: "RPE ~8", progressionRule: "When sets hit 20 reps → +5 lb per dumbbell", videoUrl: "https://www.youtube.com/shorts/PQ-F5uzxipQ", order: 6, currentWeight: "45 lb" },
      { workoutDayId: "", name: "Reverse Crunch on Bench (abs)", sets: 3, reps: "12-15", rpe: "Bodyweight", progressionRule: "When 3x15 is easy → add reps up to 20 or hold a light (5 lb) plate between knees", videoUrl: "https://www.youtube.com/shorts/eAdyaHlaCiU", order: 7, currentWeight: "Bodyweight" },
      
      // Day 3 - Upper (vertical/back focus)
      { workoutDayId: "", name: "Lat Pulldown (cable)", sets: 4, reps: "8-12", rpe: "RPE 7-8", progressionRule: "When all sets hit 12 reps → next cable plate (~5 lb)", videoUrl: "https://www.youtube.com/shorts/EoWI90clb-0", order: 1, currentWeight: "80 lb" },
      { workoutDayId: "", name: "Incline Dumbbell Bench Press", sets: 3, reps: "8-12", rpe: "RPE 7-8", progressionRule: "When all sets hit 12 reps → +5 lb per dumbbell", videoUrl: "https://www.youtube.com/watch?v=PZecKOpWOrk", order: 2, currentWeight: "40 lb" },
      { workoutDayId: "", name: "Seated Cable Row (close/neutral grip)", sets: 3, reps: "8-12", rpe: "RPE 7-8", progressionRule: "When all sets hit 12 reps → next cable plate (~5 lb)", videoUrl: "https://www.youtube.com/shorts/lOetNpBFChY", order: 3, currentWeight: "70 lb" },
      { workoutDayId: "", name: "Dumbbell Lateral Raise", sets: 3, reps: "12-15", rpe: "RPE ~8", progressionRule: "When all sets hit 15 reps → +2.5 lb per dumbbell", videoUrl: "https://www.youtube.com/shorts/O1VrfbSFYLA", order: 4, currentWeight: "20 lb" },
      { workoutDayId: "", name: "Hammer Curl (dumbbells)", sets: 3, reps: "10-15", rpe: "RPE 7-8", progressionRule: "When all sets hit 15 reps → +2.5-5 lb per dumbbell", videoUrl: "https://www.youtube.com/watch?v=wzQFTrlcDlg", order: 5, currentWeight: "25 lb" },
      { workoutDayId: "", name: "Overhead Rope Triceps Extension", sets: 3, reps: "10-15", rpe: "RPE 7-8", progressionRule: "When sets hit 15 reps → next cable plate (~5 lb)", videoUrl: "https://www.youtube.com/shorts/8dV3ZHUdPW0", order: 6, currentWeight: "35 lb" },
      { workoutDayId: "", name: "Pallof Press (anti-rotation, each side)", sets: 3, reps: "10-12/side", rpe: "RPE ~8", progressionRule: "When all sets hit 12/side → next cable plate (~5 lb)", videoUrl: "https://www.youtube.com/shorts/IgQE_DKZEIc", order: 7, currentWeight: "15 lb" },
      
      // Day 4 - Lower + Core (B)
      { workoutDayId: "", name: "Dumbbell Hip Thrust", sets: 4, reps: "8-12", rpe: "RPE 7-8", progressionRule: "When all sets hit 12 reps → +10 lb total", videoUrl: "https://www.youtube.com/shorts/QqtLsnNthbA", order: 1, currentWeight: "80 lb" },
      { workoutDayId: "", name: "Cyclist Squat (heels elevated, goblet)", sets: 3, reps: "10-15", rpe: "RPE ~8", progressionRule: "When sets hit 15 reps → +5 lb", videoUrl: "https://www.youtube.com/shorts/US8zFTTV2bY", order: 2, currentWeight: "40 lb" },
      { workoutDayId: "", name: "Step-Up (dumbbells, each leg)", sets: 3, reps: "8-12/leg", rpe: "RPE 7-8", progressionRule: "When sets hit 12/leg → +5 lb per dumbbell", videoUrl: "https://www.youtube.com/shorts/CYQ0qNAXDOM", order: 3, currentWeight: "30 lb" },
      { workoutDayId: "", name: "Single-Leg Romanian Deadlift (dumbbell)", sets: 3, reps: "8-12/leg", rpe: "RPE 7-8", progressionRule: "When sets hit 12/leg → +5 lb per dumbbell", videoUrl: "https://www.youtube.com/shorts/8sFky7C7q2A", order: 4, currentWeight: "35 lb" },
      { workoutDayId: "", name: "Seated Calf Raise (dumbbell on knees)", sets: 3, reps: "12-20", rpe: "RPE ~8", progressionRule: "When sets hit 20 reps → +5-10 lb total", videoUrl: "https://www.youtube.com/shorts/Ii1Qo44GasM", order: 5, currentWeight: "50 lb" },
      { workoutDayId: "", name: "Forearm Plank", sets: 3, reps: "45-60 sec hold", rpe: "Bodyweight", progressionRule: "When 60s is easy → add +10-20 lb plate on back or progress to harder variation", videoUrl: "https://www.youtube.com/shorts/E-PBfoIMc-0", order: 6, currentWeight: "Bodyweight" },
      { workoutDayId: "", name: "Cable Woodchop (each side)", sets: 3, reps: "10-15/side", rpe: "RPE ~8", progressionRule: "When sets hit 15/side → next plate (~5 lb)", videoUrl: "https://www.youtube.com/shorts/p4vXA60_D6A", order: 7, currentWeight: "20 lb" },
      
      // Day 5 - Full-Body Pump + Core
      { workoutDayId: "", name: "Goblet Squat (moderate pace)", sets: 3, reps: "12-15", rpe: "RPE ~8", progressionRule: "When sets hit 15 reps → +5 lb", videoUrl: "https://www.youtube.com/shorts/EUrU0HcPkQ8", order: 1, currentWeight: "45 lb" },
      { workoutDayId: "", name: "Dumbbell Romanian Deadlift (moderate)", sets: 3, reps: "10-12", rpe: "RPE 7-8", progressionRule: "When sets hit 12 reps → +5-10 lb total", videoUrl: "https://www.youtube.com/shorts/uYIlkIHksyk", order: 2, currentWeight: "55 lb" },
      { workoutDayId: "", name: "Single-Arm Cable Row (each side)", sets: 3, reps: "8-12/side", rpe: "RPE 7-8", progressionRule: "When sets hit 12/side → next cable plate (~5 lb)", videoUrl: "https://www.youtube.com/shorts/1CV_vvYBEbA", order: 3, currentWeight: "35 lb" },
      { workoutDayId: "", name: "Cable Lateral Raise", sets: 3, reps: "12-15", rpe: "RPE ~8", progressionRule: "When sets hit 15 reps → next plate (~5 lb)", videoUrl: "https://www.youtube.com/shorts/HCfU6LGpgMk", order: 4, currentWeight: "15 lb" },
      { workoutDayId: "", name: "Alternating Dumbbell Curl", sets: 3, reps: "10-15/arm", rpe: "RPE 7-8", progressionRule: "When sets hit 15/arm → +2.5-5 lb per dumbbell", videoUrl: "https://www.youtube.com/shorts/FHY_2t7R714", order: 5, currentWeight: "25 lb" },
      { workoutDayId: "", name: "Cable Triceps Pushdown", sets: 3, reps: "10-15", rpe: "RPE 7-8", progressionRule: "When sets hit 15 reps → next plate (~5 lb)", videoUrl: "https://www.youtube.com/shorts/1FjkhpZsaxc", order: 6, currentWeight: "30 lb" },
      { workoutDayId: "", name: "Weighted Decline Crunch", sets: 3, reps: "10-15", rpe: "RPE ~8", progressionRule: "When sets hit 15 reps → +2.5-5 lb", videoUrl: "https://www.youtube.com/shorts/T24Vji_gEaQ", order: 7, currentWeight: "10 lb" },
    ];

    // Create workout days
    workoutDaysData.forEach(dayData => {
      const id = randomUUID();
      const workoutDay: WorkoutDay = { ...dayData, id };
      this.workoutDays.set(id, workoutDay);
    });

    // Create exercises and assign to workout days
    const workoutDayIds = Array.from(this.workoutDays.keys());
    let exerciseIndex = 0;
    
    // Day 1: 8 exercises
    for (let i = 0; i < 8; i++) {
      const id = randomUUID();
      const exercise: Exercise = {
        ...exercisesData[exerciseIndex],
        id,
        workoutDayId: workoutDayIds[0],
        completedSets: [],
        currentReps: [8, 8, 8, 8].slice(0, exercisesData[exerciseIndex].sets), // Default to 8 reps for each set
        currentWeight: exercisesData[exerciseIndex].currentWeight || null
      };
      this.exercises.set(id, exercise);
      exerciseIndex++;
    }
    
    // Day 2: 7 exercises
    for (let i = 0; i < 7; i++) {
      const id = randomUUID();
      const exercise: Exercise = {
        ...exercisesData[exerciseIndex],
        id,
        workoutDayId: workoutDayIds[1],
        completedSets: [],
        currentReps: [10, 10, 10, 10].slice(0, exercisesData[exerciseIndex].sets), // Default to 10 reps for each set
        currentWeight: exercisesData[exerciseIndex].currentWeight || null
      };
      this.exercises.set(id, exercise);
      exerciseIndex++;
    }
    
    // Day 3: 7 exercises
    for (let i = 0; i < 7; i++) {
      const id = randomUUID();
      const exercise: Exercise = {
        ...exercisesData[exerciseIndex],
        id,
        workoutDayId: workoutDayIds[2],
        completedSets: [],
        currentReps: [10, 10, 10, 10].slice(0, exercisesData[exerciseIndex].sets), // Default to 10 reps for each set
        currentWeight: exercisesData[exerciseIndex].currentWeight || null
      };
      this.exercises.set(id, exercise);
      exerciseIndex++;
    }
    
    // Day 4: 7 exercises
    for (let i = 0; i < 7; i++) {
      const id = randomUUID();
      const exercise: Exercise = {
        ...exercisesData[exerciseIndex],
        id,
        workoutDayId: workoutDayIds[3],
        completedSets: [],
        currentReps: [10, 10, 10, 10].slice(0, exercisesData[exerciseIndex].sets), // Default to 10 reps for each set
        currentWeight: exercisesData[exerciseIndex].currentWeight || null
      };
      this.exercises.set(id, exercise);
      exerciseIndex++;
    }
    
    // Day 5: 7 exercises
    for (let i = 0; i < 7; i++) {
      const id = randomUUID();
      const exercise: Exercise = {
        ...exercisesData[exerciseIndex],
        id,
        workoutDayId: workoutDayIds[4],
        completedSets: [],
        currentReps: [12, 12, 12, 12].slice(0, exercisesData[exerciseIndex].sets), // Default to 12 reps for each set
        currentWeight: exercisesData[exerciseIndex].currentWeight || null
      };
      this.exercises.set(id, exercise);
      exerciseIndex++;
    }
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
