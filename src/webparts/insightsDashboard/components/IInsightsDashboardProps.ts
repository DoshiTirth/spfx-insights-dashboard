import { SPHttpClient } from '@microsoft/sp-http';

export interface IInsightsDashboardProps {
  dashboardTitle: string;
  listName: string;
  categoryField: string;
  valueField: string;
  dateField: string;
  chartType: 'bar' | 'line' | 'pie' | 'doughnut';
  siteUrl: string;
  spHttpClient: SPHttpClient;
  isDarkTheme: boolean;
  userDisplayName: string;
}

export interface IListItemRecord {
  Id: number;
  [key: string]: unknown;
}
