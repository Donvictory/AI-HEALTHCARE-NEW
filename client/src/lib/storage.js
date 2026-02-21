/**
 * LocalStorage wrapper for AI-HEALTHCARE persistence
 */

const STORAGE_KEYS = {
  AUTH: "auth_session",
  PROFILE: "user_profile",
  CHECK_INS: "daily_checkins",
  MESSAGES: "chat_history",
  TASKS: "health_tasks",
  POINTS: "user_points",
};

// --- AUTHENTICATION ---
export const saveUserAuth = (userData) => {
  localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(userData));
};

export const getUserAuth = () => {
  const data = localStorage.getItem(STORAGE_KEYS.AUTH);
  return data ? JSON.parse(data) : null;
};

export const isAuthenticated = () => {
  return !!getUserAuth();
};

export const logout = () => {
  localStorage.removeItem(STORAGE_KEYS.AUTH);
  window.location.href = "/login";
};

// --- PROFILE & ONBOARDING ---
export const saveUserProfile = (profile) => {
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
};

export const getUserProfile = () => {
  const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
  return data
    ? JSON.parse(data)
    : {
        name: "User",
        age: "",
        gender: "",
        weight: "",
        height: "",
        conditions: [],
      };
};

export const hasCompletedOnboarding = () => {
  const profile = getUserProfile();
  return !!(profile && profile.name && profile.gender);
};

export const calculateBMI = (weight, height) => {
  if (!weight || !height) return 0;
  const heightInMeters = height / 100;
  return Number((weight / (heightInMeters * heightInMeters)).toFixed(1));
};

// --- CHECK-INS ---
export const saveDailyCheckIn = (checkInData) => {
  const history = getDailyCheckIns();
  const today = new Date().toISOString().split("T")[0];
  const updated = history.filter((c) => c.date !== today);
  updated.push({ ...checkInData, date: today });
  localStorage.setItem(STORAGE_KEYS.CHECK_INS, JSON.stringify(updated));

  // Award points for check-in
  addPoints(10);
};

export const getDailyCheckIns = () => {
  const data = localStorage.getItem(STORAGE_KEYS.CHECK_INS);
  return data ? JSON.parse(data) : [];
};

export const getTodaysCheckIn = () => {
  const history = getDailyCheckIns();
  const today = new Date().toISOString().split("T")[0];
  return history.find((c) => c.date === today) || null;
};

export const getCheckInsLast7Days = () => {
  const history = getDailyCheckIns();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  return history.filter((c) => new Date(c.date) >= sevenDaysAgo);
};

// --- GAMIFICATION & POINTS ---
export const getPoints = () => {
  const data = localStorage.getItem(STORAGE_KEYS.POINTS);
  return data ? parseInt(data) : 0;
};

export const addPoints = (amount) => {
  const current = getPoints();
  localStorage.setItem(STORAGE_KEYS.POINTS, (current + amount).toString());
};

// --- TASKS ---
export const getHealthTasks = () => {
  const data = localStorage.getItem(STORAGE_KEYS.TASKS);
  if (data) return JSON.parse(data);

  // Default tasks if none exist
  const defaults = [
    { id: 1, title: "Drink 8 glasses of water", completed: false, points: 5 },
    { id: 2, title: "15-minute morning stretch", completed: false, points: 10 },
    { id: 3, title: "Record afternoon mood", completed: false, points: 5 },
  ];
  saveHealthTasks(defaults);
  return defaults;
};

const saveHealthTasks = (tasks) => {
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
};

export const completeHealthTask = (taskId) => {
  const tasks = getHealthTasks();
  const updated = tasks.map((t) => {
    if (t.id === taskId && !t.completed) {
      addPoints(t.points);
      return { ...t, completed: true };
    }
    return t;
  });
  saveHealthTasks(updated);
};

// --- CHAT ---
export const saveChatMessage = (message) => {
  const history = getChatMessages();
  history.push({ ...message, timestamp: new Date().toISOString() });
  localStorage.setItem(
    STORAGE_KEYS.MESSAGES,
    JSON.stringify(history.slice(-50)),
  );
};

export const getChatMessages = () => {
  const data = localStorage.getItem(STORAGE_KEYS.MESSAGES);
  return data
    ? JSON.parse(data)
    : [
        {
          role: "bot",
          content:
            "Hello! I am your AI Health Assistant. How can I help you today?",
          timestamp: new Date().toISOString(),
        },
      ];
};
