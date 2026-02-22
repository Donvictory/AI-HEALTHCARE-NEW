import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../lib/api-client";

export const useRegister = () => {
  return useMutation({
    mutationFn: async (userData) => {
      const response = await apiClient.post("/users/register", userData);
      return response.data;
    },
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (credentials) => {
      const response = await apiClient.post("/users/login", credentials);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.token) {
        localStorage.setItem("token", data.token);
        queryClient.invalidateQueries(["me"]);
      }
    },
  });
};

export const useMe = () => {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      if (!token) return null;
      try {
        const response = await apiClient.get("/users/me");
        return response.data.data.user;
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          return null;
        }
        throw error;
      }
    },
    retry: false,
  });
};

export const useUpdateMe = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const response = await apiClient.patch("/users/me", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["me"]);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await apiClient.post("/users/logout");
    },
    onSettled: () => {
      localStorage.removeItem("token");
      queryClient.setQueryData(["me"], null);
    },
  });
};
