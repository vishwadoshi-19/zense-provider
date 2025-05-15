import admin from "firebase-admin";
import dotenv from "dotenv";
dotenv.config();
// import serviceAccount from "../../serviceAccountKey.json.json";

// Initialize the Admin SDK (replace with your service account path)
// Check if the app is already initialized to avoid re-initialization errors

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

console.log("Service Account:", serviceAccount);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("Firebase Admin SDK initialized in API route.");
} else {
  console.log("Firebase Admin SDK already initialized.");
}

const auth = admin.auth(); // Get auth from the initialized app

async function createUserWithPhoneNumber(phoneNumber) {
  try {
    console.log("Attempting to create user with phone number:", phoneNumber);
    const userRecord = await auth.createUser({
      phoneNumber: phoneNumber,
      // Optional: add other user properties like displayName, photoURL, etc.
    });
    console.log("Successfully created new user in Auth:", userRecord.uid);

    // Create user document in Firestore
    const db = admin.firestore();
    const userDocRef = db.collection("users").doc(userRecord.uid);
    const initialUserData = {
      phone: userRecord.phoneNumber,
      status: "unregistered",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    console.log(
      "Attempting to create user document in Firestore:",
      userRecord.uid,
      initialUserData
    );
    await userDocRef.set(initialUserData);
    console.log(
      "Successfully created user document in Firestore:",
      userRecord.uid
    );

    return userRecord;
  } catch (error) {
    console.error("Error creating new user:", error);
    throw error;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    console.log(`Received ${req.method} request, expected POST.`);
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    console.log("Received POST request without phone number in body.");
    return res.status(400).json({ message: "Phone number is required" });
  }

  try {
    console.log(
      "Processing request to create user for phone number:",
      phoneNumber
    );
    const userRecord = await createUserWithPhoneNumber(phoneNumber);
    console.log(
      "User creation and document creation successful for UID:",
      userRecord.uid
    );
    res.status(200).json({ uid: userRecord.uid });
  } catch (error) {
    console.error("Error in API route:", error);
    res
      .status(500)
      .json({ message: "Error creating user", error: error.message });
  }
}
