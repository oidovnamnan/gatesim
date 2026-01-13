"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Language = "mn" | "en" | "cn";

interface LanguageState {
    language: Language;
    setLanguage: (lang: Language) => void;
}

export const useLanguage = create<LanguageState>()(
    persist(
        (set) => ({
            language: "mn",
            setLanguage: (lang) => set({ language: lang }),
        }),
        {
            name: "gatesim-language",
        }
    )
);

// Basic translations structure
export const translations = {
    mn: {
        home: "Нүүр",
        packages: "Багцууд",
        myEsims: "Миний eSIM",
        profile: "Профайл",
        login: "Нэвтрэх",
        greeting: "Сайн байна уу",
        logout: "Гарах",
        save: "Хадгалах",
        saving: "Хадгалж байна...",
        appearance: "Гадаад төрх",
        lightMode: "Өдөр",
        darkMode: "Шөнө",
        email: "Имэйл хаяг",
        phone: "Утасны дугаар",
        phonePlaceholder: "Утасны дугаараа оруулна уу",
        back: "Буцах",
        loading: "Уншиж байна...",
        error: "Алдаа гарлаа",
        success: "Амжилттай",
    },
    en: {
        home: "Home",
        packages: "Packages",
        myEsims: "My eSIM",
        profile: "Profile",
        login: "Login",
        greeting: "Hello",
        logout: "Logout",
        save: "Save",
        saving: "Saving...",
        appearance: "Appearance",
        lightMode: "Light",
        darkMode: "Dark",
        email: "Email Address",
        phone: "Phone Number",
        phonePlaceholder: "Enter your phone number",
        back: "Back",
        loading: "Loading...",
        error: "An error occurred",
        success: "Success",
    },
    cn: {
        home: "首页",
        packages: "套餐",
        myEsims: "我的eSIM",
        profile: "个人资料",
        login: "登录",
        greeting: "你好",
        logout: "注销",
        save: "保存",
        saving: "正在保存...",
        appearance: "外观",
        lightMode: "日间",
        darkMode: "夜间",
        email: "电子邮箱",
        phone: "电话号码",
        phonePlaceholder: "输入您的电话号码",
        back: "返回",
        loading: "加载中...",
        error: "发生错误",
        success: "成功",
    }
};

export function useTranslation() {
    const { language } = useLanguage();
    return {
        t: (key: keyof typeof translations.mn) => translations[language][key] || key,
        language
    };
}
