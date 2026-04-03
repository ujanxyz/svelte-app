import type { wa } from "@/types/wa";

class CppGraphBuilder {
  private readonly graph: wa.ApiInstance;
  private readonly cmdPrefix: string
  private readonly availableApis: string[] = [];

  public constructor(graph: wa.ApiInstance, cmdPrefix: string) {
    this.graph = graph;
    this.cmdPrefix = cmdPrefix;
    for (const api of this.graph.apis) {
      this.availableApis.push(api.name);
    }
    console.log("Available C++ apis:", this.availableApis);
  }

  public async process(code: string, request: any): Promise<Error | Record<string, any>> {
    if (!code.startsWith(this.cmdPrefix)) {
      throw new Error("Invalid code: " + code);
    }
    const apiName: string = code.substring(this.cmdPrefix.length);
    const apiFn = this.graph[apiName]!;
    if (!apiFn) {
      throw new Error("Api not found: " + apiName);
    }
    const { data, ok, status } = apiFn.bind(this.graph)(request) as wa.ApiResponse;
    return ok ? data : new Error(status);
  }
}

export { CppGraphBuilder };
