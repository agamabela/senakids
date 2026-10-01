"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { translations, DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from "@/lib/translations";

const LanguageContext = createContext({
  language: DEFAULT_LANGUAGE,
  lang: DEFAULT_LANGUAGE,
  setLanguage: () => {},
  t: (key, params) => key,
  tx: (idText, enText) => idText,
});

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(DEFAULT_LANGUAGE);

  // Restore stored language and apply to <html lang>
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("language");
      if (stored && SUPPORTED_LANGUAGES.includes(stored)) {
        setLanguageState(stored);
        document.documentElement.lang = stored;
      } else {
        document.documentElement.lang = DEFAULT_LANGUAGE;
      }
    } catch (error) {
      // ignore localStorage errors in private browsing
    }
  }, []);

  // Update document language dynamically on change
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = language;
    }
  }, [language]);

  const setLanguage = (value) => {
    if (!SUPPORTED_LANGUAGES.includes(value)) return;
    setLanguageState(value);
    try {
      window.localStorage.setItem("language", value);
    } catch (error) {
      // ignore localStorage failures
    }
  };

  const t = useMemo(
    () => (key, params = {}) => {
      const path = key.split(".");
      
      const resolve = (lang) => {
        let cur = translations[lang];
        for (const part of path) {
          if (!cur || typeof cur !== "object") return undefined;
          cur = cur[part];
        }
        return typeof cur === "string" ? cur : undefined;
      };

      // Try current language, then fall back to default language ("id")
      let result = resolve(language);
      if (result === undefined && language !== DEFAULT_LANGUAGE) {
        result = resolve(DEFAULT_LANGUAGE);
      }

      if (result === undefined) {
        return key;
      }

      return result.replace(/\{(\w+)\}/g, (_, name) => {
        if (params[name] === undefined) return `{${name}}`;
        return params[name];
      });
    },
    [language]
  );

  const tx = useMemo(
    () => (idText, enText) => (language === "en" ? enText : idText),
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, lang: language, setLanguage, t, tx }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
