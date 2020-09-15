import Vue from 'vue'
import Vuex from 'vuex'
import state from './state'
import * as actions from './actions'
import * as getters from './getters'
import mutations from './mutations'

// 调试插件，会在控制台输出日志
import createLogger from 'vuex/dist/logger'

Vue.use(Vuex)

export default new Vuex.Store({
  state,
  getters,
  mutations,
  actions,
  /**
   * strict：true | false
   * 严格模式，跟踪状态变变是不是由 mutation 函数引起的，否则会抛出错误
   *
   * 我们可以让构建工具来处理 strict 的模式
   * development => 开发模式
   * production => 生产模式
   */
  strict: process.env.NODE_ENV !== 'production',

  /**
   * 挂载插件
   */
  plugins: [
    createLogger()
  ]
})
