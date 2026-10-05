import { WorkoutExercise } from "./WorkoutExercise";

export type Workout = {
  id: string;
  date: string;
  name?: string;
  duration: number;
  exercises: WorkoutExercise[];
};
