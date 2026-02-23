"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPushNotification = void 0;
const web_push_1 = __importDefault(require("web-push"));
// Configure web-push with VAPID keys from env
const publicKey = process.env.VAPID_PUBLIC_KEY || "";
const privateKey = process.env.VAPID_PRIVATE_KEY || "";
const contactEmail = process.env.VAPID_EMAIL || "mailto:admin@driftcare.com";
if (publicKey && privateKey) {
    web_push_1.default.setVapidDetails(contactEmail, publicKey, privateKey);
}
/**
 * Send a push notification to a specific user
 */
const sendPushNotification = async (user, payload) => {
    if (!user.pushSubscription) {
        console.log(`User ${user.email} has no push subscription`);
        return;
    }
    try {
        const pushPayload = JSON.stringify(payload);
        await web_push_1.default.sendNotification(user.pushSubscription, pushPayload);
        console.log(`Push notification sent to ${user.email}`);
    }
    catch (error) {
        if (error.statusCode === 410 || error.statusCode === 404) {
            console.log(`Subscription for ${user.email} has expired or is no longer valid`);
            // Optionally clear the invalid subscription from the user model here
        }
        else {
            console.error(`Error sending push notification to ${user.email}:`, error);
        }
    }
};
exports.sendPushNotification = sendPushNotification;
