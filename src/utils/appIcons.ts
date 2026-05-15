// Keep these imports sorted alphabetically.
import ArrowClockwiseIcon from "phosphor-svelte/lib/ArrowClockwiseIcon";
import ArrowSquareOut from "phosphor-svelte/lib/ArrowSquareOutIcon";
import BracketsSquareIcon from "phosphor-svelte/lib/BracketsSquareIcon";
import BugIcon from "phosphor-svelte/lib/BugIcon";
import CaretRightIcon from "phosphor-svelte/lib/CaretRightIcon";
import CircleNotchIcon from "phosphor-svelte/lib/CircleNotchIcon";
import ClipboardIcon from "phosphor-svelte/lib/ClipboardIcon";
import CodeIcon from "phosphor-svelte/lib/CodeIcon";
import DotOutlineIcon from "phosphor-svelte/lib/DotOutlineIcon";
import DotsNine from "phosphor-svelte/lib/DotsNineIcon";
import DotsSix from "phosphor-svelte/lib/DotsSixIcon";
import EmptyIcon from "phosphor-svelte/lib/EmptyIcon";
import FunctionIcon from "phosphor-svelte/lib/FunctionIcon";
import ImageSquare from "phosphor-svelte/lib/ImageSquareIcon";
import InfoIcon from "phosphor-svelte/lib/InfoIcon";
import LineVerticalIcon from "phosphor-svelte/lib/LineVerticalIcon";
import LinkSimpleBreakIcon from "phosphor-svelte/lib/LinkSimpleBreakIcon";
import LinkSimpleIcon from "phosphor-svelte/lib/LinkSimpleIcon";
import List from "phosphor-svelte/lib/ListIcon";
import ListNumbers from "phosphor-svelte/lib/ListNumbersIcon";
import MagnifyingGlass from "phosphor-svelte/lib/MagnifyingGlassIcon";
import Moon from "phosphor-svelte/lib/MoonIcon";
import Notches from "phosphor-svelte/lib/NotchesIcon";
import NotePencil from "phosphor-svelte/lib/NotePencilIcon";
import PencilSimpleIcon from "phosphor-svelte/lib/PencilSimpleIcon";
import PlusIcon from "phosphor-svelte/lib/PlusIcon";
import Shapes from "phosphor-svelte/lib/ShapesIcon";
import SignIn from "phosphor-svelte/lib/SignInIcon";
import SignOut from "phosphor-svelte/lib/SignOutIcon";
import StackMinus from "phosphor-svelte/lib/StackMinusIcon";
import StackPlus from "phosphor-svelte/lib/StackPlusIcon";
import Sun from "phosphor-svelte/lib/SunIcon";
import TrashIcon from "phosphor-svelte/lib/TrashIcon";
import Warning from "phosphor-svelte/lib/WarningIcon";
import Wrench from "phosphor-svelte/lib/WrenchIcon";
import XCircleIcon from "phosphor-svelte/lib/XCircleIcon";
import X from "phosphor-svelte/lib/XIcon";
import type { Component } from "svelte";

const appIcons = {
  "arrow-clockwise": ArrowClockwiseIcon,
  "arrow-square-out": ArrowSquareOut,
  "brackets-square": BracketsSquareIcon,
  bug: BugIcon,
  "caret-right": CaretRightIcon,
  "circle-notch": CircleNotchIcon,
  clipboard: ClipboardIcon,
  code: CodeIcon,
  "dot-outline": DotOutlineIcon,
  "dots-six": DotsSix,
  "dots-nine": DotsNine,
  empty: EmptyIcon,
  "function": FunctionIcon,
  "image-square": ImageSquare,
  info: InfoIcon,
  "link-simple": LinkSimpleIcon,
  "link-simple-break": LinkSimpleBreakIcon,
  "line-vertical": LineVerticalIcon,
  list: List,
  "list-numbers": ListNumbers,
  "magnifying-glass": MagnifyingGlass,
  "moon": Moon,
  notches: Notches,
  "note-pencil": NotePencil,
  pencil: PencilSimpleIcon,
  plus: PlusIcon,
  shapes: Shapes,
  "sign-in": SignIn,
  "sign-out": SignOut,
  "stack-minus": StackMinus,
  "stack-plus": StackPlus,
  "sun": Sun,
  trash: TrashIcon,
  warning: Warning,
  wrench: Wrench,
  x: X,
  "x-circle": XCircleIcon,
} as const;

const defaultAppIcon = Warning;

type AppIconCode = keyof typeof appIcons;

function getAppIcon(code: string): Component {
  return appIcons[code as AppIconCode] ?? defaultAppIcon;
}

export { type AppIconCode, getAppIcon };