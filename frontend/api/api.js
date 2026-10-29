import axios from "axios";

const API = axios.create({
  baseURL: "http://192.168.10.8:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

export default API;
