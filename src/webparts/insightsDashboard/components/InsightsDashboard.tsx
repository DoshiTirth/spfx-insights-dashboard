import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
  Dropdown,
  IDropdownOption,
  Spinner,
  SpinnerSize,
  MessageBar,
  MessageBarType,
  Modal,
  IconButton,
  DetailsList,
  DetailsListLayoutMode,
  SelectionMode
} from '@fluentui/react';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

import styles from './InsightsDashboard.module.scss';
import { IInsightsDashboardProps, IListItemRecord } from './IInsightsDashboardProps';
import { fetchAllListItems } from './DashboardDataService';
import KpiCard from './KpiCard';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Tooltip, Legend);

const CHART_PALETTE = ['#2f6fed', '#12b886', '#f59f00', '#e64980', '#7048e8', '#15aabf', '#fa5252'];

const InsightsDashboard: React.FC<IInsightsDashboardProps> = (props) => {
  const { listName, categoryField, valueField, dateField, chartType, dashboardTitle } = props;

  const [items, setItems] = useState<IListItemRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [drillCategory, setDrillCategory] = useState<string>('');

  useEffect(() => {
    let cancelled = false;

    const load = async (): Promise<void> => {
      if (!listName) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError('');
      try {
        const fields = Array.from(new Set([categoryField, valueField, dateField]));
        const data = await fetchAllListItems(props.spHttpClient, props.siteUrl, listName, fields);
        if (!cancelled) {
          setItems(data);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load list data.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load().catch(() => undefined);
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listName, categoryField, valueField, dateField]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      const value = item[categoryField];
      if (value !== undefined && value !== null) {
        set.add(String(value));
      }
    });
    return Array.from(set).sort();
  }, [items, categoryField]);

  const filteredItems = useMemo(() => {
    if (categoryFilter === 'all') {
      return items;
    }
    return items.filter((item) => String(item[categoryField]) === categoryFilter);
  }, [items, categoryFilter, categoryField]);

  const grouped = useMemo(() => {
    const map = new Map<string, number>();
    filteredItems.forEach((item) => {
      const key = String(item[categoryField] ?? 'Uncategorized');
      const raw = item[valueField];
      const numeric = typeof raw === 'number' ? raw : parseFloat(String(raw));
      map.set(key, (map.get(key) || 0) + (isNaN(numeric) ? 0 : numeric));
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [filteredItems, categoryField, valueField]);

  const totalValue = useMemo(
    () => grouped.reduce((sum, [, value]) => sum + value, 0),
    [grouped]
  );

  const topCategory = grouped.length > 0 ? grouped[0][0] : '—';
  const recordCount = filteredItems.length;
  const avgValue = recordCount > 0 ? totalValue / recordCount : 0;

  const chartData = {
    labels: grouped.map(([label]) => label),
    datasets: [
      {
        label: valueField,
        data: grouped.map(([, value]) => value),
        backgroundColor: grouped.map((_, i) => CHART_PALETTE[i % CHART_PALETTE.length]),
        borderColor: '#ffffff',
        borderWidth: chartType === 'line' ? 2 : 1,
        tension: 0.35
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: (_evt: unknown, elements: Array<{ index: number }>) => {
      if (elements.length > 0) {
        setDrillCategory(grouped[elements[0].index][0]);
      }
    },
    plugins: {
      legend: { display: chartType === 'pie' || chartType === 'doughnut' }
    }
  };

  const categoryOptions: IDropdownOption[] = [
    { key: 'all', text: 'All categories' },
    ...categories.map((c) => ({ key: c, text: c }))
  ];

  const drillItems = useMemo(
    () => filteredItems.filter((item) => String(item[categoryField]) === drillCategory),
    [filteredItems, drillCategory, categoryField]
  );

  const renderChart = (): React.ReactElement => {
    switch (chartType) {
      case 'line':
        return <Line data={chartData} options={chartOptions} />;
      case 'pie':
        return <Pie data={chartData} options={chartOptions} />;
      case 'doughnut':
        return <Doughnut data={chartData} options={chartOptions} />;
      default:
        return <Bar data={chartData} options={chartOptions} />;
    }
  };

  if (!listName) {
    return (
      <div className={styles.insightsDashboard}>
        <MessageBar messageBarType={MessageBarType.info}>
          Set a SharePoint list name in the web part's edit pane to get started.
        </MessageBar>
      </div>
    );
  }

  return (
    <div className={styles.insightsDashboard}>
      <div className={styles.header}>
        <h2 className={styles.title}>{dashboardTitle || 'Insights Dashboard'}</h2>
        <Dropdown
          className={styles.filterDropdown}
          selectedKey={categoryFilter}
          options={categoryOptions}
          onChange={(_e, option) => setCategoryFilter(String(option?.key ?? 'all'))}
        />
      </div>

      {error && (
        <MessageBar messageBarType={MessageBarType.error} className={styles.errorBar}>
          {error}
        </MessageBar>
      )}

      {loading ? (
        <Spinner size={SpinnerSize.large} label="Loading dashboard data…" />
      ) : (
        <>
          <div className={styles.kpiRow}>
            <KpiCard label="Total" value={totalValue.toLocaleString()} accent="blue" />
            <KpiCard label="Records" value={recordCount.toLocaleString()} accent="green" />
            <KpiCard label="Average" value={avgValue.toFixed(1)} accent="amber" />
            <KpiCard label="Top category" value={topCategory} accent="red" />
          </div>

          <div className={styles.chartWrap}>
            {grouped.length > 0 ? (
              renderChart()
            ) : (
              <MessageBar messageBarType={MessageBarType.warning}>
                No data found for the current filter.
              </MessageBar>
            )}
          </div>

          <div className={styles.hint}>Click a bar / slice to drill into the underlying records.</div>
        </>
      )}

      <Modal isOpen={!!drillCategory} onDismiss={() => setDrillCategory('')} isBlocking={false}>
        <div className={styles.modalHeader}>
          <span>{drillCategory}</span>
          <IconButton iconProps={{ iconName: 'Cancel' }} onClick={() => setDrillCategory('')} />
        </div>
        <div className={styles.modalBody}>
          <DetailsList
            items={drillItems}
            columns={[
              { key: 'id', name: 'ID', fieldName: 'Id', minWidth: 40, maxWidth: 60 },
              { key: 'value', name: valueField, fieldName: valueField, minWidth: 80 },
              { key: 'date', name: dateField, fieldName: dateField, minWidth: 140 }
            ]}
            layoutMode={DetailsListLayoutMode.justified}
            selectionMode={SelectionMode.none}
          />
        </div>
      </Modal>
    </div>
  );
};

export default InsightsDashboard;
