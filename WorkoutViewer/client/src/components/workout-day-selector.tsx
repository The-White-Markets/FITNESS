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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {workoutDays.map((day) => {
        const isSelected = day.id === selectedWorkoutDayId;
        
        return (
          <Card
            key={day.id}
            className={`bg-primary-800 rounded-xl p-6 cursor-pointer border-2 transition-all duration-300 transform hover:scale-105 ${
              isSelected 
                ? 'border-accent-blue bg-primary-700' 
                : 'border-transparent hover:border-accent-blue'
            }`}
            onClick={() => onSelectWorkoutDay(day.id)}
            data-testid={`workout-day-${day.dayNumber}`}
          >
            <div className="text-center">
              <div className={`p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center ${
                isSelected ? 'bg-accent-blue' : 'bg-gray-600'
              }`}>
                <span className="text-xl font-bold">{day.dayNumber}</span>
              </div>
              <h3 className="font-semibold text-lg mb-2 text-white" data-testid={`day-title-${day.dayNumber}`}>{day.title}</h3>
              <p className="text-gray-400 text-sm" data-testid={`day-focus-${day.dayNumber}`}>{day.focus}</p>
              <div className="mt-3 flex justify-center space-x-2">
                <Badge className="bg-accent-green text-white" data-testid={`day-exercise-count-${day.dayNumber}`}>
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
  // Based on the CSV data structure
  switch (dayNumber) {
    case 1: return 8;
    case 2: return 7;
    case 3: return 7;
    case 4: return 7;
    case 5: return 7;
    default: return 0;
  }
}
