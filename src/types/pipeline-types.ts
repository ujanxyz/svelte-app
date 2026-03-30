export namespace data {

  export interface ParamInfo {
    // Local name, e.g. "x", "fx".
    name: string;

    // The data type. Common values are: int, int[], float, []float etc
    dtype: string;
  };

  export interface FnExtendedInfo {
    kind: "-" | "INPUT" | "OUTPUT" | "PURE_FN" | "OPERATOR" | "LAMBDA";
    input?: ExtendedInfoMap["input"];
    output?: ExtendedInfoMap["output"];
    purefn?: ExtendedInfoMap["purefn"];
    opfn?: ExtendedInfoMap["opfn"];
    lambda?: ExtendedInfoMap["lambda"];
  };

  export interface FunctionInfo {
    // The function uri, e.g. "/fn/geom/point2d-translate-x"
    uri: string;

    // Label of the function, default node names are constructed from it.
    label: string;

    // Verbose description of the function.
    desc: string;

    // Extension data depending on the kind of function.
    ext: FnExtendedInfo;
  };

  interface ExtendedInfoMap {
    input: {
      dtype: string;
      accepts: string[];
    };

    output: {
      dtype: string;
      emits: string[];
    };

    purefn: {
      ins: ParamInfo[];
      outs: ParamInfo[];
    };

    opfn: {
      dtype: string;
      ins: ParamInfo[];
    };

    lambda: {
      dtype: string;
      args: string[];
      ins: ParamInfo[];
    };
  };
}