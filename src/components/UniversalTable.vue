<script setup>
import {computed} from "vue";

const props = defineProps({
  data: Array,
  columns: Array,
  rowClick: Function
});

const computedColumns = computed(() => {
  return props.columns.map(column => {
    console.log({
      ...column,
      field: getNestedValue(props.data[0], column.field),
    })
    return {
      ...column,
      field: getNestedValue(props.data[0], column.field),
    };
  });
});

const getRowClickArg = (item) => {
  if (item.company && item.company.id) {
    return item.company.id
  } else if (item.recipient && item.recipient.id) {
    return item.recipient.id
  } else if (item.sender && item.sender.id) {
    return item.sender.id
  }else if (item.id) {
    return item.id
  }
  return null;
};

const getNestedValue = (item, field) => {
  return field.split('.').reduce((value, key) => value[key], item);
};
</script>

<template>
  <table class="table table-striped table-hover">
    <thead>
    <tr>
      <th v-for="(column, index) in columns"
          :key="index"
      >{{ column.label }}
      </th>
    </tr>
    </thead>
    <tbody>
    <tr v-for="(item, rowIndex) in data" :key="item.id" @click="rowClick(getRowClickArg(item))">
      <td v-for="(column, colIndex) in columns" :key="colIndex">
        {{ getNestedValue(item, column.field) }}
      </td>
    </tr>
    </tbody>
  </table>
</template>

<style scoped lang="scss">
tr {
  cursor: pointer;
}
</style>