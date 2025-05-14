<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { usePhotoStore } from '../stores/photoStore'

const store = usePhotoStore()

const props = defineProps({
  search: String,
  sortKey: String,
  sortOrder: String,
})

const tableRef = ref(null)
const visibleRows = ref(30)

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'albumId', label: 'Album' },
  { key: 'title', label: 'Name' },
  { key: 'url', label: 'Link' },
  { key: 'thumbnailUrl', label: 'Min' },
]

const sortedPhotos = computed(() => {
  let data = store.filteredPhotos
  if (props.sortKey) {
    data = [...data].sort((a, b) => {
      if (a[props.sortKey] < b[props.sortKey]) return props.sortOrder === 'asc' ? -1 : 1
      if (a[props.sortKey] > b[props.sortKey]) return props.sortOrder === 'asc' ? 1 : -1
      return 0
    })
  }
  return data
})

const visiblePhotos = computed(() => sortedPhotos.value.slice(0, visibleRows.value))

function onScroll(e) {
  const { scrollTop, scrollHeight, clientHeight } = e.target
  if (scrollTop + clientHeight >= scrollHeight - 10) {
    if (visibleRows.value < sortedPhotos.value.length) {
      visibleRows.value += 30
    }
  }
}

watch(
  () => store.filteredPhotos,
  () => {
    visibleRows.value = 30
  }
)

onMounted(() => {
  if (tableRef.value) {
    tableRef.value.addEventListener('scroll', onScroll)
  }
})
</script>

<template>
  <div class="w-[600px] h-[600px] mx-auto bg-white dark:bg-zinc-900 rounded-lg shadow overflow-hidden flex flex-col">
    <div class="sticky top-0 z-10 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
      <table class="w-full text-sm table-fixed">
        <colgroup>
          <col style="width: 10%" />
          <col style="width: 10%" />
          <col style="width: 35%" />
          <col style="width: 23%" />
          <col style="width: 22%" />
        </colgroup>
        <thead>
          <tr>
            <th v-for="col in columns" :key="col.key" class="px-2 py-2 text-left cursor-pointer select-none hover:bg-zinc-100 dark:hover:bg-zinc-800" @click="$emit('sort', col.key)">
              <div class="flex items-center gap-1">
                {{ col.label }}
                <span v-if="props.sortKey === col.key">
                  <svg v-if="props.sortOrder === 'asc'" class="inline w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg>
                  <svg v-else class="inline w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </span>
              </div>
            </th>
          </tr>
        </thead>
      </table>
    </div>
    <div ref="tableRef" class="overflow-y-auto flex-1" style="max-height: 540px;">
      <table class="w-full text-sm table-fixed">
        <colgroup>
          <col style="width: 10%" />
          <col style="width: 10%" />
          <col style="width: 35%" />
          <col style="width: 23%" />
          <col style="width: 22%" />
        </colgroup>
        <tbody v-if="store.loading && !visiblePhotos.length">
          <tr v-for="i in 10" :key="i" class="border-b border-zinc-200 dark:border-zinc-800 animate-pulse">
            <td v-for="col in columns" :key="col.key" class="px-2 py-3">
              <div class="h-3 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
            </td>
          </tr>
        </tbody>
        <tbody v-else-if="visiblePhotos.length">
          <tr v-for="photo in visiblePhotos" :key="photo.id" class="border-b border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800">
            <td class="px-2 py-2 truncate" :title="photo.id">{{ photo.id }}</td>
            <td class="px-2 py-2 truncate" :title="photo.albumId">{{ photo.albumId }}</td>
            <td class="px-2 py-2 truncate" :title="photo.title">{{ photo.title }}</td>
            <td class="px-2 py-2 truncate" :title="photo.url">{{ photo.url }}</td>
            <td class="px-2 py-2 truncate" :title="photo.thumbnailUrl">{{ photo.thumbnailUrl }}</td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr>
            <td colspan="5" class="text-center py-4 text-zinc-500 dark:text-zinc-400">Нет данных для отображения</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.table-fixed {
  table-layout: fixed;
}

tr, td, th {
  user-select: none;
}
</style>
