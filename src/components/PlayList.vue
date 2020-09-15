<template>
  <transition name="show">
    <div class="play-list size-lord color-lord" @click.stop="hide()" v-show="showFlag">
      <div class="list-wrapper back-sio" @click.stop>
        <!-- 播放模式 -->
        <div class="header flex cross-center">
          <i class="icon color-highlight margin-right-10" :class="modeIcon" @click="changeMode()"></i>
          <span class="mode-text flex-1 color-whiteTranslucent">{{modeText}}</span>
          <span class="icon-clear text-center" @click="clearPlayList()"></span>
        </div>
        <!-- 播放列表 -->
        <div class="song-content">
          <scroll class="wrapper" :scrollParams="scrollParams" ref="wrapper">
            <div class="content">
              <ul class="song-list padding-left-20 padding-right-30" v-if="sequenceList.length" ref="songList">
                <li class="item-song flex cross-center" v-for="item in sequenceList" :key="item.songid" @click="playSelectSong(item.songmid)">
                  <div class="current color-highlight" :class="{'icon-play': currentSong.songmid === item.songmid}"></div>
                  <div class="name flex-1 text-overflow">{{item.songname}}</div>
                  <div class="icon color-highlight text-center size-sio" :class="[favoriteCls(item)]" @click.stop="favorites(item)"></div>
                  <div class="icon-delete color-highlight text-center size-sio" @click.stop="removeSelectSong(item.songmid)"></div>
                </li>
              </ul>
            </div>
          </scroll>
        </div>
        <!-- 添加歌曲到队列 -->
        <div class="add-song flex space-center size-sio">
          <div class="add">
            <i class="icon-add margin-right-5"></i>
            <span class="text" @click="addSongList()">添加歌曲到队列</span>
          </div>
        </div>
        <!-- 关闭播放列表 -->
        <div class="close text-center back-lord" @click="hide()">关闭</div>
      </div>
      <!-- 添加歌曲到列表页面 -->
      <add-song ref="addSong"></add-song>
    </div>
  </transition>
</template>

<script>
import { mapGetters, mapMutations, mapActions } from 'vuex'

import Scroll from '@/components/Scroll'
import AddSong from '@/components/AddSong'

import * as types from '@/store/mutations-types'
import { playMode } from '@/assets/js/player.config'
import { shuffle } from '@/assets/js/utils'

const itemSongHeight = 40

export default {
  props: {
    currentIndex: {
      type: Number
    }
  },
  data () {
    return {
      showFlag: false,
      scrollParams: {}
    }
  },
  methods: {
    hide () {
      this.showFlag = false
    },
    show () {
      this.showFlag = true
    },
    clearPlayList () {
      /**
       * 清空播放列表，并将正在播放的音乐暂停
       */
      this.setPlayList([])
      this.setPlaying(false)
    },
    changeMode () {
      const mode = (this.mode + 1) % 3
      let list = []
      if (mode === playMode.random) {
        // 随机播放
        list = shuffle(this.sequenceList)
      } else {
        // 顺序播放 / 循环播放
        list = this.sequenceList
      }
      this.setMode(mode)
      this._resetCurrentIndex(list)
      this.setPlayList(list)
    },
    playSelectSong (songmid) {
      /**
       * 播放选择的歌曲
       */
      const index = this.playList.findIndex(item => item.songmid === songmid)

      if (index !== -1) {
        this.setCurrentIndex(index)
      }
    },
    removeSelectSong (songmid) {
      /**
       * 删除选择的歌曲
       */
      this.removeSong(songmid)
    },
    addSongList () {
      /**
       * 添加歌曲到队列
       */
      this.$refs.addSong.show()
    },
    favorites (item) {
      this.isFavorite(item)
    },
    _resetCurrentIndex (list) {
      /**
       * 重置 currentIndex，因为切换模式会导致 playlist 列表改变并且还会改变当前播放的音乐
       *
       * 所以找到当前播放的音乐索引，并将 state 中的 currentIndex 重置为当前播放的音乐索引位置，即可解决切换模式会导致音乐变化的问题
       */
      const index = list.findIndex(item => {
        return item.songmid === this.currentSong.songmid
      })

      this.setCurrentIndex(index)
    },
    ...mapMutations({
      setPlayList: types.SET_PLAYLIST,
      setPlaying: types.SET_PLAYING,
      setMode: types.SET_MODE,
      setCurrentIndex: types.SET_CURRENT_INDEX
    }),
    ...mapActions([
      'removeSong',
      'isFavorite'
    ])
  },
  computed: {
    modeIcon () {
      const mode = this.mode
      return mode === playMode.sequence ? 'icon-sequence' : mode === playMode.loop ? 'icon-loop' : mode === playMode.random ? 'icon-random' : ''
    },
    modeText () {
      const mode = this.mode
      return mode === playMode.sequence ? '顺序播放' : mode === playMode.loop ? '循环播放' : mode === playMode.random ? '随机播放' : ''
    },
    favoriteCls () {
      return function (item) {
        const flag = this.favorite.some(some => some.songmid === item.songmid)

        return flag ? 'color-favorite icon-favorite' : 'icon-not-favorite'
      }
    },
    ...mapGetters([
      'mode',
      'playList',
      'sequenceList',
      'currentSong',
      'favorite'
    ])
  },
  watch: {
    sequenceList: {
      deep: true,
      handler () {
        this.$nextTick(() => {
          this.$refs.wrapper && this.$refs.wrapper.refresh()
        })
      }
    },
    showFlag () {
      this.$nextTick(() => {
        this.$refs.wrapper && this.$refs.wrapper.refresh()
      })
    },
    currentIndex () {
      /**
       * 每次更改时，都将查找当前播放的索引位置，并将当前播放歌曲置顶
       */
      this.$nextTick(() => {
        const index = this.sequenceList.findIndex(item => item.songmid === this.currentSong.songmid)

        this.$refs.wrapper && this.$refs.wrapper.scrollTo(0, itemSongHeight * -index, 300)
      })
    }
  },
  components: {
    Scroll,
    AddSong
  }
}
</script>

<style lang="stylus" scoped>
@import "../assets/stylus/variable.styl"

.play-list
  position fixed
  top 0
  left 0
  right 0
  bottom 0
  z-index 200
  background-color rgba(0, 0, 0, 0.3)
  .list-wrapper
    position absolute
    left 0
    right 0
    bottom 0
    .header
      padding 20px 30px 10px 20px
      .icon
        font-size 30px
      .icon-clear
        width 34px
        height 34px
        line-height 34px
    .song-content
      max-height 240px
      overflow hidden
      .wrapper
        height 240px !important
      .song-list
        .item-song
          height 40px
          .current
            width 20px
          .icon
          .icon-delete
            width 34px
            height 34px
            line-height 34px
    .add-song
      margin 20px auto 30px auto
      .add
        border 1px solid $color-whiteTranslucent
        padding 8px 16px
        border-radius 30px
    .close
      height 50px
      line-height 50px
      font-size 16px
.show-enter, .show-leave-to
  opacity 0
  .list-wrapper
    transform translate(0, 100%)
.show-enter-active, .show-leave-active
  transition all 200ms
  .list-wrapper
    transition all 200ms
.show-enter-to, .show-leave
  opacity 1
  .list-wrapper
    transform translate(0, 0)
</style>
