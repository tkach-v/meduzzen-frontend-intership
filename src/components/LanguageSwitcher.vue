<script setup>
import {useI18n} from 'vue-i18n'
import Tr from "@/i18n/translation"
import {useRouter} from "vue-router";

const {t, locale} = useI18n()

const router = useRouter()

const supportedLocales = Tr.supportedLocales

const switchLanguage = async (event) => {
  const newLocale = event.target.value
  await Tr.switchLanguage(newLocale)

  try {
    await router.replace({params: {locale: newLocale}})
  } catch (e) {
    console.log(e)
    router.push("/")
  }
}

</script>

<template>
  <select class="form-select form-select-sm"
          aria-label="Language"
          @change="switchLanguage">
    <option
        v-for="sLocale in supportedLocales"
        :key="`locale-${sLocale}`"
        :value="sLocale"
        :selected="locale === sLocale"
    >
      {{ t(`locale.${sLocale}`) }}
    </option>
  </select>
</template>