import axios from 'axios'

const API = axios.create({
  baseURL: "https://server-p3wv.onrender.com/api/v1/todos",
})

export default API
