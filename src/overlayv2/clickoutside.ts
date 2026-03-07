export default function clickoutside(node: HTMLElement) {
  const handleClick = (event: MouseEvent) => {
    if (node && !event.defaultPrevented) {
      event.preventDefault();
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
