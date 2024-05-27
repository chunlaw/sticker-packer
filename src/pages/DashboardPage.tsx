import { Box, Grid, SxProps, Theme } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { useEffect, useState } from "react";
import { Pack } from "../types";
import { Stores, getStore } from "../db";
import PackThumbnail from "../components/PackThumbnail";

const DashboardPage = () => {
  const navigate = useNavigate();

  const [packs, setPacks] = useState<Pack[]>([]);

  useEffect(() => {
    getStore<Pack>(Stores.Packs).then((packs) => {
      setPacks(packs);
    });
  }, []);

  return (
    <Box flex={1} py={2} overflow="scroll" width="100%">
      <Grid container alignItems="center">
        {packs.map((pack) => (
          <Grid
            key={`pack-${pack.id}`}
            item
            sx={gridSx}
            md={3}
            sm={4}
            xs={6}
            onClick={() => navigate(`/${pack.id}`)}
          >
            <PackThumbnail key={`pack-${pack.id}`} pack={pack} />
          </Grid>
        ))}
        <Grid
          item
          sx={gridSx}
          md={3}
          sm={4}
          xs={6}
          onClick={() => navigate(`/${uuidv4()}`)}
        >
          <AddIcon />
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;

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
