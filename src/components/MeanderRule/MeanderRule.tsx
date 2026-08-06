import styles from './MeanderRule.module.css';

interface MeanderRuleProps {
  /** Centered, ~14rem wide. Use under a section heading rather than between sections. */
  short?: boolean;
  className?: string;
}

export function MeanderRule({ short = false, className }: MeanderRuleProps) {
  return (
    <hr
      aria-hidden="true"
      className={[styles.rule, short ? styles.short : undefined, className]
        .filter(Boolean)
        .join(' ')}
    />
  );
}
