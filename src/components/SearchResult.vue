<template>
  <div class="search-result back-lord color-lord size-lord" v-if="this.querys.length">
    <scroll :scrollParams="scrollParams" @pullingUp="pullingUp" ref="wrapper" v-if="singer || songData.length">
      <ul class="result-wrapper padding-left-30 padding-right-30">
        <!-- 歌手片段 -->
        <li class="item-result flex margin-bottom-20" @click="selectSinger()" v-if="singer">
          <div class="icon-mine padding-right-20"></div>
          <div class="name">{{singer.singer_name}}</div>
        </li>

        <!-- 歌曲片段 -->
        <li class="item-result flex padding-bottom-20" @click="selectSong(item)" v-for="(item, index) in songData" :key="index">
          <div class="icon-music padding-right-20"></div>
          <div class="name text-overflow">{{item.singer}}</div>
        </li>

        <!-- loading -->
        <li class="item-result flex padding-bottom-20 flex center" v-show="!disableMore">
          <img src="../assets/imgs/loading.gif" class="img margin-bottom-10" weidth="20" height="20">
        </li>
      </ul>
    </scroll>

    <!-- 搜索不到结果时的文案 -->
    <div class="no-result-wrapper flex column center" v-show="!(singer || songData.length)">
      <div class="no-result-icon"></div>
      <div class="no-result-text margin-top-30">抱歉，暂无搜索结果</div>
    </div>
  </div>
</template>

<script>
import mixin from '@/assets/js/mixin'

import { ERR_OK } from '@/assets/js/statusCode'
import { getSearchResult } from '@/api/search'
import { getSongURL } from '@/api/song'
import { baseSinger2 } from '@/assets/js/utils'

import Scroll from '@/components/Scroll'

export default {
  mixins: [mixin],
  props: {
    querys: {
      type: String,
      default: ''
    },
    catZhida: {
      type: Number,
      default: 1
    }
  },
  data () {
    return {
      scrollParams: {
        pullUpLoad: true
      },
      p: 1,
      songData: [],
      singer: false,
      disableMore: false,
      requestCount: 0
    }
  },
  methods: {
    setBottom () {
      this.$refs.wrapper && this.$refs.wrapper.refresh()
    },
    selectSinger () {
      this.$emit('selectSinger', this.singer)
    },
    selectSong (song) {
      this.$emit('selectSong', song)

      // 存储搜索历史
      this.$emit('searchHistory', this.querys)
    },
    pullingUp () {
      /**
       * 上拉加载更多歌曲，该事件由 scroll 组件派发
       */
      this._getSearchResult(this.querys, this.p)
    },
    _checkMore (data) {
      /**
       * 用于检测是否还禁用上拉加载数据
       * 数据：
       *  curpage => 歌曲起始页数
       *  curnum => 拿到的数据数量
       *  totalnum => 表示的是搜索内容的所有数量
       * 如果 curpage * curnum > totalnum 说明加载的数据已经超出 totalnum 的总值了，就没有必要无限的上拉加载
       */

      if (data.song.curnum * data.song.curpage > data.song.totalnum) {
        this.disableMore = true
      }
    },
    _getSearchResult (query, p) {
      if (this.disableMore) {
        return
      }

      getSearchResult(query, p, this.catZhida).then(res => {
        if (res.data.code === ERR_OK) {
          const data = this._initSongData(res.data.data.song.list)

          this._filterDetailData(data, res => {
            this.songData = this.songData.concat(res)
          })

          this.singer = this._initSingerData(res.data.data.zhida) || false

          this._checkMore(res.data.data)

          this.p = res.data.data.song.curpage + 1
        }
      })
    },
    _initSongData (song) {
      /**
       * 初始化歌曲数据
       */
      const data = song.map(item => {
        const { albummid, singer, songid, songmid, songname } = item
        return {
          albummid,
          singer: baseSinger2(songname, singer),
          songid,
          songmid,
          songname
        }
      })
      return data
    },
    _initSingerData (zhida) {
      /**
       * 初始化歌手数据，用于展示在搜索结果的第一条目
       */
      if (zhida.type === 2) {
        const { singermid, singername } = zhida
        return {
          singer_mid: singermid,
          singer_name: singername
        }
      }
    },
    _filterDetailData (data, cb) {
      /**
       * 集合所有的 songmid，发起请求获取对应歌曲的资源定配地址,
       * 还有一个问题，在获取的资源定配地址中有的歌曲没有定配地址，可能是 vip 才能听的，所以我们需要过滤掉这些不能播放没有播放地址的歌曲
       */
      const newData = []

      // 获取歌手所有的 songmid
      const songmidArr = data.map(item => item.songmid)

      getSongURL(songmidArr).then(res => {
        if (res.data.code === ERR_OK) {
          /**
           * midurlinfo => 歌手 songmid 对应的音频资源定配地址，其中的 purl 是音频资源定配地址，有的为空就代表我们获取不到这个音频资源定配地址，那我们就跳过他，不要这个数据了
           *
           * sip => 是音频资源定配地址的域名，sip[n] + midurlinfo[n].purl，才是一个真正的音频播放地址
           */
          const { midurlinfo, sip } = res.data.req_0.data

          data.forEach((item, index) => {
            midurlinfo.forEach((items, indexs) => {
              if (item.songmid === items.songmid && items.purl !== '' && item.albummid !== '') {
                newData.push({
                  ...item,
                  purl: sip[0] + items.purl
                })
              }
            })
          })

          // 通过回调带回过滤后的数据
          cb && cb(newData)
        }
      })
    }
  },
  watch: {
    songData: {
      deep: true,
      handler (newData) {
        /**
         * 如果第一次拿到的数据条目不足 20 条，那么就需要重新发起请求，直到数据够 20 条
         */
        if (this.songData.length < 20) {
          /**
           * 如果自动搜索同一个文案返回的是空数据，就让 requestCount 自增，当 requestCount 大于 5，就放弃自动搜索这个文案
           * 搜索下一个文案时将 requestCount 恢复为默认值，在进行自动搜索。当然自动搜索只在 songData.length 不足 20条目时工作
           */
          if (!newData.length) {
            this.requestCount++
          }
          if (this.requestCount < 5) {
            this._getSearchResult(this.querys, this.p)
          }
        }

        this.$nextTick(() => {
          // 数据发生改变意味着结构也进行了改变需要重新计算 scroll 的滚动距离
          this.$refs.wrapper && this.$refs.wrapper.refresh()

          this.$refs.wrapper && this.$refs.wrapper.finishPullUp()
        })
      }
    },
    querys (newQuery) {
      if (newQuery.length) {
        /**
         * 定义计时器实现节流效果，防止极限搜索操作
         */
        clearTimeout(this.timer)

        this.timer = setTimeout(() => {
          /**
           * 每次搜索内容时都要将数据恢复到默认值
           */
          this.songData.length = 0
          this.p = 1
          this.requestCount = 0

          this._getSearchResult(this.querys, this.p)
        }, 200)
      }
    }
  },
  components: {
    Scroll
  }
}
</script>

<style lang="stylus">
.search-result
  position absolute
  top 0
  left 0
  right 0
  bottom 0
  .no-result-wrapper
    position absolute
    top 0
    left 0
    right 0
    bottom 0
    .no-result-icon
      width 86px
      height 90px
      background-image url(../assets/imgs/no-result@2x.png)
      background-size 100% 100%
      background-repeat no-repeat
</style>
