import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import I18NextHttpBackend from 'i18next-http-backend';


const defaultLanguage = document.querySelector('meta[name="default-language"]')?.getAttribute('content') || 'en';


let savedLanguage = localStorage.getItem('panel_language') || defaultLanguage;
if (!savedLanguage || typeof savedLanguage !== 'string' || savedLanguage.length < 2) {
    savedLanguage = 'en';
}

const hash = Date.now().toString(16);

i18n
    .use(I18NextHttpBackend)
    .use(initReactI18next)
    .init({
        lng: savedLanguage,
        fallbackLng: 'en',
        debug: process.env.NODE_ENV === 'development',
        defaultNS: 'common',
        ns: ['common'],
        load: 'languageOnly',
        keySeparator: '.',
        nsSeparator: ':',
        backend: {
            loadPath: '/locales/{{lng}}/{{ns}}.json',
            queryStringParams: { v: hash },
        },
        interpolation: {
            escapeValue: false,
        },
        react: {
            useSuspense: false,
            bindI18n: 'languageChanged loaded',
            bindI18nStore: 'added removed',
        },
        returnEmptyString: false,
        saveMissing: false,
        missingKeyHandler: (lngs, ns, key, fallbackValue) => {
            console.warn(`[i18n] Missing translation: ${ns}:${key} for languages: ${lngs.join(', ')}`);
        },
    });

i18n.on('initialized', () => {
    console.log('[i18n] Initialized with language:', i18n.language);
    console.log('[i18n] Load path:', '/locales/{{lng}}/{{ns}}.json');
});

i18n.on('loaded', (loaded) => {
    console.log('[i18n] Loaded translations:', Object.keys(loaded));
});

i18n.on('failedLoading', (lng, ns, msg) => {
    console.error(`[i18n] Failed to load ${ns} for ${lng}:`, msg);
});

export default i18n;
