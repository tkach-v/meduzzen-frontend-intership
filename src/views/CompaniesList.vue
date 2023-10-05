<script setup>
import {reactive} from "vue";
import {useRouter} from "vue-router";

const router = useRouter();

const CompaniesList = [
  {id: 1, name: 'test_company_name'},
  {id: 2, name: 'test_company_name'},
  {id: 3, name: 'test_company_name'},
];

const goToUserPage = (userId) => {
  router.push({name: 'companyProfile', params: {id: userId}});
};
</script>

<template>
  <div class="container fs-5">
    <h1 class="fw-bold mt-5 mb-4">{{$t('companies.header')}}</h1>
    <table class="table table-striped table-hover">
      <thead>
      <tr>
        <th scope="col">#</th>
        <th scope="col">Company name</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(company) in CompaniesList"
          :key="company.id"
          @click="goToUserPage(company.id)"
      >
        <th scope="row">{{ company.id }}</th>
        <td>{{ company.name }}</td>
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