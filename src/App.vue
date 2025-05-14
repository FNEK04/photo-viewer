<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { usePhotoStore } from './stores/photoStore'
import PhotoTable from './components/PhotoTable.vue'

const store = usePhotoStore()

const search = ref('')
const sortKey = ref('id')
const sortOrder = ref('asc')
const theme = ref(localStorage.getItem('theme') || 'dark')

function handleSearch() {
  const ids = search.value.trim() ? search.value.split(' ').map(s => parseInt(s.trim())).filter(Boolean) : []
  store.setAlbumFilter(ids)
  store.fetchPhotos(ids)
}

function handleSort(key) {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
}

function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  localStorage.setItem('theme', theme.value)
  applyTheme()
}

function applyTheme() {
  if (theme.value === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

onMounted(() => {
  store.loadAlbumFilter()
  if (store.albumFilter.length) {
    search.value = store.albumFilter.join(' ')
    store.fetchPhotos(store.albumFilter)
  } else {
    store.fetchPhotos([])
  }
  applyTheme()
})
</script>

<template>
  <div class="min-h-screen bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col items-center justify-start py-8">
    <div class="text-3xl font-bold mb-6 text-center">Photo Viewer</div>
    <div class="flex items-center gap-3 mb-4 w-[600px] mx-auto">
      <input
        v-model="search"
        @keydown.enter="handleSearch"
        class="flex-1 px-3 py-2 rounded bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:ring focus:ring-blue-400"
        placeholder="Enter albums by spaces (for example: 1 2 3"
        type="text"
      />
      <button
        @click="handleSearch"
        :disabled="store.loading"
        class="px-5 py-2 rounded bg-blue-500 text-white font-semibold hover:bg-blue-600 disabled:bg-blue-300 flex items-center gap-2 transition-colors"
      >
        <span v-if="store.loading" class="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4"></span>
        Search
      </button>
      <button @click="toggleTheme" class="ml-2 px-4 py-2 rounded font-semibold transition-colors shadow flex items-center gap-2" :class="theme === 'dark' ? 'bg-amber-100 text-amber-900 hover:bg-amber-200' : 'bg-indigo-700 text-white hover:bg-indigo-800'">
        <span v-if="theme === 'dark'" class="w-4 h-4">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
          </svg>
        </span>
        <span v-else class="w-4 h-4">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path fill-rule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clip-rule="evenodd" />
          </svg>
        </span>
        {{ theme === 'dark' ? 'Light' : 'Dark' }}
      </button>
    </div>
    <PhotoTable
      :search="search"
      :sortKey="sortKey"
      :sortOrder="sortOrder"
      @sort="handleSort"
    />
    <div v-if="store.error" class="text-red-600 mt-4">Error: {{ store.error.message }}</div>
  </div>
</template>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  100% { transform: rotate(360deg); }
}
</style>
