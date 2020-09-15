<template>
  <div class="singer">
    <!-- 歌手列表 -->
    <singer-list :singerData="singerData" v-if="singerData.length" @selectSinger="selectSinger" ref="wrapper"></singer-list>

    <!-- 路由出口 -->
    <transition name="slider">
      <router-view></router-view>
    </transition>

    <loading v-if="!singerData.length"></loading>
  </div>
</template>

<script>
import { mapMutations } from 'vuex'

import * as types from '@/store/mutations-types'

import SingerList from '@/components/SingerList'
import Loading from '@/components/Loading'

import { getSingerList } from '@/api/singer'

import { ERR_OK } from '@/assets/js/statusCode'
import { baseImageURL } from '@/assets/js/utils'
import mixin from '@/assets/js/mixin'

export default {
  mixins: [mixin],
  data () {
    return {
      singerData: []
    }
  },
  methods: {
    setBottom (playList) {
      const bottom = playList.length ? '60px' : '0px'
      this.$el.style.bottom = bottom
      this.$refs.wrapper && this.$refs.wrapper.refresh()
    },
    selectSinger (items) {
      this.$router.push({
        path: `/singer/${items.singer_mid}`
      })

      // 使用 vuex 保存歌手信息
      this.setSinger(items)
    },
    _getSingerList () {
      getSingerList().then(res => {
        if (res.data.code === ERR_OK) {
          this.singerData = this._initSingerData(res.data.data.list)
        }
      })
    },
    _initSingerData (data) {
      const list = []
      const hot = {
        items: [],
        title: '热'
      }

      /**
       * 初始化 list 数组数据结构
       * [
       *   {
       *     items: [],
       *     title: 'A'
       *   }
       *   ...
       * ]
       */
      for (let i = 65; i < 91; i++) {
        list.push({
          items: [],
          title: String.fromCharCode(i)
        })

        // 向 hot 添加前 10 条数据，用来当作热门歌手
        if (hot.items.length < 10) {
          const temp = data[i - 65]
          hot.items.push({
            singer_mid: temp.Fsinger_mid,
            singer_name: temp.Fsinger_name,
            singer_cover: baseImageURL(temp.Fsinger_mid, 0)
          })
        }
      }

      // 根据数据中的 Findex 文案与 list 匹配并归纳
      data.forEach(item => {
        list.forEach(list => {
          if (item.Findex === list.title) {
            list.items.push({
              singer_mid: item.Fsinger_mid,
              singer_name: item.Fsinger_name,
              singer_cover: baseImageURL(item.Fsinger_mid, 0)
            })
          }
        })
      })

      // 数组合并，hot 应该始终在最前并且只返回包含成员的
      return [hot].concat(list).filter(item => item.items.length)

      /**
       * 说一下最终数据为什么不使用对象，因为对象的属性顺序是不可控的，我们不清楚顺序是不是像下面这个结果
       * {
       *   hot: [...],
       *   A: [...],
       *   ...
       *   Z: [...]
       * }
       */
    },
    ...mapMutations({
      setSinger: types.SET_SINGER
    })
  },
  computed: {
    anchorTitle () {
      // 返回 singerData 中的 title 属性，作用于锚点列表
      return this.singerData.map(item => item.title)
    }
  },
  components: {
    SingerList,
    Loading
  },
  created () {
    this._getSingerList()
  }
}
</script>

<style lang="stylus">
.singer
  // height 100%
  overflow hidden
  position absolute
  top 0
  left 0
  right 0
  bottom 0
</style>
