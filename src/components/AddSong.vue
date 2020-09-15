<template>
  <transition name="slider">
    <div class="add-song back-lord" v-show="isShow" @click.stop>

      <!-- 标题 -->
      <div class="header flex center">
        <h2 class="title color-white">添加歌曲到列表</h2>
        <div class="close icon-close text-center" @click="hide()"></div>
      </div>

      <!-- 搜索框 -->
      <search-box @searchQuery="searchQuery" ref="searchBox"></search-box>

      <!-- 选项卡 -->
      <ul class="tab flex center text-center radius-8">
        <li class="item-tab flex-1" :class="{'color-white back-sio': currentIndex === 0}" @click="tabSwitch(0)">最近播放</li>
        <li class="item-tab flex-1" :class="{'color-white back-sio': currentIndex === 1}" @click="tabSwitch(1)">搜索历史</li>
      </ul>

      <!-- 播放历史 -->
      <div class="play-list padding-left-30 padding-right-30 padding-top-20 padding-bottom-20">
        <scroll :scrollParams="scrollParams1" ref="wrapper1" v-if ="currentIndex === 0">
          <div class="content color-white">
            <div class="song-list" v-if="playHistory.length" v-show="isShow">
              <song v-for="(item, index) in playHistory" :key="index" :index="index" :item="item" @selectItem="selectItem"></song>
            </div>
          </div>
        </scroll>
      </div>

      <!-- 搜索历史 -->
      <div class="history-list padding-left-30 padding-right-30 padding-top-20 padding-bottom-20">
        <scroll :scrollParams="scrollParams2" ref="wrapper2" v-if="currentIndex === 1">
          <div class="content color-white">
            <ul class="song-list color-lord" v-if="searchHistory.length" v-show="isShow">
              <li class="item flex space-between cross-center" v-for="(item, index) in searchHistory" :key="index">
                <span class="name flex-1" @click="addQuery(item)">{{item}}</span>
                <span class="icon-delete size-lord text-center" @click="removeItemSearchHistory(item)"></span>
              </li>
            </ul>
          </div>
        </scroll>
      </div>

      <!-- 搜索结果 -->
      <div class="result" v-show="querys.length">
        <search-result :querys="querys" :catZhida="0" @selectSong="selectSong" @searchHistory="$searchHistory"></search-result>
      </div>

      <!-- 顶部提示 一首歌曲已经添加到播放列表 -->
      <transition name="tip">
        <div class="tip flex center color-white" v-show="isShowTip">
          <i class="icon-ok color-highlight margin-right-5"></i>
          <div class="text">一首歌曲已经添加到播放列表</div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import SearchBox from '@/components/SearchBox'
import Scroll from '@/components/Scroll'
import Song from '@/components/Song'
import SearchResult from '@/components/SearchResult'

export default {
  data () {
    return {
      isShow: false,
      isShowTip: false,
      scrollParams1: {},
      scrollParams2: {},
      currentIndex: 0,
      querys: ''
    }
  },
  methods: {
    show () {
      this.isShow = true
    },
    hide () {
      this.isShow = false
    },
    tabSwitch (index) {
      this.currentIndex = index
    },
    searchQuery (query) {
      this.querys = query
    },
    selectSong (song) {
      this.showTip(song.songmid)

      this.addSongList(song)
    },
    selectItem (item, index) {
      this.showTip(item.songmid)

      this.addSongList(item)
    },
    $searchHistory (query) {
      this.setSearchHistory(query)
    },
    addQuery (query) {
      this.$refs.searchBox.setQuery(query)
    },
    removeItemSearchHistory (item) {
      this.removeItemHistory(item)
    },
    showTip (songmid) {
      /**
       * 如果添加当前正在播放的歌曲，那么就不需要显示文案了
       */
      const flag = this.currentSong.songmid === songmid

      if (flag) {
        return
      }

      this.isShowTip = true

      clearTimeout(this.tipTimer)

      this.tipTimer = setTimeout(() => {
        clearTimeout(this.tipTimer)

        this.isShowTip = false
      }, 1000)
    },
    ...mapActions([
      'addSongList',
      'setSearchHistory',
      'removeItemHistory'
    ])
  },
  computed: {
    ...mapGetters([
      'playHistory',
      'searchHistory',
      'playList',
      'currentSong'
    ])
  },
  watch: {
    playHistory () {
      this.$nextTick(() => {
        this.$refs.wrapper1 && this.$refs.wrapper1.refresh()
      })
    },
    searchHistory () {
      this.$nextTick(() => {
        this.$refs.wrapper2 && this.$refs.wrapper2.refresh()
      })
    }
  },
  components: {
    SearchBox,
    Scroll,
    Song,
    SearchResult
  }
}
</script>

<style lang="stylus" scoped>
@import '../assets/stylus/variable.styl'

.add-song
  position fixed
  top 0
  left 0
  right 0
  bottom 0
  z-index 210
  .header
    height 44px
    position relative
    .title
      font-size 18px
    .close
      width 44px
      height 100%
      line-height 44px
      position absolute
      top 0
      right 8px
      font-size 20px
      color $color-highlight
  .tab
    width 240px
    height 32px
    margin 0 auto
    overflow hidden
    border 1px solid $back-sio
    box-sizing border-box
    .item-tab
      padding 8px
  .play-list, .history-list
    position absolute
    top 176px
    left 0
    right 0
    bottom 0
    overflow hidden
  .history-list
    font-size 16px
    .item
      height 40px
      .icon-delete
        width 34px
        height 34px
        line-height 34px
  .result
    position absolute
    top 134px
    left 0
    right 0
    bottom 0
    z-index 10
    overflow hidden
  .tip
    width 100%
    padding 18px 0
    position fixed
    top 0
    left 0
    background-color #666666
.tip-enter, .tip-leave-to
  transform translate(0, -100%)
.tip-enter-active, .tip-leave-active
  transition all 300ms
.tip-enter-to, .tip-leave
  transform translate(0, 0)
</style>
