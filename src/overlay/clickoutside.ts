export default function clickoutside(node: HTMLElement) {
  const handleClick = (event: MouseEvent) => {
    if (node && !event.defaultPrevented) {
      event.preventDefault();
      if (event.target instanceof HTMLElement) {
        const elem = event.target as HTMLElement;
        if (elem.dataset.kind === "move-handle") {
          // Ignore clicks on a move handle.
          return;
        }
      }
      const { clientX, clientY } = event;
      node.dispatchEvent(
        new CustomEvent("clickoutside", {
          detail: { clientX, clientY },
          bubbles: false,
        }),
      );
    }
  };
  document.addEventListener("click", handleClick, true);

  return {
    destroy() {
      document.removeEventListener("click", handleClick, true);
    },
  };
}
