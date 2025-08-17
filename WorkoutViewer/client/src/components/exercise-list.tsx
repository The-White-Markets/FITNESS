import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ExerciseCard } from "@/components/exercise-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarDays, Edit, Save, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { WorkoutDayWithExercises, Exercise } from "@shared/schema";

interface ExerciseListProps {
  workoutDayId: string;
  searchQuery: string;
}

export function ExerciseList({ workoutDayId, searchQuery }: ExerciseListProps) {
  const [editMode, setEditMode] = useState(false);
  const [exerciseSearchQuery, setExerciseSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: workoutDay, isLoading } = useQuery<WorkoutDayWithExercises>({
    queryKey: ["/api/workout-days", workoutDayId],
  });

  const updateExerciseMutation = useMutation({
    mutationFn: async ({ exerciseId, updates }: { exerciseId: string; updates: Partial<Exercise> }) => {
      const response = await apiRequest("PATCH", `/api/exercises/${exerciseId}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workout-days", workoutDayId] });
      toast({
        title: "Exercise Updated",
        description: "Your exercise has been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update exercise. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-primary-800 rounded-xl p-6 animate-pulse">
            <div className="h-6 bg-gray-700 rounded mb-4 w-3/4"></div>
            <div className="h-4 bg-gray-700 rounded mb-2 w-1/2"></div>
            <div className="h-4 bg-gray-700 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!workoutDay) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Workout day not found.</p>
      </div>
    );
  }

  // Filter exercises based on search queries
  const filteredExercises = workoutDay.exercises.filter(exercise => {
    const matchesGlobalSearch = searchQuery === "" || 
      exercise.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocalSearch = exerciseSearchQuery === "" || 
      exercise.name.toLowerCase().includes(exerciseSearchQuery.toLowerCase());
    
    return matchesGlobalSearch && matchesLocalSearch;
  });

  const handleExerciseUpdate = (exerciseId: string, updates: Partial<Exercise>) => {
    updateExerciseMutation.mutate({ exerciseId, updates });
  };

  const handleSaveWorkout = () => {
    toast({
      title: "Workout Saved",
      description: "All changes have been saved successfully.",
    });
    setEditMode(false);
  };

  return (
    <section className="exercise-list">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold flex items-center" data-testid="selected-day-title">
          <CalendarDays className="text-accent-blue mr-3" />
          <span>Day {workoutDay.dayNumber} - {workoutDay.title} ({workoutDay.focus})</span>
        </h3>
        
        <div className="flex space-x-3">
          <Button 
            onClick={() => setEditMode(!editMode)}
            className="bg-accent-blue hover:bg-blue-600 transition-colors"
            data-testid="toggle-edit-mode"
          >
            <Edit className="mr-2 h-4 w-4" />
            {editMode ? "Exit Edit" : "Edit Workout"}
          </Button>
          
          <Button 
            onClick={handleSaveWorkout}
            className="bg-accent-green hover:bg-green-600 transition-colors"
            data-testid="save-workout"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Search bar for exercises */}
      <div className="relative mb-6 md:hidden">
        <Input
          type="text"
          placeholder="Search exercises in this day..."
          value={exerciseSearchQuery}
          onChange={(e) => setExerciseSearchQuery(e.target.value)}
          className="bg-primary-800 text-white px-4 py-3 pl-12 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent w-full"
          data-testid="exercise-search-input"
        />
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      </div>

      {/* Exercise Cards Grid */}
      <div className="grid gap-6">
        {filteredExercises.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400" data-testid="no-exercises-message">
              {searchQuery || exerciseSearchQuery ? "No exercises match your search." : "No exercises found for this day."}
            </p>
          </div>
        ) : (
          filteredExercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              editMode={editMode}
              onUpdate={handleExerciseUpdate}
            />
          ))
        )}
      </div>

      {/* Progress Summary */}
      <section className="mt-12 bg-primary-800 rounded-xl p-6" data-testid="progress-summary">
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <i className="fas fa-chart-line text-accent-green mr-3"></i>
          Workout Progress Summary
        </h3>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-accent-blue mb-2" data-testid="total-exercises">
              {workoutDay.exercises.length}
            </div>
            <div className="text-gray-400">Total Exercises</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-accent-green mb-2" data-testid="estimated-time">
              {getEstimatedTime(workoutDay.exercises.length)}
            </div>
            <div className="text-gray-400">Minutes</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-2" data-testid="muscle-groups">
              {getMuscleGroupCount(workoutDay)}
            </div>
            <div className="text-gray-400">Muscle Groups</div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-center">
          <Button 
            className="bg-accent-green hover:bg-green-600 px-8 py-3 text-lg font-semibold transition-colors"
            data-testid="start-workout"
          >
            <i className="fas fa-play mr-3"></i>
            Start Workout
          </Button>
        </div>
      </section>
    </section>
  );
}

function getEstimatedTime(exerciseCount: number): string {
  const baseTime = exerciseCount * 5; // 5 minutes per exercise
  const restTime = exerciseCount * 2; // 2 minutes rest between exercises
  const total = baseTime + restTime;
  return `${total}-${total + 15}`;
}

function getMuscleGroupCount(workoutDay: WorkoutDayWithExercises): number {
  // Simple estimation based on workout day focus
  if (workoutDay.focus.includes("Upper")) return 4;
  if (workoutDay.focus.includes("Lower")) return 3;
  if (workoutDay.focus.includes("Full-Body")) return 5;
  return 3;
}
