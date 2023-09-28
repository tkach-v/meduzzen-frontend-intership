<script setup>
import {reactive} from "vue";
import {useRouter} from "vue-router";

const router = useRouter();

const UsersList = [
  {id: 1, username: 'testusername1'},
  {id: 2, username: 'testusername2'},
  {id: 3, username: 'testusername3'},
];

const goToUserPage = (userId) => {
  router.push({name: 'userProfile', params: {id: userId}});
};
</script>

<template>
  <div class="container fs-5">
    <h1 class="fw-bold mt-5 mb-4">List of users</h1>
    <table class="table table-striped table-hover">
      <thead>
      <tr>
        <th scope="col">#</th>
        <th scope="col">Username</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(user) in UsersList" :key="user.id" @click="goToUserPage(user.id)">
        <th scope="row">{{ user.id }}</th>
        <td>@{{ user.username }}</td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped lang="scss">
tr {
  cursor: pointer;
}
</style>