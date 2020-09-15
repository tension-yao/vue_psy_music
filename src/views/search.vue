<template>
  <div class="search flex column">
    <!-- 搜索框 -->
    <search-box ref="searchBox" @searchQuery="searchQuery"></search-box>

    <scroll class="wrapper flex-1 padding-left-20 padding-right-20" :scrollParams="scrollParams" ref="wrapper">
      <div class="content">
        <!-- 热门搜索 -->
        <div class="hot-search color-lord size-lord margin-bottom-20">
          <div class="title margin-bottom-20">热门搜索</div>
          <ul class="hot-content">
            <li class="item-hot inline-block radius-8 back-sio" v-for="item in hotSearch" :key="item.n" @click="addQuery(item.k)">{{item.k}}</li>
          </ul>
        </div>

        <!-- 搜索历史 -->
        <div class="search-history color-lord" v-show="searchHistory.length">
          <div class="search-header flex space-between cross-center size-lord">
            <span class="title">搜索历史</span>
            <span class="icon-clear text-center" @click="removeAllSearchHistory()"></span>
          </div>
          <ul class="search-list size-lord">
            <li class="item flex space-between cross-center" v-for="(item, index) in searchHistory" :key="index">
              <span class="name flex-1" @click="addQuery(item)">{{item}}</span>
              <span class="icon-delete size-lord text-center" @click="removeItemSearchHistory(item)"></span>
            </li>
          </ul>
        </div>
      </div>

      <!-- 搜索结果 -->
      <search-result :querys="querys" @selectSinger="selectSinger" @selectSong="selectSong" @searchHistory="$searchHistory"></search-result>
    </scroll>

    <transition name="slider">
      <router-view></router-view>
    </transition>
  </div>
</template>

<script>
import { mapMutations, mapActions, mapGetters } from 'vuex'

import * as types from '@/store/mutations-types'

import mixin from '@/assets/js/mixin'

import SearchBox from '@/components/SearchBox'
import Scroll from '@/components/Scroll'
import SearchResult from '@/components/SearchResult'

import { getHotSearch } from '@/api/search'
import { ERR_OK } from '@/assets/js/statusCode'

export default {
  mixins: [mixin],
  data () {
    return {
      hotSearch: [],
      scrollParams: {},
      querys: ''
    }
  },
  methods: {
    setBottom (playList) {
      const bottom = playList.length ? '60px' : '0px'
      this.$el.style.bottom = bottom
      this.$refs.wrapper && this.$refs.wrapper.refresh()
    },
    addQuery (query) {
      /**
       * 搜索选定的文案
       */
      this.$refs.searchBox.setQuery(query)
    },
    selectSinger (singer) {
      this.$router.push({
        path: `/search/${singer.singer_mid}`
      })

      // 保存歌手信息
      this.setSinger(singer)
    },
    searchQuery (query) {
      this.querys = query
    },
    selectSong (song) {
      /**
       * 与先前的播放列表与当前单个播放的歌曲合并到一起
       */

      const list = this.sequenceList.slice()

      /**
       * 检查当前播放的歌曲是否在基础列表中存在，如果存在就删除在添加到列表顶端，以确保每次的播放的单个歌曲在列表的顶端
       */
      const index = this.sequenceList.findIndex(item => {
        return item.songmid === song.songmid
      })

      if (index !== -1) {
        list.splice(index, 1)
      }

      list.unshift(song)

      this.playItem({
        list,
        index: 0
      })
    },
    $searchHistory (query) {
      this.setSearchHistory(query)
    },
    removeAllSearchHistory () {
      this.removeAllHistory()
    },
    removeItemSearchHistory (item) {
      this.removeItemHistory(item)
    },
    _getHotSearch () {
      getHotSearch().then(res => {
        if (res.data.code === ERR_OK) {
          /**
           * 拿到热门搜索的前 10 条数据
           */
          this.hotSearch = res.data.data.hotkey.slice(0, 10)
        }
      })
    },
    ...mapActions([
      'playItem',
      'setSearchHistory',
      'removeItemHistory',
      'removeAllHistory'
    ]),
    ...mapMutations({
      setSinger: types.SET_SINGER
    })
  },
  computed: {
    ...mapGetters([
      'playList',
      'searchHistory',
      'sequenceList'
    ])
  },
  watch: {
    searchHistory: {
      deep: true,
      handler () {
        this.$refs.wrapper && this.$refs.wrapper.refresh()
      }
    }
  },
  components: {
    SearchBox,
    Scroll,
    SearchResult
  },
  created () {
    this._getHotSearch()
  }
}
</script>

<style lang="stylus">
.search
  position absolute
  top 0
  left 0
  right 0
  bottom 0
  overflow hidden
  .wrapper
    overflow hidden
    .content
      .hot-search
        .hot-content
          .item-hot
            padding 5px 10px
            margin 5px 10px
      .search-history
        .search-header
          .icon-clear
            width 34px
            height 34px
            line-height 34px
        .search-list
          font-size 16px
          .item
            height 40px
            .icon-delete
              width 34px
              height 34px
              line-height 34px
</style>
