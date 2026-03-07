import type { MenuItem } from "./menu";

const demoMenuData: MenuItem[] = [
  { code: "new", label: "New Shape ..." },
  "-",
  { code: "stack+", label: "Push layer", shortcut: "Ctrl+S" },
  { code: "stack-", label: "Pop layer", shortcut: "Ctrl+S" },
  "-",
  { code: "copy", label: "Copy shape", shortcut: "Ctrl+C" },
  { code: "code", label: "View code" },
];

export default demoMenuData;
