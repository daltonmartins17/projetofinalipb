import axios from 'axios'

const private_api = axios.create({
    baseURL: 'http://localhost:5000/',
})
export default private_api