import { createContext, useContext } from "react";
import { Outlet } from "react-router";
import { useAppData } from "@/hooks/useAppData";

type AppDataContextValue = ReturnType<typeof useAppData>;

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider() {
  const value = useAppData();
  return (
    <AppDataContext.Provider value={value}>
      <Outlet />
    </AppDataContext.Provider>
  );
}

export function useAppDataContext(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) {
    throw new Error("useAppDataContext must be used within AppDataProvider");
  }
  return ctx;
}
