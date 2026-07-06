/**
 * Central frontend state hook.
 * v2 uses local React state only. To connect the backend later,
 * replace the setters with api.* calls from src/lib/api.ts.
 */

import { useState, useCallback } from "react";
import type { Customer, ProjectData, ReceivedPayment, SlabEntry } from "@/lib/types";

export function useAppData() {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [slabs, setSlabs] = useState<SlabEntry[]>([]);
  const [receivedPayments, setReceivedPayments] = useState<ReceivedPayment[]>([]);

  const addProject = useCallback((p: ProjectData) => {
    setProjects(prev => {
      const idx = prev.findIndex(x => x.id === p.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = p;
        return next;
      }
      return [...prev, p];
    });
  }, []);

  const addCustomer = useCallback((c: Customer) => {
    setCustomers(prev => [...prev, c]);
  }, []);

  const addSlab = useCallback((s: SlabEntry) => {
    setSlabs(prev => [...prev, s]);
  }, []);

  const addReceivedPayment = useCallback((r: ReceivedPayment) => {
    setReceivedPayments(prev => [...prev, r]);
  }, []);

  return {
    projects,
    customers,
    slabs,
    receivedPayments,
    addProject,
    addCustomer,
    addSlab,
    addReceivedPayment,
    setProjects,
    setCustomers,
    setSlabs,
    setReceivedPayments,
  };
}