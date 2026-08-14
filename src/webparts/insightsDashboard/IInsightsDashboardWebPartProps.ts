export interface IInsightsDashboardWebPartProps {
  dashboardTitle: string;
  listName: string;
  categoryField: string;
  valueField: string;
  dateField: string;
  chartType: 'bar' | 'line' | 'pie' | 'doughnut';
}
