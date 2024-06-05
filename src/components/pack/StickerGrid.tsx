import { Box, Grid, SxProps, Theme, Typography } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import React, { useCallback, useContext, useRef, useState } from "react";
import AppContext from "../../context/AppContext";
import Thumbnail from "../../components/Thumbnail";
import {
  getImgDimensions,
  getLayersFromImgFiles,
  randomEmoji,
} from "../../utils";
import { Sticker } from "../../types";
import { Stores, saveData } from "../../db";

const StickerGrid = () => {
  const { pack, addStickers } = useContext(AppContext);
  const [dragging, setDragging] = useState<boolean>(false);
  const isDragging = useRef<boolean>(false);
  const navigate = useNavigate();

  const handleDragging = useCallback(
    (
      e: React.DragEvent<HTMLDivElement>,
      type: "dragEnter" | "dragOver" | "dragLeave" | "drop"
    ) => {
      e.preventDefault();
      e.stopPropagation();
      if (type === "dragEnter" || type === "dragOver") {
        if (isDragging.current === false) {
          setDragging(true);
          isDragging.current = true;
        }
      } else if (type === "dragLeave") {
        if (isDragging.current === true) {
          setDragging(false);
          isDragging.current = false;
        }
      } else if (type === "drop") {
        const { files } = e.dataTransfer;
        getLayersFromImgFiles(files).then(async (base64s) => {
          const stickerIds = [];
          for (const base64 of base64s) {
            const { width, height } = await getImgDimensions(base64);
            const ratio = width / height;
            const maxWidth = Math.min(500, width);
            const maxHeight = Math.min(500, height);
            const _width = ratio > 1 ? maxWidth : maxHeight * ratio;
            const _height = ratio > 1 ? maxWidth / ratio : maxHeight;
            const sticker: Sticker = {
              id: uuidv4(),
              layers: [
                {
                  id: uuidv4(),
                  _width: width,
                  _height: height,
                  width: _width,
                  height: _height,
                  rotation: 0,
                  top: 250 - _height / 2,
                  left: 250 - _width / 2,
                  content: base64,
                  croppedTop: 0,
                  croppedLeft: 0,
                  croppedHeight: height,
                  croppedWidth: width,
                },
              ],
              emoji: randomEmoji(),
            };
            stickerIds.push(sticker.id);
            await saveData(Stores.Stickers, sticker);
          }
          addStickers(stickerIds);
        });
        if (isDragging.current === true) {
          setDragging(false);
          isDragging.current = false;
        }
      }
    },
    [addStickers]
  );

  return (
    <Box
      overflow="scroll"
      py={2}
      flex={1}
      onDragEnter={(e) => handleDragging(e, "dragEnter")}
      onDragOver={(e) => handleDragging(e, "dragOver")}
      onDragLeave={(e) => handleDragging(e, "dragLeave")}
      onDrop={(e) => handleDragging(e, "drop")}
      position="relative"
    >
      <Grid container alignItems="center">
        {pack.stickerIds.map((id) => (
          <Grid
            item
            sx={gridSx}
            md={3}
            sm={4}
            xs={6}
            onClick={() => navigate(`/${pack.id}/${id}`)}
            key={`sticker-${id}`}
          >
            <Thumbnail id={id} />
          </Grid>
        ))}
        <Grid
          item
          sx={gridSx}
          md={3}
          sm={4}
          xs={6}
          onClick={() => navigate(`/${pack.id}/${uuidv4()}`)}
        >
          <AddIcon />
        </Grid>
      </Grid>
      {dragging && (
        <Box
          position="absolute"
          top={0}
          left={0}
          bottom={0}
          right={0}
          bgcolor="#777"
          pt={10}
          display="flex"
          justifyContent="center"
        >
          <Typography variant="h4">Drop image files here</Typography>
        </Box>
      )}
    </Box>
  );
};

export default StickerGrid;

const gridSx: SxProps<Theme> = {
  cursor: "pointer",
  border: "1px dashed #333",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minWidth: 150,
  minHeight: 210,
  "&:hover": {
    border: "1px solid #ddd",
    "& .remove": {
      visibility: "visible",
    },
  },
};
