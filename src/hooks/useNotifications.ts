// src/hooks/useNotifications.ts
import { toast } from 'react-toastify';

const useNotifications = () => {
    const notifySuccess = (message: string, options = {}) => {
        toast.success(message, {
            position: 'top-right',
            autoClose: 3000,
            ...options,
        });
    };

    const notifyError = (message: string, options = {}) => {
        toast.error(message, {
            position: 'top-right',
            autoClose: 3000,
            ...options,
        });
    };

    return { notifySuccess, notifyError };
};

export default useNotifications;