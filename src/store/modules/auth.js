import AuthService from "@/services/auth.service";

const user = JSON.parse(localStorage.getItem('user'));
const initialState = user ? {user} : null;


const auth = {
  namespaced: true,
  state: initialState,
  actions: {
    login({commit}, user) {
      return AuthService.login(user).then(
        user => {
          commit('updateUser', user);
          return Promise.resolve(user);
        },
        error => {
          commit('updateUser', null);
          return Promise.reject(error);
        }
      );
    },
    logout({commit}) {
      AuthService.logout();
      commit('updateUser', null);
    },
    register({commit}, user) {
      return AuthService.register(user).then(
        response => {
          commit('updateUser', null);
          return Promise.resolve(response.data);
        },
        error => {
          commit('updateUser', null);
          return Promise.reject(error);
        }
      );
    },
    refreshToken({ commit }, accessToken) {
      commit('refreshToken', accessToken);
    }
  },
  mutations: {
    updateUser(state, user) {
      state.user = user;
    },
    refreshToken(state, accessToken) {
      state.user = { ...state.user, accessToken: accessToken };
    }
  }
};

export default auth