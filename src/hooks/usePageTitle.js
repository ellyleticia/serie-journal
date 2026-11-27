import { useEffect } from 'react';

const APP_NAME = 'Serie Journal';

/** Define o título da aba do navegador para a página atual. */
export default function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | ${APP_NAME}` : APP_NAME;
  }, [title]);
}
