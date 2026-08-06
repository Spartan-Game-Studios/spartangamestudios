import { useTranslation } from 'react-i18next';
import { Container } from '@/components/Container/Container';
import { GameCard } from '@/components/GameCard/GameCard';
import { MeanderRule } from '@/components/MeanderRule/MeanderRule';
import { listedGames, studio } from '@/data';
import { useDocumentMeta } from '@/lib/useDocumentMeta';
import page from '@/pages/shared/page.module.css';

export function Games() {
  const { t } = useTranslation();

  useDocumentMeta({
    title: t('games.title'),
    description: t('meta.gamesDescription', { studio: studio.name }),
    path: '/games',
  });

  const games = listedGames();

  return (
    <div className={page.page}>
      <Container>
        <header className={page.header}>
          <p className="u-eyebrow">{t('games.eyebrow')}</p>
          <h1 className={`${page.title} u-gold-text`}>{t('games.title')}</h1>
          <p className={page.lede}>{t('games.lede')}</p>
          <MeanderRule />
        </header>

        <div className={page.grid}>
          {games.map((game) => (
            <GameCard key={game.slug} game={game} />
          ))}
        </div>
      </Container>
    </div>
  );
}
