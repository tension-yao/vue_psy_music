<template>
  <div class="scroll relative" ref="wrapper">
    <slot></slot>
  </div>
</template>

<script>
import BScroll from 'better-scroll'

export default {
  props: {
    // BScroll 的配置参数
    scrollParams: {
      type: Object,
      default: () => {}
    }
  },
  data () {
    return {
      scroll: null
    }
  },
  methods: {
    refresh () {
      // DOM 变化后都需要重新计算 better-scroll 的滚动高度
      this.scroll && this.scroll.refresh()
    },
    scrollTo (x, y, duration) {
      this.scroll && this.scroll.scrollTo(x, y, duration)
    },
    scrollToElement (dom, duration = 0) {
      // 跳转到目标元素
      this.scroll && this.scroll.scrollToElement(dom, duration)
    },
    finishPullUp () {
      this.scroll && this.scroll.finishPullUp()
    },
    enable () {
      this.scroll && this.scroll.enable()
    },
    _initBScroll () {
      if (!this.$refs.wrapper) {
        return
      }
      this.scroll = new BScroll(this.$refs.wrapper, this.scrollParams)

      // 查找是否存在 probeType 属性，如果有表示需要启用一个 scroll 监听事件
      if (Reflect.has(this.scrollParams, 'probeType')) {
        this.scroll.on('scroll', (pos) => {
          // 将 pos 派发出去
          this.$emit('scroll', pos)
        })
      }

      /**
       * 触底上拉动作
       */
      if (this.scrollParams.pullUpLoad) {
        this.scroll.on('pullingUp', () => {
          this.$emit('pullingUp')
        })
      }
    }
  },
  mounted () {
    this._initBScroll()
  }
}
</script>

<style lang="stylus">
.scroll
  height 100%
  z-index 10
</style>
