export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARNING = 2,
  ERROR = 3,
}

export interface MemLogEntry {
  id: bigint;
  level: LogLevel;
  timestamp: number;
  message: string;
}
