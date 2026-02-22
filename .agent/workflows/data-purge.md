---
description: Steps for clearing all local health data (Danger Zone)
---

1. **User Intent Confirmation**: Display `AlertDialog` to warn about irreversible deletion.
2. **Action Trigger**: User clicks "Yes, Delete Everything".
3. **Wipe Storage**: Call `localStorage.clear()`.
4. **Toast Notification**: Trigger `toast.success("All data cleared. Redirecting...")`.
5. **Session Termination**: Delay 1.5s then force redirect to home `/` via `window.location.href`.
6. **Fresh Slate**: On landing, the app detects no profile and prompts for Login/Signup.
