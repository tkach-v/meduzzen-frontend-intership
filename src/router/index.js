import {createRouter, createWebHistory} from 'vue-router'
import Home from "@/views/Home.vue";
import Layout from "@/layouts/Layout.vue";
import Tr from "@/i18n/translation"
import i18n from "@/i18n/index"
import {checkIsUserMember} from "@/services/company.service";

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
          {
            path: '',
            name: 'home',
            component: Home
          },
          {
            path: 'about',
            name: 'about',
            component: () => import("@/views/About.vue")
          },
          {
            path: 'profile',
            name: 'profile',
            component: () => import("@/views/UserProfile.vue")
          },
          {
            path: 'notifications',
            name: 'userNotifications',
            component: () => import("@/views/UserNotifications.vue")
          },
          {
            path: 'users', children: [
              {
                path: '',
                name: 'usersList',
                component: () => import("@/views/UsersList.vue")
              },
              {
                path: ':id',
                name: 'userProfile',
                component: () => import("@/views/UserProfile.vue")
              },
            ]
          },
          {
            path: 'companies', children: [
              {
                path: '',
                name: 'companiesList',
                component: () => import("@/views/CompaniesList.vue")
              },
              {
                path: ':id', children: [
                  {
                    path: '',
                    name: 'companyProfile',
                    component: () => import("@/views/CompanyProfile.vue")
                  },
                  {
                    path: 'quizzes/:quizId',
                    beforeEnter: async (to, from, next) => {
                      // only for company members can access the quiz
                      const companyId = to.params.id
                      const isMember = await checkIsUserMember(companyId)
                      if (isMember) {
                        next()
                      } else {
                        next({name: 'NotFound', params: {locale: i18n.global.locale.value}})
                      }
                    },
                    children: [
                      {
                        path: '',
                        name: 'quizProfile',
                        component: () => import("@/views/QuizProfile.vue")
                      },
                      {
                        path: 'take',
                        name: 'quizTake',
                        component: () => import("@/views/QuizTake.vue"),
                      }
                    ]
                  },
                ]
              },
            ]
          },
          {
            path: ':pathMatch(.*)*',
            name: 'NotFound',
            component: () => import("@/views/NotFound.vue")
          }
        ]
      },
      {
        path: 'login',
        name: 'login',
        component: () => import("@/views/Login.vue")
      },
      {
        path: 'register',
        name: 'register',
        component: () => import("@/views/Register.vue")
      },
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

router.beforeEach((to, from, next) => {
  const loggedIn = localStorage.getItem('user');

  const publicRoutes = ['home', 'about', 'NotFound'];
  const unauthorizedRoutes = ['login', 'register'];

  if (!loggedIn) {
    if (unauthorizedRoutes.includes(to.name) || publicRoutes.includes(to.name)) {
      next();
    } else {
      next({name: 'login', params: {locale: i18n.global.locale.value}});
    }
  } else {
    if (unauthorizedRoutes.includes(to.name)) {
      next({name: 'home', params: {locale: i18n.global.locale.value}});
    } else {
      next();
    }
  }
});

export default router