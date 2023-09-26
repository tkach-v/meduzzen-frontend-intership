import {createRouter, createWebHistory} from 'vue-router'
import Home from "@/views/Home.vue";
import Layout from "@/layouts/Layout.vue";

const routes = [
  {
    path: '/',
    component: Layout,
    children: [
      {path: '', name: 'home', component: Home},
      {path: 'about', name: 'about', component: () => import("@/views/About.vue")},
      {
        path: 'users', children: [
          {path: '', name: 'usersList', component: () => import("@/views/UsersList.vue")},
          {path: ':id', name: 'userProfile', component: () => import("@/views/UserProfile.vue")},
        ]
      },
      {
        path: 'companies', children: [
          {path: '', name: 'companiesList', component: () => import("@/views/CompaniesList.vue")},
          {path: ':id', name: 'companyProfile', component: () => import("@/views/CompanyProfile.vue")},
        ]
      },

      {path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import("@/views/NotFound.vue")}
    ]
  },
  { path: '/login', name: 'login', component: () => import("@/views/Login.vue") },
  { path: '/register', name: 'register', component: () => import("@/views/Register.vue") },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  linkActiveClass: 'active',
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || {top: 0}
  },
  routes
})

export default router