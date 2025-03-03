import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { AuthProvider } from "@/components/auth/AuthContext";
import OfflineAlert from "@/components/common/OfflineAlert";
import Head from "next/head";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Head>
        <title>Nurch Provider Dashboard</title>
        <meta
          name="description"
          content="Nurch Provider Dashboard for managing staff and jobs"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <Component {...pageProps} />
      <OfflineAlert />
    </AuthProvider>
  );
}
