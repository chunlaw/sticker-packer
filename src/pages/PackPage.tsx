import {
  Autocomplete,
  Box,
  Grid,
  IconButton,
  SxProps,
  TextField,
  Theme,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { useContext } from "react";
import { Download as DownloadIcon } from "@mui/icons-material";
import AppContext from "../context/AppContext";
import Thumbnail from "../components/Thumbnail";

const PackPage = () => {
  const { pack, setPackTitle, setPackAuthor, setPackTags, downloadPack } =
    useContext(AppContext);
  const navigate = useNavigate();

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
        <Box display="flex" flexDirection="column" gap={1} flex={5}>
          <Box display="flex" gap={1}>
            <TextField
              value={pack.title}
              size="small"
              onChange={setPackTitle}
              fullWidth
              placeholder="Pack Name"
            />
            <TextField
              value={pack.author}
              size="small"
              onChange={setPackAuthor}
              placeholder="Author name"
              fullWidth
            />
          </Box>
          <Autocomplete
            freeSolo
            multiple
            disableClearable
            value={pack.tags}
            onChange={(_, value) => {
              setPackTags(value);
            }}
            renderInput={(params) => (
              <TextField {...params} placeholder="Tags" size="small" />
            )}
            options={[]}
          />
        </Box>
        <Box
          flex={1}
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <IconButton onClick={() => downloadPack(pack)}>
            <DownloadIcon />
          </IconButton>
        </Box>
      </Box>
      <Box overflow="scroll" py={2}>
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
      </Box>
    </Box>
  );
};

export default PackPage;

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
