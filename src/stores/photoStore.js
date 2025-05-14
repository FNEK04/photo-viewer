import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const usePhotoStore = defineStore('photo', () => {
  const photos = ref([])
  const loading = ref(false)
  const error = ref(null)
  const albumFilter = ref([])

  const filteredPhotos = computed(() => {
    if (!albumFilter.value.length) return photos.value
    return photos.value.filter(photo => albumFilter.value.includes(photo.albumId))
  })

  async function fetchPhotos(albumIds = []) {
    loading.value = true
    error.value = null
    let url = 'https://jsonplaceholder.typicode.com/photos'
    if (albumIds.length) {
      // Создаем строку с параметрами запроса для фильтрации по нескольким альбомам
      url += '?' + albumIds.map(id => `albumId=${id}`).join('&')
    }
    try {
      const res = await fetch(url)
      const data = await res.json()
      photos.value = data
    } catch (e) {
      error.value = e
    } finally {
      loading.value = false
    }
  }

  function setAlbumFilter(ids) {
    albumFilter.value = ids
    localStorage.setItem('albumFilter', JSON.stringify(ids))
  }

  function loadAlbumFilter() {
    try {
      const saved = localStorage.getItem('albumFilter')
      if (saved) albumFilter.value = JSON.parse(saved)
    } catch {}
  }

  return { photos, filteredPhotos, loading, error, albumFilter, fetchPhotos, setAlbumFilter, loadAlbumFilter }
})
