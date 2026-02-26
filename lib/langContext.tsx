"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Translations for UI labels
const T = {
    en: {
        overview: "Overview", myCV: "My CV", optimize: "Optimize",
        coach: "AI Career Coach", jobs: "Find Jobs", history: "History",
        settings: "Settings", logout: "Log out", loading: "Loading Workspace…",
        atsCheck: "ATS Scanner"
    },
    tr: {
        overview: "Panel", myCV: "CV'm", optimize: "Optimize Et",
        coach: "AI Kariyer Koçu", jobs: "İş Bul", history: "Geçmiş",
        settings: "Ayarlar", logout: "Çıkış yap", loading: "Yükleniyor…",
        atsCheck: "ATS Tarayıcı"
    },
    az: {
        overview: "İdarə paneli", myCV: "CV'm", optimize: "Optimallaşdır",
        coach: "AI Karyera Məşqçisi", jobs: "İş Tap", history: "Tarixçə",
        settings: "Parametrlər", logout: "Çıxış", loading: "Yüklənir…",
        atsCheck: "ATS Skaneri"
    },
    ru: {
        overview: "Обзор", myCV: "Моё резюме", optimize: "Оптимизировать",
        coach: "ИИ Карьерный коуч", jobs: "Поиск вакансий", history: "История",
        settings: "Настройки", logout: "Выйти", loading: "Загрузка…",
        atsCheck: "ATS Сканер"
    }
} as const;

type Lang = keyof typeof T;
type TKeys = keyof typeof T.en;

interface LangCtx { lang: Lang; t: (k: TKeys) => string; setLang: (l: Lang) => void; }

const LangContext = createContext<LangCtx>({ lang: "en", t: (k) => k, setLang: () => { } });
export const useLang = () => useContext(LangContext);

export function LangProvider({ children }: { children: ReactNode }) {
    const [lang, setLangState] = useState<Lang>("en");

    useEffect(() => {
        const stored = localStorage.getItem("ui_lang") as Lang | null;
        if (stored && T[stored]) setLangState(stored);
    }, []);

    const setLang = (l: Lang) => {
        setLangState(l);
        localStorage.setItem("ui_lang", l);
    };

    const t = (k: TKeys) => T[lang][k] ?? T.en[k];
    return <LangContext.Provider value={{ lang, t, setLang }}>{children}</LangContext.Provider>;
}
