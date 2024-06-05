import { Box } from "@mui/material";
import MetaData from "../components/pack/MetaData";
import PackFuncPanel from "../components/pack/PackFuncPanel";
import StickerGrid from "../components/pack/StickerGrid";

const PackPage = () => {
  return (
    <Box
      flex={1}
      py={2}
      overflow="scroll"
      width="100%"
      gap={1}
      display="flex"
      flexDirection="column"
    >
      <Box display="flex" alignItems="center">
        <MetaData />
        <PackFuncPanel />
      </Box>
      <StickerGrid />
    </Box>
  );
};

export default PackPage;
