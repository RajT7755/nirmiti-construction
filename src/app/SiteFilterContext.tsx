import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { ProjectData } from "@/lib/types";

interface SiteFilterContextValue {
  projects: ProjectData[];
  selectedSite: string;
  setSelectedSite: (site: string) => void;
  filteredProjects: ProjectData[];
  projectNames: string[];
  isAllSites: boolean;
}

const SiteFilterContext = createContext<SiteFilterContextValue | null>(null);

export function SiteFilterProvider({
  projects,
  children,
}: {
  projects: ProjectData[];
  children: ReactNode;
}) {
  const [selectedSite, setSelectedSite] = useState("All Sites");

  const value = useMemo<SiteFilterContextValue>(() => {
    const isAllSites = selectedSite === "All Sites";
    const filteredProjects = isAllSites
      ? projects
      : projects.filter((p) => p.name === selectedSite);
    return {
      projects,
      selectedSite,
      setSelectedSite,
      filteredProjects,
      projectNames: filteredProjects.map((p) => p.name),
      isAllSites,
    };
  }, [projects, selectedSite]);

  return <SiteFilterContext.Provider value={value}>{children}</SiteFilterContext.Provider>;
}

export function useSiteFilterContext(): SiteFilterContextValue {
  const ctx = useContext(SiteFilterContext);
  if (!ctx) {
    throw new Error("useSiteFilterContext must be used within SiteFilterProvider");
  }
  return ctx;
}