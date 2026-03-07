import { api } from "@/services/axios.config";

export async function getActiveCampuses() {
  const response = await api.get("/campuses");
  return response.data?.data?.campuses || [];
}
