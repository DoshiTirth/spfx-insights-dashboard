import * as React from 'react';
import styles from './InsightsDashboard.module.scss';

export interface IKpiCardProps {
  label: string;
  value: string;
  trend?: number;
  accent?: 'blue' | 'green' | 'amber' | 'red';
}

const KpiCard: React.FC<IKpiCardProps> = ({ label, value, trend, accent = 'blue' }) => {
  const trendKnown = typeof trend === 'number' && !isNaN(trend);
  const trendUp = trendKnown && (trend as number) >= 0;

  return (
    <div className={`${styles.kpiCard} ${styles['accent-' + accent]}`}>
      <div className={styles.kpiLabel}>{label}</div>
      <div className={styles.kpiValue}>{value}</div>
      {trendKnown && (
        <div className={`${styles.kpiTrend} ${trendUp ? styles.trendUp : styles.trendDown}`}>
          {trendUp ? '▲' : '▼'} {Math.abs(trend as number).toFixed(1)}%
        </div>
      )}
    </div>
  );
};

export default KpiCard;
