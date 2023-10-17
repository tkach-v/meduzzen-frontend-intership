<script setup>
import {onMounted, ref} from "vue";
import Modal from "bootstrap/js/dist/modal";

defineProps({
  title: {
    default: "Modal title",
  },
});
let modalElement = ref(null);
let thisModalObj = null;

onMounted(() => {
  thisModalObj = new Modal(modalElement.value);
});

function _show() {
  thisModalObj.show();
}

defineExpose({show: _show});
</script>

<template>
  <div class="modal fade" ref="modalElement">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ title }}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <slot></slot>
        </div>
      </div>
    </div>
  </div>
</template>