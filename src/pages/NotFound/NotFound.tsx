import { Container } from '@/components/Container/Container';
import { Button } from '@/components/Button/Button';
import { MeanderRule } from '@/components/MeanderRule/MeanderRule';
import { useDocumentMeta } from '@/lib/useDocumentMeta';
import styles from './NotFound.module.css';

export function NotFound() {
  useDocumentMeta({
    title: 'Not found',
    description: 'That page does not exist.',
  });

  return (
    <Container>
      <div className={styles.wrap}>
        <p className="u-eyebrow">404</p>
        <h1 className={`${styles.code} u-gold-text`}>Come back with your shield</h1>
        <MeanderRule short />
        <p className={styles.message}>
          That page does not exist — or it never did. The catalogue is the surest ground.
        </p>
        <Button to="/games">See the games</Button>
      </div>
    </Container>
  );
}
