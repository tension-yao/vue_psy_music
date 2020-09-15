<template>
  <div class="music-list relative flex column">
    <div class="music-header" ref="headerTitle">
      <div class="relative">
        <div class="back text-center flex center" @click="onback()">
          <i class="icon-back color-highlight size-22"></i>
        </div>
        <h2 class="header-title size-max text-center">{{title}}</h2>
      </div>
    </div>
    <div class="cover" :style="{transform: 'scale('+ scaleRatio +')', backgroundImage: 'url('+ backImage +')'}" ref="cover">
      <!-- 播放全部按钮，必须有数据以及按钮的状态为真时才显示 -->
      <div class="play-all flex center size-sio color-highlight" @click="playAll()" v-show="detailData.length && playAllFlag">
        <i class="icon icon-play margin-right-6"></i>
        <div class="text">随机播放全部</div>
      </div>
      <!-- 覆盖在背景图上的蒙版 -->
      <div class="mask"></div>
    </div>
    <div class="song-list flex-1" ref="songList">
      <scroll :scrollParams="scrollParams" v-if="detailData.length" @scroll="scroll" ref="wrapper">
        <div class="song-content padding-top-20 padding-bottom-20 padding-left-30 padding-right-30" ref="content">
          <song v-for="(item, index) in detailData" :key="index" :item="item" :index="index" :ranking="ranking" @selectItem="selectItem"></song>
        </div>
      </scroll>
      <loading v-if="!detailData.length"></loading>
    </div>
    <div class="moveMask back-lord" :style="{transform: 'translateY('+ moveMaskY +'px)'}" ref="moveMask"></div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import Song from '@/components/Song'
import Scroll from '@/components/Scroll'
import Loading from '@/components/Loading'

import mixin from '@/assets/js/mixin'

export default {
  mixins: [mixin],
  props: {
    title: {
      type: String,
      redirect: true
    },
    backImage: {
      type: String,
      redirect: true
    },
    detailData: {
      type: Array,
      redirect: true
    },
    ranking: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      moveMaskY: 0,
      scaleRatio: 1,
      playAllFlag: true,
      scrollParams: {
        probeType: 3,
        click: true
      }
    }
  },
  methods: {
    setBottom (playList) {
      const bottom = playList.length ? '60px' : '0px'
      this.$refs.songList.style.bottom = bottom
      this.$refs.wrapper && this.$refs.wrapper.refresh()
    },
    onback () {
      // 返回上一级
      this.$router.back()
    },
    playAll () {
      // 随机播放全部
      this.randomPlayAll({
        list: this.detailData
      })
    },
    selectItem (item, index) {
      this.selectPlay({
        list: this.detailData,
        index
      })
    },
    scroll (pos) {
      const { y } = pos

      // y 大于 0 说明时向下拉的
      if (y > 0) {
        // 基准值为 1， 并且计算后的结果只能是 1+，计算公式：滚动值 / 图片高度
        this.scaleRatio = 1 + Math.abs(y / this.$refs.cover.offsetHeight)
      }

      /**
       * 歌曲列表容器的高度与滚动的 y 值相加，当滚动到设备顶部时正好与设备的高度一致，这时可以减去头部标题当滚动到一定距离，应用一些头部标题的样式
       */
      let scrollTop = this.$refs.songList.offsetHeight + Math.abs(y)

      if (this.playList.length) {
        scrollTop += 60
      }
      // 在距离顶部还有 headerTitle.offsetHeight 时，让 cover 封面层级确保在列表之上
      if (scrollTop > window.screen.height - this.$refs.headerTitle.offsetHeight) {
        this.$refs.cover.style.zIndex = 50
        this.$refs.cover.style.paddingTop = 0
        this.$refs.cover.style.height = '40px'
        this.playAllFlag = false
      } else if (scrollTop < window.screen.height) {
        // 恢复默认的样式
        this.$refs.cover.style.paddingTop = '70%'
        this.$refs.cover.style.height = '0'
        this.$refs.cover.style.zIndex = 30
        this.playAllFlag = true
      }

      // 让这个遮罩层与滚动的距离同步，能够覆盖掉 cover 封面
      this.moveMaskY = y
    },
    ...mapActions([
      'selectPlay',
      'randomPlayAll'
    ])
  },
  computed: {
    ...mapGetters([
      'singer',
      'playList'
    ])
  },
  components: {
    Song,
    Scroll,
    Loading
  },
  mounted () {
    const coverHeight = this.$refs.cover.offsetHeight
    this.$refs.songList.style.top = coverHeight + 'px'
    this.$refs.moveMask.style.top = coverHeight + 'px'
    this.moveMaskY = coverHeight
  }
}
</script>

<style lang="stylus">
@import "../assets/stylus/variable.styl"

.music-list
  height 100%
  .music-header
    line-height 40px
    position absolute
    top 0
    left 0
    right 0
    z-index 60
    .back
      width 40px
      height 40px
      position absolute
      top 0
      left 6px
  .cover
    position absolute
    top 0
    left 0
    right 0
    padding-top 70%
    background-size cover
    .play-all
      height 32px
      line-height 32px
      z-index 50
      border 1px solid $color-highlight
      padding 0 17px
      border-radius 32px
      box-sizing border-box
      position absolute
      left 50%
      bottom 20px
      transform translateX(-50%)
      .icon
        font-size 16px
    .mask
      position absolute
      top 0
      left 0
      right 0
      bottom 0
      background-color rgba(7, 17, 27, 0.4)
  .song-list
    position absolute
    top 0
    left 0
    right 0
    bottom 0
    box-sizing border-box
    z-index 45
  .moveMask
    height 100vh
    position absolute
    top 0
    left 0
    right 0
    z-index 40
</style>
