import Vue from 'vue'
import Vuex from 'vuex'
import * as actions from './actions'
import * as getters from './getters'
import state from './state'
import mutations from './mutations'
// 打印之前的state和修改后的state
import createLogger from 'vuex/dist/logger'

Vue.use(Vuex)
// 调试工具
const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  actions,
  getters,
  state,
  mutations,
  strict: debug,// eg检测 state的修改是不是来源于mutation 否则会报警告  开启会有性能损耗
  plugins: debug ? [createLogger()] : []
})
