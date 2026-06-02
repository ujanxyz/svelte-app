import type { base } from "@/types/base";

import { VIEW_SCALE } from "./DesignEditorEngine";
import type { IDimension } from "./types";

const DEFAULT_PAGE_DIMENSION: IDimension = { width: 800, height: 600 };
const MIN_PADDING = 160;

function clampDimension(input: Partial<IDimension>, fallback: IDimension): IDimension {
  const width = Math.max(1, Math.round(input.width ?? fallback.width));
  const height = Math.max(1, Math.round(input.height ?? fallback.height));
  return { width, height };
}

function createPageStore() {
  let pageDimension = $state<IDimension>({ ...DEFAULT_PAGE_DIMENSION });
  let zoomLevel = $state<base.ZoomLevel>({ x: 0, y: 0, zoom: 1 });

  const viewDimension = $derived.by<IDimension>(() => {
    const minWidth = pageDimension.width + MIN_PADDING;
    const minHeight = pageDimension.height + MIN_PADDING;
    return {
      width: Math.max(minWidth, Math.round(pageDimension.width * VIEW_SCALE)),
      height: Math.max(minHeight, Math.round(pageDimension.height * VIEW_SCALE)),
    };
  });

  function setPageDimension(next: Partial<IDimension>): void {
    pageDimension = clampDimension(next, pageDimension);
  }

  function setZoomLevel(next: base.ZoomLevel): void {
    zoomLevel = {
      x: next.x,
      y: next.y,
      zoom: next.zoom,
    };
  }

  return {
    get pageDimension(): IDimension {
      return pageDimension;
    },
    get viewDimension(): IDimension {
      return viewDimension;
    },
    get zoomLevel(): base.ZoomLevel {
      return zoomLevel;
    },
    setPageDimension,
    setZoomLevel,
    MIN_PADDING,
  };
}

export const pageStore = createPageStore();
