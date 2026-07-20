import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { Box, IconButton, MenuItem, Stack, TextField, Tooltip } from "@mui/material";
import { useState } from "react";

import { DATE_PRESET_LABELS, DatePreset, resolvePreset } from "@/utils/dateRangePresets";

interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  onChange: (startDate: string, endDate: string) => void;
}

const PRESETS: DatePreset[] = [
  "today",
  "yesterday",
  "this_week",
  "this_month",
  "this_quarter",
  "last_quarter",
  "financial_year",
  "custom",
];

export function DateRangeFilter({ startDate, endDate, onChange }: DateRangeFilterProps) {
  const [preset, setPreset] = useState<DatePreset | "">("");

  function handlePresetChange(value: DatePreset) {
    setPreset(value);
    const range = resolvePreset(value);
    if (range) onChange(range.startDate, range.endDate);
  }

  function handleReset() {
    setPreset("");
    onChange("", "");
  }

  return (
    <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
      <TextField
        select
        label="Date Range"
        size="small"
        value={preset}
        onChange={(e) => handlePresetChange(e.target.value as DatePreset)}
        sx={{ minWidth: 160 }}
      >
        <MenuItem value="">All time</MenuItem>
        {PRESETS.map((p) => (
          <MenuItem key={p} value={p}>
            {DATE_PRESET_LABELS[p]}
          </MenuItem>
        ))}
      </TextField>

      {(preset === "custom" || (!preset && (startDate || endDate))) && (
        <>
          <TextField
            label="From"
            type="date"
            size="small"
            value={startDate}
            onChange={(e) => onChange(e.target.value, endDate)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="To"
            type="date"
            size="small"
            value={endDate}
            onChange={(e) => onChange(startDate, e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </>
      )}

      {(startDate || endDate || preset) && (
        <Tooltip title="Reset filter">
          <Box>
            <IconButton size="small" onClick={handleReset}>
              <RestartAltIcon fontSize="small" />
            </IconButton>
          </Box>
        </Tooltip>
      )}
    </Stack>
  );
}
