export enum ToastType {
  INFO = "info",
  SUCCESS = "success",
  WARNNG = "warning",
  ERROR = "error",
}

export interface ToastEntry {
  id: string;
  type: ToastType;
  message: string;
  startedAt: number;
}
