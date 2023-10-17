<script setup>
import {useRouter} from "vue-router";
import {onMounted, reactive, computed} from "vue";
import Pagination from "@/components/Pagination.vue";
import {useStore} from "vuex";

const router = useRouter();
const store = useStore()

const state = reactive({
  usersList: computed(() => store.state.users.usersList),
  totalUsersCount: computed(() => store.state.users.totalUsersCount),
  currentPage: 1,
  rowsPerPage: 2,
  pageCount: computed(() => Math.ceil(state.totalUsersCount / state.rowsPerPage)),
  paginatedData: computed(() =>
      state.usersList.slice(
          (state.currentPage - 1) * state.rowsPerPage,
          state.currentPage * state.rowsPerPage
      )
  ),
});

const goToUserPage = (userId) => {
  router.push({name: 'userProfile', params: {id: userId}});
};

function setCurrentPage(number) {
  state.currentPage = number;
}

onMounted(() => {
  store.dispatch('users/fetchUsers', '/api/users/')
});
</script>

<template>
  <div class="container fs-5">
    <h1 class="fw-bold mt-5 mb-4">{{ $t('users.header') }}</h1>
    <table class="table table-striped table-hover">
      <thead>
      <tr>
        <th scope="col">#</th>
        <th scope="col">Email</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(user) in state.paginatedData" :key="user.id" @click="goToUserPage(user.id)">
        <th scope="row">{{ user.id }}</th>
        <td>{{ user.email }}</td>
      </tr>
      </tbody>
    </table>
  </div>
  <Pagination
      :currentPage="state.currentPage"
      :pageCount="state.pageCount"
      @set-currentpage="setCurrentPage"
  />
</template>

<style scoped lang="scss">
tr {
  cursor: pointer;
}
</style>