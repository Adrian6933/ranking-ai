import { useFavorites } from './FavoritesProvider';
import ModelCard from './ModelCard';
import { useT } from '../lib/i18n';

export default function FavoritesList({ allModels }: { allModels: any[] }) {
  const { favorites } = useFavorites();
  const { t } = useT();

  const favModels = allModels.filter(m => favorites.includes(m.id));

  if (favModels.length === 0) {
    return (
      <div class="rounded-lg border border-dark-border bg-dark-card/50 p-12 text-center">
        <div class="text-gray-text font-mono text-sm">
          <span class="text-gold">// </span>{t('No tienes modelos favoritos todavía.', "You don't have any favorite models yet.")}
        </div>
        <div class="text-gray-text/60 font-mono text-xs mt-2">
          {t('Ve a la página de un modelo y pulsa ★ para añadirlo aquí.', "Go to a model's page and press ★ to add it here.")}
        </div>
        <a href="/ranking" class="inline-block mt-4 px-4 py-2 rounded border border-gold/40 bg-gold/10 text-gold text-sm font-mono hover:bg-gold/20 transition-colors">
          $ {t('Explorar ranking', 'Explore ranking')}
        </a>
      </div>
    );
  }

  return (
    <div>
      <div class="mb-4 text-xs text-gray-text font-mono">
        {favModels.length} {favModels.length !== 1 ? t('modelos', 'models') : t('modelo', 'model')} {favModels.length !== 1 ? t('guardados', 'saved') : t('guardado', 'saved')}
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {favModels.map(m => <ModelCard key={m.id} model={m} />)}
      </div>
    </div>
  );
}
