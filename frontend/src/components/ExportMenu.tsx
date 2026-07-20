import DownloadIcon from "@mui/icons-material/Download";
import { Button, ListItemText, Menu, MenuItem } from "@mui/material";
import { useState } from "react";

import { exportToCsv } from "@/utils/csv";
import { exportToExcel, exportToJson } from "@/utils/exportFormats";

interface ExportMenuProps {
  filenameBase: string;
  rows: Record<string, string | number>[];
}

export function ExportMenu({ filenameBase, rows }: ExportMenuProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const disabled = rows.length === 0;

  function close() {
    setAnchorEl(null);
  }

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<DownloadIcon />}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        disabled={disabled}
      >
        Export
      </Button>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={close}>
        <MenuItem
          onClick={() => {
            exportToCsv(`${filenameBase}.csv`, rows);
            close();
          }}
        >
          <ListItemText primary="CSV" />
        </MenuItem>
        <MenuItem
          onClick={() => {
            exportToExcel(`${filenameBase}.xlsx`, rows);
            close();
          }}
        >
          <ListItemText primary="Excel (.xlsx)" />
        </MenuItem>
        <MenuItem
          onClick={() => {
            exportToJson(`${filenameBase}.json`, rows);
            close();
          }}
        >
          <ListItemText primary="JSON" />
        </MenuItem>
      </Menu>
    </>
  );
}
