import store from "./store";
import { LogLevel } from "./types";

function useMemlogging() {

  function debugLog(message: string): void {
    store.appendLog(LogLevel.DEBUG, message);
  }

  function infoLog(message: string): void {
    store.appendLog(LogLevel.INFO, message);
  }

  function warnLog(message: string): void {
    store.appendLog(LogLevel.WARNING, message);
  }

  function errorLog(message: string): void {
    store.appendLog(LogLevel.ERROR, message);
  }

  return { debugLog, infoLog, warnLog, errorLog };
}

export default useMemlogging;


