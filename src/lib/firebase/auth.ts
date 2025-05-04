import { auth, db } from "./config";
import {
  PhoneAuthProvider,
  RecaptchaVerifier,
  signInWithCredential,
  signOut as firebaseSignOut,
  User,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { UserData } from "@/types";

// Setup recaptcha verifier
export const setupRecaptcha = (containerId: string) => {
  return new RecaptchaVerifier(auth, containerId, {
    size: "invisible",
    callback: () => {},
  });
};

// Send OTP to phone number
export const sendOTP = async (
  phoneNumber: string,
  recaptchaVerifier: RecaptchaVerifier
) => {
  try {
    const provider = new PhoneAuthProvider(auth);
    const verificationId = await provider.verifyPhoneNumber(
      phoneNumber,
      recaptchaVerifier
    );
    return { success: true, verificationId };
  } catch (error) {
    console.error("Error sending OTP:", error);
    return { success: false, error };
  }
};

// Verify OTP and sign in
export const verifyOTP = async (
  verificationId: string,
  otp: string,
  router: any
) => {
  try {
    const credential = PhoneAuthProvider.credential(verificationId, otp);
    const result = await signInWithCredential(auth, credential);
    const user = result.user;
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists()) {
      // Create user document in "users" collection
      await setDoc(doc(db, "users", user.uid), {
        phone: user.phoneNumber,
        status: "unregistered",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      const status = userDoc.data()?.status || "unregistered"; // Get status if it exists
      if (status === "registered" || status === "live") {
        router.replace("/jobs");
      } else {
        router.replace("/onboarding");
      }

      return { success: true, user, isNewUser: true };
    } else {
      return { success: true, user, isNewUser: false };
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return { success: false, error };
  }
};

export const verifyOTP2 = async (
  verificationId: string,
  otp: string,
  router: any
) => {
  try {
    const credential = PhoneAuthProvider.credential(verificationId, otp);
    const result = await signInWithCredential(auth, credential);
    const user = result.user;

    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);

    let isNewUser = false;
    let status = "unregistered";

    if (!userDoc.exists()) {
      // Create user document in "users" collection
      await setDoc(userRef, {
        phone: user.phoneNumber,
        status: "unregistered",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      isNewUser = true;
    } else {
      status = userDoc.data().status || "unregistered"; // Get status if it exists
      console.log("User status:", status);
      console.log("User data:", userDoc, userDoc.data());

      // Update last login timestamp
      await updateDoc(userRef, {
        updatedAt: serverTimestamp(),
      });
    }

    // Redirect based on user status
    if (status === "registered" || status === "live") {
      router.replace("/jobs");
    } else {
      router.replace("/onboarding");
    }

    return { success: true, user, isNewUser };
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return { success: false, error };
  }
};

// Sign out
export const signOut = async (router: any) => {
  try {
    await firebaseSignOut(auth);
    router.push("/sign-in");
    return { success: true };
  } catch (error) {
    console.error("Error signing out:", error);
    return { success: false, error };
  }
};

// Check if user exists in Firestore
export const checkUserExists = async (userId: string) => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    return userDoc.exists();
  } catch (error) {
    console.error("Error checking if user exists:", error);
    return false;
  }
};

// Create user in Firestore
// export const createUser = async (user: User, userData: Partial<UserData>) => {
//   try {
//     await updateDoc(doc(db, "users", user.uid), {
//       ...userData,
//     });
//     return { success: true };
//   } catch (error) {
//     console.error("Error creating user:", error);
//     return { success: false, error };
//   }
// };

export const createUser = async (user: User, userData: Partial<UserData>) => {
  try {
    console.log("Creating user with UID:", user?.uid);
    console.log("User data:", userData);

    const userRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      await updateDoc(userRef, { ...userData, updatedAt: serverTimestamp() });
    } else {
      await setDoc(
        doc(db, "users", user.uid),
        { ...userData },
        { merge: true }
      );
    }

    return { success: true };
  } catch (error) {
    console.error("Error creating user:", error);
    return { success: false, error };
  }
};

// Get user data from Firestore
export const getUserData = async (userId: string) => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      return { success: true, data: userDoc.data() as UserData };
    } else {
      return { success: false, error: "User not found" };
    }
  } catch (error) {
    console.error("Error getting user data:", error);
    return { success: false, error };
  }
};
