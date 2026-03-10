import type { ClientXY, StatusOr } from "../../overlayv2/types";

export type MenuFunction = (clientXY: ClientXY) => Promise<StatusOr<string>>;
export type PopupFunction = () => Promise<StatusOr<string>>;

export interface XYActions {
  name: string;
  menuInPane?: MenuFunction;
  menuInNode?: MenuFunction;
  menuInEdge?: MenuFunction;
  menuInSelection?: MenuFunction;
  popupGallery?: PopupFunction;
}
