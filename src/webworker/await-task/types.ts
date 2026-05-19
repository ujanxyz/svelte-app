import type { AwaitTaskChannel } from "./AwaitTaskChannel";

export interface AwaitTaskProcessor<TReq, TResult> {
  name: string;

  processAsync(taskId: string, taskData: TReq): Promise<TResult>;
}
