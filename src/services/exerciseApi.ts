const API_URL = "https://exercise-api.com/v1";

export async function getExercises() {
  const response = await fetch(`${API_URL}/exercises?limit=200`);

  const data = await response.json();

  if (!response.ok) {
    console.log("STATUS:", response.status);
    console.log("API ERROR:", data);

    throw new Error(data?.error?.message || "Failed to fetch exercises");
  }

  return data.data;
}
