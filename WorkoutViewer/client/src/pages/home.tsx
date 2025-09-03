import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { WorkoutDaySelector } from "@/components/workout-day-selector";
import { ExerciseList } from "@/components/exercise-list";
import { Dumbbell, Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { WorkoutDay } from "@shared/schema";

export default function Home() {
  const [selectedWorkoutDayId, setSelectedWorkoutDayId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: workoutDays, isLoading } = useQuery<WorkoutDay[]>({
    queryKey: ["/api/workout-days"],
  });

  // Auto-select first workout day when data loads
  if (workoutDays && workoutDays.length > 0 && !selectedWorkoutDayId) {
    setSelectedWorkoutDayId(workoutDays[0].id);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your workout plan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-primary-900 text-white min-h-screen font-sans">
      {/* Header */}
      <header className="bg-primary-800 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center py-3 sm:py-4 space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="bg-accent-blue p-2 rounded-lg">
                <Dumbbell className="text-white text-xl" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white" data-testid="app-title">The Best Workout Tracker</h1>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto justify-center sm:justify-end">
              {/* Search functionality - visible on all screen sizes */}
              <div className="relative flex-1 sm:flex-none max-w-xs sm:max-w-none">
                <Input
                  type="text"
                  placeholder="Search exercises..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-primary-900 text-white px-3 sm:px-4 py-2 pl-8 sm:pl-10 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent w-full sm:w-64 text-sm sm:text-base"
                  data-testid="search-input"
                />
                <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>
              
              <Button className="bg-accent-green hover:bg-green-600 p-2 rounded-lg transition-colors flex-shrink-0" data-testid="profile-button">
                <User className="text-white h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Workout Day Selector */}
        <section className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center" data-testid="workout-plan-title">Your 5-Day Workout Plan</h2>
          
          {workoutDays && (
            <WorkoutDaySelector
              workoutDays={workoutDays}
              selectedWorkoutDayId={selectedWorkoutDayId}
              onSelectWorkoutDay={setSelectedWorkoutDayId}
            />
          )}
        </section>

        {/* Exercise List */}
        {selectedWorkoutDayId && (
          <ExerciseList
            workoutDayId={selectedWorkoutDayId}
            searchQuery={searchQuery}
          />
        )}
      </main>
    </div>
  );
}
