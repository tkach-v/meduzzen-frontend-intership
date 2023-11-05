<script setup>
import {computed, defineProps} from "vue";
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  TimeScale,
  Title,
  Tooltip
} from 'chart.js'
import {Line} from 'vue-chartjs'
import 'chartjs-adapter-date-fns';
import {format} from "date-fns";
import {useI18n} from "vue-i18n";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Title, TimeScale)

const props = defineProps({
  x: Array,
  y: Array
})

const {t} = useI18n()

const ChartData = computed(() => {
  return {
    labels: props.x.map(date => format(new Date(date), "yyyy-MM-dd HH:mm")),
    datasets: [
      {
        label: t('company_profile.score'),
        borderColor: "#c319ee",
        backgroundColor: '#c319ee',
        tension: 0.3,
        data: props.y
      }
    ]
  }
})

const ChartOptions = {
  responsive: true,
  scales: {
    y: {
      ticks: {
        color: "#b6baca",
      },
      grid: {
        drawTicks: false,
      },
      border: {
        dash: [5, 10],
      },
    },
    x: {
      ticks: {
        color: "#b6baca",
        maxTicksLimit: 6,
      },
      grid: {
        display: false,
      },
      border: {
        display: false,
      },
      title: {
        display: true,
        text: t('company_profile.date'),
      }
    },
  },
}
</script>

<template>
  <Line :options="ChartOptions"
        :data="ChartData"/>
</template>