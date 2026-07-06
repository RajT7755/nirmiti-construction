/**
 * Central frontend state hook.
 * Set VITE_USE_API=true in .env to load data from the backend API.
 */

import { useState, useCallback, useEffect } from "react";
import type { Customer, ProjectData, ReceivedPayment, SlabEntry } from "@/lib/types";
import {
  customerSalesApi,
  paymentSlabsApi,
  projectsApi,
  receivedPaymentsApi,
} from "@/lib/api";

const USE_API = import.meta.env.VITE_USE_API === "true";

export function useAppData() {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [slabs, setSlabs] = useState<SlabEntry[]>([]);
  const [receivedPayments, setReceivedPayments] = useState<ReceivedPayment[]>([]);
  const [loading, setLoading] = useState(USE_API);

  useEffect(() => {
    if (!USE_API) return;
    let cancelled = false;
    (async () => {
      try {
        const [p, c, s, r] = await Promise.all([
          projectsApi.list(),
          customerSalesApi.list(),
          paymentSlabsApi.list(),
          receivedPaymentsApi.list(),
        ]);
        if (!cancelled) {
          setProjects(p);
          setCustomers(c);
          setSlabs(s);
          setReceivedPayments(r);
        }
      } catch (err) {
        console.error("Failed to load API data:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

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
    loading,
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
