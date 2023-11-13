import {createStore} from 'vuex'
import auth from "@/store/modules/auth"
import users from "@/store/modules/users";

const store = createStore({
  modules: {
    auth,
    users
  }
})

export default store