---
description: Logic flow after clicking the 'Daily Check-in' button
---

1. **Check Existing Entry**: System checks `getTodaysCheckIn()` from `storage.js`.
2. **Conditional Toast**: If today's entry exists, trigger `toast.info("Already checked in")`.
3. **Route Navigation**: If no entry exists, call `navigate("/check-in")`.
4. **Data Acquisition**: User completes the multi-step form (Sleep, Mood, Activity, Stress, Hydration).
5. **Persistence**: Call `saveDailyCheckIn(data)` to commit to LocalStorage.
6. **Stat Recalculation**: `points` are incremented based on task completion and consistency.
7. **Drift Refresh**: Upon return to Dashboard, `detectDrift()` is re-executed with the 7-day window.
8. **UI State Update**: Resilience tank and Drift gauge animate to new values.
