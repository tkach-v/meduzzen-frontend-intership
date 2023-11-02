import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.min'
import 'vue3-toastify/dist/index.css'

import {createApp} from 'vue'
import App from './App.vue'
import router from "./router";
import i18n from "./i18n";
import store from "@/store";
import Vue3Toastify, {toast} from "vue3-toastify";

const app = createApp(App)
app.use(router)
app.use(i18n)
app.use(store)
app.use(Vue3Toastify, {
  autoClose: 3000,
  position: toast.POSITION.TOP_CENTER
})

app.mount('#app')