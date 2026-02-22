---
description: Comprehensive logic flow for every step in the Daily Check-in process
---

1. **Step 1: Sleep & Energy**
   - **Input Capture**: User adjusts sliders for `hoursSlept` (0-12h), `stressLevel` (1-10), and `mood` (1-10).
   - **Real-time Feedback**: Logic triggers orange text alerts if `hoursSlept < 6` or `stressLevel >= 8`.
   - **Logic**: Updates `checkInData` state object.

2. **Step 2: Movement & Water**
   - **Input Capture**: User adjusts sliders for `physicalActivity` (minutes) and `waterIntake` (glasses).
   - **Real-time Feedback**: Logic triggers "Drink more water" alert if `waterIntake < 4` and motivational messages for activity.
   - **Logic**: Compares values against healthy baselines (e.g., 30 mins activity, 8 glasses water).

3. **Step 3: Health Status & Symptoms**
   - **Select Input**: User chooses from `Select` dropdown for qualitative health status (Excellent to Very Poor).
   - **Multi-select Logic**: User toggles symptom checkboxes.
   - **Exclusion Logic**: Selecting "None" clears all other symptoms; selecting any symptom clears "None".

4. **Step 4: Medical Reports (Optional)**
   - **File Validation**: System checks `file.size` (max 5MB) and mime type (PDF/JPG/PNG).
   - **Note Capture**: User provides context in `reportNotes` textarea.
   - **Asynchronous Prep**: If a file exists, a `FileReader` is initialized in the final completion step.

5. **Step 5: Lifestyle & Journal**
   - **Reflective Capture**: Binary toggles for sensitive lifestyle choices (Alcohol, Smoking) with "No Judgment" UI copy.
   - **Qualitative Input**: Open-ended `journal` entry for emotional context.
   - **Security Assurance**: Display of local-first encryption disclaimer before submission.

6. **Completion & Persistence**
   - **Final Calculation**: Call `calculateQuickScore(checkInData)` to generate an immediate resilience preview.
   - **Object Assembly**: Construct final `checkIn` object with unique ID and ISO timestamp.
   - **File Serialization**: If a report exists, convert `uploadedFile` to Base64 (DataURL) via `FileReader`.
   - **Storage Commit**: Invoke `saveDailyCheckIn(checkIn)` and `saveMedicalReport(report)`.
   - **Reward Logic**: Call `addPoints(15)` and trigger success toast with redirection to Dashboard.
