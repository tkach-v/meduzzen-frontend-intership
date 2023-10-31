<script setup>
import {useRouter} from "vue-router";
import {onMounted, reactive, computed} from "vue";
import Pagination from "@/components/Pagination.vue";
import {useStore} from "vuex";
import UniversalTable from "@/components/UniversalTable.vue";

const router = useRouter();
const store = useStore()

const userListColumns = [
  {label: "#", field: "id"},
  {label: "Email", field: "email"},
]

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
    <UniversalTable :columns="userListColumns"
                    :data="state.paginatedData"
                    :rowClick="goToUserPage"/>
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