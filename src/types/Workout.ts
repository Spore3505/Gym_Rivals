import { WorkoutExercise } from "./WorkoutExercise";

export type Workout = {
  id: string;
  date: string;
  exercises: WorkoutExercise[];
};
