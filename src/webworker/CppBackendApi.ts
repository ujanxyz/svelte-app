import type { wa } from "@/types/wa";

class CppBackendApi {
  private readonly cmdPrefix: string;
  private readonly graph: wa.ApiInstance;
  private readonly availableApis: string[] = [];

  public constructor(apiCodePrefix: string, graph: wa.ApiInstance) {
    this.cmdPrefix = apiCodePrefix + ":";
    this.graph = graph;
    for (const api of this.graph.apis) {
      this.availableApis.push(api.name);
    }
    console.log(`${apiCodePrefix} apis:`, this.availableApis);
  }

  public matchesPrefix(code: string): boolean {
    return code.startsWith(this.cmdPrefix);
  }

  public async process(code: string, request: any): Promise<Error | Record<string, any>> {
    if (!this.matchesPrefix(code)) {
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

export { CppBackendApi };
