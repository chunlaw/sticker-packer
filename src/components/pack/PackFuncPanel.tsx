import { Box, IconButton, Tooltip } from "@mui/material";
import { useCallback, useContext } from "react";
import {
  Download as DownloadIcon,
  CleaningServices as CleaningServicesIcon,
  FormatPaint as FormatPaintIcon,
} from "@mui/icons-material";
import AppContext from "../../context/AppContext";
import { removeLayerBackground } from "../../utils";
import { Stores, getStoreData, saveData } from "../../db";
import { Sticker } from "../../types";

const PackFuncPanel = () => {
  const { pack, isBatchProcessing, setIsBatchProcessing, downloadPack } =
    useContext(AppContext);

  const cleanAllBackground = useCallback(async () => {
    if (isBatchProcessing) return;
    setIsBatchProcessing(true);
    let idx = 0;
    console.log("start removing");
    for (const stickerId of pack.stickerIds) {
      const sticker = await getStoreData<Sticker>(Stores.Stickers, stickerId);
      for (let i = 0; i < sticker.layers.length; ++i) {
        sticker.layers[i].content = (
          await removeLayerBackground(sticker.layers[i])
        ).content!;
      }
      console.log(`${++idx} / ${pack.stickerIds.length}`);
      await saveData<Sticker>(Stores.Stickers, sticker);
    }
    setIsBatchProcessing(false);
  }, [isBatchProcessing, setIsBatchProcessing, pack]);

  return (
    <Box flex={1} display="flex" justifyContent="center" alignItems="center">
      <Tooltip title="Download in ZIP">
        <IconButton onClick={() => downloadPack(pack)}>
          <DownloadIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Clean background for all stickers">
        <IconButton onClick={() => cleanAllBackground()}>
          <CleaningServicesIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Add border for all stickers">
        <IconButton>
          <FormatPaintIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default PackFuncPanel;
