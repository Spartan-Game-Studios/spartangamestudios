import { useTranslation } from 'react-i18next';
import { Container } from '@/components/Container/Container';
import { MeanderRule } from '@/components/MeanderRule/MeanderRule';
import { listedPosts, studio } from '@/data';
import { useDocumentMeta } from '@/lib/useDocumentMeta';
import page from '@/pages/shared/page.module.css';
import { PostListItem } from './PostListItem';
import styles from './Devlog.module.css';

export function Devlog() {
  const { t } = useTranslation();

  useDocumentMeta({
    title: t('devlog.title'),
    description: t('meta.devlogDescription', { studio: studio.name }),
    path: '/devlog',
  });

  const posts = listedPosts();

  return (
    <div className={page.page}>
      <Container>
        <header className={page.header}>
          <p className="u-eyebrow">{t('devlog.eyebrow')}</p>
          <h1 className={`${page.title} u-gold-text`}>{t('devlog.title')}</h1>
          <p className={page.lede}>{t('devlog.lede')}</p>
          <MeanderRule />
        </header>

        {posts.length > 0 ? (
          <div className={styles.list}>
            {posts.map((post) => (
              <PostListItem key={post.slug} post={post} />
            ))}
          </div>
        ) : (
          <p className={page.lede}>{t('devlog.empty')}</p>
        )}
      </Container>
    </div>
  );
}
