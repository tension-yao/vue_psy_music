<template>
  <div class="ranking">
    <scroll :scrollParams="scrollParams" v-if="topListData.length" ref="wrapper">
      <ul class="list">
        <li class="item-list flex" v-for="item in topListData" :key="item.id" @click="selectItem(item)">
          <div class="picUrl">
            <img v-lazy="item.picUrl" width="100%" height="100%">
          </div>
          <ol class="rank-list flex column space-center padding-left-20 padding-right-20 size-sio color-lord back-sio flex-1">
            <li class="item-rank text-overflow" v-for="(songList, index) in item.songList" :key="index">
              <span>{{++index}}</span>
              <span>{{songList.songname +'-'+ songList.singername}}</span>
            </li>
          </ol>
        </li>
      </ul>
    </scroll>

    <transition name="slider">
      <router-view></router-view>
    </transition>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'

import Scroll from '@/components/Scroll'

import { getTopList } from '@/api/ranking'
import mixin from '@/assets/js/mixin'
import { ERR_OK } from '@/assets/js/statusCode'

import * as types from '@/store/mutations-types'

export default {
  mixins: [mixin],
  data () {
    return {
      scrollParams: {
        click: true
      },
      topListData: []
    }
  },
  methods: {
    setBottom () {
      const bottom = this.playList.length ? '60px' : '0px'
      this.$el.style.bottom = bottom

      this.$refs.wrapper && this.$refs.wrapper.refresh()
    },
    selectItem (item) {
      this.$router.push({
        path: `/ranking/${item.id}`
      })

      this.setRanking(item)
    },
    _getTopList () {
      getTopList().then(res => {
        if (res.data.code === ERR_OK) {
          const data = this._initTopListData(res.data.data.topList)

          this.topListData = data
        }
      })
    },
    _initTopListData (data) {
      /**
       * 初始化数据
       */
      const newData = data.map(item => {
        const { id, picUrl, songList, topTitle } = item
        return {
          id,
          picUrl,
          songList,
          topTitle
        }
      })

      return newData
    },
    ...mapMutations({
      setRanking: types.SET_RANKING
    })
  },
  computed: {
    ...mapGetters([
      'playList'
    ])
  },
  components: {
    Scroll
  },
  created () {
    this._getTopList()
  }
}
</script>

<style lang="stylus">
.ranking
  padding 20px 20px
  position absolute
  top 0
  left 0
  right 0
  bottom 0
  .list
    .item-list
      padding 10px 0
      &:first-child
        padding 0 0 10px 0
      &:last-child
        padding 10px 0 0 0
      .picUrl
        width 100px
        height 100px
      .rank-list
        overflow hidden
        .item-rank
          height 26px
          line-height 26px
</style>
