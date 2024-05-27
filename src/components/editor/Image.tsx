import { Box, SxProps, Theme } from "@mui/material";
import { Layer } from "../../types";
import {
  PointerEventHandler,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import EditorContext from "../../context/EditorContext";
import {
  translateLayer,
  rotateLayer,
  cropLayer,
  cropTranslate,
  resizeLayer,
} from "../../utils";

interface ImageProps {
  layer: Layer;
}

type FuncType =
  | "resize-tl"
  | "resize-tr"
  | "resize-bl"
  | "resize-br"
  | "crop-translate"
  | "crop-tl"
  | "crop-tr"
  | "crop-bl"
  | "crop-br"
  | "translate"
  | "rotate"
  | null;

const Image = ({ layer }: ImageProps) => {
  const [state, setState] = useState<Layer>(layer);
  const {
    updateLayer,
    selectedLayerId,
    setSelectedLayerId,
    layerIdInBgRemoval,
    isCrop,
  } = useContext(EditorContext);
  const imageRef = useRef<HTMLDivElement>(null);
  const func = useRef<FuncType>(null);
  const isSelected = useMemo(
    () => selectedLayerId === layer.id,
    [selectedLayerId, layer.id]
  );
  const isLoading = useMemo(
    () => layerIdInBgRemoval.includes(layer.id),
    [layerIdInBgRemoval, layer.id]
  );

  const handlePointerDown = useCallback(
    (type: FuncType): PointerEventHandler<HTMLDivElement> =>
      (e) => {
        e.stopPropagation();
        imageRef.current?.setPointerCapture(e.pointerId);
        func.current = type;
        console.log(`${type} capturing`);
      },
    []
  );

  const handlePointerMove: PointerEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      e.stopPropagation();
      if (e.pressure === 0 && func.current) {
        console.log(`${func.current} release`);
        imageRef.current?.releasePointerCapture(e.pointerId);
        func.current = null;
        updateLayer(state);
        return;
      }
      if (func.current === "translate") {
        setState((prev) => ({
          ...prev,
          ...translateLayer(prev, e.movementX, e.movementY),
        }));
      } else if (func.current?.startsWith("resize")) {
        setState((prev) => ({
          ...prev,
          ...resizeLayer(
            prev,
            e.movementX,
            e.movementY,
            func.current as
              | "resize-tl"
              | "resize-tr"
              | "resize-bl"
              | "resize-br"
          ),
        }));
      } else if (func.current === "crop-translate") {
        setState((prev) => ({
          ...prev,
          ...cropTranslate(prev, e.movementX, e.movementY),
        }));
      } else if (func.current?.startsWith("crop")) {
        setState((prev) => ({
          ...prev,
          ...cropLayer(
            prev,
            e.movementX,
            e.movementY,
            func.current as "crop-tl" | "crop-tr" | "crop-bl" | "crop-br"
          ),
        }));
      } else if (func.current === "rotate" && imageRef.current) {
        setState((prev) => ({
          ...prev,
          ...rotateLayer(
            imageRef.current!.getBoundingClientRect(),
            e.clientX,
            e.clientY
          ),
        }));
      }
    },
    [updateLayer, state]
  );

  const handlePointerUp: PointerEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      imageRef.current?.releasePointerCapture(e.pointerId);
      console.log(`${func.current} release`);
      e.stopPropagation();
      updateLayer(state);
      func.current = null;
    },
    [updateLayer, state]
  );

  return (
    <Box
      ref={imageRef}
      width={`${state.width}px`}
      height={`${state.height}px`}
      position="absolute"
      top={state.top}
      left={state.left}
      sx={{
        backgroundImage: `url(${state.content})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: `${(state._width / state.croppedWidth) * state.width}px ${(state._height / state.croppedHeight) * state.height}px`,
        backgroundPositionX: `-${(state.croppedLeft / state.croppedWidth) * state.width}px`,
        backgroundPositionY: `-${(state.croppedTop / state.croppedHeight) * state.height}px`,
        transform: `rotate(${state.rotation}deg)`,
        pointerEvents: isLoading ? "none" : "unset",
        filter: isLoading ? "grayscale(60%)" : "unset",
      }}
      onPointerMove={isSelected ? handlePointerMove : undefined}
      onPointerUp={isSelected ? handlePointerUp : undefined}
      onClick={() => setSelectedLayerId(state.id)}
    >
      <Box
        position="absolute"
        top={0}
        left={0}
        width={(state._width / state.croppedWidth) * state.width}
        height={(state._height / state.croppedHeight) * state.height}
        sx={{
          display: isCrop && selectedLayerId === layer.id ? "block" : "none",
          backgroundImage: `url(${state.content})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: `${(state._width / state.croppedWidth) * state.width}px ${(state._height / state.croppedHeight) * state.height}px`,
          transform: `translate(${(-state.croppedLeft / state.croppedWidth) * state.width}px, ${(-state.croppedTop / state.croppedHeight) * state.height}px)`,
          pointerEvents: "none",
          filter: isLoading ? "grayscale(60%)" : "unset",
          opacity: 0.3,
        }}
      />
      {isSelected && (
        <Box
          width="100%"
          height="100%"
          position="relative"
          border="1px solid #00b0ff"
          onPointerDown={handlePointerDown(
            isCrop ? "crop-translate" : "translate"
          )}
        >
          {!isCrop ? (
            <>
              <Box
                position="absolute"
                sx={rotateSx}
                onPointerDown={handlePointerDown("rotate")}
              />
              <Box
                position="absolute"
                top={-5}
                left={-5}
                onPointerDown={handlePointerDown("resize-tl")}
                sx={{ ...resizeSx, cursor: "nwse-resize" }}
              />
              <Box
                position="absolute"
                bottom={-5}
                left={-5}
                onPointerDown={handlePointerDown("resize-bl")}
                sx={{ ...resizeSx, cursor: "nesw-resize" }}
              />
              <Box
                position="absolute"
                top={-5}
                right={-5}
                onPointerDown={handlePointerDown("resize-tr")}
                sx={{ ...resizeSx, cursor: "nesw-resize" }}
              />
              <Box
                position="absolute"
                bottom={-5}
                right={-5}
                onPointerDown={handlePointerDown("resize-br")}
                sx={{ ...resizeSx, cursor: "nwse-resize" }}
              />
            </>
          ) : (
            <>
              <Box
                position="absolute"
                top={0}
                left={0}
                onPointerDown={handlePointerDown("crop-tl")}
                sx={cropSx}
              />
              <Box
                position="absolute"
                bottom={0}
                left={0}
                onPointerDown={handlePointerDown("crop-bl")}
                sx={cropSx}
              />
              <Box
                position="absolute"
                top={0}
                right={0}
                onPointerDown={handlePointerDown("crop-tr")}
                sx={cropSx}
              />
              <Box
                position="absolute"
                bottom={0}
                right={0}
                onPointerDown={handlePointerDown("crop-br")}
                sx={cropSx}
              />
            </>
          )}
        </Box>
      )}
    </Box>
  );
};

export default Image;

const resizeSx: SxProps<Theme> = {
  border: "1px solid #00b0ff",
  borderRadius: "50%",
  width: 10,
  height: 10,
  background: "#eee",
};

const cropSx: SxProps<Theme> = {
  outline: "1px solid #00b0ff",
  width: 15,
  height: 15,
  cursor: "url(/assets/crop.png) 9 9, auto",
};

const rotateSx: SxProps<Theme> = {
  border: "1px solid #00b0ff",
  borderRadius: "50%",
  width: 10,
  height: 10,
  top: -20,
  left: "50%",
  right: "50%",
  cursor: "url(/assets/rotate-cursor.png) 9 9, auto",
  background: "#eee",
};
