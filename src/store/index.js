import {createStore} from 'vuex'
import testModule from "@/store/modules/test";

const store = createStore({
  modules: {
    test: testModule
  }
})

export default store