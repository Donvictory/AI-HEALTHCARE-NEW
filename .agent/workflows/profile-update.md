---
description: Logic flow after clicking 'Update Profile' in EditProfile
---

1. **Validation**: Check required fields (Name, Age, Sex, Height, Weight).
2. **BMI Calculation**: Trigger `calculateBMI(weight, height)` utility.
3. **Data Merge**: Retrieve current profile via `getUserProfile()` and spread/overwrite with `formData`.
4. **Persistence**: Call `saveUserProfile(updatedProfile)` to commit to LocalStorage.
5. **Confirmation**: Trigger `toast.success("Profile updated successfully")`.
6. **Route Reset**: Navigate back to `/profile`.
7. **Global State Sync**: Profile page re-fetches latest data on mount/effect.
