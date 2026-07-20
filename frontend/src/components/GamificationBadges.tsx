import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import LocalFireDepartmentOutlinedIcon from "@mui/icons-material/LocalFireDepartmentOutlined";
import { Chip, Stack } from "@mui/material";

import { GamificationStats } from "@/types/gamification";

export function GamificationBadges({ stats }: { stats: GamificationStats }) {
  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
      <Chip
        icon={<LocalFireDepartmentOutlinedIcon />}
        label={`${stats.no_spend_streak_days}-day no-spend streak`}
        color={stats.no_spend_streak_days > 0 ? "warning" : "default"}
        variant="outlined"
      />
      {stats.active_budget_count > 0 && (
        <Chip
          icon={<EmojiEventsOutlinedIcon />}
          label={stats.budget_champion ? "Budget Champion this month" : "Over budget this month"}
          color={stats.budget_champion ? "success" : "error"}
          variant="outlined"
        />
      )}
    </Stack>
  );
}
