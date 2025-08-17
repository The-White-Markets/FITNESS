import type { Exercise, WorkoutDay } from "@shared/schema";

// Muscle group mappings for exercise categorization
export const MUSCLE_GROUP_MAPPINGS = {
  chest: ['bench', 'chest', 'fly', 'press'],
  back: ['row', 'pulldown', 'lat', 'pull'],
  shoulders: ['shoulder', 'lateral', 'face pull', 'press'],
  biceps: ['curl', 'bicep'],
  triceps: ['tricep', 'pushdown', 'extension'],
  legs: ['squat', 'lunge', 'leg', 'deadlift', 'thrust'],
  calves: ['calf', 'calves', 'raise'],
  abs: ['crunch', 'abs', 'plank', 'woodchop'],
  glutes: ['thrust', 'squat', 'lunge'],
  quads: ['squat', 'extension', 'lunge'],
  hamstrings: ['curl', 'deadlift', 'thrust']
};

// Exercise type classification
export const COMPOUND_EXERCISES = [
  'squat', 'deadlift', 'bench', 'row', 'pulldown', 'press', 'thrust'
];

// Color mappings for muscle group badges
export const MUSCLE_GROUP_COLORS = {
  chest: 'bg-blue-600',
  back: 'bg-purple-600',
  shoulders: 'bg-pink-600',
  biceps: 'bg-indigo-600',
  triceps: 'bg-cyan-600',
  legs: 'bg-green-600',
  calves: 'bg-orange-600',
  abs: 'bg-yellow-600',
  glutes: 'bg-red-600',
  quads: 'bg-emerald-600',
  hamstrings: 'bg-amber-600'
};

// RPE (Rate of Perceived Exertion) descriptions
export const RPE_DESCRIPTIONS = {
  'RPE 6': 'Easy - Could do many more reps',
  'RPE 7': 'Moderately hard - Could do 3-4 more reps',
  'RPE 8': 'Hard - Could do 2-3 more reps',
  'RPE 9': 'Very hard - Could do 1-2 more reps',
  'RPE 10': 'Maximum effort - Could not do another rep'
};

/**
 * Determines muscle groups targeted by an exercise based on its name
 */
export function getExerciseMuscleGroups(exerciseName: string): string[] {
  const name = exerciseName.toLowerCase();
  const muscleGroups: string[] = [];

  Object.entries(MUSCLE_GROUP_MAPPINGS).forEach(([muscle, keywords]) => {
    if (keywords.some(keyword => name.includes(keyword))) {
      muscleGroups.push(muscle);
    }
  });

  return muscleGroups;
}

/**
 * Determines if an exercise is compound or isolation
 */
export function getExerciseType(exerciseName: string): 'Compound' | 'Isolation' {
  const name = exerciseName.toLowerCase();
  const isCompound = COMPOUND_EXERCISES.some(keyword => name.includes(keyword));
  return isCompound ? 'Compound' : 'Isolation';
}

/**
 * Gets the appropriate color class for a muscle group
 */
export function getMuscleGroupColor(muscleGroup: string): string {
  return MUSCLE_GROUP_COLORS[muscleGroup as keyof typeof MUSCLE_GROUP_COLORS] || 'bg-gray-600';
}

/**
 * Calculates estimated workout duration based on number of exercises
 */
export function calculateWorkoutDuration(exercises: Exercise[]): { min: number; max: number } {
  const totalSets = exercises.reduce((sum, exercise) => sum + exercise.sets, 0);
  const baseTimePerSet = 2; // minutes (including rest)
  const setupTime = exercises.length * 1; // 1 minute setup per exercise
  
  const minDuration = Math.ceil(totalSets * baseTimePerSet + setupTime);
  const maxDuration = Math.ceil(minDuration * 1.3); // Add 30% buffer
  
  return { min: minDuration, max: maxDuration };
}

/**
 * Counts unique muscle groups in a workout day
 */
export function countUniqueMuscleGroups(exercises: Exercise[]): number {
  const allMuscleGroups = new Set<string>();
  
  exercises.forEach(exercise => {
    const muscleGroups = getExerciseMuscleGroups(exercise.name);
    muscleGroups.forEach(group => allMuscleGroups.add(group));
  });
  
  return allMuscleGroups.size;
}

/**
 * Parses RPE string to extract numeric value
 */
export function parseRPE(rpeString: string): number {
  const match = rpeString.match(/RPE\s*(\d+)/i);
  return match ? parseInt(match[1]) : 8; // Default to RPE 8 if not found
}

/**
 * Formats weight string for display
 */
export function formatWeight(weight: string | null | undefined): string {
  if (!weight || weight.trim() === '') {
    return 'Add weight';
  }
  return weight;
}

/**
 * Determines if an exercise is ready for progression based on completed sets
 */
export function isReadyForProgression(exercise: Exercise): boolean {
  const completedSets = exercise.completedSets as any[] || [];
  if (completedSets.length === 0) return false;
  
  // Simple logic: if all sets are at the top of the rep range
  const repRange = exercise.reps;
  const topRange = extractTopRepRange(repRange);
  
  return completedSets.every(set => set.reps >= topRange);
}

/**
 * Extracts the top number from a rep range (e.g., "8-12" -> 12)
 */
export function extractTopRepRange(repRange: string): number {
  const match = repRange.match(/(\d+)-(\d+)/);
  if (match) {
    return parseInt(match[2]);
  }
  
  // If it's just a single number
  const singleMatch = repRange.match(/(\d+)/);
  return singleMatch ? parseInt(singleMatch[1]) : 10;
}

/**
 * Extracts the bottom number from a rep range (e.g., "8-12" -> 8)
 */
export function extractBottomRepRange(repRange: string): number {
  const match = repRange.match(/(\d+)-(\d+)/);
  if (match) {
    return parseInt(match[1]);
  }
  
  // If it's just a single number
  const singleMatch = repRange.match(/(\d+)/);
  return singleMatch ? parseInt(singleMatch[1]) : 8;
}

/**
 * Gets progress status based on exercise completion
 */
export function getProgressStatus(exercise: Exercise): {
  status: 'ready' | 'in-progress' | 'maintain';
  message: string;
  color: string;
} {
  if (isReadyForProgression(exercise)) {
    return {
      status: 'ready',
      message: 'Ready to increase',
      color: 'text-accent-green'
    };
  }
  
  const completedSets = exercise.completedSets as any[] || [];
  if (completedSets.length > 0) {
    return {
      status: 'in-progress',
      message: 'Keep current weight',
      color: 'text-yellow-400'
    };
  }
  
  return {
    status: 'maintain',
    message: 'No data',
    color: 'text-gray-400'
  };
}

/**
 * Workout day titles for display
 */
export const WORKOUT_DAY_TITLES = {
  1: 'Upper Body (Horizontal Focus)',
  2: 'Lower + Core (Variation A)',
  3: 'Upper Body (Vertical/Back Focus)',
  4: 'Lower + Core (Variation B)',
  5: 'Full-Body Pump + Core'
};

/**
 * Gets the full title for a workout day
 */
export function getWorkoutDayTitle(dayNumber: number, title: string, focus: string): string {
  return `Day ${dayNumber} - ${title} (${focus})`;
}
