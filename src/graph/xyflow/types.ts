import type { ClientXY, StatusOr } from "../../overlayv2/types";

export interface XYActions {
  menuInPane?: (clientXY: ClientXY) => Promise<StatusOr<string>>;
  menuInNode?: (clientXY: ClientXY) => Promise<StatusOr<string>>;
  menuInEdge?: (clientXY: ClientXY) => Promise<StatusOr<string>>;
  menuInSelection?: (clientXY: ClientXY) => Promise<StatusOr<string>>;
  name: string;
}

