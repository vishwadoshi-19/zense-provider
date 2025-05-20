import { useRouter } from "next/router";
import { useEffect } from "react";
import { useAuth } from "./AuthContext";
import LoadingSpinner from "../common/LoadingSpinner";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return null; // Or a loading indicator, or redirecting...
  }

  return <>{children}</>;
};

export default ProtectedRoute;
