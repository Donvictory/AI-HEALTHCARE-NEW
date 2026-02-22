import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../lib/api-client";
import {
  getUserProfile,
  getUserAuth,
  saveUserAuth,
  saveTokens,
  clearTokens,
} from "../lib/storage";

export const useRegister = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userData) => {
      const response = await apiClient.post("/users/register", userData);
      return response.data;
    },
    onSuccess: (data) => {
      const user = data.data?.user || data.user;
      const { accessToken, refreshToken } = data.data || data;

      if (user) {
        saveUserAuth(user);
        saveTokens(accessToken, refreshToken);
        queryClient.invalidateQueries(["me"]);
      }
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
      const user = data.data?.user || data.user;
      const { accessToken, refreshToken } = data.data || data;

      if (user) {
        saveUserAuth(user);
        saveTokens(accessToken, refreshToken);
        queryClient.invalidateQueries(["me"]);
      }
    },
  });
};

export const useMe = () => {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      try {
        console.log("useMe: calling /users/profile...");
        const response = await apiClient.get("/users/profile");
        console.log("useMe raw response:", response.data);

        const data = response.data?.data;
        let backendUser =
          data?.user || (response.data?.user ? response.data : null);

        // Final check: if /profile didn't return a user structure we expect, try /me
        if (!backendUser) {
          console.log("useMe: /profile didn't return user, trying /me...");
          const meResponse = await apiClient.get("/users/me");
          backendUser = meResponse.data?.data?.user || meResponse.data?.user;
        }

        if (backendUser) {
          console.log("useMe: final user identified", backendUser.email);
          const enrichedUser = {
            id: backendUser._id || backendUser.id,
            ...backendUser,
            ...data?.stats,
          };
          saveUserAuth(enrichedUser);
          return enrichedUser;
        }

        console.log("useMe: no user in response, checking local storage...");
        const localUser = getUserAuth();
        return localUser;
      } catch (error) {
        console.error(
          "useMe exception:",
          error.response?.status,
          error.message,
        );
        if (error.response?.status === 401) {
          clearTokens();
          return null;
        }
        return null;
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
      clearTokens();
      queryClient.setQueryData(["me"], null);
    },
  });
};

export const useOnboard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const response = await apiClient.post("/users/onboard", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["me"]);
    },
  });
};

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await apiClient.delete("/users/me");
    },
    onSuccess: () => {
      localStorage.clear();
      queryClient.setQueryData(["me"], null);
    },
  });
};
