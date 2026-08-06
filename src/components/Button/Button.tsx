import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import styles from './Button.module.css';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'small' | 'medium' | 'large';

interface CommonProps {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  className?: string;
}

type ButtonAsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { to?: never; href?: never };
type ButtonAsLink = CommonProps & { to: string; href?: never };
type ButtonAsAnchor = CommonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; to?: never };

export type ButtonProps = ButtonAsButton | ButtonAsLink | ButtonAsAnchor;

interface ClassOptions {
  variant?: Variant | undefined;
  size?: Size | undefined;
  fullWidth?: boolean | undefined;
  className?: string | undefined;
}

function classNames({ variant = 'primary', size = 'medium', fullWidth, className }: ClassOptions) {
  return [
    styles.button,
    styles[variant],
    size !== 'medium' ? styles[size] : undefined,
    fullWidth ? styles.full : undefined,
    className,
  ]
    .filter(Boolean)
    .join(' ');
}

export function Button(props: ButtonProps) {
  const { children, variant, size, fullWidth, className, ...rest } = props;
  const cls = classNames({ variant, size, fullWidth, className });

  if ('to' in rest && rest.to) {
    const { to, ...linkRest } = rest as { to: string };
    return (
      <Link to={to} className={cls} {...linkRest}>
        {children}
      </Link>
    );
  }

  if ('href' in rest && rest.href) {
    const anchorProps = rest as AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };
    const external = /^https?:/.test(anchorProps.href);
    return (
      <a
        className={cls}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        {...anchorProps}
      >
        {children}
      </a>
    );
  }

  return (
    <button type="button" className={cls} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
