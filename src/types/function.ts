export namespace fn {
  /**
   * See C++ repo -> ujcore::data::ParamInfo
   */
  export interface ParamInfo {
    name: string;
    dtype: string;
    access: "I" | "O" | "M";
  }

  /**
   * See C++ repo -> ujcore::data::FunctionInfo
   */
  export interface FunctionInfo {
    uri: string;
    label: string;
    desc: string;
    params: ParamInfo[];
  }

  export interface GraphIoInfo {
    uri: string;
    dtype: string;
  }

}
