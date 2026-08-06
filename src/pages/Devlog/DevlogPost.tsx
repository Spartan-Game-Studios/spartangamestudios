import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container } from '@/components/Container/Container';
import { MeanderRule } from '@/components/MeanderRule/MeanderRule';
import { formatDate, getPost } from '@/data';
import { usePostCopy } from '@/i18n/content';
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
  const { t, i18n } = useTranslation();
  const post = getPost(slug)!;
  const copy = usePostCopy(post);

  useDocumentMeta({
    title: copy.title,
    description: copy.summary,
    path: `/devlog/${post.slug}`,
  });

  return (
    <article className={styles.article}>
      <Container size="narrow">
        <Link to="/devlog" className={styles.back}>
          &larr; {t('common.backToDevlog')}
        </Link>

        <header className={styles.header}>
          <time className={styles.date} dateTime={post.date}>
            {formatDate(post.date, i18n.resolvedLanguage ?? i18n.language)}
          </time>
          <h1 className={styles.title}>{copy.title}</h1>
          <p className={styles.summary}>{copy.summary}</p>
          <MeanderRule />
        </header>

        <div className={styles.body}>
          {copy.body.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </Container>
    </article>
  );
}
