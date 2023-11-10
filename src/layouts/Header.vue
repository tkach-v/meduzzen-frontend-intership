<script setup>
import LanguageSwitcher from "@/components/LanguageSwitcher.vue";
import LocalizedLink from "@/components/LocalizedLink.vue";
import {computed} from 'vue';
import {useStore} from 'vuex';
import {useRouter} from "vue-router";
import i18n from "@/i18n/index"

const navItems = [
  {text: 'common.about', link: {name: 'about'}},
  {text: 'header.users', link: {name: 'usersList'}},
  {text: 'header.companies', link: {name: 'companiesList'}},
]


const store = useStore();

const currentUser = computed(() => store.state.auth.user);

const dropdownItems = currentUser.value ? [
  {text: 'header.profile', link: {name: 'profile'}},
  {text: 'notifications.notifications', link: {name: 'userNotifications'}},
  {text: 'header.companies', link: {name: 'companiesList'}},
] : [
  {text: 'common.sign_in', link: {name: 'login'}},
  {text: 'common.sign_up', link: {name: 'register'}}
]

const router = useRouter();
const logOut = computed(() => {
  store.dispatch('auth/logout').then(() => {
    router.push({name: 'home', params: {locale: i18n.global.locale.value}});
  });
});

</script>

<template>
  <header class="border-bottom fixed-top bg-body-tertiary" data-bs-theme="dark">
    <nav class="navbar">
      <div class="container-fluid">
        <button class="btn border-0 pe-4"
                type="button"
                data-bs-toggle="offcanvas"
                data-bs-target="#offcanvas1"
                aria-controls="offcanvas1">
          <span class="navbar-toggler-icon"></span>
        </button>
        <LocalizedLink class="navbar-brand fs-3 fw-bold" :to="{name: 'home'}">Quizzes</LocalizedLink>
        <div class="ms-auto d-flex">
          <LanguageSwitcher/>
          <div class="ms-2 dropdown">
            <button class="btn border-0 user-profile-btn"
                    id="dropdown1"
                    data-bs-toggle="dropdown"
                    aria-expanded="false">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor"
                   class="bi bi-person-circle" viewBox="0 0 16 16">
                <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
                <path fill-rule="evenodd"
                      d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"/>
              </svg>
            </button>
            <ul class="dropdown-menu dropdown-menu-end mt-1" aria-labelledby="dropdown1">
              <li v-if="currentUser">
                <div class="dropdown-item fw-bold mb-3">{{ currentUser.email }}</div>
              </li>
              <li v-for="(item, index) in dropdownItems"
                  :key="index">
                <LocalizedLink class="dropdown-item"
                               :to="item.link">
                  {{ $t(item.text) }}
                </LocalizedLink>
              </li>
              <li v-if="currentUser">
                <hr class="dropdown-divider">
              </li>
              <li v-if="currentUser">
                <a class="dropdown-item"
                   @click="logOut"
                   style="cursor: pointer">
                  {{ $t('header.sign_out') }}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div class="offcanvas offcanvas-start"
           tabindex="-1"
           id="offcanvas1">
        <div class="offcanvas-header">
          <LocalizedLink class="navbar-brand fs-2 fw-bold" :to="{name: 'home'}">Quizzes</LocalizedLink>
          <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div class="offcanvas-body pt-0">
          <ul class="navbar-nav me-auto">
            <li class="nav-item"
                v-for="(item, index) in navItems"
                :key="index">
              <LocalizedLink class="nav-link fs-5 fw-bold" :to="item.link">{{ $t(item.text) }}</LocalizedLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </header>
</template>

<style scoped lang="scss">
.user-profile-btn {
  &:hover {
    color: #ffffff;
  }

  &.show {
    background-color: #dee2e6;

    &:hover {
      color: #000000;
    }
  }
}
</style>