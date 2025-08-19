import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import type { Exercise } from "@shared/schema";

interface ExerciseCardProps {
  exercise: Exercise;
  editMode: boolean;
  onUpdate: (exerciseId: string, updates: Partial<Exercise>) => void;
}

export function ExerciseCard({ exercise, editMode, onUpdate }: ExerciseCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [localExercise, setLocalExercise] = useState(exercise);

  const handleInputChange = (field: keyof Exercise, value: any) => {
    const updated = { ...localExercise, [field]: value };
    setLocalExercise(updated);
    onUpdate(exercise.id, { [field]: value });
  };

  const handleSetComplete = (setIndex: number, reps: number) => {
    const completedSets = [...(localExercise.completedSets as any[] || [])];
    completedSets[setIndex] = { reps };
    handleInputChange('completedSets', completedSets);
  };

  const handleCurrentRepsChange = (setIndex: number, reps: number) => {
    const currentReps = [...(localExercise.currentReps as any[] || [])];
    currentReps[setIndex] = reps;
    handleInputChange('currentReps', currentReps);
  };

  const handleWeightChange = (weight: string) => {
    handleInputChange('currentWeight', weight);
  };

  const getMuscleGroupBadges = (exerciseName: string) => {
    const name = exerciseName.toLowerCase();
    const badges = [];

    if (name.includes('bench') || name.includes('chest') || name.includes('fly')) {
      badges.push({ label: 'Chest', color: 'bg-blue-600' });
    }
    if (name.includes('row') || name.includes('pulldown') || name.includes('lat')) {
      badges.push({ label: 'Back', color: 'bg-purple-600' });
    }
    if (name.includes('shoulder') || name.includes('lateral') || name.includes('face pull')) {
      badges.push({ label: 'Shoulders', color: 'bg-pink-600' });
    }
    if (name.includes('curl') || name.includes('bicep')) {
      badges.push({ label: 'Biceps', color: 'bg-indigo-600' });
    }
    if (name.includes('tricep') || name.includes('pushdown') || name.includes('extension')) {
      badges.push({ label: 'Triceps', color: 'bg-cyan-600' });
    }
    if (name.includes('squat') || name.includes('lunge') || name.includes('leg')) {
      badges.push({ label: 'Legs', color: 'bg-green-600' });
    }
    if (name.includes('calf') || name.includes('calves')) {
      badges.push({ label: 'Calves', color: 'bg-orange-600' });
    }
    if (name.includes('crunch') || name.includes('abs') || name.includes('plank')) {
      badges.push({ label: 'Abs', color: 'bg-yellow-600' });
    }

    // Exercise type
    const isCompound = name.includes('squat') || name.includes('deadlift') || 
                      name.includes('bench') || name.includes('row') || 
                      name.includes('pulldown') || name.includes('press');
    
    badges.push({ 
      label: isCompound ? 'Compound' : 'Isolation', 
      color: isCompound ? 'bg-accent-green' : 'bg-red-500' 
    });

    return badges;
  };

  const badges = getMuscleGroupBadges(exercise.name);

  return (
    <Card className="exercise-card bg-primary-800 rounded-xl border border-gray-700 overflow-hidden hover:border-accent-blue transition-colors" data-testid={`exercise-card-${exercise.id}`}>
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h4 className="text-xl font-semibold text-white mb-2" data-testid={`exercise-name-${exercise.id}`}>
              {exercise.name}
            </h4>
            <div className="flex flex-wrap gap-2 mb-3">
              {badges.map((badge, index) => (
                <Badge key={index} className={`${badge.color} text-white px-3 py-1 rounded-full text-sm font-medium`}>
                  {badge.label}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              data-testid={`toggle-details-${exercise.id}`}
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              data-testid={`video-link-${exercise.id}`}
            >
              <a href={exercise.videoUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-accent-blue" data-testid={`exercise-sets-${exercise.id}`}>
              {localExercise.sets}
            </div>
            <div className="text-sm text-gray-400">Sets</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent-green" data-testid={`exercise-reps-${exercise.id}`}>
              {localExercise.reps}
            </div>
            <div className="text-sm text-gray-400">Reps</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400" data-testid={`exercise-rpe-${exercise.id}`}>
              {localExercise.rpe}
            </div>
            <div className="text-sm text-gray-400">Intensity</div>
          </div>
        </div>

        {/* Current Settings Summary */}
        <div className="bg-primary-900 p-3 rounded-lg mb-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Current Weight:</span>
            <span className="text-accent-blue font-medium">
              {localExercise.currentWeight || 'Not set'}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm mt-1">
            <span className="text-gray-400">Target Reps:</span>
            <span className="text-accent-green font-medium">
              {Array.from({ length: localExercise.sets }, (_, i) => 
                (localExercise.currentReps as any[])?.[i] || '?'
              ).join(' • ')}
            </span>
          </div>
          {/* Rep Range Warning */}
          {localExercise.currentReps && localExercise.currentReps.length > 0 && (
            <div className="mt-2 text-xs">
              {(() => {
                const targetRange = localExercise.reps;
                const currentReps = localExercise.currentReps as number[];
                const avgReps = currentReps.reduce((a, b) => a + b, 0) / currentReps.length;
                
                if (targetRange.includes('-')) {
                  const [min, max] = targetRange.split('-').map(n => parseInt(n));
                  if (avgReps < min || avgReps > max) {
                    return (
                      <span className="text-yellow-400">
                        ⚠️ Average reps ({avgReps.toFixed(0)}) outside target range ({targetRange})
                      </span>
                    );
                  }
                }
                return (
                  <span className="text-green-400">
                    ✓ Reps within target range ({targetRange})
                  </span>
                );
              })()}
            </div>
          )}
        </div>

        {/* Expandable Details */}
        {expanded && (
          <div className="exercise-details border-t border-gray-600 pt-4" data-testid={`exercise-details-${exercise.id}`}>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-semibold mb-3 text-accent-blue">Current Settings</h5>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-sm text-gray-300">Sets:</label>
                    <Input
                      type="number"
                      value={localExercise.sets}
                      onChange={(e) => handleInputChange('sets', parseInt(e.target.value))}
                      disabled={!editMode}
                      className="bg-primary-900 text-white px-3 py-1 rounded border border-gray-600 focus:border-accent-blue w-20 text-center"
                      data-testid={`sets-input-${exercise.id}`}
                    />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <label className="text-sm text-gray-300">Rep Range:</label>
                    <Input
                      type="text"
                      value={localExercise.reps}
                      onChange={(e) => handleInputChange('reps', e.target.value)}
                      disabled={!editMode}
                      className="bg-primary-900 text-white px-3 py-1 rounded border border-gray-600 focus:border-accent-blue w-20 text-center"
                      data-testid={`reps-input-${exercise.id}`}
                    />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <label className="text-sm text-gray-300">Current Weight (all sets):</label>
                    <Input
                      type="text"
                      value={localExercise.currentWeight || ''}
                      onChange={(e) => handleWeightChange(e.target.value)}
                      placeholder="Add weight"
                      disabled={!editMode}
                      className="bg-primary-900 text-white px-3 py-1 rounded border border-gray-600 focus:border-accent-blue w-24 text-center"
                      data-testid={`weight-input-${exercise.id}`}
                    />
                  </div>

                  {/* Quick Weight Presets */}
                  {editMode && (
                    <div className="mt-3">
                      <label className="text-xs text-gray-400 block mb-2">Quick Weight Update:</label>
                      <div className="flex flex-wrap gap-2">
                        {['Bodyweight', '25 lb', '30 lb', '35 lb', '40 lb', '45 lb', '50 lb', '55 lb', '60 lb', '65 lb', '70 lb', '75 lb', '80 lb'].map((weight) => (
                          <button
                            key={weight}
                            onClick={() => handleWeightChange(weight)}
                            className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded border border-gray-600 text-gray-300 hover:text-white transition-colors"
                          >
                            {weight}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick Reps Presets */}
                  {editMode && (
                    <div className="mt-3">
                      <label className="text-xs text-gray-400 block mb-2">Quick Reps Update (all sets):</label>
                      <div className="flex flex-wrap gap-2">
                        {[6, 8, 10, 12, 15, 20].map((reps) => (
                          <button
                            key={reps}
                            onClick={() => {
                              const newReps = Array(localExercise.sets).fill(reps);
                              handleInputChange('currentReps', newReps);
                            }}
                            className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded border border-gray-600 text-gray-300 hover:text-white transition-colors"
                          >
                            {reps} reps
                          </button>
                        ))}
                      </div>
                      <div className="mt-2">
                        <button
                          onClick={() => {
                            const targetRange = localExercise.reps;
                            if (targetRange.includes('-')) {
                              const [min, max] = targetRange.split('-').map(n => parseInt(n));
                              const targetReps = Math.round((min + max) / 2);
                              const newReps = Array(localExercise.sets).fill(targetReps);
                              handleInputChange('currentReps', newReps);
                            }
                          }}
                          className="px-2 py-1 text-xs bg-green-600 hover:bg-green-700 rounded border border-green-500 text-white transition-colors"
                          title="Set reps to middle of target range"
                        >
                          🎯 Use Target Range
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Copy Weight Button */}
                  {editMode && localExercise.currentWeight && (
                    <div className="mt-3">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(localExercise.currentWeight || '');
                          // You could add a toast notification here
                        }}
                        className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded border border-blue-500 text-white transition-colors"
                        title="Copy weight to clipboard"
                      >
                        📋 Copy Weight
                      </button>
                    </div>
                  )}

                  {/* Reset Workout Button */}
                  {editMode && (
                    <div className="mt-3">
                      <button
                        onClick={() => {
                          if (confirm('Reset all reps for this exercise? This will clear current and completed reps.')) {
                            handleInputChange('currentReps', []);
                            handleInputChange('completedSets', []);
                          }
                        }}
                        className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 rounded border border-red-500 text-white transition-colors"
                        title="Reset all reps for fresh workout"
                      >
                        🔄 Reset Workout
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h5 className="font-semibold mb-3 text-accent-green">Progression Guide</h5>
                <div className="bg-primary-900 p-3 rounded-lg">
                  <p className="text-sm text-gray-300" data-testid={`progression-rule-${exercise.id}`}>
                    {exercise.progressionRule}
                  </p>
                </div>
                
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Last workout:</span>
                    <span className="text-accent-green" data-testid={`last-workout-${exercise.id}`}>
                      {exercise.lastWorkout || 'No data'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Progress:</span>
                    <span className="text-yellow-400" data-testid={`progress-status-${exercise.id}`}>
                      Ready to progress
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Workout Log */}
            <div className="mt-6">
              <h5 className="font-semibold mb-3 text-white">Today's Workout</h5>
              <div className="bg-primary-900 p-3 rounded-lg mb-4">
                <p className="text-xs text-gray-300">
                  <strong>Current Reps:</strong> Your target reps for each set • <strong>Completed Reps:</strong> What you actually completed
                </p>
              </div>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {Array.from({ length: localExercise.sets }, (_, setIndex) => (
                  <div key={setIndex} className="text-center">
                    <div className="text-xs text-gray-400 mb-1">Set {setIndex + 1}</div>
                    <div className="space-y-2">
                      <Input
                        type="number"
                        placeholder="Current Reps"
                        value={(localExercise.currentReps as any[])?.[setIndex] || ''}
                        onChange={(e) => handleCurrentRepsChange(setIndex, parseInt(e.target.value) || 0)}
                        className="bg-primary-900 text-white px-2 py-1 rounded border border-gray-600 focus:border-accent-blue w-full text-center text-sm"
                        data-testid={`current-reps-input-${exercise.id}-${setIndex}`}
                      />
                      <Input
                        type="number"
                        placeholder="Completed Reps"
                        value={(localExercise.completedSets as any[])?.[setIndex]?.reps || ''}
                        onChange={(e) => handleSetComplete(setIndex, parseInt(e.target.value) || 0)}
                        className="bg-primary-900 text-white px-2 py-1 rounded border border-gray-600 focus:border-accent-green w-full text-center text-sm"
                        data-testid={`completed-reps-input-${exercise.id}-${setIndex}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-xs text-gray-400 text-center mt-2">
                Top: Current reps • Bottom: Completed reps
              </div>
            </div>

            {/* Workout Progress Summary */}
            <div className="mt-6 border-t border-gray-600 pt-4">
              <h5 className="font-semibold mb-3 text-white">Progress Summary</h5>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Sets Completed:</span>
                  <span className="ml-2 text-accent-green">
                    {(localExercise.completedSets as any[])?.filter(set => set?.reps > 0).length || 0} / {localExercise.sets}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Total Reps:</span>
                  <span className="ml-2 text-accent-blue">
                    {(localExercise.completedSets as any[])?.reduce((total, set) => total + (set?.reps || 0), 0) || 0}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Weight Used:</span>
                  <span className="ml-2 text-yellow-400">
                    {localExercise.currentWeight || 'Not set'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Last Workout:</span>
                  <span className="ml-2 text-gray-300">
                    {localExercise.lastWorkout || 'No data'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
