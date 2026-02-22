import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../lib/api-client";

export const useCreateDailyCheckIn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const response = await apiClient.post("/daily-check-ins", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["daily-check-ins"]);
      queryClient.invalidateQueries(["me"]);
    },
  });
};

export const useDailyCheckIns = () => {
  return useQuery({
    queryKey: ["daily-check-ins"],
    queryFn: async () => {
      const response = await apiClient.get("/daily-check-ins");
      return response.data.data.checkIns;
    },
  });
};

export const useTodayCheckIn = () => {
  return useQuery({
    queryKey: ["daily-check-ins", "today"],
    queryFn: async () => {
      const response = await apiClient.get("/daily-check-ins/today");
      return response.data.data.checkIn;
    },
  });
};
