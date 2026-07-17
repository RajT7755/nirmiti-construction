import { WA_TEMPLATE_DEFAULT } from "@/lib/constants";

/** Global default — edit here or via Settings → Message Templates. */
export const WA_SLAB_TEMPLATE_DEFAULT = WA_TEMPLATE_DEFAULT;

export const SLAB_TEMPLATE_VARIABLES = [
  "{owner_name}",
  "{flat_name}",
  "{payment_value}",
  "{due_date}",
  "{build_status}",
] as const;
