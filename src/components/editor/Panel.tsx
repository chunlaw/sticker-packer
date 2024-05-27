import { IconButton, Menu, Paper, Typography } from "@mui/material";
import { useCallback, useContext, useRef, useState } from "react";
import EditorContext from "../../context/EditorContext";
import {
  AddPhotoAlternate as AddPhotoAlternateIcon,
  CleaningServices as CleaningServicesIcon,
  FormatPaint as FormatPaintIcon,
  Crop as CropIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import EmojiPicker from "@emoji-mart/react";
import { Data } from "emoji-mart";
import { getImageFromLayers } from "../../utils";
import { saveAs } from "file-saver";

const Panel = () => {
  const [isEmojiOpen, setIsEmojiOpen] = useState<boolean>(false);
  const emojiButton = useRef<HTMLButtonElement>(null);
  const fileUploader = useRef<HTMLInputElement>(null);
  const {
    id,
    layers,
    addLayer,
    isCrop,
    toggleCrop,
    selectedLayerId,
    cleanLayerBg,
    outlineLayer,
    emoji,
    setEmoji,
  } = useContext(EditorContext);

  const handleFileUpload = useCallback(() => {
    fileUploader.current?.click();
  }, [fileUploader]);

  const getImageBase64 = useCallback(() => {
    if (fileUploader.current?.files) {
      Promise.all(
        Array.from(fileUploader.current?.files).map((file) => {
          const reader = new FileReader();
          return new Promise<string>((resolve) => {
            reader.onload = function () {
              resolve(reader.result as string);
            };
            if (fileUploader.current?.files) {
              reader.readAsDataURL(file);
            }
          });
        })
      ).then((base64s) => {
        base64s.map((base64) => addLayer(base64));
        fileUploader.current!.value = "";
      });
    }
  }, [addLayer]);

  const download = useCallback(() => {
    getImageFromLayers(layers).then((dataUri) => {
      const byteString = atob(dataUri.split(",")[1]);
      const mimeString = dataUri.split(",")[0].split(":")[1].split(";")[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeString });
      saveAs(blob, `${id}.png`);
    });
  }, [layers, id]);

  const changeEmoji = useCallback(
    (emoji: string) => {
      setEmoji(emoji);
      setIsEmojiOpen(false);
    },
    [setEmoji]
  );

  return (
    <Paper sx={{ display: "flex", gap: 1, zIndex: 10 }}>
      <IconButton ref={emojiButton} onClick={() => setIsEmojiOpen(true)}>
        <Typography variant="h6">{emoji}</Typography>
      </IconButton>
      <Menu
        open={isEmojiOpen}
        onClose={() => setIsEmojiOpen(false)}
        anchorEl={emojiButton.current}
        sx={{ ml: 4 }}
      >
        <EmojiPicker
          data={Data}
          onEmojiSelect={(v: any) => changeEmoji(v.native)}
        />
      </Menu>
      <IconButton onClick={handleFileUpload}>
        <input
          hidden
          multiple
          type="file"
          ref={fileUploader}
          onChange={getImageBase64}
          accept=".jpg,.jpeg,.png,.webp"
        />
        <AddPhotoAlternateIcon />
      </IconButton>
      <IconButton
        sx={{ background: isCrop ? "#777" : "none" }}
        disabled={selectedLayerId === ""}
        onClick={toggleCrop}
      >
        <CropIcon />
      </IconButton>
      <IconButton
        disabled={selectedLayerId === ""}
        onClick={() => cleanLayerBg(selectedLayerId)}
      >
        <CleaningServicesIcon />
      </IconButton>
      <IconButton
        disabled={selectedLayerId === ""}
        onClick={() => outlineLayer("white", 10, selectedLayerId)}
      >
        <FormatPaintIcon />
      </IconButton>
      <IconButton onClick={download}>
        <DownloadIcon />
      </IconButton>
    </Paper>
  );
};

export default Panel;
