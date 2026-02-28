import axios from 'axios'

const API = axios.create({
  baseURL: "https://server-p3wv.onrender.com/api/v1",
})

export default API
