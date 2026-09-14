import "@/global.css";
import { PortalHost } from "@rn-primitives/portal";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { ThemeProvider } from "expo-router/react-navigation";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { useUniwind } from "uniwind";

import { NAV_THEME } from "@/lib/theme";

export { ErrorBoundary } from "expo-router";

const RootLayout = () => {
  const [queryClient] = useState(() => new QueryClient());
  const { theme } = useUniwind();
  const scheme = theme === "dark" ? "dark" : "light";
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={NAV_THEME[scheme]}>
        <StatusBar style={scheme === "dark" ? "light" : "dark"} />
        <Stack screenOptions={{ headerShown: false }} />
        <PortalHost />
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default RootLayout;
