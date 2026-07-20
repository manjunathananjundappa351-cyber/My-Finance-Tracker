import { Autocomplete, Chip, TextField } from "@mui/material";
import { useEffect, useState } from "react";

import { tagApi } from "@/api/tagApi";
import { Tag } from "@/types/tag";

interface TagsInputProps {
  value: Tag[];
  onChange: (tags: Tag[]) => void;
}

export function TagsInput({ value, onChange }: TagsInputProps) {
  const [options, setOptions] = useState<Tag[]>([]);

  useEffect(() => {
    tagApi.list().then(setOptions).catch(() => undefined);
  }, []);

  async function handleChange(newValue: (Tag | string)[]) {
    const resolved: Tag[] = [];
    for (const item of newValue) {
      if (typeof item === "string") {
        const existing = options.find((o) => o.name.toLowerCase() === item.toLowerCase());
        if (existing) {
          resolved.push(existing);
        } else if (item.trim()) {
          const created = await tagApi.create({ name: item.trim() });
          setOptions((prev) => [...prev, created]);
          resolved.push(created);
        }
      } else {
        resolved.push(item);
      }
    }
    onChange(resolved);
  }

  return (
    <Autocomplete
      multiple
      freeSolo
      options={options}
      value={value}
      getOptionLabel={(o) => (typeof o === "string" ? o : o.name)}
      isOptionEqualToValue={(o, v) => o.id === v.id}
      onChange={(_, newValue) => handleChange(newValue)}
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((tag, index) => (
          <Chip
            {...getTagProps({ index })}
            key={tag.id}
            label={tag.name}
            size="small"
            sx={{ bgcolor: tag.color, color: "#fff" }}
          />
        ))
      }
      renderInput={(params) => (
        <TextField {...params} label="Tags" placeholder="Add a tag" />
      )}
    />
  );
}
