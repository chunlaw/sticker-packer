import { Box, IconButton, SxProps, Theme, Typography } from "@mui/material";
import { Pack, Sticker } from "../types";
import { useCallback, useEffect, useState } from "react";
import { Stores, getStoreData } from "../db";
import { Close as DeleteIcon } from "@mui/icons-material";
import MockImage from "./MockImage";

interface PackThumbnailProps {
  pack: Pack;
}

const PackThumbnail = ({ pack }: PackThumbnailProps) => {
  const [sticker, setSticker] = useState<Sticker>(DEFAULT_STICKER);

  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Confirm remove?")) {
      console.log("hi");
    }
  }, []);

  useEffect(() => {
    if (pack.stickerIds.length !== 0) {
      getStoreData<Sticker>(Stores.Stickers, pack.stickerIds[0]).then(
        (sticker) => {
          setSticker(sticker);
        }
      );
    }
  }, [pack.stickerIds]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      gap={1}
      py={1}
      alignItems="center"
      width="100%"
      position="relative"
    >
      <Box width={150} height={150}>
        <Box
          position="relative"
          width={500}
          height={500}
          sx={{
            transform: "scale(0.3)",
            transformOrigin: "top left",
            overflow: "hidden",
          }}
        >
          {sticker.layers.map((layer, idx) => (
            <MockImage key={`layer-${idx}`} layer={layer} />
          ))}
        </Box>
      </Box>
      <Typography variant="h6">{pack.title || "<no name>"}</Typography>
      <IconButton
        size="small"
        sx={removeBtnSx}
        onClick={handleRemove}
        className="remove"
      >
        <DeleteIcon />
      </IconButton>
    </Box>
  );
};

export default PackThumbnail;

const DEFAULT_STICKER: Sticker = {
  id: "",
  layers: [],
  emoji: "🫥",
};

const removeBtnSx: SxProps<Theme> = {
  position: "absolute",
  right: 4,
  visibility: "hidden",
};
