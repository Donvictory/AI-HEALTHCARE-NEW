import UserModel from "../modules/user/user.model";

export const resetDailyChecks = async () => {
  console.log(
    "Running Daily Reset: resetting hasCompletedDailyChecks for all users...",
  );
  try {
    const result = await UserModel.updateMany(
      {},
      {
        hasCompletedDailyChecks: false,
        currentDailyCheckStep: 1,
      },
    );
    console.log(`Daily reset complete. Updated ${result.modifiedCount} users.`);
    return result;
  } catch (error) {
    console.error("Error during daily reset:", error);
    throw error;
  }
};
