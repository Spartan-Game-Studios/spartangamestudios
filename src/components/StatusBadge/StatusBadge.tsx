import { STATUS_LABELS, type GameStatus } from '@/data';
import styles from './StatusBadge.module.css';

const VARIANTS: Record<GameStatus, string> = {
  released: styles.released,
  'early-access': styles.earlyAccess,
  'in-development': styles.inDevelopment,
  concept: styles.concept,
};

export function StatusBadge({ status }: { status: GameStatus }) {
  return <span className={`${styles.badge} ${VARIANTS[status]}`}>{STATUS_LABELS[status]}</span>;
}
