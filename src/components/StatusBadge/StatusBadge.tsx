import { useTranslation } from 'react-i18next';
import { statusKey, type GameStatus } from '@/data';
import styles from './StatusBadge.module.css';

const VARIANTS: Record<GameStatus, string> = {
  released: styles.released,
  'early-access': styles.earlyAccess,
  'in-development': styles.inDevelopment,
  concept: styles.concept,
};

export function StatusBadge({ status }: { status: GameStatus }) {
  const { t } = useTranslation();
  return <span className={`${styles.badge} ${VARIANTS[status]}`}>{t(statusKey(status))}</span>;
}
