/**
 * Default in-memory implementation for an await-task channel.
 */
class AwaitTaskChannel<TReq, TResult> {
	private readonly channelName: string;
	private readonly requests = new Map<string, TReq>();
	private readonly results = new Map<string, TResult>();

	public constructor(channelName: string) {
		this.channelName = channelName;
	}

	/** Returns task ids that are not fulfilled yet. */
	getPendingTaskIds(): string[] {
		const ids: string[] = [];
		for (const taskId of this.requests.keys()) {
			if (!this.results.has(taskId)) {
				ids.push(taskId);
			}
		}
		return ids;
	}

	/** Creates a task and returns a generated id. */
	addTask(taskPayload: TReq): string {
		const taskId = _createTaskId(this.channelName);
		this.requests.set(taskId, taskPayload);
		return taskId;
	}

	/** Returns request payload for a task id, or null if absent. */
	getTaskData(taskId: string): TReq | null {
		return this.requests.get(taskId) ?? null;
	}

	/** Returns all request payloads keyed by task id. */
	getAllTaskData(_taskId: string): Record<string, TReq> {
		const snapshot: Record<string, TReq> = {};
		for (const [taskId, payload] of this.requests.entries()) {
			snapshot[taskId] = payload;
		}
		return snapshot;
	}

	/**
	 * Marks a task as fulfilled.
	 * Throws if task id does not exist.
	 */
	fulfillTask(taskId: string, result: TResult): void {
		if (!this.requests.has(taskId)) {
			throw new Error(`Cannot fulfill unknown task id: ${taskId}`);
		}
		this.results.set(taskId, result);
	}

	/** Removes all stored requests and results. */
	clear(): void {
		this.requests.clear();
		this.results.clear();
	}

	/** Reads a fulfilled result without deleting task state. */
	peekResult(taskId: string): TResult | null {
		return this.results.get(taskId) ?? null;
	}

	/**
	 * Removes and returns a fulfilled result.
	 * If forceDelete is true, request metadata is removed even when no result exists.
	 */
	releaseResult(taskId: string, forceDelete = false): TResult | null {
		const hasResult = this.results.has(taskId);
		if (!hasResult && !forceDelete) {
			return null;
		}

		const result = this.results.get(taskId) ?? null;
		this.results.delete(taskId);
		this.requests.delete(taskId);
		return result;
	}
}

// Create a unique task id, prefixed by channel name.
function _createTaskId(chanName: string): string {
	const uniquePart = typeof globalThis.crypto !== "undefined" && "randomUUID" in globalThis.crypto
		? globalThis.crypto.randomUUID()
		: `task_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
	return `${chanName}_${uniquePart}`;
}


export { AwaitTaskChannel };
