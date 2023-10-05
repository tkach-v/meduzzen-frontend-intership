<script setup>
import i18n from "@/i18n/index"

const props = defineProps({
  to: {
    type: [String, Object],
    required: true,
  },
})

const locale = i18n.global.locale.value
let localizedTo

if (typeof props.to === 'string') {
  localizedTo = `${locale}/${props.to}`
} else if (typeof props.to === 'object') {
  localizedTo = {...props.to, params: {locale: locale}}
}

</script>

<template>
  <router-link :to="localizedTo">
    <slot></slot>
  </router-link>
</template>