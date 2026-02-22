import webpush from "web-push";
import { appConfig } from "../config/app.config";
import { IUserEntity } from "../modules/user/user.entity";

// Configure web-push with VAPID keys from env
const publicKey = process.env.VAPID_PUBLIC_KEY || "";
const privateKey = process.env.VAPID_PRIVATE_KEY || "";
const contactEmail = process.env.VAPID_EMAIL || "mailto:admin@driftcare.com";

if (publicKey && privateKey) {
  webpush.setVapidDetails(contactEmail, publicKey, privateKey);
}

/**
 * Send a push notification to a specific user
 */
export const sendPushNotification = async (
  user: IUserEntity,
  payload: { title: string; body: string; url?: string },
) => {
  if (!user.pushSubscription) {
    console.log(`User ${user.email} has no push subscription`);
    return;
  }

  try {
    const pushPayload = JSON.stringify(payload);
    await webpush.sendNotification(user.pushSubscription as any, pushPayload);
    console.log(`Push notification sent to ${user.email}`);
  } catch (error: any) {
    if (error.statusCode === 410 || error.statusCode === 404) {
      console.log(
        `Subscription for ${user.email} has expired or is no longer valid`,
      );
      // Optionally clear the invalid subscription from the user model here
    } else {
      console.error(`Error sending push notification to ${user.email}:`, error);
    }
  }
};
