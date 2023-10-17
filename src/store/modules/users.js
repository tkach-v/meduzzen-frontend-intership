import apiClient from "@/http/axios/apiClient";

const state = {
  usersList: [],
  totalUsersCount: 0,
  user: {}
};

const actions = {
  async fetchUsers({commit}, url) {
    try {
      const response = await apiClient.get(url);
      const users = response.data.results
      const totalUsersCount = response.data.count

      commit('setUsersList', {users, totalUsersCount})

      if (response.data.next) {
        await actions.fetchUsers({commit}, response.data.next);
      }
    } catch (error) {
      console.error('API Error:', error)
      const users = []
      const totalUsersCount = 0
      commit('setUsersList', {users, totalUsersCount})
    }
  },

  async fetchUserById({commit}, userId) {
    try {
      const response = await apiClient.get(`/api/users/${userId}/`);
      const user = response.data;

      commit('setUser', user)
    } catch (error) {
      console.error('API Error:', error)
      commit('setUser', {})
    }
  },
};

const mutations = {
  setUsersList(state, {users, totalUsersCount}) {
    state.usersList = state.usersList.concat(users)
    state.totalUsersCount = totalUsersCount
  },

  setUser(state, user) {
    state.user = user;
  },
};

export default {
  namespaced: true,
  state,
  actions,
  mutations,
};