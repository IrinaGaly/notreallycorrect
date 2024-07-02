import { createApp } from "vue";

import "./style.css";
import "@/sass/main.scss";
import App from "./App.vue";
import VueLazyload from "vue-lazyload";
import Vue3Dragscroll from "vue3-dragscroll";
import router from "@/router";

const app = createApp(App).use(VueLazyload).use(Vue3Dragscroll).use(router);
app.mount("#app");
