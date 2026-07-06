import { apiRequest } from "../client";
import type { Customer } from "@/lib/types";

export const customerSalesApi = {
  list: () => apiRequest<Customer[]>("/api/customers"),
};
