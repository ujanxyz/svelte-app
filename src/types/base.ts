export namespace base {
  export interface StatusOr<T> {
    status: string;
    value?: T;
    reason?: any;
  }

  export interface XYPosition {
    x: number;
    y: number;
  }

  export interface IDimension {
    width: number;
    height: number;
  } 

  export interface ZoomLevel {
    x: number;
    y: number;
    zoom: number;
  }
}
