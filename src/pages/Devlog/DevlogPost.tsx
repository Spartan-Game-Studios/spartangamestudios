import { Link, useParams } from 'react-router-dom';
import { Container } from '@/components/Container/Container';
import { MeanderRule } from '@/components/MeanderRule/MeanderRule';
import { formatDate, getPost } from '@/data';
import { useDocumentMeta } from '@/lib/useDocumentMeta';
import { NotFound } from '@/pages/NotFound/NotFound';
import styles from './DevlogPost.module.css';

export function DevlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPost(slug) : undefined;

  if (!post) {
    return <NotFound />;
  }

  return <DevlogPostView key={post.slug} slug={post.slug} />;
}

function DevlogPostView({ slug }: { slug: string }) {
  const post = getPost(slug)!;

  useDocumentMeta({
    title: post.title,
    description: post.summary,
    path: `/devlog/${post.slug}`,
  });

  return (
    <article className={styles.article}>
      <Container size="narrow">
        <Link to="/devlog" className={styles.back}>
          &larr; All posts
        </Link>

        <header className={styles.header}>
          <time className={styles.date} dateTime={post.date}>
            {formatDate(post.date)}
          </time>
          <h1 className={styles.title}>{post.title}</h1>
          <p className={styles.summary}>{post.summary}</p>
          <MeanderRule />
        </header>

        <div className={styles.body}>
          {post.body.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </Container>
    </article>
  );
}
