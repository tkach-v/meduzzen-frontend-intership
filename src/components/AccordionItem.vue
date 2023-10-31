<script setup>
import { defineProps } from 'vue';

defineProps({
  itemTitle: String,
  itemSuffix: String,
  parentSelector: String,
});
</script>

<template>
  <div class="accordion-item">
    <h2 class="accordion-header">
      <button
          class="accordion-button collapsed"
          type="button"
          data-bs-toggle="collapse"
          aria-expanded="false"
          :data-bs-target="'#collapse' + itemSuffix"
          :aria-controls="'collapse' + itemSuffix"
      >{{ itemTitle }}
      </button>
    </h2>
    <div :id="'collapse' + itemSuffix" class="accordion-collapse collapse" :data-bs-parent="parentSelector">
      <div class="accordion-body">
        <slot></slot>
      </div>
    </div>
  </div>
</template>