import axios from 'axios';

const API_URL = "http://localhost:3000";

const instance = axios.create({
  baseURL: API_URL,
});

export const login = (login) => {
  return instance.post(`${API_URL}/login`, {login})
}

export const getMessages = () => {
  return instance.get(`${API_URL}/messages`)
}

export const sendMessage = (message, login) => {
  return instance.post(`${API_URL}/sendMessage`, {
    message,
    login
  })
}