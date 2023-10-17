import {createStore} from 'vuex'
import testModule from "@/store/modules/test";
import auth from "@/store/modules/auth"
import users from "@/store/modules/users";

const store = createStore({
  modules: {
    test: testModule,
    auth,
    users
  }
})

export default store