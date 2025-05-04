import { initializeApp, credential as _credential, auth } from "firebase-admin";

// Initialize the Admin SDK (replace with your service account path)
import serviceAccount from "../../serviceAccountKey.json";
initializeApp({
  credential: _credential.cert(serviceAccount),
});
console.log("Firebase Admin SDK initialized.");

export async function createUserWithPhoneNumber(phoneNumber) {
  try {
    const userRecord = await auth().createUser({
      phoneNumber: phoneNumber,
      // Optional: add other user properties like displayName, photoURL, etc.
    });
    console.log("Successfully created new user:", userRecord.uid);
    return userRecord;
  } catch (error) {
    console.error("Error creating new user:", error);
    throw error;
  }
}

// Example usage:
createUserWithPhoneNumber("+919876543210");
