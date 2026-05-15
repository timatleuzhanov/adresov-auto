"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type Locale = "ru" | "en" | "kz";

const STORAGE_KEY = "adresov_locale";

export const translations = {
  ru: {
    nav: {
      models: "Модели",
      promotions: "Акции",
      credit: "Кредит",
      trade_in: "Trade-in",
      service: "Сервис",
      about: "О компании",
      contacts: "Контакты",
    },
    catalog: "Каталог",
    more: "Подробнее",
    request: "Заявка",
    car: {
      new: "Новый",
      used: "С пробегом",
      in_stock: "В наличии",
      on_order: "Под заказ",
      sold: "Продано",
      auto: "Автомат",
      manual: "Механика",
      variator: "Вариатор",
      price_on_request: "Цена по запросу",
      clarify: "Уточнить цену",
      from: "от",
      km: "км",
    },
  },
  en: {
    nav: {
      models: "Models",
      promotions: "Promotions",
      credit: "Credit",
      trade_in: "Trade-in",
      service: "Service",
      about: "About",
      contacts: "Contacts",
    },
    catalog: "Catalog",
    more: "Details",
    request: "Enquire",
    car: {
      new: "New",
      used: "Used",
      in_stock: "In stock",
      on_order: "On order",
      sold: "Sold",
      auto: "Automatic",
      manual: "Manual",
      variator: "CVT",
      price_on_request: "Price on request",
      clarify: "Ask for price",
      from: "from",
      km: "km",
    },
  },
  kz: {
    nav: {
      models: "Модельдер",
      promotions: "Акциялар",
      credit: "Несие",
      trade_in: "Trade-in",
      service: "Сервис",
      about: "Компания туралы",
      contacts: "Байланыс",
    },
    catalog: "Каталог",
    more: "Толығырақ",
    request: "Өтінім",
    car: {
      new: "Жаңа",
      used: "Жүрілген",
      in_stock: "Қоймада бар",
      on_order: "Тапсырыспен",
      sold: "Сатылды",
      auto: "Автомат",
      manual: "Механика",
      variator: "Вариатор",
      price_on_request: "Баға сұрау бойынша",
      clarify: "Бағаны нақтылау",
      from: "бастап",
      km: "км",
    },
  },
} as const;

export type T = {
  nav: {
    models: string;
    promotions: string;
    credit: string;
    trade_in: string;
    service: string;
    about: string;
    contacts: string;
  };
  catalog: string;
  more: string;
  request: string;
  car: {
    new: string;
    used: string;
    in_stock: string;
    on_order: string;
    sold: string;
    auto: string;
    manual: string;
    variator: string;
    price_on_request: string;
    clarify: string;
    from: string;
    km: string;
  };
};

type LocaleContextType = {
  locale: Locale;
  t: T;
  setLocale: (l: Locale) => void;
};

const LocaleContext = createContext<LocaleContextType>({
  locale: "ru",
  t: translations.ru,
  setLocale: () => {},
});

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("ru");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "ru" || saved === "en" || saved === "kz") {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem(STORAGE_KEY, l);
  };

  return (
    <LocaleContext.Provider value={{ locale, t: translations[locale], setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
