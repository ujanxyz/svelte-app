import type { bgtask } from "@/bgtask/worker/types";
import type { wa } from "@/types/wa";

class CppApiPlugin implements bgtask.host.BgTaskPlugin {
  private readonly cmdPrefix: string;
  private readonly graph: wa.ApiInstance;
  private readonly availableApis: string[] = [];

  public constructor(apiCodePrefix: string, graph: wa.ApiInstance) {
    this.cmdPrefix = apiCodePrefix;
    this.graph = graph;
    for (const api of this.graph.apis) {
      this.availableApis.push(api.name);
    }
    console.log(`${apiCodePrefix} apis:`, this.availableApis);
  }

  public get prefix(): string {
    return this.cmdPrefix;
  }

  public async onProcess(code: string, request: any): Promise<bgtask.host.PluginProcessResult> {
    console.log("Processing code:", code, "with request:", request);
    if (!this.#matchesPrefix(code)) {
      throw new Error("Invalid code: " + code);
    }
    const apiName: string = code.substring(this.cmdPrefix.length + 1);
    const apiFn = this.graph[apiName]!;
    if (!apiFn) {
      throw new Error("Api not found: " + apiName);
    }
    const { data, ok, status } = apiFn.bind(this.graph)(request) as wa.ApiResponse;
    if (!ok) {
      throw new Error(`API Error (Status: ${status}): ${data}`);
    }
    return data as bgtask.host.PluginProcessResult;
  }

  #matchesPrefix(code: string): boolean {
    return code.startsWith(this.cmdPrefix + ":");
  }
}

export { CppApiPlugin };
