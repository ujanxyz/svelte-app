export default function clickoutside(node: HTMLElement) {
  const handleClick = (event: MouseEvent) => {
    //event.preventDefault();
    console.log("clicked ... ", event);
    console.log("node ... ", node);
    console.log("target ... ", event.target);
    console.log("not contains ... ", !node.contains(event.target as HTMLElement));
    console.log("not default prevented ... ", !event.defaultPrevented);
    if (
      node &&
      !node.contains(event.target as HTMLElement) &&
      !event.defaultPrevented
    ) {
      event.preventDefault();
      node.dispatchEvent(
        new CustomEvent("clickoutside", {
          detail: { node },
          bubbles: false,
        }),
      );
    }
  };
  console.log("Created new handleClick @@@@@. ... ");

  document.addEventListener("click", handleClick, true);

  return {
    destroy() {
      document.removeEventListener("click", handleClick, true);
    },
  };
}
