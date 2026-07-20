export interface HealthScoreComponent {
  label: string;
  score: number;
  rating: string;
}

export interface FinancialHealthScore {
  overall_score: number;
  overall_rating: string;
  components: HealthScoreComponent[];
}
