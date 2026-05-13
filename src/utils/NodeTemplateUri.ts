type NodeTemplateType = "FN" | "IN" | "OUT";

class NodeTemplateUri {
  readonly #kind: NodeTemplateType;
  readonly #dtype: string | null;
  readonly #funcUri: string | null;

  private constructor(kind: NodeTemplateType, dtype: string | null, funcUri: string | null) {
    this.#kind = kind;
    this.#dtype = dtype;
    this.#funcUri = funcUri;
  }

  static ParseFromStr(strUri: string): NodeTemplateUri {
    if (typeof strUri !== "string" || strUri.length === 0) {
      throw new Error("Node template URI must be a non-empty string");
    }
    if (!strUri.startsWith("/")) {
      throw new Error(`Invalid node template URI '${strUri}': must start with '/'`);
    }

    const segments = strUri.split("/");
    // Leading slash produces an empty first segment.
    const parts = segments.slice(1);

    if (parts.length === 2 && parts[0] === "$IN" && parts[1].length > 0) {
      return new NodeTemplateUri("IN", parts[1], null);
    }
    if (parts.length === 2 && parts[0] === "$OUT" && parts[1].length > 0) {
      return new NodeTemplateUri("OUT", parts[1], null);
    }

    // Function URI: keep intact, allow future extension with >2 path components.
    if (parts.length >= 2 && parts[0] !== "$IN" && parts[0] !== "$OUT" && parts.every((p) => p.length > 0)) {
      return new NodeTemplateUri("FN", null, strUri);
    }

    throw new Error(`Invalid node template URI '${strUri}'`);
  }

  getNodeType(): NodeTemplateType {
    return this.#kind;
  }

  getDataType(): string {
    if (this.#kind === "FN") {
      throw new Error("Function node URI does not have graph IO data type");
    }
    return this.#dtype!;
  }

  getAsFuncUri(): string {
    if (this.#kind !== "FN") {
      throw new Error("Graph IO node URI cannot be used as function URI");
    }
    return this.#funcUri!;
  }
}

export { NodeTemplateUri };
