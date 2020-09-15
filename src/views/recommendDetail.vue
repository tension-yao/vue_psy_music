<template>
  <div class="singer-detail back-lord">
    <!-- 歌单列表组件 -->
    <music-list :title="title" :backImage="backImage" :detailData="detailData"></music-list>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import MusicList from '@/components/MusicList'

import { getSongList } from '@/api/recommend'
import { getSongURL } from '@/api/song'

import { ERR_OK } from '@/assets/js/statusCode'
import { baseSinger } from '@/assets/js/utils'

export default {
  data () {
    return {
      detailData: []
    }
  },
  methods: {
    _getSongList () {
      const dissid = this.songList.dissid

      // 如果客户端在歌单详情页面进行了刷新 vuex 保存的歌手数据就会被初始化，所以加载不到数据，那么我们就让他返回的歌手列表页
      if (!dissid) {
        this.$router.push({ path: '/recommend' })
        return
      }

      getSongList(dissid).then(res => {
        if (res.data.code === ERR_OK) {
          const data = this._initSongListData(res.data.cdlist[0].songlist)
          this._filterSongListData(data, (res) => {
            this.detailData = res
          })
        }
      })
    },
    _initSongListData (data) {
      /**
       * 初始化数据，原数据太臃肿
       */
      const arr = data.map(item => {
        return {
          albummid: item.album.mid,
          songmid: item.mid,
          songname: item.name,
          singer: baseSinger(item.album.name, item.singer),
          songid: item.id
        }
      })

      return arr
    },
    _filterSongListData (data, cb) {
      /**
       * 集合所有的 songmid，发起请求获取对应歌曲的资源定配地址,
       * 还有一个问题，在获取的资源定配地址中有的歌曲没有定配地址，可能是 vip 才能听的，所以我们需要过滤掉这些不能播放没有播放地址的歌曲
       */
      const newData = []

      const songmidArr = data.map(item => item.songmid)

      getSongURL(songmidArr).then(res => {
        if (res.data.code === ERR_OK) {
          /**
           * midurlinfo => 歌手 songmid 对应的音频资源定配地址，其中的 purl 是音频资源定配地址，有的为空就代表我们获取不到这个音频资源定配地址，那我们就跳过他，不要这个数据了
           *
           * sip => 是音频资源定配地址的域名，sip[n] + midurlinfo[n].purl，才是一个真正的音频播放地址
           */
          const { midurlinfo, sip } = res.data.req_0.data

          data.forEach(item => {
            midurlinfo.forEach(items => {
              if (item.songmid === items.songmid && items.purl !== '') {
                newData.push({
                  ...item,
                  purl: sip[0] + items.purl
                })
              }
            })
          })
        }

        // 通过回调带回过滤后的数据
        cb && cb(newData)
      })
    }
  },
  computed: {
    title () {
      return this.songList.dissname
    },
    backImage () {
      return this.songList.imgurl
    },
    ...mapGetters([
      'songList'
    ])
  },
  components: {
    MusicList
  },
  created () {
    this._getSongList()
  }
}
</script>

<style lang="stylus">
.singer-detail
  position fixed
  top 0
  left 0
  right 0
  bottom 0
  z-index 10
</style>
