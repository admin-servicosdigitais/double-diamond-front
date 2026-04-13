import { toast } from "sonner";

export const systemToast = {
  success: (title: string, description?: string) =>
    toast.success(title, {
      description,
    }),
  warning: (title: string, description?: string) =>
    toast.warning(title, {
      description,
    }),
  error: (title: string, description?: string) =>
    toast.error(title, {
      description,
    }),
};
