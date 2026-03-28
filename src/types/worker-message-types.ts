export interface SecureMessage {
  seq: bigint;
  code: string;
  payload: Record<string, any>;
}

export interface WorkerResponse {
  ack: bigint;
  ok: boolean;
  code: string;  // Always "OK" on success.
  reqcode?: string;
  payload?: Record<string, any>;  // If ok
  error?: string;  // If !ok
}
