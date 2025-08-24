import { toast } from 'react-toastify';

// Toast utility functions with glass theme
export const showToast = {
  success: (message, options = {}) => {
    toast.success(message, {
      className: 'glass-toast',
      bodyClassName: 'glass-toast-body',
      progressClassName: 'glass-toast-progress',
      ...options,
    });
  },

  error: (message, options = {}) => {
    toast.error(message, {
      className: 'glass-toast',
      bodyClassName: 'glass-toast-body',
      progressClassName: 'glass-toast-progress',
      ...options,
    });
  },

  warning: (message, options = {}) => {
    toast.warning(message, {
      className: 'glass-toast',
      bodyClassName: 'glass-toast-body',
      progressClassName: 'glass-toast-progress',
      ...options,
    });
  },

  info: (message, options = {}) => {
    toast.info(message, {
      className: 'glass-toast',
      bodyClassName: 'glass-toast-body',
      progressClassName: 'glass-toast-progress',
      ...options,
    });
  },

  // Custom confirm dialog using toast
  confirm: (message, onConfirm, onCancel = () => {}) => {
    const toastId = toast(
      ({ closeToast }) => (
        <div>
          <p className="mb-3 text-sm">{message}</p>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                onConfirm();
                closeToast();
              }}
              className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Confirm
            </button>
            <button
              onClick={() => {
                onCancel();
                closeToast();
              }}
              className="px-3 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        className: 'glass-toast',
        bodyClassName: 'glass-toast-body',
        progressClassName: 'glass-toast-progress',
        autoClose: false,
        closeOnClick: false,
        hideProgressBar: true,
        draggable: false,
      }
    );
    return toastId;
  },

  // Loading toast
  loading: (message, options = {}) => {
    return toast.loading(message, {
      className: 'glass-toast',
      bodyClassName: 'glass-toast-body',
      progressClassName: 'glass-toast-progress',
      ...options,
    });
  },

  // Update loading toast
  update: (toastId, options) => {
    toast.update(toastId, {
      className: 'glass-toast',
      bodyClassName: 'glass-toast-body',
      progressClassName: 'glass-toast-progress',
      ...options,
    });
  },

  // Dismiss specific toast
  dismiss: (toastId) => {
    toast.dismiss(toastId);
  },

  // Dismiss all toasts
  dismissAll: () => {
    toast.dismiss();
  },
};

// Export individual functions for convenience
export const { success, error, warning, info, confirm, loading } = showToast;
