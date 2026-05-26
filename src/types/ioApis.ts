import type { grph } from "@/types/grph";

import type { flow } from "./flow";
import type { AssetSummary, AssetType, StoredAssetMeta, StoredMediaMeta } from "./worker-message-types";

export namespace ioApis {
  interface VoidType {};

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
        meta: StoredAssetMeta;
        bitmap: ImageBitmap;
      };
    },

    listAssets: {
      request: {
        assetType: AssetType;
      };
      response: {
        assetEntries: { summary: AssetSummary; thumbnail: ImageBitmap }[];
      };
    },

    registerPreview: {
      request: {
        assetKey: string;
        offscreen: OffscreenCanvas;
      };
      response: {
        regKey: string;
      };
    },

    unRegisterPreview: {
      request: {
        regKey: string;
      };
      response: VoidType;
    },

    fulfillAwaiters: {
      request: {
        awaitInfos: flow.AwaitEntry[]; 
      };
      response: VoidType;
    };

  };

  export type Names = keyof ApiDict;
  export type Request<K extends Names> = ApiDict[K]["request"];
  export type Response<K extends Names> = ApiDict[K]["response"];
}