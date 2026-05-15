import type { grph } from "./grph";

/**
 * Types related to pipeline / flow graph operations.
 */
export namespace flow {

  export interface GraphOutputEntry {
    nodeId: number;
    dtype: string;
    encodedData: grph.EncodedData;
  };

  export interface AwaitEntry {
    nodeId: number;
    channel: string;
    workId: string;
  };

  export interface FlowStepResult {
    status: "PENDING" | "SUCCESS" | "ERROR" | "PARTIAL";
    outputs: GraphOutputEntry[];
    awaitInfos: AwaitEntry[];
  };
};
