import {createStore} from 'vuex'
import testModule from "@/store/modules/test";
import auth from "@/store/modules/auth"

const store = createStore({
  modules: {
    test: testModule,
    auth
  }
})

export default store