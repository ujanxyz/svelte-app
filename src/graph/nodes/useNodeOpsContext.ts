import useLayeredContext from "../../utils/useLayeredContext";

interface NodeContextOps {
  deleteSelf(): void;
}

const CONTEXT_KEY = Symbol("node");

function useNodeOpsContext() {
  const { setData: setNodeOps, getData: getNodeOps } =
    useLayeredContext<NodeContextOps>(CONTEXT_KEY);
  return { setNodeOps, getNodeOps };
}

export default useNodeOpsContext;
