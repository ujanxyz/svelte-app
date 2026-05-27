import type { HitCandidate, RotatedRect } from "./types";

const GraphicTypeEnums = Object.freeze({
  Rect: "rect",
  Circle: "circle",
  Line: "line",
  Star: "star",
});

type GraphicType = typeof GraphicTypeEnums[keyof typeof GraphicTypeEnums];

class AbstractGraphic {
  readonly #type: GraphicType;
  readonly #hitData: HitCandidate;
  #rrect: RotatedRect;

  public constructor(type: GraphicType) {
    this.#type = type;
    this.#hitData = { hitId: 0, hitColor: "#000000" };
    this.#rrect = { x: 0, y: 0, width: 0, height: 0, rotationDeg: 0 };
  }

  public setHitData(hitId: number, hitColor: string): void {
    this.#hitData.hitId = hitId;
    this.#hitData.hitColor = hitColor;
  }

  // TODO: Replace applyFrameTransformToElement with this.
  applyRRect(frame: RotatedRect): void {
    this.#rrect = frame;
  }
}

export { AbstractGraphic };