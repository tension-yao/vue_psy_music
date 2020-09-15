<template>
  <div class="slider" ref="wrapper" v-on="{touchstart: clearIntervalStart, touchend: clearIntervalEnd}">
    <slot></slot>
    <div class="dots text-center">
      <span class="dots-item inline-block radius-8" :class="{active: currentIndex === index}" v-for="(item, index) in silderLenth" :key="index"></span>
    </div>
  </div>
</template>

<script>
import BScroll from 'better-scroll'

export default {
  props: {
    silderLenth: {
      type: Number,
      redirect: true
    }
  },
  data () {
    return {
      b: null,
      wrapper: null,
      children: null,
      currentIndex: 0,
      sliderParam: {
        scrollX: true,
        momentum: false, // 快速滑动时是否生成动画
        autoPlay: true, // 自动轮播
        snap: { // snap 只作用与 Slider 组件
          loop: true // 开启无缝轮播
        },
        interval: 4000,
        click: true
      }
    }
  },
  methods: {
    clearIntervalStart () {
      // 触摸时清除定时器
      clearInterval(this.timer)
    },
    clearIntervalEnd () {
      // 抬起时重新启动定时器
      this._autoPlay()
    },
    _setSliderWidth () {
      this.wrapper = this.$refs.wrapper
      this.children = this.$refs.wrapper.children[0].children

      let width = 0

      // 获取可视区宽度，需要根据轮播中的子元素设置轮播滚动的宽度
      const screenWidth = window.screen.width
      for (let i = 0; i < this.children.length; i++) {
        width += screenWidth
      }

      /**
       * 如果 loop 为 true 表示是无缝轮播，需要在额外增加二屏的宽度
       * 需要增加二屏的宽度是因为会在第一张图的前面克隆并增加最后一张图片，第一张图片会克隆并增加到最后一张图的后面
       */
      if (this.sliderParam.snap.loop) {
        width += 2 * screenWidth
      }

      this.wrapper.children[0].style.width = width + 'px'

      // 初始化 better-scroll 插件
      this._initSliderScroll()

      if (this.sliderParam.autoPlay) {
        // 自动轮播函数
        this._autoPlay()
      }
    },
    _initSliderScroll () {
      this.b = new BScroll(this.wrapper, this.sliderParam)

      // 绑定滚动结束事件，用于具体获取滚动到那个页面数
      this.b.on('scrollEnd', () => {
        // getCurrentPage() 其中 x 和 y 表示偏移的坐标值，pageX 和 pageY 表示横轴方向和纵轴方向的页面数。
        const pageIndex = this.b.getCurrentPage().pageX

        this.currentIndex = pageIndex
      })
    },
    _autoPlay () {
      this.timer = setInterval(() => {
        // 滚动到下一个页面
        this.b.next()
      }, this.sliderParam.interval)
    }
  },
  mounted () {
    this._setSliderWidth()
  },
  destroyed () {
    this.clearIntervalStart()
  }
}
</script>

<style lang="stylus">
@import "../assets/stylus/variable.styl"
.slider
  height 150px
  position relative
  .swiper
    height 100%
    .swiper-item
      height 100%
      .img
        width 100vw
        height 100%
  .dots
    position absolute
    left 0
    right 0
    bottom 6px
    .dots-item
      width 8px
      height 8px
      margin 0 4px
      background $back-whiteTranslucent
      &.active
        width 20px
        background $back-white
</style>
