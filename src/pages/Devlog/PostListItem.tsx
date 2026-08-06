import { Link } from 'react-router-dom';
import { formatDate, type DevlogPost } from '@/data';
import styles from './PostListItem.module.css';

export function PostListItem({ post }: { post: DevlogPost }) {
  return (
    <article className={styles.item}>
      <time className={styles.date} dateTime={post.date}>
        {formatDate(post.date)}
      </time>

      <div>
        <h3 className={styles.title}>
          <Link to={`/devlog/${post.slug}`} className={styles.link}>
            {post.title}
          </Link>
        </h3>
        <p className={styles.summary}>{post.summary}</p>
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
