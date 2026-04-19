import { toast } from "sonner";

export const notify = {
  success: (message: string) => toast.success(message, { duration: 2500 }),
  error: (message: string) => toast.error(message, { duration: 4000 }),
  info: (message: string) => toast(message, { duration: 2500 }),
};
