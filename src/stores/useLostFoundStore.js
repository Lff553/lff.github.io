import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  createLostItem,
  deleteLostItem,
  fetchClaims,
  fetchLostItems,
  fetchMyItems,
  submitClaim,
  updateClaimStatus,
  updateLostItem,
} from '@/api/lostFound'

export const useLostFoundStore = defineStore('lost-found', () => {
  const items = ref([])
  const myItems = ref([])
  const claims = ref([])
  const loading = ref(false)
  const error = ref(null)

  const itemCount = computed(() => items.value.length)
  const pendingClaims = computed(() => claims.value.filter((claim) => claim.status === 'PENDING'))

  const isEmpty = computed(() => !loading.value && items.value.length === 0)

  async function loadItems(keyword) {
    loading.value = true
    error.value = null
    try {
      const list = await fetchLostItems(keyword)
      items.value = list
      return list
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function loadClaims() {
    try {
      const list = await fetchClaims()
      claims.value = list
      return list
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  async function loadMyItems() {
    loading.value = true
    error.value = null
    try {
      const list = await fetchMyItems()
      myItems.value = list
      return list
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createItem(payload) {
    try {
      const created = await createLostItem(payload)
      items.value = [created, ...items.value]
      return created
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  async function editItem(id, payload) {
    try {
      const updated = await updateLostItem(id, payload)
      items.value = items.value.map((item) => (item.id === id ? { ...updated } : item))
      return updated
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  async function removeItem(id) {
    try {
      await deleteLostItem(id)
      items.value = items.value.filter((item) => item.id !== id)
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  async function createClaim(itemId, payload) {
    try {
      const created = await submitClaim(itemId, payload)
      syncClaim(created)
      return created
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  async function changeClaimStatus(claimId, status) {
    try {
      const updated = await updateClaimStatus(claimId, { status })
      syncClaim(updated)
      return updated
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  function syncClaim(claimPayload) {
    if (!claimPayload) return

    const index = claims.value.findIndex((claim) => claim.id === claimPayload.id)
    if (index > -1) {
      claims.value.splice(index, 1, claimPayload)
    } else {
      claims.value = [claimPayload, ...claims.value]
    }

    if (claimPayload.lostItemId) {
      const itemIndex = items.value.findIndex((item) => item.id === claimPayload.lostItemId)
      if (itemIndex > -1) {
        const item = { ...items.value[itemIndex] }
        item.claims = item.claims ? [...item.claims] : []
        const claimInItemIndex = item.claims.findIndex((claim) => claim.id === claimPayload.id)
        if (claimInItemIndex > -1) {
          item.claims.splice(claimInItemIndex, 1, claimPayload)
        } else {
          item.claims = [claimPayload, ...item.claims]
        }

        items.value.splice(itemIndex, 1, item)
      }
    }
  }

  function resetError() {
    error.value = null
  }

  return {
    items,
    myItems,
    claims,
    loading,
    error,
    itemCount,
    pendingClaims,
    isEmpty,
    loadItems,
    loadMyItems,
    loadClaims,
    createItem,
    editItem,
    removeItem,
    createClaim,
    changeClaimStatus,
    resetError,
  }
})

export default useLostFoundStore

