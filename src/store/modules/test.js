const testModule = {
  namespaced: true,
  state: {
    testValue: 'test string 123'
  },

  getters: {
    getValue(state) {
      return state.testValue
    }
  },

  actions: {
    async setValueAsync({commit}, {value}) {
      setTimeout(() => {
        commit('setValue', {value})
      }, 1000)
    }
  },

  mutations: {
    setValue(state, {value}) {
      state.testValue = value
    }
  },
}

export default testModule