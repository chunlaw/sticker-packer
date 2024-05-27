import { Box, SxProps, Theme } from "@mui/material";

const Footer = () => {
  return (
    <Box sx={rootSx}>
      <Box
        width={120}
        height={40}
        sx={{
          backgroundImage: "url(/assets/app-store-badge.svg)",
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          cursor: "pointer",
        }}
        onClick={() => {
          window.open(
            "https://apps.apple.com/app/sigstick-signal-sticker-maker/id1550509104",
            "_blank"
          );
        }}
      />
      <Box
        width={140}
        height={40}
        sx={{
          backgroundImage: "url(/assets/google-play-badge.png)",
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          cursor: "pointer",
        }}
        onClick={() => {
          window.open(
            "https://play.google.com/store/apps/details?id=com.sigstick.myapp",
            "_blank"
          );
        }}
      />
    </Box>
  );
};

export default Footer;

const rootSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 1,
  mb: 1,
};
