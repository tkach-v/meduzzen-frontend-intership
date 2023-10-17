<script setup>
import Pagination from "vuejs-paginate-next";
import {defineEmits, onBeforeMount, ref} from "vue";

const props = defineProps({
  currentPage: Number,
  pageCount: Number,
});
const currentPageNumber = ref(props.currentPage);

const emit = defineEmits(["set-currentpage"]);

const clickCallback = () => {
  emit("set-currentpage", currentPageNumber.value);
};
</script>

<template>
  <pagination
      v-model="currentPageNumber"
      :page-count="pageCount"
      :click-handler="clickCallback"
      :margin-pages="3"
      :prev-text="'Prev'"
      :next-text="'Next'"
      :container-class="'pagination d-flex justify-content-center'"
      :page-class="'page-item'"
      :page-link-class="'page-link'"
      :active-class="'active'"
      :hide-prev-next="false"
  ></pagination>
</template>

<style lang="scss">
.page-item {
  cursor: pointer;
}
</style>