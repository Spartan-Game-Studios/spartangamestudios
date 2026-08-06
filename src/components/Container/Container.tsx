import type { ElementType, ReactNode } from 'react';
import styles from './Container.module.css';

interface ContainerProps {
  children: ReactNode;
  size?: 'narrow' | 'default' | 'wide';
  as?: ElementType;
  className?: string;
}

export function Container({
  children,
  size = 'default',
  as: Tag = 'div',
  className,
}: ContainerProps) {
  const width = size === 'wide' ? styles.wide : size === 'narrow' ? styles.narrow : undefined;
  return (
    <Tag className={[styles.container, width, className].filter(Boolean).join(' ')}>{children}</Tag>
  );
}
