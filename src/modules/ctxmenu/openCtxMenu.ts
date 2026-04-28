import type { Snippet } from "svelte";

import { createOverlayController, type OverlayManager } from "@/modules/overlay2";

import type {
  CtxMenuOpenResult,
  CtxMenuPayload,
  CtxMenuSelection,
  OpenCtxMenuArgs,
} from "./types";

export async function openCtxMenu<TCode extends string>(
  manager: OverlayManager,
  render: Snippet<[]>,
  args: OpenCtxMenuArgs<TCode>,
): Promise<CtxMenuOpenResult<TCode>> {
  const controller = createOverlayController<
    CtxMenuPayload<TCode>,
    CtxMenuSelection<TCode>
  >(manager, render);

  return controller.open(
    {
      x: args.x,
      y: args.y,
      items: args.items,
    },
    {
      dismissOnBackdrop: true,
      dismissOnEscape: true,
      closeOnWindowResize: true,
      ...(args.options ?? {}),
    },
  );
}
