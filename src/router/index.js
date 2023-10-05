import {createRouter, createWebHistory} from 'vue-router'
import Home from "@/views/Home.vue";
import Layout from "@/layouts/Layout.vue";
import Tr from "@/i18n/translation"

const routes = [
  {
    path: '/',
    redirect: `/${Tr.guessDefaultLocale()}`,
  },
  {
    path: '/:locale',
    beforeEnter: Tr.routeMiddleware,
    children: [
      {
        path: '',
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
        ]
      },
      {path: 'login', name: 'login', component: () => import("@/views/Login.vue")},
      {path: 'register', name: 'register', component: () => import("@/views/Register.vue")},
    ]
  },
  {
    path: '/:locale/:pathMatch(.*)*',
    component: Layout,
    children: [
      {
        path: '',
        component: () => import("@/views/NotFound.vue"),
        name: 'NotFound'
      }
    ]
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  linkActiveClass: 'active',
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || {top: 0}
  },
  routes,
  base: '/en'
})

// router.beforeEach((to, from, next) => {
//   localizationMiddleware(to, from, next);
// });

export default router