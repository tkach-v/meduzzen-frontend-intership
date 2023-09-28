import i18n from "@/i18n/index"

const Trans = {
  defaultLocale: 'en',
  supportedLocales: ['en', 'ua'],

  get currentLocale() {
    return i18n.global.locale.value
  },

  set currentLocale(newLocale) {
    i18n.global.locale.value = newLocale
  },

  async switchLanguage(newLocale) {
    Trans.currentLocale = newLocale
    document.querySelector("html").setAttribute("lang", newLocale)
    localStorage.setItem("user-locale", newLocale)
  },

  isLocaleSupported(locale) {
    return Trans.supportedLocales.includes(locale)
  },

  getPersistedLocale() {
    const persistedLocale = localStorage.getItem("user-locale")

    if(Trans.isLocaleSupported(persistedLocale)) {
      return persistedLocale
    } else {
      return null
    }
  },

  guessDefaultLocale() {
    const userPersistedLocale = Trans.getPersistedLocale()
    if(userPersistedLocale) {
      return userPersistedLocale
    }

    return Trans.defaultLocale
  },

  async routeMiddleware(to, _from, next) {
    const paramLocale = to.params.locale

    if(!Trans.isLocaleSupported(paramLocale)) {
      return next(Trans.guessDefaultLocale())
    }

    await Trans.switchLanguage(paramLocale)

    return next()
  },

  i18nRoute(to) {
    return {
      ...to,
      params: {
        locale: Trans.currentLocale,
        ...to.params
      }
    }
  }
}

export default Trans