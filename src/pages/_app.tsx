import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { AuthProvider } from "@/components/auth/AuthContext";
import OfflineAlert from "@/components/common/OfflineAlert";
import Head from "next/head";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useRouter } from "next/router";
import { Toaster } from "@/components/ui/toaster";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const unprotectedRoutes = ["/login", "/signup"];

  return (
    <AuthProvider>
      <Head>
        <title>Zense Provider Dashboard</title>
        <meta
          name="description"
          content="Zense Provider Dashboard for managing staff and jobs"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      {unprotectedRoutes.includes(router.pathname) ? (
        <Component {...pageProps} />
      ) : (
        <ProtectedRoute>
          <Component {...pageProps} />
        </ProtectedRoute>
      )}
      <OfflineAlert />
      <Toaster />
    </AuthProvider>
  );
}
