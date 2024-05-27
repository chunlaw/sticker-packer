import { Box, IconButton, SxProps, Theme, Typography } from "@mui/material";
import { Sticker } from "../types";
import { useCallback, useContext, useEffect, useState } from "react";
import { Stores, getStoreData } from "../db";
import { Close as DeleteIcon } from "@mui/icons-material";
import AppContext from "../context/AppContext";
import MockImage from "./MockImage";

interface ThumbnailProps {
  id: string;
}

const Thumbnail = ({ id }: ThumbnailProps) => {
  const [sticker, setSticker] = useState<Sticker>(DEFAULT_STICKER);
  const { removeSticker } = useContext(AppContext);

  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (window.confirm("Confirm remove?")) {
        removeSticker(id);
      }
    },
    [removeSticker, id]
  );

  useEffect(() => {
    getStoreData<Sticker>(Stores.Stickers, id).then((sticker) => {
      setSticker(sticker);
    });
  }, [id]);

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
      <Typography variant="h6">{sticker.emoji}</Typography>
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

export default Thumbnail;

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
