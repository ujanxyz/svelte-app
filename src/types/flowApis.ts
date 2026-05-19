import type { flow } from "./flow";

export namespace flowApis {

  interface VoidType {};

  export interface ApiDict {
   getFlowStatus: {
      request: VoidType;
      response: {
        status: string;
      };
    };

    buildPipeline: {
      request: VoidType;
      response: VoidType;
    };

    stepPipeline: {
      request: VoidType;
      response: {
        stepResult: flow.FlowStepResult;
      };
    };

  };

  export type Names = keyof ApiDict;
  export type Request<K extends Names> = ApiDict[K]["request"];
  export type Response<K extends Names> = ApiDict[K]["response"];
}
