import { Autocomplete, Box, TextField } from "@mui/material";
import { useContext } from "react";
import AppContext from "../../context/AppContext";

const MetaData = () => {
  const { pack, setPackField } = useContext(AppContext);

  return (
    <Box display="flex" flexDirection="column" gap={1} flex={5}>
      <Box display="flex" gap={1}>
        <TextField
          value={pack.title}
          size="small"
          onChange={(e) => setPackField("title", e.target.value)}
          fullWidth
          placeholder="Pack Name"
        />
        <TextField
          value={pack.author}
          size="small"
          onChange={(e) => setPackField("author", e.target.value)}
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
          setPackField("tags", value);
        }}
        renderInput={(params) => (
          <TextField {...params} placeholder="Tags" size="small" />
        )}
        options={[]}
      />
    </Box>
  );
};

export default MetaData;
