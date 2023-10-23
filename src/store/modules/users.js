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

      const { results, count, next } = response.data;

      commit('setUsersList', {users: results, totalUsersCount: count})

      if (next) {
        await actions.fetchUsers({commit}, next);
      }

    } catch (error) {
      console.error('API Error:', error)
      commit('setUsersList', { users: [], totalUsersCount: 0 })
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