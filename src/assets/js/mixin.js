import { mapGetters } from 'vuex'

/**
 * mixin 提供了一种非常灵活的方式，用来实现 vue 组件中的可复用功能
 */
const mixin = {
  methods: {
    setBottom () {
      /**
       * mixin 中定义的方法没有组件中的权重高，也就是说如果组件中定义了同名方法，就不将 mixin 中同名的方法进行混入了
       */
      throw new Error('Not found setBottom  method')
    }
  },
  computed: {
    ...mapGetters([
      'playList'
    ])
  },
  watch: {
    playList () {
      this.setBottom(this.playList)
    }
  },
  mounted () {
    this.setBottom(this.playList)
  },
  /**
   * activated 是 <keep-alive/> 组件的钩子函数，缓存的组件切换回来会执行
   */
  activated () {
    this.setBottom(this.playList)
  }
}

export default mixin
