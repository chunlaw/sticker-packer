import React, {
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Layer, Sticker } from "../types";
import {
  addStrokeEffect,
  getImgDimensions,
  removeLayerBackground,
} from "../utils";
import { v4 as uuidv4 } from "uuid";
import { Stores, getStoreData, saveData } from "../db";
import { useParams } from "react-router-dom";
import AppContext from "./AppContext";

interface EditorContextState {
  isCrop: boolean;
  id: string;
  layers: Layer[];
  emoji: string;
  selectedLayerId: string;
  layerIdInBgRemoval: string[];
}

interface EditorContextValue extends EditorContextState {
  addLayer: (content: string) => void;
  updateLayer: (layer: Layer) => void;
  deleteLayer: (layerId: string) => void;
  toggleCrop: () => void;
  setSelectedLayerId: (id: string) => void;
  cleanLayerBg: (layerId: string) => void;
  outlineLayer: (color: string, thickness: number, layerId: string) => void;
  setEmoji: (emoji: string) => void;
}

const EditorContext = React.createContext({} as EditorContextValue);

export const EditorContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [state, setState] = useState<EditorContextState>(DEFAULT_STATE);
  const { isDBReady } = useContext(AppContext);
  const { stickerId } = useParams();

  const addLayer = useCallback((content: string) => {
    getImgDimensions(content).then(({ width, height }) => {
      const ratio = width / height;
      const maxWidth = Math.min(500, width);
      const maxHeight = Math.min(500, height);
      const _width = ratio > 1 ? maxWidth : maxHeight * ratio;
      const _height = ratio > 1 ? maxWidth / ratio : maxHeight;
      const id = uuidv4();
      setState((prev) => ({
        ...prev,
        layers: [
          ...prev.layers,
          {
            id,
            _width: width,
            _height: height,
            width: _width,
            height: _height,
            rotation: 0,
            top: 0,
            left: 0,
            content,
            croppedTop: 0,
            croppedLeft: 0,
            croppedHeight: height,
            croppedWidth: width,
          },
        ],
        selectedLayerId: id,
      }));
    });
  }, []);

  const updateLayer = useCallback((layer: Layer) => {
    setState((prev) => {
      const layers = [...prev.layers];
      const layerIdx = layers.findIndex(({ id }) => id === layer.id);
      layers[layerIdx] = layer;
      return {
        ...prev,
        layers,
      };
    });
  }, []);

  const deleteLayer = useCallback((layerId: string) => {
    setState((prev) => ({
      ...prev,
      layers: prev.layers.filter(({ id }) => id !== layerId),
      selectedLayerId:
        prev.selectedLayerId === layerId ? "" : prev.selectedLayerId,
    }));
  }, []);

  const toggleCrop = useCallback(() => {
    setState((prev) => ({ ...prev, isCrop: !prev.isCrop }));
  }, []);

  const cleanLayerBg = useCallback(
    (layerId: string) => {
      setState((prev) => ({
        ...prev,
        layerIdInBgRemoval: [...prev.layerIdInBgRemoval, layerId],
      }));
      removeLayerBackground(
        state.layers[state.layers.findIndex(({ id }) => id === layerId)]
      ).then(({ content }) => {
        setState((prev) => {
          const layers = [...prev.layers];
          const layerIdx = layers.findIndex(({ id }) => id === layerId);
          layers[layerIdx].content = content!;
          return {
            ...prev,
            layers,
            layerIdInBgRemoval: prev.layerIdInBgRemoval.filter(
              (v) => v !== layerId
            ),
          };
        });
      });
    },
    [state.layers]
  );

  const outlineLayer = useCallback(
    (color: string, thickness: number, layerId: string) => {
      const layer =
        state.layers[state.layers.findIndex(({ id }) => layerId === id)];
      addStrokeEffect(layer, color, thickness).then(({ content }) => {
        setState((prev) => {
          const layers = [...prev.layers];
          const layerIdx = layers.findIndex(({ id }) => id === layerId);
          layers[layerIdx].content = content!;
          return {
            ...prev,
            layers,
          };
        });
      });
    },
    [state.layers]
  );

  const setSelectedLayerId = useCallback((selectedLayerId: string) => {
    setState((prev) => ({ ...prev, selectedLayerId }));
  }, []);

  const setEmoji = useCallback((emoji: string) => {
    setState((prev) => ({
      ...prev,
      emoji,
    }));
  }, []);

  useEffect(() => {
    const handleKeydown = (ev: KeyboardEvent) => {
      if (ev.key === "Backspace" || ev.key === "Delete") {
        setState((prev) => ({
          ...prev,
          selectedLayerId: "",
          layers: prev.layers.filter(({ id }) => id !== prev.selectedLayerId),
        }));
      }
    };
    window.addEventListener("keydown", handleKeydown);
    return () => {
      window.removeEventListener("keydown", handleKeydown);
    };
  }, [deleteLayer]);

  useEffect(() => {
    if (!isDBReady) return;
    if (stickerId === state.id) {
      saveData(Stores.Stickers, {
        id: state.id,
        layers: state.layers,
        emoji: state.emoji,
      });
    } else if (stickerId !== undefined) {
      getStoreData<Sticker>(Stores.Stickers, stickerId!)
        .then(({ id, layers, emoji }) => {
          console.log(layers);
          setState({
            ...DEFAULT_STATE,
            id,
            layers,
            emoji,
          });
        })
        .catch(() => {
          setState((prev) => ({
            ...prev,
            id: stickerId as string,
          }));
        });
    }
  }, [isDBReady, state.layers, stickerId, state.id, state.emoji]);

  useEffect(() => {
    if (stickerId === undefined) {
      setState(JSON.parse(JSON.stringify(DEFAULT_STATE)));
    }
  }, [stickerId]);

  const contextValue: EditorContextValue = useMemo(
    () => ({
      ...state,
      toggleCrop,
      addLayer,
      updateLayer,
      deleteLayer,
      setSelectedLayerId,
      cleanLayerBg,
      outlineLayer,
      setEmoji,
    }),
    [
      state,
      toggleCrop,
      addLayer,
      updateLayer,
      deleteLayer,
      setSelectedLayerId,
      cleanLayerBg,
      outlineLayer,
      setEmoji,
    ]
  );

  return (
    <EditorContext.Provider value={contextValue}>
      {children}
    </EditorContext.Provider>
  );
};

export default EditorContext;

const DEFAULT_STATE: EditorContextState = {
  isCrop: false,
  id: "",
  layers: [],
  emoji: "🫥",
  selectedLayerId: "",
  layerIdInBgRemoval: [],
};
