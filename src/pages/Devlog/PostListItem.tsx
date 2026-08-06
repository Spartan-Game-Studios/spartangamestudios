import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatDate, type DevlogPost } from '@/data';
import { usePostCopy } from '@/i18n/content';
import styles from './PostListItem.module.css';

export function PostListItem({ post }: { post: DevlogPost }) {
  const { i18n } = useTranslation();
  const copy = usePostCopy(post);

  return (
    <article className={styles.item}>
      <time className={styles.date} dateTime={post.date}>
        {formatDate(post.date, i18n.resolvedLanguage ?? i18n.language)}
      </time>

      <div>
        <h3 className={styles.title}>
          <Link to={`/devlog/${post.slug}`} className={styles.link}>
            {copy.title}
          </Link>
        </h3>
        <p className={styles.summary}>{copy.summary}</p>
        {post.tags.length > 0 ? (
          <ul className={styles.tags}>
            {post.tags.map((tag) => (
              <li key={tag} className={styles.tag}>
                #{tag}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  );
}
