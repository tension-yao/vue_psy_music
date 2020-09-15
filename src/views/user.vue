<template>
  <transition name="slider">
    <div class="user back-lord">
      <!-- 标题 -->
      <div class="user-header flex center margin-top-4 margin-bottom-25">
        <div class="icon-back text-center color-highlight" @click="back()"></div>
        <ul class="user-tab flex size-lord">
          <li class="item-tab flex-1 text-center" :class="{'back-sio': currentIndex === 0}" @click="tabSwitch(0)">我喜欢的</li>
          <li class="item-tab flex-1 text-center" :class="{'back-sio': currentIndex === 1}" @click="tabSwitch(1)">最近听的</li>
        </ul>
      </div>

      <!-- 随机播放全部 -->
      <div class="play-all flex center color-lord size-sio" @click="playAll()">
        <i class="icon icon-play margin-right-6"></i>
        <div class="text">随机播放全部</div>
      </div>

      <!-- 我喜欢的 -->
      <div class="list" ref="list">
        <scroll :scrollParams="scrollParams" ref="wrapper1" v-if="favorite.length" v-show="currentIndex === 0">
          <div class="content">
            <ul class="song-list">
              <li class="item-song" v-for="(item, index) in favorite" :key="index">
                <song :item="item" :index="index" @selectItem="selectItem"></song>
              </li>
            </ul>
          </div>
        </scroll>
        <scroll :scrollParams="scrollParams" ref="wrapper2" v-if="playHistory.length" v-show="currentIndex === 1">
          <div class="content">
            <ul class="song-list" v-show="currentIndex === 1">
              <li class="item-song" v-for="(item, index) in playHistory" :key="index">
                <song :item="item" :index="index" @selectItem="selectItem"></song>
              </li>
            </ul>
          </div>
        </scroll>
      </div>
    </div>
  </transition>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import mixin from '@/assets/js/mixin'

import Scroll from '@/components/Scroll'
import Song from '@/components/Song'

export default {
  mixins: [mixin],
  data () {
    return {
      scrollParams: {
        click: true
      },
      currentIndex: 0
    }
  },
  methods: {
    setBottom (playList) {
      const bottom = playList.length ? '60px' : '0px'
      this.$refs.list.style.bottom = bottom
      this.$refs.wrapper1 && this.$refs.wrapper1.refresh()
      this.$refs.wrapper2 && this.$refs.wrapper2.refresh()
    },
    back () {
      this.$router.back()
    },
    tabSwitch (index) {
      this.currentIndex = index
    },
    playAll () {
      switch (this.currentIndex) {
        case 0:
          this.randomPlayAll({
            list: this.favorite
          })
          break
        case 1:
          this.randomPlayAll({
            list: this.playHistory
          })
          break
      }
    },
    selectItem (item) {
      /**
       * 与先前的播放列表与当前单个播放的歌曲合并到一起
       */

      const list = this.sequenceList.slice()

      /**
       * 检查当前播放的歌曲是否在基础列表中存在，如果存在就删除在添加到列表顶端，以确保每次的播放的单个歌曲在列表的顶端
       */
      const index = this.sequenceList.findIndex(some => {
        return some.songmid === item.songmid
      })

      if (index !== -1) {
        list.splice(index, 1)
      }

      list.unshift(item)

      this.playItem({
        list,
        index: 0
      })
    },
    ...mapActions([
      'playItem',
      'randomPlayAll'
    ])
  },
  computed: {
    ...mapGetters([
      'favorite',
      'playHistory',
      'playList',
      'sequenceList'
    ])
  },
  watch: {
    favorite () {
      this.$nextTick(() => {
        this.$refs.wrapper1 && this.$refs.wrapper1.refresh()
      })
    },
    playHistory () {
      this.$nextTick(() => {
        this.$refs.wrapper1 && this.$refs.wrapper1.refresh()
      })
    }
  },
  components: {
    Scroll,
    Song
  }
}
</script>

<style lang="stylus">
@import '../assets/stylus/variable.styl'

.user
  position fixed
  top 0
  left 0
  right 0
  bottom 0
  z-index 100
  .user-header
    height 44px
    position relative
    .icon-back
      width 44px
      height 100%
      line-height 44px
      font-size 22px
      position absolute
      top 0
      left 0
    .user-tab
      width 240px
      margin 0 auto
      border-radius 5px
      border 1px solid $back-sio
      .item-tab
        padding 8px
  .play-all
    width 135px
    height 32px
    margin 0 auto
    line-height 32px
    border 1px solid $back-sio
    padding 0 17px
    border-radius 32px
    box-sizing border-box
    .icon
      font-size 16px
  .list
    position absolute
    top 105px
    left 0
    right 0
    bottom 0
    overflow hidden
    .song-list
      padding 20px 30px
</style>
