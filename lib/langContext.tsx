"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// ─── Translation map — all static UI strings ──────────────────────────────────
const T = {
    en: {
        // Dashboard sidebar nav
        overview: "Overview", myCV: "My CV", optimize: "Optimize",
        coach: "AI Career Coach", jobs: "Find Jobs", history: "History",
        settings: "Settings", logout: "Log out", loading: "Loading Workspace…",
        atsCheck: "ATS Scanner",
        // Marketing nav
        navPricing: "Pricing", navSignIn: "Sign in",
        // Landing hero
        heroBadge: "Now with Full Multi-Language Support",
        heroTitle: "Land your dream job with",
        heroSubtitle: "Upload your base resume, paste the job description, and let our engine instantly align your profile. No hallucinations, purely you.",
        heroBtn: "Optimize My CV",
        // Features
        feat1Title: "ATS-Friendly Resumes",
        feat1Desc: "Generate clean, optimised PDF resumes that pass strict AI and ATS filters without losing your truthful experience.",
        feat2Title: "Instant Share Links",
        feat2Desc: "Don't want to send attachments? Create tracked, unlisted web links for your tailored application.",
        feat3Title: "Full Application Pack",
        feat3Desc: "Not just a CV. Get customised cover letters, email text, and 3 variants of LinkedIn messages instantly.",
        // Auth
        backHome: "Back home",
        welcomeBack: "Welcome back",
        loginSubtitle: "Log in to manage your tailored applications.",
        createAccount: "Create an account",
        signupSubtitle: "Start optimizing your CV for free.",
        emailLabel: "Email", passwordLabel: "Password", fullNameLabel: "Full Name",
        loginBtn: "Log in", loginBtnLoading: "Signing in…",
        signupBtn: "Sign Up", signupBtnLoading: "Signing up…",
        orContinueWith: "Or continue with",
        alreadyHaveAccount: "Already have an account?", noAccount: "Don't have an account?",
        logInLink: "Log in", signUpLink: "Sign up",
        // Pricing
        pricingBadge: "Transparent & Simple",
        pricingTitle: "One plan,", pricingTitleAccent: "infinite power.",
        pricingSubtitle: "Only pay when you need unlimited optimizations. A single low yearly payment guarantees access to all Pro features with priority API access.",
    },
    tr: {
        overview: "Panel", myCV: "CV'm", optimize: "Optimize Et",
        coach: "AI Kariyer Koçu", jobs: "İş Bul", history: "Geçmiş",
        settings: "Ayarlar", logout: "Çıkış yap", loading: "Yükleniyor…",
        atsCheck: "ATS Tarayıcı",
        navPricing: "Fiyatlar", navSignIn: "Giriş yap",
        heroBadge: "Artık Tam Çok Dilli Destek ile",
        heroTitle: "Hayalinizdeki işi bulun",
        heroSubtitle: "CV'nizi yükleyin, iş tanımını yapıştırın ve motorumuz profilinizi anında hizalasın. Hallüsinasyon yok, sadece siz.",
        heroBtn: "CV'mi Optimize Et",
        feat1Title: "ATS Uyumlu CV'ler",
        feat1Desc: "Deneyimlerinizi koruyarak katı yapay zeka ve ATS filtrelerini geçen temiz, optimize edilmiş PDF CV'ler oluşturun.",
        feat2Title: "Anında Paylaşım Bağlantıları",
        feat2Desc: "Ek göndermek istemiyor musunuz? Özel başvurunuz için takip edilen, listelenmemiş web bağlantıları oluşturun.",
        feat3Title: "Tam Başvuru Paketi",
        feat3Desc: "Sadece CV değil. Özelleştirilmiş ön yazılar, e-posta metni ve 3 farklı LinkedIn mesajı alın.",
        backHome: "Ana sayfaya dön",
        welcomeBack: "Tekrar hoş geldiniz",
        loginSubtitle: "Özelleştirilmiş başvurularınızı yönetmek için giriş yapın.",
        createAccount: "Hesap oluşturun",
        signupSubtitle: "CV'nizi ücretsiz optimize etmeye başlayın.",
        emailLabel: "E-posta", passwordLabel: "Şifre", fullNameLabel: "Ad Soyad",
        loginBtn: "Giriş yap", loginBtnLoading: "Giriş yapılıyor…",
        signupBtn: "Kayıt ol", signupBtnLoading: "Kaydediliyor…",
        orContinueWith: "Veya şununla devam et",
        alreadyHaveAccount: "Zaten hesabınız var mı?", noAccount: "Hesabınız yok mu?",
        logInLink: "Giriş yap", signUpLink: "Kayıt ol",
        pricingBadge: "Şeffaf ve Basit",
        pricingTitle: "Tek plan,", pricingTitleAccent: "sınırsız güç.",
        pricingSubtitle: "Yalnızca sınırsız optimizasyona ihtiyaç duyduğunuzda ödeyin. Tek düşük yıllık ödeme tüm Pro özelliklere ve öncelikli API erişimine garanti verir.",
    },
    az: {
        overview: "İdarə paneli", myCV: "CV'm", optimize: "Optimallaşdır",
        coach: "AI Karyera Məşqçisi", jobs: "İş Tap", history: "Tarixçə",
        settings: "Parametrlər", logout: "Çıxış", loading: "Yüklənir…",
        atsCheck: "ATS Skaneri",
        navPricing: "Qiymətlər", navSignIn: "Daxil ol",
        heroBadge: "İndi Tam Çoxdilli Dəstəklə",
        heroTitle: "Xəyal etdiyiniz işi tapın",
        heroSubtitle: "CV-nizi yükləyin, iş təsvirini yapışdırın və mühərrikimiz profilinizi dərhal uyğunlaşdırsın. Heç bir uydurma yoxdur, yalnız siz.",
        heroBtn: "CV-mi Optimallaşdır",
        feat1Title: "ATS Uyğun CV-lər",
        feat1Desc: "Təcrübənizi qoruyaraq ciddi AI və ATS filtrlərindən keçən təmiz, optimallaşdırılmış PDF CV-lər yaradın.",
        feat2Title: "Dərhal Paylaşma Linkləri",
        feat2Desc: "Əlavə göndərmək istəmirsiniz? Xüsusi müraciətiniz üçün izlənilən, siyahısız veb linklər yaradın.",
        feat3Title: "Tam Müraciət Paketi",
        feat3Desc: "Yalnız CV deyil. Özəlləşdirilmiş örtük məktubları, e-poçt mətni və 3 LinkedIn mesajı alın.",
        backHome: "Ana səhifəyə qayıt",
        welcomeBack: "Xoş gəldiniz",
        loginSubtitle: "Xüsusi müraciətlərinizi idarə etmək üçün daxil olun.",
        createAccount: "Hesab yaradın",
        signupSubtitle: "CV-nizi pulsuz optimallaşdırmağa başlayın.",
        emailLabel: "E-poçt", passwordLabel: "Şifrə", fullNameLabel: "Ad Soyad",
        loginBtn: "Daxil ol", loginBtnLoading: "Daxil olunur…",
        signupBtn: "Qeydiyyat", signupBtnLoading: "Qeydiyyatdan keçirilir…",
        orContinueWith: "Və ya davam et",
        alreadyHaveAccount: "Artıq hesabınız var?", noAccount: "Hesabınız yoxdur?",
        logInLink: "Daxil ol", signUpLink: "Qeydiyyat",
        pricingBadge: "Şəffaf və Sadə",
        pricingTitle: "Bir plan,", pricingTitleAccent: "sonsuz güc.",
        pricingSubtitle: "Yalnız sınırsız optimizasiyaya ehtiyac duyanda ödəyin. Tək aşağı illik ödəniş bütün Pro xüsusiyyətlərə giriş təmin edir.",
    },
    ru: {
        overview: "Обзор", myCV: "Моё резюме", optimize: "Оптимизировать",
        coach: "ИИ Карьерный коуч", jobs: "Поиск вакансий", history: "История",
        settings: "Настройки", logout: "Выйти", loading: "Загрузка…",
        atsCheck: "ATS Сканер",
        navPricing: "Цены", navSignIn: "Войти",
        heroBadge: "Теперь с полной многоязычной поддержкой",
        heroTitle: "Найдите работу мечты с",
        heroSubtitle: "Загрузите резюме, вставьте описание вакансии, и наш движок мгновенно адаптирует ваш профиль. Никаких галлюцинаций — только вы.",
        heroBtn: "Оптимизировать резюме",
        feat1Title: "ATS-совместимые резюме",
        feat1Desc: "Создавайте чистые, оптимизированные PDF-резюме, которые проходят строгие AI и ATS-фильтры без потери честного опыта.",
        feat2Title: "Мгновенные ссылки для шаринга",
        feat2Desc: "Не хотите отправлять вложения? Создайте отслеживаемые, неиндексируемые ссылки для вашей заявки.",
        feat3Title: "Полный комплект заявки",
        feat3Desc: "Не только резюме. Получите сопроводительные письма, текст email и 3 варианта сообщений LinkedIn.",
        backHome: "На главную",
        welcomeBack: "С возвращением",
        loginSubtitle: "Войдите, чтобы управлять вашими заявками.",
        createAccount: "Создать аккаунт",
        signupSubtitle: "Начните оптимизировать резюме бесплатно.",
        emailLabel: "Электронная почта", passwordLabel: "Пароль", fullNameLabel: "Полное имя",
        loginBtn: "Войти", loginBtnLoading: "Вход…",
        signupBtn: "Зарегистрироваться", signupBtnLoading: "Регистрация…",
        orContinueWith: "Или продолжить с",
        alreadyHaveAccount: "Уже есть аккаунт?", noAccount: "Нет аккаунта?",
        logInLink: "Войти", signUpLink: "Зарегистрироваться",
        pricingBadge: "Прозрачно и просто",
        pricingTitle: "Один план,", pricingTitleAccent: "безграничная сила.",
        pricingSubtitle: "Платите только тогда, когда нужны неограниченные оптимизации. Один низкий годовой платёж — доступ ко всем функциям Pro.",
    },
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
