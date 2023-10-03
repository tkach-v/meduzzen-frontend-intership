import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.min'

import { createApp } from 'vue'
import App from './App.vue'
import router from "./router";
import i18n from "./i18n";
import store from "@/store";

const app = createApp(App)
app.use(router)
app.use(i18n)
app.use(store)

app.mount('#app')