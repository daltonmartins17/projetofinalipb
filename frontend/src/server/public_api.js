import axios from 'axios'

const public_api = axios.create({
    baseURL: 'http://localhost:5000/guest'
})
export default public_api