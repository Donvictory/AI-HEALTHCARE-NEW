import { useMutation } from "@tanstack/react-query";
import apiClient from "../lib/api-client";

/**
 * useAskCompanion — sends a user message to the backend AI health companion.
 * Returns: { data: { reply: string }, mutate, isPending }
 */
export const useAskCompanion = () => {
  return useMutation({
    mutationFn: async (message) => {
      const response = await apiClient.post("/chat", { message });
      // Response shape: { status, data: { reply } }
      return response.data?.data?.reply || response.data?.reply || "";
    },
  });
};
