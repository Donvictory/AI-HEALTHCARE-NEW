import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../lib/api-client";
import { getUserProfile } from "../lib/storage";

import { saveUserAuth } from "../lib/storage";

export const useRegister = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userData) => {
      try {
        const response = await apiClient.post("/users/register", userData);
        return response.data;
      } catch (error) {
        // Fallback for Demo/Dev mode if backend is unreachable
        if (!error.response) {
          console.warn(
            "Backend unreachable, using local storage fallback for registration.",
          );
          return {
            status: "success",
            data: {
              user: { ...userData, id: `local-${Date.now()}` },
              accessToken: "demo-token",
            },
          };
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      const token = data.data?.accessToken || data.accessToken;
      const user = data.data?.user || data.user;
      if (token) {
        saveUserAuth({ token, ...user });
        queryClient.invalidateQueries(["me"]);
      }
    },
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (credentials) => {
      try {
        const response = await apiClient.post("/users/login", credentials);
        return response.data;
      } catch (error) {
        // Fallback for Demo/Dev mode if backend is unreachable
        if (!error.response) {
          console.warn(
            "Backend unreachable, using local storage fallback for login.",
          );
          const localProfile = getUserProfile();
          if (localProfile && localProfile.email === credentials.email) {
            return {
              status: "success",
              data: { user: localProfile, accessToken: "demo-token" },
            };
          }
          // If no local profile matches, still allow login for demo purposes with a generic user
          return {
            status: "success",
            data: {
              user: { email: credentials.email, name: "Demo User" },
              accessToken: "demo-token",
            },
          };
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      const token = data.data?.accessToken || data.accessToken;
      const user = data.data?.user || data.user;

      if (token) {
        localStorage.setItem("token", token);
        if (user) {
          saveUserAuth({ token, ...user });
        }
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
      const localProfile = getUserProfile();

      if (!token) return localProfile;

      try {
        const response = await apiClient.get("/users/me");
        const backendUser = response.data.data.user;

        // Merge or prefer backend data if it's more complete
        if (backendUser && backendUser.age) {
          return backendUser;
        }

        return localProfile || backendUser;
      } catch (error) {
        console.error("Backend profile fetch failed:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          return null;
        }
        // Fallback to local profile on network error
        return localProfile;
      }
    },
    retry: 1,
    staleTime: 1000 * 60 * 5,
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
