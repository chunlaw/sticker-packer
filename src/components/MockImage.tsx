import { Box } from "@mui/material";
import { Layer } from "../types";

interface MockImageProps {
  layer: Layer;
}

const MockImage = ({ layer }: MockImageProps) => {
  return (
    <Box
      width={`${layer.width}px`}
      height={`${layer.height}px`}
      position="absolute"
      top={layer.top}
      left={layer.left}
      sx={{
        backgroundImage: `url(${layer.content})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: `${(layer._width / layer.croppedWidth) * layer.width}px ${(layer._height / layer.croppedHeight) * layer.height}px`,
        backgroundPositionX: `-${(layer.croppedLeft / layer.croppedWidth) * layer.width}px`,
        backgroundPositionY: `-${(layer.croppedTop / layer.croppedHeight) * layer.height}px`,
        transform: `rotate(${layer.rotation}deg)`,
        pointerEvents: "none",
      }}
    />
  );
};

export default MockImage;
