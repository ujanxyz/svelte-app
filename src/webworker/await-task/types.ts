import type { AwaitTaskChannel } from "./AwaitTaskChannel";

export interface AwaitTaskProcessor<TReq, TResult> {
  name: string;

  processAsync(task: TReq): Promise<TResult>;
}

