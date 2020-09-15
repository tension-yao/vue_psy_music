<template>
  <div class="recommend">

    <scroll v-if="listData.length || sliderData.length" ref="wrapper" :scrollParams="scrollParams">
      <div class="content flex column">
        <!-- 轮播 -->
        <!-- 小细节：这里使用 v-if 是因为网络请求是异步的，防止数据没有返回 better-scroll 组件就会率先执行完毕，否则轮播是没有效果的-->
        <!-- 通信一个 sliderLenth 根据数据个数创建 dots-item -->
        <slider :silderLenth="sliderData.length" v-if="sliderData.length">
          <div class="swiper flex">
            <div class="swiper-item no-shrink" v-for="item in sliderData" :key="item.id">
              <img :src="item.picUrl" class="img">
            </div>
          </div>
        </slider>

        <!-- 推荐列表 -->
        <div class="recommend-list relative flex column">
          <div class="list-title color-highlight size-lord text-center">热门歌单推荐</div>
          <div class="contents relative flex-1">
            <recommend-list v-for="item in listData" :key="item.dissid" :item="item" @selectSongList="selectSongList"></recommend-list>
            <!-- loading -->
            <loading v-show="!listData.length"></loading>
          </div>
        </div>
      </div>
    </scroll>
    <transition name="slider">
      <router-view></router-view>
    </transition>
  </div>
</template>

<script>
import { mapMutations } from 'vuex'

import Slider from '@/components/Slider'
import Scroll from '@/components/Scroll'
import RecommendList from '@/components/RecommendList'
import Loading from '@/components/Loading'

import { getRecommendSlider, getRecommendList } from '@/api/recommend'
import { ERR_OK } from '@/assets/js/statusCode'
import * as types from '@/store/mutations-types'
import mixin from '@/assets/js/mixin'

export default {
  /**
   * 混入 mixin，可以混入多个
   */
  mixins: [mixin],
  data () {
    return {
      sliderData: [],
      listData: [],
      scrollParams: {}
    }
  },
  methods: {
    setBottom (playList) {
      const bottom = playList.length ? '60px' : '0px'
      this.$el.style.bottom = bottom
      this.$refs.wrapper && this.$refs.wrapper.refresh()
    },
    selectSongList (item) {
      this.setSongList(item)
      this.$router.push({
        path: `/recommend/${item.dissid}`
      })
    },
    _initListData (data) {
      // 初始化列表数据，拿出需要的数据
      const arr = data.map(item => {
        const { imgurl, dissname, dissid, creator: { name } } = item

        return {
          name,
          imgurl,
          dissname,
          dissid
        }
      })

      return arr
    },
    _getRecommendSlider () {
      getRecommendSlider().then(res => {
        if (res.code === ERR_OK) {
          const { slider } = res.data
          this.sliderData = slider
        }
      })
    },
    _getRecommendList () {
      getRecommendList().then(res => {
        if (res.data.code === ERR_OK) {
          this.listData = this._initListData(res.data.data.list)
        }
      })
    },
    ...mapMutations({
      setSongList: types.SET_SONGLIST
    })
  },
  components: {
    Slider,
    Scroll,
    RecommendList,
    Loading
  },
  created () {
    this._getRecommendSlider()
    this._getRecommendList()
  }
}
</script>

<style lang="stylus">
.recommend
  // height 100%
  position absolute
  top 0
  left 0
  right 0
  bottom 0
  .content
    min-height 100%
  .recommend-list
    flex 1
    .list-title
      line-height 65px
</style>
