import { apiRequest } from "../client";
import type { AddCustomerFormInput } from "@/lib/customers/buildCustomerProfile";
import type { CustomerDetailProfile } from "@/lib/customers/customerDetailTypes";
import type { Customer } from "@/lib/types";

export interface RegisterCustomerRequest {
  profile: AddCustomerFormInput;
  initialPayment?: { amount: number; method: string; date: string };
}

export const addCustomerApi = {
  /** Legacy v1 slim customer */
  create: (body: Omit<Customer, "id">) =>
    apiRequest<Customer>("/api/customers", { method: "POST", body: JSON.stringify(body) }),

  /** v3 full profile registration */
  register: (body: RegisterCustomerRequest) =>
    apiRequest<CustomerDetailProfile>("/api/customers/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};
