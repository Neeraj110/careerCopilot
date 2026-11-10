export type AppToastVariant = "success" | "error" | "info";

export interface AppToastDetail {
  title: string;
  description?: string;
  variant: AppToastVariant;
}

type AppToastListener = (detail: AppToastDetail) => void;

const listeners = new Set<AppToastListener>();
const pendingToasts: AppToastDetail[] = [];

export function dispatchAppToast(detail: AppToastDetail) {
  if (listeners.size === 0) {
    pendingToasts.push(detail);
    return;
  }

  listeners.forEach((listener) => listener(detail));
}

export function subscribeToAppToasts(listener: AppToastListener) {
  listeners.add(listener);
  pendingToasts.splice(0).forEach(listener);

  return () => {
    listeners.delete(listener);
  };
}
