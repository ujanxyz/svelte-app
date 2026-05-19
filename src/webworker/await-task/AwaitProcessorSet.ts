import type { wa } from "@/types/wa";

import { AwaitTaskChannel } from "./AwaitTaskChannel";
import type { AwaitTaskProcessor } from "./types";

interface ChannelProcessorPair {
  channel: AwaitTaskChannel<any, any>;
  proc: AwaitTaskProcessor<any, any>;
}

class AwaitProcessorSet {
  private readonly pool: wa.AwaitTaskPoolInterface;
  private processors: Map<string, ChannelProcessorPair>;

  public constructor(pool: wa.AwaitTaskPoolInterface) {
    this.pool = pool;
    this.processors = new Map();
  }

  public assignProcessors(processors: AwaitTaskProcessor<any, any>[]): void {
    for (const proc of processors) {
      const channelName = proc.name;
      if (this.processors.has(channelName)) {
        throw new Error(`[AwaitProcessorSet] Processor with name "${channelName}" is already registered.`);
      }
      const channel = new AwaitTaskChannel<any, any>(channelName);
      this.pool.registerChannel(channelName, channel);
      this.processors.set(channelName, { channel, proc });
    }
  }

  public async fulfillAwaitTasks(): Promise<void> {
    let numProcessed = 0;
    const channelnames: string[] = [];
    for (const [chanName, {channel, proc}] of this.processors) {
      channelnames.push(chanName);
      const taskIds: string[] = channel.getPendingTaskIds();
      for (const taskId of taskIds) {
        const taskData = channel.getTaskData(taskId);
        if (taskData === null) {
          console.warn(`[AwaitProcessorSet] Missing task data for id "${taskId}" on channel "${chanName}". Skipping.`);
          continue;
        }
        try {
          console.log(`[AwaitProcessorSet] Processing task id "${taskId}" on channel "${chanName}".`);
          const result = await proc.processAsync(taskId, taskData);
          channel.fulfillTask(taskId, result);
          numProcessed++;
        } catch (err) {
          console.error(`[AwaitProcessorSet] Error processing task id "${taskId}" on channel "${chanName}":`, err);
        }
      }
    }
    console.log(`[AwaitProcessorSet] Processed ${numProcessed} tasks from: ${channelnames.join(", ")}`);
  }

}

export { AwaitProcessorSet };