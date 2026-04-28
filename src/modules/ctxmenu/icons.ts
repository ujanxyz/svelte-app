import ArrowClockwiseIcon from "phosphor-svelte/lib/ArrowClockwiseIcon";
import CaretRightIcon from "phosphor-svelte/lib/CaretRightIcon";
import ClipboardIcon from "phosphor-svelte/lib/ClipboardIcon";
import CodeIcon from "phosphor-svelte/lib/CodeIcon";
import InfoIcon from "phosphor-svelte/lib/InfoIcon";
import LineVerticalIcon from "phosphor-svelte/lib/LineVerticalIcon";
import PencilSimpleIcon from "phosphor-svelte/lib/PencilSimpleIcon";
import PlusIcon from "phosphor-svelte/lib/PlusIcon";
import StackMinusIcon from "phosphor-svelte/lib/StackMinusIcon";
import StackPlusIcon from "phosphor-svelte/lib/StackPlusIcon";
import TrashIcon from "phosphor-svelte/lib/TrashIcon";
import type { Component } from "svelte";

import type { CtxMenuIconCode } from "./types";

export const ctxMenuIconByCode: Record<CtxMenuIconCode, Component> = {
  "arrow-clockwise": ArrowClockwiseIcon,
  "caret-right": CaretRightIcon,
  clipboard: ClipboardIcon,
  code: CodeIcon,
  info: InfoIcon,
  "line-vertical": LineVerticalIcon,
  pencil: PencilSimpleIcon,
  plus: PlusIcon,
  "stack-minus": StackMinusIcon,
  "stack-plus": StackPlusIcon,
  trash: TrashIcon,
};
