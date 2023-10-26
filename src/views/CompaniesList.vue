<script setup>
import {useRouter} from "vue-router";
import {onMounted, reactive, computed} from "vue";
import Pagination from "@/components/Pagination.vue";
import apiClient from "@/http/axios/apiClient";
import UniversalTable from "@/components/UniversalTable.vue";

const router = useRouter();

const companyListColumns = [
  {label: "#", field: "id"},
  {label: "Name", field: "name"},
]

const companiesList = reactive([])
const state = reactive({
  totalCompaniesCount: computed(() => companiesList.length),
  currentPage: 1,
  rowsPerPage: 2,
  pageCount: computed(() => Math.ceil(state.totalCompaniesCount / state.rowsPerPage)),
  paginatedData: computed(() =>
      companiesList.slice(
          (state.currentPage - 1) * state.rowsPerPage,
          state.currentPage * state.rowsPerPage
      )
  ),
});

const goToCompanyPage = (companyId) => {
  router.push({name: 'companyProfile', params: {id: companyId}});
};

function setCurrentPage(number) {
  state.currentPage = number;
}

async function fetchCompanies(url) {
  try {
    const response = await apiClient.get(url);

    const { results, next } = response.data;
    companiesList.push(...results);

    if (next) {
      await fetchCompanies(next);
    }

  } catch (error) {
    console.error('API Error:', error)
  }
}


onMounted(() => {
  fetchCompanies('/api/companies/')
});
</script>

<template>
  <div class="container fs-5">
    <h1 class="fw-bold mt-5 mb-4">{{ $t('companies.header') }}</h1>
    <UniversalTable :columns="companyListColumns"
                    :data="state.paginatedData"
                    :rowClick="goToCompanyPage"/>
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