import type { StoredMediaMeta } from "./worker-message-types";

export namespace ioApis {
  export interface ApiDict {
    uploadMedia: {
      request: {
        file: File;
        overwrite: boolean;
      };
      response: {
        meta: StoredMediaMeta;
        thumbnail: ImageBitmap;
      };
    },

    listMedia: {
      request: {};
      response: {
        mediaEntries: { meta: StoredMediaMeta; thumbnail: ImageBitmap }[];
      };
    },

    deleteMedia: {
      request: {
        ids: string[];
      };
      response: {
        deletedIds: string[];
      };
    },

    getMediaData: {
      request: {
        id: string;
      };
      response: {
        meta: StoredMediaMeta;
        bitmap: ImageBitmap;
      };
    },

    // Stage media as bitmaps for input nodes prior to execution.
    stageMedia: {
      request: {
        ids: string[];
      };
      response: {
        stagedBitmaps: ImageBitmap[];
      };
    },

  };

  export type Names = keyof ApiDict;
  export type Request<K extends Names> = ApiDict[K]["request"];
  export type Response<K extends Names> = ApiDict[K]["response"];
}