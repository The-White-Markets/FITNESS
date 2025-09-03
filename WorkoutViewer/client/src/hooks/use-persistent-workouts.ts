import { useEffect, useState } from 'react';
import type { WorkoutDayWithExercises } from '@shared/schema';

const STORAGE_KEY = 'workout-data';

export function usePersistentWorkouts() {
  const [workoutData, setWorkoutData] = useState<Record<string, WorkoutDayWithExercises>>({});

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setWorkoutData(parsed);
      }
    } catch (error) {
      console.warn('Failed to load workout data from localStorage:', error);
    }
  }, []);

  // Save data to localStorage whenever it changes
  const saveWorkoutData = (data: Record<string, WorkoutDayWithExercises>) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setWorkoutData(data);
    } catch (error) {
      console.warn('Failed to save workout data to localStorage:', error);
    }
  };

  // Update a specific workout day
  const updateWorkoutDay = (workoutDayId: string, updatedWorkoutDay: WorkoutDayWithExercises) => {
    const newData = { ...workoutData, [workoutDayId]: updatedWorkoutDay };
    saveWorkoutData(newData);
  };

  // Update a specific exercise
  const updateExercise = (workoutDayId: string, exerciseId: string, updatedExercise: any) => {
    const workoutDay = workoutData[workoutDayId];
    if (!workoutDay) return;

    const updatedExercises = workoutDay.exercises.map(exercise => 
      exercise.id === exerciseId ? { ...exercise, ...updatedExercise } : exercise
    );

    const updatedWorkoutDay = {
      ...workoutDay,
      exercises: updatedExercises
    };

    updateWorkoutDay(workoutDayId, updatedWorkoutDay);
  };

  return {
    workoutData,
    updateWorkoutDay,
    updateExercise,
    saveWorkoutData
  };
}