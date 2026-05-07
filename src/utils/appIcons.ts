import ArrowClockwiseIcon from "phosphor-svelte/lib/ArrowClockwiseIcon";
import BugIcon from "phosphor-svelte/lib/BugIcon";
import CaretRightIcon from "phosphor-svelte/lib/CaretRightIcon";
import ClipboardIcon from "phosphor-svelte/lib/ClipboardIcon";
import CodeIcon from "phosphor-svelte/lib/CodeIcon";
import DotsNine from "phosphor-svelte/lib/DotsNineIcon";
import DotsSix from "phosphor-svelte/lib/DotsSixIcon";
import FunctionIcon from "phosphor-svelte/lib/FunctionIcon";
import ImageSquare from "phosphor-svelte/lib/ImageSquareIcon";
import InfoIcon from "phosphor-svelte/lib/InfoIcon";
import LineVerticalIcon from "phosphor-svelte/lib/LineVerticalIcon";
import List from "phosphor-svelte/lib/ListIcon";
import ListNumbers from "phosphor-svelte/lib/ListNumbersIcon";
import MagnifyingGlass from "phosphor-svelte/lib/MagnifyingGlassIcon";
import PencilSimpleIcon from "phosphor-svelte/lib/PencilSimpleIcon";
import PlusIcon from "phosphor-svelte/lib/PlusIcon";
import Shapes from "phosphor-svelte/lib/ShapesIcon";
import StackMinusIcon from "phosphor-svelte/lib/StackMinusIcon";
import StackPlusIcon from "phosphor-svelte/lib/StackPlusIcon";
import TrashIcon from "phosphor-svelte/lib/TrashIcon";
import WarningIcon from "phosphor-svelte/lib/WarningIcon";
import XCircleIcon from "phosphor-svelte/lib/XCircleIcon";
import X from "phosphor-svelte/lib/XIcon";
import type { Component } from "svelte";

const appIcons = {
  "arrow-clockwise": ArrowClockwiseIcon,
  bug: BugIcon,
  "caret-right": CaretRightIcon,
  clipboard: ClipboardIcon,
  code: CodeIcon,
  "dots-six": DotsSix,
  "dots-nine": DotsNine,
  "function": FunctionIcon,
  "image-square": ImageSquare,
  info: InfoIcon,
  "line-vertical": LineVerticalIcon,
  list: List,
  "list-numbers": ListNumbers,
  "magnifying-glass": MagnifyingGlass,
  pencil: PencilSimpleIcon,
  plus: PlusIcon,
  shapes: Shapes,
  "stack-minus": StackMinusIcon,
  "stack-plus": StackPlusIcon,
  trash: TrashIcon,
  warning: WarningIcon,
  x: X,
  "x-circle": XCircleIcon,
} as const;

const defaultAppIcon = WarningIcon;

type AppIconCode = keyof typeof appIcons;

function getAppIcon(code: string): Component {
  return appIcons[code as AppIconCode] ?? defaultAppIcon;
}

export { type AppIconCode, getAppIcon };