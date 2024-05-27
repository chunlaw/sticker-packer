import {
  Box,
  Breadcrumbs,
  ClickAwayListener,
  SxProps,
  Theme,
  Typography,
} from "@mui/material";
import Panel from "../components/editor/Panel";
import { useCallback, useContext } from "react";
import EditorContext from "../context/EditorContext";
import Image from "../components/editor/Image";
import AppContext from "../context/AppContext";
import { useNavigate } from "react-router-dom";

const StickerPage = () => {
  const { pack } = useContext(AppContext);
  const { layers, setSelectedLayerId } = useContext(EditorContext);
  const navigate = useNavigate();
  const goToPack = useCallback(() => {
    navigate(`/${pack.id}`);
  }, [navigate, pack.id]);

  return (
    <ClickAwayListener onClickAway={() => setSelectedLayerId("")}>
      <Box sx={rootSx}>
        <Breadcrumbs>
          <Typography variant="h6" onClick={goToPack} sx={linkSx}>
            Pack: {pack.title || pack.id}
          </Typography>
        </Breadcrumbs>
        <Box sx={editorSx}>
          <Box sx={bgSx} />
          <Box id="image" width={500} height={500} position="relative">
            {layers.map((layer) => (
              <Image key={`layer-${layer.id}`} layer={layer} />
            ))}
          </Box>
        </Box>
        <Panel />
      </Box>
    </ClickAwayListener>
  );
};

export default StickerPage;

const rootSx: SxProps<Theme> = {
  flex: 1,
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-around",
  flexDirection: "column",
  gap: 1,
};

const linkSx: SxProps<Theme> = {
  cursor: "pointer",
  "&:hover": {
    borderBottom: "1px solid #777",
  },
};

const bgSx: SxProps<Theme> = {
  background: "url(/assets/Checkered.svg)",
  opacity: 0.5,
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  position: "absolute",
  pointerEvents: "none",
};

const editorSx: SxProps<Theme> = {
  height: 500,
  width: 500,
  position: "relative",
};
