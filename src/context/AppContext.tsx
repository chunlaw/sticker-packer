import React, {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Stores, getStoreData, initDB, removeStoreData, saveData } from "../db";
import { useParams } from "react-router-dom";
import { Pack } from "../types";
import { zipPack } from "../utils";
import { saveAs } from "file-saver";

interface AppContextState {
  isDBReady: boolean;
  isBatchProcessing: boolean;
  pack: Pack;
}

interface AppContextValue extends AppContextState {
  setIsBatchProcessing: (isBatchProcessing: boolean) => void;
  setPackField: (field: keyof Pack, value: any) => void;
  addStickers: (stickerIds: string[]) => void;
  removeSticker: (stickerId: string) => void;
  downloadPack: (pack: Pack) => void;
}

const AppContext = React.createContext({} as AppContextValue);

export const AppContextProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppContextState>(DEFAULT_STATE);
  const { packId, stickerId } = useParams();

  const setIsBatchProcessing = useCallback((v: boolean) => {
    setState((prev) => ({
      ...prev,
      isBatchProcessing: v,
    }));
  }, []);

  const setPackField = useCallback((field: keyof Pack, value: any) => {
    setState((prev) => {
      const pack = {
        ...prev.pack,
        [field]: value,
      };
      saveData<Pack>(Stores.Packs, pack);
      return {
        ...prev,
        pack,
      };
    });
  }, []);

  const addStickers = useCallback((stickerIds: string[]) => {
    setState((prev) => {
      const set = new Set([...prev.pack.stickerIds, ...stickerIds]);
      const pack: Pack = {
        ...prev.pack,
        stickerIds: Array.from(set),
      };
      saveData<Pack>(Stores.Packs, pack);
      return {
        ...prev,
        pack,
      };
    });
  }, []);

  const removeSticker = useCallback((stickerId: string) => {
    setState((prev) => {
      const pack: Pack = {
        ...prev.pack,
        stickerIds: prev.pack.stickerIds.filter((v) => v !== stickerId),
      };
      saveData<Pack>(Stores.Packs, pack).then(() => {
        removeStoreData(Stores.Stickers, stickerId);
      });
      return {
        ...prev,
        pack,
      };
    });
  }, []);

  const downloadPack = useCallback((pack: Pack) => {
    zipPack(pack.id).then((blob) => {
      saveAs(blob, `${pack.title || pack.id}.zip`);
    });
  }, []);

  useEffect(() => {
    initDB().then((isDBReady) => {
      setState((prev) => ({ ...prev, isDBReady }));
    });
  }, []);

  useEffect(() => {
    if (!state.isDBReady) {
      return;
    }
    if (packId !== undefined && state.pack.id !== packId) {
      getStoreData<Pack>(Stores.Packs, packId)
        .then((pack) => {
          setState((prev) => ({
            ...prev,
            pack,
          }));
        })
        .catch(() => {
          setState((prev) => ({
            ...prev,
            pack: {
              ...prev.pack,
              id: packId,
            },
          }));
        });
    } else if (state.pack.id === packId && stickerId !== undefined) {
      setState((prev) => {
        if (prev.pack.stickerIds.includes(stickerId)) return prev;
        const pack = {
          ...prev.pack,
          stickerIds: [...prev.pack.stickerIds, stickerId],
        };
        saveData<Pack>(Stores.Packs, pack);
        return {
          ...prev,
          pack,
        };
      });
    }
  }, [state.isDBReady, packId, stickerId, state.pack.id]);

  useEffect(() => {
    if (packId === undefined) {
      setState((prev) => ({
        ...prev,
        pack: JSON.parse(JSON.stringify(DEFAULT_STATE)).pack,
      }));
    }
  }, [packId]);

  const contextValue = useMemo<AppContextValue>(
    () => ({
      ...state,
      setIsBatchProcessing,
      setPackField,
      removeSticker,
      downloadPack,
      addStickers,
    }),
    [
      state,
      setIsBatchProcessing,
      setPackField,
      removeSticker,
      downloadPack,
      addStickers,
    ]
  );

  if (!state.isDBReady) {
    return <></>;
  }

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};

export default AppContext;

const DEFAULT_STATE: AppContextState = {
  isDBReady: false,
  isBatchProcessing: false,
  pack: {
    id: "",
    title: "",
    author: "",
    stickerIds: [],
    tags: [],
  },
};
