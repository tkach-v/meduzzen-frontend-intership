<script setup>
import {onMounted, ref} from "vue";
import Modal from "bootstrap/js/dist/modal";

defineProps({
  title: {
    default: "Modal title",
  },
  wide: Boolean
});
let modalElement = ref(null);
let thisModalObj = null;

onMounted(() => {
  thisModalObj = new Modal(modalElement.value);
});

function _show() {
  thisModalObj.show();
}

function _hide() {
  thisModalObj.hide();
}

defineExpose({show: _show, hide: _hide});
</script>

<template>
  <div class="modal fade" ref="modalElement">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable"
        :class="wide ? 'wide-modal-dialog' : ''">
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

<style scoped lang="scss">
.wide-modal-dialog {
  max-width: 900px;
  width: 100%;
  padding: 0 20px
}
</style>