import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../lib/api-client";
import { getUserProfile, getUserAuth, saveUserAuth } from "../lib/storage";

export const useRegister = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userData) => {
      try {
        const response = await apiClient.post("/users/register", userData);
        return response.data;
      } catch (error) {
        // Fallback for Demo/Dev mode if backend is unreachable or failing
        const isNetworkError = !error.response;
        const isServerError = error.response?.status >= 500;

        if (isNetworkError || isServerError) {
          console.warn(
            `Backend ${isNetworkError ? "unreachable" : "failing"}, using local storage fallback for registration.`,
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
      const user = data.data?.user || data.user;
      if (user) {
        saveUserAuth(user);
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
        // Fallback for Demo/Dev mode if backend is unreachable or failing
        const isNetworkError = !error.response;
        const isServerError = error.response?.status >= 500;

        if (isNetworkError || isServerError) {
          console.warn(
            `Backend ${isNetworkError ? "unreachable" : "failing"}, using local storage fallback for login.`,
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
              user: {
                email: credentials.email,
                name: "Demo User",
                isFirstLogin: true,
              },
              accessToken: "demo-token",
            },
          };
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      const user = data.data?.user || data.user;

      if (user) {
        saveUserAuth(user);
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
        const response = await apiClient.get("/users/me");

        // Our API structure: { status: 'success', data: { user: ... } }
        const backendUser = response.data?.data?.user || response.data?.user;

        if (backendUser) {
          // Keep localStorage in sync with backend
          saveUserAuth(backendUser);
          return backendUser;
        }

        // Backend returned no user — try localStorage fallback
        const localUser = getUserAuth();
        if (localUser) {
          console.warn(
            "Backend returned no user, using localStorage fallback.",
          );
          return localUser;
        }

        return null;
      } catch (error) {
        // On 401, check if we have a locally saved session (e.g. demo/offline mode)
        if (error.response?.status === 401) {
          const localUser = getUserAuth();
          if (localUser) {
            console.warn("Backend returned 401, using localStorage fallback.");
            return localUser;
          }
          return null;
        }

        // Network error or server error — fall back to localStorage
        console.warn(
          "Backend profile fetch failed, using localStorage fallback.",
          error.message,
        );
        const localUser = getUserAuth();
        if (localUser) {
          return localUser;
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
