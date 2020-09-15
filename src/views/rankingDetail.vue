<template>
  <div class="ranking-detail back-lord">
    <!-- 歌单列表组件 -->
    <music-list :title="title" :backImage="backImage" :ranking="true" :detailData="detailData"></music-list>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import MusicList from '@/components/MusicList'

import { getTopListDetail } from '@/api/ranking'
import { getSongURL } from '@/api/song'

import { ERR_OK } from '@/assets/js/statusCode'
import { baseSinger, baseImageURL } from '@/assets/js/utils'

export default {
  data () {
    return {
      detailData: []
    }
  },
  methods: {
    _getTopListDetail () {
      const id = this.ranking.id
      // 如果客户端在歌单详情页面进行了刷新 vuex 保存的歌手数据就会被初始化，所以加载不到数据，那么我们就让他返回的歌手列表页
      if (!id) {
        this.$router.push({ path: '/ranking' })
        return
      }

      getTopListDetail(id).then(res => {
        if (res.data.code === ERR_OK) {
          const data = this._initDetailData(res.data.songlist)
          this._filterDetailData(data, res => {
            this.detailData = res
          })
        }
      })
    },
    _initDetailData (data) {
      // 原数据太过于臃肿，所以我们只拿出我们需要的数据
      const arr = data.map(item => {
        const { albummid, albumname, songmid, songname, singer, songid } = item.data
        return {
          albummid,
          songmid,
          songname,
          singer: baseSinger(albumname, singer),
          songid
        }
      })
      return arr
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
              if (item.songmid === items.songmid && items.purl !== '') {
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
  computed: {
    title () {
      return this.ranking.topTitle
    },
    backImage () {
      if (this.detailData.length) {
        return baseImageURL(this.detailData[0].albummid, 2)
      }
      return ''
    },
    ...mapGetters([
      'ranking'
    ])
  },
  components: {
    MusicList
  },
  created () {
    this._getTopListDetail()
  }
}
</script>

<style lang="stylus">
.ranking-detail
  position fixed
  top 0
  left 0
  right 0
  bottom 0
  z-index 10
</style>
