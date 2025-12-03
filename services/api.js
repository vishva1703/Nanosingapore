import axios from "axios";

const api = axios.create({
  baseURL: "https://api.corangelab.com/nutrition-api/",
});

api.interceptors.request.use(async (config) => {
  if (global.authToken) {
    config.headers["x-auth-token"] = global.authToken;
  }
  return config;
});

export default api;
