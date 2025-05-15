import React from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/components/auth/AuthContext";
import SignupForm from "@/components/auth/SignupForm";
import Link from "next/link";

const SignupPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  React.useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  // Redirect if not logged in
  // This is a temporary solution. Ideally, we should check if the user is logged in
  // and redirect to the login page if not.

  // React.useEffect(() => {
  //   if (true) {
  //     router.push("/login");
  //   }
  // });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <Link href="/" className="inline-block">
            <span className="text-3xl font-bold text-primary">Zense</span>
            <span className="ml-2 text-sm bg-accent text-white px-2 py-0.5 rounded">
              Provider
            </span>
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Create a provider account
          </h2>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <SignupForm />
      </div>
    </div>
  );
};

export default SignupPage;
