<script setup>
defineProps({
  data: Array,
  columns: Array,
  rowClick: Function
});

const getRowClickArg = (item) => {
  if (item.company && item.company.id) {
    return item.company.id
  } else if (item.recipient && item.recipient.id) {
    return item.recipient.id
  } else if (item.sender && item.sender.id) {
    return item.sender.id
  } else if (item.user_id) {
    return item.user_id
  } else if (item.id) {
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
    <tr v-for="(item) in data" :key="item.id" @click="rowClick(getRowClickArg(item))">
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