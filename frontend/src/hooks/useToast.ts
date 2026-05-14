import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

export function useToast() {
  const success = (message: string) => toast.success(message);

  const error = (message: string) => toast.error(message);

  const loading = (message: string) => toast.loading(message);

  const dismiss = (id?: string) => toast.dismiss(id);

  const apiError = (err: unknown, fallback = 'Something went wrong') => {
    const axiosErr = err as AxiosError<{ message: string }>;
    const message = axiosErr?.response?.data?.message || fallback;
    toast.error(message);
    return message;
  };

  return { success, error, loading, dismiss, apiError };
}
