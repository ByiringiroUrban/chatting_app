import { useUiStore } from '../stores/uiStore';
import { translations } from '../locales/translations';

export function useTranslation() {
  const { language } = useUiStore();
  const dict = translations[language] || translations.en;

  const t = (key, fallback = "") => {
    return dict[key] || translations.en[key] || fallback || key;
  };

  return { t, language };
}
