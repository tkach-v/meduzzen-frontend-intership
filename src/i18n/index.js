import {createI18n} from "vue-i18n";
import en from "./locales/en.json"
import ua from "./locales/ua.json"

export default createI18n({
  locale: 'en',
  fallbackLocale: 'ua',
  legacy: false,
  globalInjection: true,
  messages: {
    en,
    ua
  }
})