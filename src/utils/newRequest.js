//src/utils/newRequest.js
import axios from "axios";

const newRequest = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
});

export default newRequest;