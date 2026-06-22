import { useState, useEffect } from 'react';
import { useT } from '../lib/i18n';

export default function BackToTop() {
  const { t } = useT();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      class="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full bg-gold text-dark flex items-center justify-center shadow-lg shadow-gold/20 hover:bg-gold-light transition-colors"
      aria-label={t('Volver arriba', 'Back to top')}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}
