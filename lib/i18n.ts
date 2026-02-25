export type Language = 'en' | 'tr' | 'az' | 'ru';

export const dictionaries = {
    en: () => import('@/locales/en/common.json').then((module) => module.default),
    tr: () => import('@/locales/tr/common.json').then((module) => module.default),
    az: () => import('@/locales/az/common.json').then((module) => module.default),
    ru: () => import('@/locales/ru/common.json').then((module) => module.default),
};

export const getDictionary = async (locale: Language) => dictionaries[locale]();
