import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Alert, Box, Chip, Grid, IconButton, Paper, Stack, Tooltip, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";

import { expenseApi } from "@/api/expenseApi";
import { goalApi } from "@/api/goalApi";
import { incomeApi } from "@/api/incomeApi";
import { loanApi } from "@/api/loanApi";
import { TableSkeleton } from "@/components/Skeletons";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { formatCurrency } from "@/utils/format";

interface CalendarEvent {
  date: string;
  label: string;
  type: "expense" | "income" | "goal" | "loan";
}

const TYPE_COLOR: Record<CalendarEvent["type"], "error" | "success" | "info" | "warning"> = {
  expense: "error",
  income: "success",
  goal: "info",
  loan: "warning",
};

export function Calendar() {
  useDocumentTitle("Calendar");
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [events, setEvents] = useState<CalendarEvent[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const monthStart = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
    const startStr = monthStart.toISOString().slice(0, 10);
    const endStr = monthEnd.toISOString().slice(0, 10);

    Promise.all([
      expenseApi.list({ start_date: startStr, end_date: endStr }),
      incomeApi.list({ start_date: startStr, end_date: endStr }),
      goalApi.list(),
      loanApi.list(),
    ])
      .then(([expenses, income, goals, loans]) => {
        const items: CalendarEvent[] = [
          ...expenses.map((e) => ({
            date: e.expense_date,
            label: `${e.description || e.category.name}: ${formatCurrency(e.amount)}`,
            type: "expense" as const,
          })),
          ...income.map((i) => ({
            date: i.income_date,
            label: `${i.description || i.category.name}: ${formatCurrency(i.amount)}`,
            type: "income" as const,
          })),
          ...goals
            .filter((g) => {
              const d = new Date(g.target_date);
              return d.getFullYear() === cursor.getFullYear() && d.getMonth() === cursor.getMonth();
            })
            .map((g) => ({ date: g.target_date, label: `Goal due: ${g.name}`, type: "goal" as const })),
          ...loans
            .filter((l) => {
              const d = new Date(l.next_due_date);
              return d.getFullYear() === cursor.getFullYear() && d.getMonth() === cursor.getMonth();
            })
            .map((l) => ({
              date: l.next_due_date,
              label: `EMI due: ${l.name} (${formatCurrency(l.emi_amount)})`,
              type: "loan" as const,
            })),
        ];
        setEvents(items);
      })
      .catch(() => setError("Could not load calendar data."));
  }, [cursor]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const e of events ?? []) {
      const list = map.get(e.date) ?? [];
      list.push(e);
      map.set(e.date, list);
    }
    return map;
  }, [events]);

  const monthLabel = cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  const gridDays = useMemo(() => {
    const firstOfMonth = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const startOffset = (firstOfMonth.getDay() + 6) % 7; // Monday-first
    const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    const days: (Date | null)[] = Array(startOffset).fill(null);
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));
    }
    return days;
  }, [cursor]);

  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4" fontWeight={700} letterSpacing="-0.02em">
          Calendar
        </Typography>
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton
            aria-label="Previous month"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
          >
            <ChevronLeftIcon />
          </IconButton>
          <Typography variant="subtitle1" fontWeight={600} minWidth={160} textAlign="center">
            {monthLabel}
          </Typography>
          <IconButton
            aria-label="Next month"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
          >
            <ChevronRightIcon />
          </IconButton>
        </Stack>
      </Box>

      {!events ? (
        <TableSkeleton />
      ) : (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Grid container spacing={1}>
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <Grid item xs={12 / 7} key={d}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  {d}
                </Typography>
              </Grid>
            ))}
            {gridDays.map((day, i) => {
              const dateStr = day?.toISOString().slice(0, 10);
              const dayEvents = dateStr ? eventsByDate.get(dateStr) ?? [] : [];
              const isToday = dateStr === new Date().toISOString().slice(0, 10);
              return (
                <Grid item xs={12 / 7} key={i}>
                  <Box
                    sx={{
                      minHeight: 84,
                      border: "1px solid",
                      borderColor: isToday ? "primary.main" : "divider",
                      borderRadius: 2,
                      p: 0.75,
                      opacity: day ? 1 : 0.3,
                    }}
                  >
                    {day && (
                      <>
                        <Typography variant="caption" fontWeight={isToday ? 700 : 400}>
                          {day.getDate()}
                        </Typography>
                        <Stack spacing={0.25} mt={0.5}>
                          {dayEvents.slice(0, 3).map((e, idx) => (
                            <Tooltip key={idx} title={e.label}>
                              <Chip
                                label={e.label}
                                size="small"
                                color={TYPE_COLOR[e.type]}
                                sx={{
                                  height: 16,
                                  fontSize: 9,
                                  "& .MuiChip-label": { px: 0.5, whiteSpace: "nowrap" },
                                }}
                              />
                            </Tooltip>
                          ))}
                          {dayEvents.length > 3 && (
                            <Typography variant="caption" color="text.secondary">
                              +{dayEvents.length - 3} more
                            </Typography>
                          )}
                        </Stack>
                      </>
                    )}
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Paper>
      )}
    </Box>
  );
}
