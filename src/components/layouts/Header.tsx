import { Box, SxProps, Theme, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  return (
    <Box>
      <Typography variant="h4" onClick={() => navigate("/")} sx={linkSx}>
        Sticker Packer
      </Typography>
    </Box>
  );
};

export default Header;

const linkSx: SxProps<Theme> = {
  cursor: "pointer",
};
