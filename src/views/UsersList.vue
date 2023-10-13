<script setup>
import {useRouter} from "vue-router";
import {ref} from "vue";
import userService from "@/services/user.service";

const router = useRouter();

const usersList = ref(null);
userService.getUsers()
    .then(response => {
      usersList.value = response.data.results;
    })
    .catch(error => {
      console.error('API Error:', error);
    });

const goToUserPage = (userId) => {
  router.push({name: 'userProfile', params: {id: userId}});
};
</script>

<template>
  <div class="container fs-5">
    <h1 class="fw-bold mt-5 mb-4">{{$t('users.header')}}</h1>
    <table class="table table-striped table-hover">
      <thead>
      <tr>
        <th scope="col">#</th>
        <th scope="col">Email</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(user) in usersList" :key="user.id" @click="goToUserPage(user.id)">
        <th scope="row">{{ user.id }}</th>
        <td>{{ user.email }}</td>
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