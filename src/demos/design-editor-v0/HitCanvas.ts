import { createHitColorGen } from "@/utils/HitColorGen";

import type { GraphicBase } from "./GraphicBase";
import type { HitCandidate } from "./types";

type HitCtx = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

/**
 * HitCanvas manages color-key based hit detection over a dedicated canvas.
 *
 * It allocates opaque hit colors (black is reserved background), renders shapes
 * with their hit colors, and decodes coordinates back to hit IDs.
 */
export class HitCanvas {
  #drawCanvas: HTMLCanvasElement | OffscreenCanvas | null = null;
  #ctx: HitCtx | null = null;

  readonly #colorGen = createHitColorGen();
  readonly #freeColorPool: Array<{ id: number; col: string }> = [];

  /** Configure hit-canvas to render into an onscreen canvas. */
  public configureOnscreen(canvas: HTMLCanvasElement): void {
    this.#drawCanvas = canvas;
    this.#ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!this.#ctx) throw new Error("Failed to create hit canvas context");

    this.#ctx.imageSmoothingEnabled = false;
    this.#clearToBlack();
  }

  /** Configure hit-canvas to render into an offscreen canvas with given size. */
  public configureOffscreen(width: number, height: number): void {
    if (typeof OffscreenCanvas !== "undefined") {
      this.#drawCanvas = new OffscreenCanvas(width, height);
      this.#ctx = this.#drawCanvas.getContext("2d", { willReadFrequently: true });
      if (!this.#ctx) throw new Error("Failed to create offscreen hit canvas context");
    } else {
      const fallback = document.createElement("canvas");
      fallback.width = width;
      fallback.height = height;
      this.#drawCanvas = fallback;
      this.#ctx = fallback.getContext("2d", { willReadFrequently: true });
      if (!this.#ctx) throw new Error("Failed to create fallback hit canvas context");
    }

    this.#ctx.imageSmoothingEnabled = false;
    this.#clearToBlack();
  }

  /** Allocate or reuse a hit color and set hit fields on candidate. */
  public initGraphics(elems: GraphicBase[]): void {
    elems.forEach((elem) => {
      const nextHit =
        this.#freeColorPool.length > 0
          ? (this.#freeColorPool.pop() as { id: number; col: string })
          : this.#colorGen.next();
      elem.setHitData(nextHit.id, nextHit.col);
    });
  }

  /** Return hit colors of deleted elements back to the reuse pool. */
  public releaseCandidates(elems: HitCandidate[]): void {
    for (const elem of elems) {
      if (!elem.hitColor || elem.hitColor === "#000000FF") continue;
      if (!elem.hitId || elem.hitId < 1) continue;
      const exists = this.#freeColorPool.some((free) => free.id === elem.hitId);
      if (!exists) {
        this.#freeColorPool.push({ id: elem.hitId, col: elem.hitColor });
      }
    }
  }

  /** Redraw the full hit canvas from candidates using their drawHit method. */
  public refresh(elems: HitCandidate[]): void {
    if (!this.#ctx || !this.#drawCanvas) return;

    this.#ctx.globalAlpha = 1;
    this.#ctx.globalCompositeOperation = "source-over";
    this.#clearToBlack();

    const drawables = elems as Array<HitCandidate & { drawHit?: (ctx: HitCtx) => void }>;
    for (const elem of drawables) {
      if (!elem.drawHit) continue;
      elem.drawHit(this.#ctx);
    }
  }

  /**
   * Looks up hit id at the given canvas-space coordinate.
   * Returns -1 when outside canvas or no candidate is mapped.
   */
  public lookup(coordinate: { x: number; y: number }): number {
    return this.#getHitIdAt(coordinate.x, coordinate.y);
  }

  public destroy(): void {
    this.#drawCanvas = null;
    this.#ctx = null;
  }

  #clearToBlack(): void {
    if (!this.#ctx || !this.#drawCanvas) return;
    this.#ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.#ctx.globalAlpha = 1;
    this.#ctx.globalCompositeOperation = "source-over";
    this.#ctx.fillStyle = "#000000";
    this.#ctx.fillRect(0, 0, this.#drawCanvas.width, this.#drawCanvas.height);
  }

  #getHitIdAt(x: number, y: number): number {
    if (!this.#ctx || !this.#drawCanvas) return -1;
    if (x < 0 || y < 0 || x >= this.#drawCanvas.width || y >= this.#drawCanvas.height) {
      return -1;
    }

    const pixel = this.#ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1);
    return this.#colorGen.indexOfPixel(pixel);
  }
}
