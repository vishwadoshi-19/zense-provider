import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/utils/firebase";
import { Provider } from "@/types";

interface AuthContextType {
  user: FirebaseUser | null;
  providerData: Provider | null;
  loading: boolean;
  error: string | null;
  isOffline: boolean;
  signup: (
    email: string,
    password: string,
    providerData: Partial<Provider>
  ) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [providerData, setProviderData] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Set initial status
    setIsOffline(!navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      if (user) {
        try {
          const providerDoc = await getDoc(doc(db, "providers", user.uid));
          if (providerDoc.exists()) {
            setProviderData(providerDoc.data() as Provider);
          }
        } catch (error: any) {
          console.error("Error fetching provider data:", error);
          // If we're offline, don't show an error, just use cached data if available
          if (!isOffline) {
            setError(
              `Failed to fetch provider data: ${
                error.message || "Unknown error"
              }`
            );
          }
        } finally {
          setLoading(false);
        }
      } else {
        setProviderData(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [isOffline]);

  const signup = async (
    email: string,
    password: string,
    providerData: Partial<Provider>
  ) => {
    try {
      setError(null);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Create provider document in Firestore
      await setDoc(doc(db, "providers", user.uid), {
        ...providerData,
        id: user.uid,
        email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const value = {
    user,
    providerData,
    loading,
    error,
    isOffline,
    signup,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
