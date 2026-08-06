import { Container } from '@/components/Container/Container';
import { MeanderRule } from '@/components/MeanderRule/MeanderRule';
import { listedPosts, studio } from '@/data';
import { useDocumentMeta } from '@/lib/useDocumentMeta';
import page from '@/pages/shared/page.module.css';
import { PostListItem } from './PostListItem';
import styles from './Devlog.module.css';

export function Devlog() {
  useDocumentMeta({
    title: 'Devlog',
    description: `Development writing from ${studio.name} — what we're building and why.`,
    path: '/devlog',
  });

  const posts = listedPosts();

  return (
    <div className={page.page}>
      <Container>
        <header className={page.header}>
          <p className="u-eyebrow">From the workshop</p>
          <h1 className={`${page.title} u-gold-text`}>Devlog</h1>
          <p className={page.lede}>
            Development writing lives here first. The archive is ours — socials are where it gets
            distributed, not where it is kept.
          </p>
          <MeanderRule />
        </header>

        {posts.length > 0 ? (
          <div className={styles.list}>
            {posts.map((post) => (
              <PostListItem key={post.slug} post={post} />
            ))}
          </div>
        ) : (
          <p className={page.lede}>Nothing published yet. First entry lands soon.</p>
        )}
      </Container>
    </div>
  );
}
