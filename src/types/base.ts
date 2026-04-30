export interface StatusOr<T> {
  status: string;
  value?: T;
  reason?: any;
}

export interface ClientXY {
  x: number;
  y: number;
}
