import { boot } from 'quasar/wrappers';
import axios, { AxiosInstance } from 'axios';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
  }
}

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)

const api = axios.create({ baseURL: 'https://dummyapi.io/data/v1/',headers: {
  "app-id": '6271426859cca854c0603345'
} });
axios.defaults.headers.common = {
  "app-id": '6271426859cca854c0603345'
};
export default boot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios;
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api;
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
});

export async function getUsers() {
    try{
      const {data} = await api.get('/user');
      return [data]
    }catch(err){
      return[err]
    }
}
export async function deleteUser(id: any) {
  try{
    const data = api.delete('/user/' + id);
    return [data]
  }catch(err){
    return[err]
  }
}
export async function getUserDetail(id: any) {
  try{
    const data = await api.get('/user/' + id);
    return [data]
  }catch(err){
    return[err]
  }
}
export async function updateUser(id: any, userData: any) {
  try{
    const data = await api.put('/user/' + id, userData);
    return [data]
  }catch(err){
    return[err]
  }
}
export async function addUser(userData: any) {
  try{
    const data = await api.post('/user/create', userData);
    console.log(data);

    return [data]
  }catch(err){
    return[err]
  }
}

export { api };

