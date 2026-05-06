import ArrowClockwiseIcon from "phosphor-svelte/lib/ArrowClockwiseIcon";
import BugIcon from "phosphor-svelte/lib/BugIcon";
import CaretRightIcon from "phosphor-svelte/lib/CaretRightIcon";
import ClipboardIcon from "phosphor-svelte/lib/ClipboardIcon";
import CodeIcon from "phosphor-svelte/lib/CodeIcon";
import DotsNine from "phosphor-svelte/lib/DotsNineIcon";
import DotsSix from "phosphor-svelte/lib/DotsSixIcon";
import InfoIcon from "phosphor-svelte/lib/InfoIcon";
import LineVerticalIcon from "phosphor-svelte/lib/LineVerticalIcon";
import PencilSimpleIcon from "phosphor-svelte/lib/PencilSimpleIcon";
import PlusIcon from "phosphor-svelte/lib/PlusIcon";
import StackMinusIcon from "phosphor-svelte/lib/StackMinusIcon";
import StackPlusIcon from "phosphor-svelte/lib/StackPlusIcon";
import TrashIcon from "phosphor-svelte/lib/TrashIcon";
import WarningIcon from "phosphor-svelte/lib/WarningIcon";
import XCircleIcon from "phosphor-svelte/lib/XCircleIcon";
import type { Component } from "svelte";

const appIcons = {
  "arrow-clockwise": ArrowClockwiseIcon,
  bug: BugIcon,
  "caret-right": CaretRightIcon,
  clipboard: ClipboardIcon,
  code: CodeIcon,
  "dots-six": DotsSix,
  "dots-nine": DotsNine,
  info: InfoIcon,
  "line-vertical": LineVerticalIcon,
  pencil: PencilSimpleIcon,
  plus: PlusIcon,
  "stack-minus": StackMinusIcon,
  "stack-plus": StackPlusIcon,
  trash: TrashIcon,
  warning: WarningIcon,
  "x-circle": XCircleIcon,
} as const;

const defaultAppIcon = WarningIcon;

type AppIconCode = keyof typeof appIcons;

function getAppIcon(code: string): Component {
  return appIcons[code as AppIconCode] ?? defaultAppIcon;
}

export { type AppIconCode, getAppIcon };