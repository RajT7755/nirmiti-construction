import { apiRequest } from "../client";
import type { Customer } from "@/lib/types";

export const addCustomerApi = {
  create: (body: Omit<Customer, "id">) =>
    apiRequest<Customer>("/api/customers", { method: "POST", body: JSON.stringify(body) }),
};
