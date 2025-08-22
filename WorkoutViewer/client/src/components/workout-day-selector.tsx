import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { WorkoutDay } from "@shared/schema";

interface WorkoutDaySelectorProps {
  workoutDays: WorkoutDay[];
  selectedWorkoutDayId: string;
  onSelectWorkoutDay: (id: string) => void;
}

export function WorkoutDaySelector({ workoutDays, selectedWorkoutDayId, onSelectWorkoutDay }: WorkoutDaySelectorProps) {
  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
      {workoutDays.map((day) => {
        const isSelected = day.id === selectedWorkoutDayId;
        
        return (
          <Card
            key={day.id}
            className={`bg-primary-800 rounded-xl p-3 sm:p-4 lg:p-6 cursor-pointer border-2 transition-all duration-300 transform hover:scale-105 ${
              isSelected 
                ? 'border-accent-blue bg-primary-700' 
                : 'border-transparent hover:border-accent-blue'
            }`}
            onClick={() => onSelectWorkoutDay(day.id)}
            data-testid={`workout-day-${day.dayNumber}`}
          >
            <div className="text-center">
              <div className={`p-2 sm:p-3 rounded-full w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center ${
                isSelected ? 'bg-accent-blue' : 'bg-gray-600'
              }`}>
                <span className="text-lg sm:text-xl font-bold">{day.dayNumber}</span>
              </div>
              <h3 className="font-semibold text-sm sm:text-base lg:text-lg mb-2 text-white" data-testid={`day-title-${day.dayNumber}`}>{day.title}</h3>
              <p className="text-gray-400 text-xs sm:text-sm mb-2 sm:mb-3" data-testid={`day-focus-${day.dayNumber}`}>{day.focus}</p>
              <div className="flex justify-center">
                <Badge className="bg-accent-green text-white text-xs px-2 py-1" data-testid={`day-exercise-count-${day.dayNumber}`}>
                  {getExerciseCount(day.dayNumber)} exercises
                </Badge>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function getExerciseCount(dayNumber: number): number {
  // Based on the new CSV data structure
  switch (dayNumber) {
    case 1: return 5; // Push Day - 5 exercises
    case 2: return 4; // Pull Day - 4 exercises
    case 3: return 4; // Core Day - 4 exercises
    case 4: return 5; // Upper Body - 5 exercises
    case 5: return 5; // Lower Body - 5 exercises
    default: return 0;
  }
}
