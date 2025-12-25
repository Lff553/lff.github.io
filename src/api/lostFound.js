import http from './http'

export const fetchLostItems = async (keyword) => {
  const response = await http.get('/items', {
    params: keyword ? { keyword } : undefined,
  })
  return response.data
}

export const createLostItem = async (payload) => {
  const response = await http.post('/items', payload)
  return response.data
}

export const updateLostItem = async (id, payload) => {
  const response = await http.put(`/items/${id}`, payload)
  return response.data
}

export const deleteLostItem = async (id) => {
  await http.delete(`/items/${id}`)
}

export const submitClaim = async (itemId, payload) => {
  const response = await http.post(`/items/${itemId}/claims`, payload)
  return response.data
}

export const fetchClaims = async () => {
  const response = await http.get('/claims')
  return response.data
}

export const updateClaimStatus = async (id, payload) => {
  const response = await http.put(`/claims/${id}/status`, payload)
  return response.data
}

// 获取我发布的物品
export const fetchMyItems = async () => {
  const response = await http.get('/items/my')
  return response.data
}

// 上传图片
export const uploadImage = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await http.post('/upload/image', formData)
  return response.data
}

