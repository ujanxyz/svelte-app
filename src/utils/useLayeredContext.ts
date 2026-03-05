import { getContext, setContext } from "svelte";

function useLayeredContext<T>(contextKey: symbol) {
  // Call at the component subtree root to set the contextual data.
  function setData(data: T) {
    setContext(contextKey, data);
  }

  // Call anywhere under the component subtree to access the contextual data.
  function getData() {
    const data = getContext<T>(contextKey);
    if (!data) {
      throw new Error("Context not defined: " + contextKey.toString());
    }
    return data;
  }

  return { setData, getData };
}

export default useLayeredContext;
