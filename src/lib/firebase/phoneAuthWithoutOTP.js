import { initializeApp, credential as _credential, auth } from "firebase-admin";
import dotenv from "dotenv";
dotenv.config();
// Initialize the Admin SDK (replace with your service account path)
// import serviceAccount from "../../serviceAccountKey.json";

const serviceAccount = {
  type: process.env.TYPE,
  project_id: process.env.PROJECT_ID,
  private_key_id: process.env.PRIVATE_KEY_ID,
  private_key: process.env.PRIVATE_KEY,
  client_email: process.env.CLIENT_EMAIL,
  client_id: process.env.CLIENT_ID,
  auth_uri: process.env.AUTH_URI,
  token_uri: process.env.TOKEN_URI,
  auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
};

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
