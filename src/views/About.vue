<script setup>

</script>

<template>
  <div class="container fs-5">
    <h1 class="fw-bold mt-5 mb-4">{{$t('common.about')}}</h1>
    <p><b>{{$t('about.author')}}: </b>{{$t('about.author_name')}} (<a href="https://github.com/tkach-v">Github</a>)</p>
    <p>
      <b>{{$t('about.description')}}:</b>
      {{$t('about.description_p1')}}
    </p>
    <p>{{$t('about.description_p2')}}</p>
  </div>
</template>