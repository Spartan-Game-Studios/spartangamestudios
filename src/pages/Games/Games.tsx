import { Container } from '@/components/Container/Container';
import { GameCard } from '@/components/GameCard/GameCard';
import { MeanderRule } from '@/components/MeanderRule/MeanderRule';
import { listedGames, studio } from '@/data';
import { useDocumentMeta } from '@/lib/useDocumentMeta';
import page from '@/pages/shared/page.module.css';

export function Games() {
  useDocumentMeta({
    title: 'Games',
    description: `Every game from ${studio.name}, with the full list of storefronts for each.`,
    path: '/games',
  });

  const games = listedGames();

  return (
    <div className={page.page}>
      <Container>
        <header className={page.header}>
          <p className="u-eyebrow">Catalogue</p>
          <h1 className={`${page.title} u-gold-text`}>Games</h1>
          <p className={page.lede}>
            Every game we make, and every shelf it sits on. When a title launches or lands on a new
            platform, the link appears here first.
          </p>
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
