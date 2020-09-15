<template>
  <div class="player" v-show="playList.length">
    <!-- 定义出场动画 -->
    <transition name="normal" @enter="enter" @after-enter="afterEnter" @leave="leave" @after-leave="afterLeave">
      <!-- 标准的播放器 -->
      <div class="normal-player back-lord" v-show="fullScreen">
        <!-- 头部标题 -->
        <div class="normal-header relative text-center">
          <div class="back color-highlight flex center" @click="back()">
            <i class="icon-back"></i>
          </div>
          <div class="song-name size-max text-overflow">{{currentSong.songname}}</div>
          <!-- 歌手名称 -->
          <div class="singer-name size-lord margin-bottom-25 text-overflow">{{currentSong.singer | baseSingerName}}</div>
        </div>

        <div class="middle flex" v-on="{touchstart: middleStart, touchmove: middleMove, touchend: middleEnd}">
          <!-- cover 封面 -->
          <div class="cover flex column cross-center no-shrink" ref="cover">
            <!-- cd 图片，歌曲播放时需要旋转 -->
            <div class="cd" ref="cd">
              <div class="cd-rotate radius-round" :class="cdRotate">
                <img :src="currentSong.albummid | baseImageURL" width="100%" height="100%">
              </div>
            </div>
            <!-- 当前歌词 -->
            <div class="lyric margin-top-30 size-lord color-whiteTranslucent text-center" ref="coverLyric"></div>
          </div>

          <!-- 歌词 -->
          <div class="lyric no-shrink size-lord" ref="lyric">
            <scroll :scrollParams="scrollParams" ref="wrapper">
              <div class="content text-center color-whiteTranslucent" ref="content">
                <p class="item-lyric" :class="{'color-white': lineNum === index}" v-for="(item, index) in currentLyric.lines" :key="item.time" ref="itemLyric">{{item.txt}}</p>
              </div>
            </scroll>
          </div>
        </div>
        <!-- 控制台 -->
        <div class="bottom padding-bottom-40">
          <div class="dots flex space-center">
            <div class="dots-item margin-left-5 margin-right-5" :class="{active: dotsIndex === 0}"></div>
            <div class="dots-item margin-left-5 margin-right-5" :class="{active: dotsIndex === 1}"></div>
          </div>
          <div class="progress-bar size-sio flex cross-center space-between">
            <div class="current text-left">{{currentTime}}</div>
            <div class="progress relative back-blockTranslucent flex-1 margin-left-7 margin-right-7" @click.stop.prevent="progressClick($event)" ref="progress">
              <div class="inner back-highlight" ref="progressInner"></div>
              <div class="bar radius-round back-highlight" v-on.stop.prevent="{touchstart: progressStart, touchmove: progressMove, touchend: progressEnd}"  ref="progressBar"></div>
            </div>
            <div class="duration text-right">{{duration}}</div>
          </div>
          <div class="control flex space-between cross-center color-highlight">
            <div class="mode">
              <i :class="modeIcon" @click="changeMode()"></i>
            </div>
            <div class="prev">
              <i class="icon-prev" :class="disableCls" @click="prev()"></i>
            </div>
            <div class="play">
              <i :class="[playIcon, disableCls]" @click="togglePlay()"></i>
            </div>
            <div class="next">
              <i class="icon-next" :class="disableCls" @click="next()"></i>
            </div>
            <div class="favorite">
              <i class="icon-favorite" :class="{'color-favorite': favoriteCls}" @click="favorites()"></i>
            </div>
          </div>
        </div>
        <!-- 背景图 -->
        <div class="background">
          <img :src="currentSong.albummid | baseImageURL" width="100%" height="100%">
        </div>
      </div>
    </transition>
    <transition name="mini">
      <!-- 迷你播放器 -->
      <div class="mini-player back-sio size-lord flex cross-center" v-show="!fullScreen" @click="open()" ref="mini">
        <div class="cover radius-round margin-left-20 margin-right-10" :class="cdRotate" ref="miniCover">
          <img :src="currentSong.albummid | baseImageURL" width="100%" height="100%">
        </div>
        <div class="song-info flex-1">
          <div class="song-name text-overflow padding-right-10">{{currentSong.songname}}</div>
          <div class="singer-name size-sio color-lord text-overflow padding-right-30">{{currentSong.singer | baseSingerName}}</div>
        </div>
        <div class="control flex color-highlight">
          <div class="play-mini padding-left-10 padding-right-10">
            <i :class="miniIcon" @click.stop="togglePlay()"></i>
          </div>
          <div class="play-list padding-left-10 padding-right-10" @click.stop="showPlayList()">
            <i class="icon-playlist"></i>
          </div>
        </div>
      </div>
    </transition>

    <!-- 播放列表  -->
    <play-list ref="playList" :currentIndex="currentIndex"></play-list>

    <!-- canplay => 浏览器能够开始播放指定的音频或视频 -->
    <audio :src="currentSong.purl" ref="audio" @canplay="canplay()" @error="error($event)" @ended="ended()" @timeupdate="timeupdate()"></audio>
  </div>
</template>

<script>
import createKeyframeAnimation from 'create-keyframe-animation'
import { Base64 } from 'js-base64'
import Lyric from 'lyric-parser'
import { mapGetters, mapMutations, mapActions } from 'vuex'

import Scroll from '@/components/Scroll'
import PlayList from '@/components/PlayList'

import * as types from '@/store/mutations-types'
import { getLyric, getSongURL } from '@/api/song'
import { playMode } from '@/assets/js/player.config'
import { shuffle } from '@/assets/js/utils'
import { ERR_OK, MEDIA_ERR_SRC_NOT_SUPPORTED } from '@/assets/js/statusCode'

export default {
  data () {
    return {
      audioReadyState: false,
      currentTime: '00:00',
      duration: '00:00',
      currentProgress: 0,
      touch: {},
      middleTouch: {},
      currentMiddleTarget: 'cover',
      dotsIndex: 0,
      lineNum: 0,
      songid: null,
      currentLyric: {},
      scrollParams: {}
    }
  },
  methods: {
    back () {
      this.setFullScreen(false)
    },
    open () {
      // 作用于迷你播放器上的事件，用于切换到标准的播放器
      this.setFullScreen(true)
    },
    changeMode () {
      const mode = (this.mode + 1) % 3
      let list = null
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
    togglePlay () {
      // 控制音乐的暂停或播放
      this.setPlaying(!this.playing)
    },
    next () {
      // 开关状态
      if (!this.audioReadyState) return

      // 切换歌曲时，将 playing 状态变更为 false
      this.setPlaying(false)

      /**
       * 如果歌曲列表只有一首歌曲，在进行切换歌曲的时候直接进行重新播放即可
       */
      if (this.playList.length === 1 || this.mode === playMode.loop) {
        this.loop()
      } else {
        let index = this.currentIndex + 1

        if (index >= this.playList.length) {
          index = 0
        }
        this.setCurrentIndex(index)
      }

      this.audioReadyState = false
    },
    prev () {
      if (!this.audioReadyState) return

      this.setPlaying(false)

      if (this.playList.length === 1 || this.mode === playMode.loop) {
        this.loop()
      } else {
        let index = this.currentIndex - 1

        if (index <= -1) {
          index = this.playList.length - 1
        }
        this.setCurrentIndex(index)
      }

      this.audioReadyState = false
    },
    canplay () {
      const audio = this.$refs.audio

      audio.play()

      this.setPlaying(true)

      /**
       * 部署一个开关状态，防止用户快速切换歌曲，允许切换的条件是当前的歌曲准备就绪才能够进行切换，防止还没有准备完毕就直接 play() 方法，这样会报错的
       */
      this.audioReadyState = true

      // 歌曲总时长
      this.duration = this._calcTime(audio.duration)

      // 存储播放历史
      this.playHistory(this.currentSong)
    },
    error (e) {
      /**
       * 部署 audio 的 error 事件，是因为某些情况可能会发生错误，或者说是用户的极限操作导致 canplay 事件无法执行就会导致 audioReadyState 状态无法变更为 true，也就不能进行切换歌曲了
       * 所以就算发生了错误也要将 audioReadyState 状态变更为 true，使用户可以进行切换歌曲
       */
      this.audioReadyState = true

      /**
       * 对于播放地址失效的应对措施，需要重新去获取播放地址
       */
      if (e.target.error.code === MEDIA_ERR_SRC_NOT_SUPPORTED) {
        this.mediaErrorCode = MEDIA_ERR_SRC_NOT_SUPPORTED
        getSongURL([this.currentSong.songmid]).then(res => {
          if (res.data.code === ERR_OK) {
            const { midurlinfo, sip } = res.data.req_0.data

            /**
             * 对失效的歌曲数据进行深度拷贝，防止修改时会影响到源数据
             */
            const currentSong = JSON.parse(JSON.stringify(this.currentSong))

            /**
             * 新的播放地址替换掉旧的播放地址（失效的）
             */
            currentSong.purl = sip[0] + midurlinfo[0].purl

            // 更新歌曲数据
            this.upDateSong(currentSong)
          }
        })
      }
    },
    ended () {
      if (this.mode === playMode.loop) {
        this.loop()
      } else {
        this.next()
      }
    },
    timeupdate () {
      const audio = this.$refs.audio

      // 解决一个报错，因为歌曲可能还没有加载完毕，直接获取 currentTiem 会报错...
      if (!audio) return

      // 当前播放时间 / 总时间会得到一个 0 - 1 之间的数
      this.currentProgress = audio.currentTime / audio.duration

      // 播放时间
      this.currentTime = this._calcTime(audio.currentTime)
    },
    loop () {
      /**
       * currentTime 是可读可写的属性，赋值 0 会将歌曲重新播放
       */
      this.$refs.audio.currentTime = 0

      /**
       * 循环播放需要重新初始化 currentLyric 的播放进度
       */
      this.lyricSeek(0)
    },
    progressClick (e) {
      // 检索该事件是在谁身上冒泡的，如果该元素类名包含 bar，就不进行进度的改变
      if (e.target.classList.contains('bar')) {
        return
      }
      // e.offsetX 相对于元素自身的坐标
      this._offset(e.offsetX)
      this._progressUpdateCurrentTime()
    },
    progressStart (e) {
      // 开关状态，防止未点击直接进入 progressMove 事件
      this.touch.swtich = true

      // 记录触摸的 x 坐标
      this.touch.startX = e.touches[0].pageX

      // 每触摸都要获取 progressInner 的实时宽度
      this.touch.left = this.$refs.progressInner.offsetWidth
    },
    progressMove (e) {
      if (!this.touch.swtich) {
        return false
      }

      /**
       * 移动中的 x 坐标 - 触摸的 x 坐标，就能得到一个滑动的距离
       *
       * 可以将求出的这个差值与 progressInner 的宽度相加，并应用到 progressInner 的宽度，就是我我们滑动的距离
       */
      const diffX = e.touches[0].pageX - this.touch.startX

      /**
       * 使用 Math 对象的方法是将计算的结果控制在进度条总长度的可控范围
       * Math.min(x, y) 返回 x，y 中的最小数
       * Math.max(x, y) 返回 x，y 中的最大数
       */
      const offsetWidth = Math.min(this.$refs.progress.offsetWidth - this.$refs.progressBar.offsetWidth, Math.max(0, this.touch.left + diffX))

      this._offset(offsetWidth)

      /**
       * 在进度条更新时候也要更新 currentLyric 的进度，seek 接受的是毫秒数
       */
      const progressWidth = this.$refs.progress.offsetWidth - this.$refs.progressBar.offsetWidth
      const innerWidth = this.$refs.progressInner.offsetWidth / progressWidth
      this.lyricSeek((this.$refs.audio.duration * innerWidth) * 1000)
    },
    progressEnd () {
      this.touch.swtich = false

      // 拖拽结束，更新歌曲进度
      this._progressUpdateCurrentTime()
    },
    _calcTime (date) {
      // 计算歌曲播放时间以及总时间
      const newDate = date | 0

      // 分
      const minute = newDate / 60 | 0

      // 秒
      const second = newDate % 60 | 0

      return `${minute < 10 ? '0' + minute : minute}:${second < 10 ? '0' + second : second}`
    },
    middleStart (e) {
      this.middleTouch.startX = e.touches[0].clientX
      this.middleTouch.startY = e.touches[0].clientY
    },
    middleMove (e) {
      const diffX = this.middleTouch.startX - e.touches[0].clientX
      const diffY = this.middleTouch.startY - e.touches[0].clientY

      // 如果 diifY 大于 diffX，说明是向上下滑的，上下滑就不进行 lyric 的移动
      if (Math.abs(diffY) > Math.abs(diffX)) {
        return
      }

      const left = this.currentMiddleTarget === 'cover' ? 0 : -window.innerWidth

      const offset = Math.min(0, Math.max(-window.innerWidth, left + -diffX))

      const percent = Math.abs(offset / window.innerWidth)

      const delatX = Math.min(0, Math.max(-window.innerWidth, left - diffX))

      this.middleTouch.percent = percent

      this.$refs.cover.style.opacity = -percent + 1

      this.$refs.lyric.style.transform = `translate3d(${delatX}px, 0, 0)`
    },
    middleEnd () {
      let offset
      let opacity
      let timer = null
      if (this.currentMiddleTarget === 'cover') {
        if (this.middleTouch.percent > 0.2) {
          offset = -window.innerWidth
          opacity = 0
          this.currentMiddleTarget = 'lyric'
          this.dotsIndex = 1
        } else {
          offset = 0
          opacity = 1
        }
      } else if (this.currentMiddleTarget === 'lyric') {
        if (this.middleTouch.percent < 0.8) {
          offset = 0
          opacity = 1
          this.currentMiddleTarget = 'cover'
          this.dotsIndex = 0
        } else {
          offset = -window.innerWidth
          opacity = 0
        }
      }
      this.$refs.cover.style.transitionDuration = '300ms'
      this.$refs.lyric.style.transitionDuration = '300ms'

      this.$refs.cover.style.opacity = opacity
      this.$refs.lyric.style.transform = `translate3d(${offset}px, 0, 0)`

      delete this.middleTouch.percent

      timer = setTimeout(() => {
        clearTimeout(timer)
        this.$refs.cover.style.transitionDuration = '0ms'
        this.$refs.lyric.style.transitionDuration = '0ms'
      }, 300)
    },
    favorites () {
      this.isFavorite(this.currentSong)
    },
    enter (el, done) {
      const { x, y } = this._getPosition()
      // 使用第三方插件创建帧动画，使用第三方插件的目的是因为可以通过 javaScript 创建动态的 CSS 帧动画
      createKeyframeAnimation.registerAnimation({
        // 动画名称
        name: 'move',
        // 动画动作
        animation: {
          0: {
            transform: `translate3d(${x}px, ${y}px, 0) scale(0)`
          },
          60: {
            transform: 'translate3d(0, 0, 0) scale(1.1)'
          },
          100: {
            transform: 'translate3d(0, 0, 0) scale(1)'
          }
        },
        // 动画配置
        presets: {
          duration: 500,
          easing: 'linear'
        }
      })

      // 运行动画，并传入作用的 DOM 元素，执行 runAnimation 方法时，会创建 style 标签中写入上面配置的动画动作，并向 head 标签追加
      createKeyframeAnimation.runAnimation(this.$refs.cd, 'move', done)
    },
    afterEnter () {
      // unregisterAnimation 用于删除指定动画，即 runAnimation 方法创建的 style 标签
      createKeyframeAnimation.unregisterAnimation('move')
      this.$refs.cd.style.animation = ''
    },
    leave (el, done) {
      const { x, y } = this._getPosition()
      // 返回时我们需要将发送动画的元素恢复到默认值，否则下次动画会发生意想不到的效果
      this.$refs.cd.style.transition = 'all 0.5s'
      this.$refs.cd.style.transform = `translate3d(${x}px, ${y}px, 0) scale(0)`
      this.$refs.cd.addEventListener('transitionend', done)
    },
    afterLeave () {
      // 恢复默认
      this.$refs.cd.style.transition = ''
      this.$refs.cd.style.transform = ''
    },
    lyricTogglePlay () {
      this.currentLyric.togglePlay && this.currentLyric.togglePlay()
    },
    lyricStop () {
      this.currentLyric.stop && this.currentLyric.stop()
    },
    lyricSeek (timer) {
      this.currentLyric.seek && this.currentLyric.seek(timer)
    },
    showPlayList () {
      // 显示播放列表
      this.$refs.playList.show()
    },
    hidePlayList () {
      // 关闭播放列表
      this.$refs.playList.hide()
    },
    _getPosition () {
      // 计算出 noraml 播放器 cover 封面在 mini 播放器中封面运动的轨迹
      const width = window.screen.width
      const height = window.screen.height
      const x = -(width / 2 - this.$refs.miniCover.offsetLeft)
      const y = (height - this.$refs.mini.offsetHeight) - (this.$refs.mini.offsetHeight / 2)
      return {
        x,
        y
      }
    },
    _offset (offset) {
      this.$refs.progressInner.style.width = `${offset}px`
      this.$refs.progressBar.style.transform = `translate3d(${offset}px, 0, 0)`
    },
    _progressUpdateCurrentTime () {
      const progressWidth = this.$refs.progress.offsetWidth - this.$refs.progressBar.offsetWidth
      const innerWidth = this.$refs.progressInner.offsetWidth / progressWidth

      this.$refs.audio.currentTime = this.$refs.audio.duration * innerWidth

      /**
       * 在进度条更新时候也要更新 currentLyric 的进度，seek 接受的是毫秒数
       */
      this.lyricSeek((this.$refs.audio.duration * innerWidth) * 1000)
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
    _decodeLyric (lyric) {
      return Base64.decode(lyric)
    },
    _lyricHandler ({ txt, lineNum }) {
      /**
       * lineNum > 5 时在进行歌词的滚动
       */
      if (lineNum > 5) {
        const lineDom = this.$refs.itemLyric[lineNum - 5]
        this.$refs.wrapper.scrollToElement(lineDom, 1000)
      } else {
        this.$refs.wrapper.scrollTo(0, 0, 1000)
      }

      this.lineNum = lineNum
      this.$refs.coverLyric.innerText = txt
    },
    _getLyric () {
      if (this.currentSong.songid === this.$refs.audio.songid) {
        return
      }
      /**
       * 清除旧的歌词对象，防止多个歌词播放器同时存在会影响歌词滚动的状态
       */
      this.currentLyric = {}

      getLyric(this.currentSong.songid).then(res => {
        if (res.data.code === ERR_OK) {
          const decodeLyric = this._decodeLyric(res.data.lyric)
          const lyricObj = new Lyric(decodeLyric, this._lyricHandler)
          if (!lyricObj.lines.length) {
            this.$refs.coverLyric.innerText = '此歌曲为没有填词的纯音乐，请您欣赏'
            this.$refs.content.innerHTML = '<div class="item-lyric" style="padding-top: 50%;">此歌曲为没有填词的纯音乐，请您欣赏</div>'
          }
          this.currentLyric = lyricObj
        }
      })
    },
    ...mapMutations({
      setFullScreen: types.SET_FULL_SCREEN,
      setPlaying: types.SET_PLAYING,
      setCurrentIndex: types.SET_CURRENT_INDEX,
      setMode: types.SET_MODE,
      setPlayList: types.SET_PLAYLIST
    }),
    ...mapActions([
      'playHistory',
      'isFavorite',
      'upDateSong'
    ])
  },
  computed: {
    cdRotate () {
      return this.playing ? 'play' : 'pause'
    },
    playIcon () {
      return this.playing ? 'icon-pause' : 'icon-play'
    },
    miniIcon () {
      return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
    },
    disableCls () {
      return this.audioReadyState ? '' : 'disbale'
    },
    favoriteCls () {
      return this.favorite.some(item => item.songmid === this.currentSong.songmid)
    },
    modeIcon () {
      const mode = this.mode
      return mode === playMode.sequence ? 'icon-sequence' : mode === playMode.loop ? 'icon-loop' : mode === playMode.random ? 'icon-random' : ''
    },
    ...mapGetters([
      'fullScreen',
      'playList',
      'currentSong',
      'playing',
      'currentIndex',
      'mode',
      'sequenceList',
      'favorite'
    ])
  },
  watch: {
    playing (newPlaying) {
      // watch 并非只能监听 data 或者 props 数据，同样也能监听 计算属性
      const audio = this.$refs.audio

      // 使用 $nextTick 是因为音频还没有加载完成，直接进行操作会报错
      this.$nextTick(() => {
        if (newPlaying) {
          audio.play()
          this.lyricTogglePlay()
        } else {
          audio.pause()
          this.lyricTogglePlay()
        }
      })
    },
    currentProgress (newVal) {
      // 只有在不拖拽 progress 的时候才能自动更新进度
      if (!this.touch.swtich) {
        // 进度条宽度 - 小圆点宽度
        const progressWidth = this.$refs.progress.offsetWidth - this.$refs.progressBar.offsetWidth

        // 0 - 1 之间的小数 * 计算好的进度条宽度就是当前进度的比例
        const offset = newVal * progressWidth

        this._offset(offset)
      }
    },
    currentSong (newSong, oldSong) {
      /**
       * 监听 getters 中的 currentSong，判断二者的 songid 是否一样，如果一样表示是一首歌曲，就不发起重复请求
       */
      if (newSong.songid === oldSong.songid) {
        return
      }

      /**
       * lyric-parser 内部是通过计时器实现的，如果在切换歌曲后，会导计时器冲突歌词跳动就不正确了，所以需要先将旧的计时器清理掉
       */
      this.lyricStop()

      this._getLyric()
    },
    currentLyric () {
      /**
       * 如果音频加载失败就没有必要更新歌词滚动的进度，因为会使歌词进行滚动，而音乐无法播放
       */
      if (this.mediaErrorCode === MEDIA_ERR_SRC_NOT_SUPPORTED) {
        return
      }
      this.lyricSeek(this.$refs.audio.currentTime)
    }
  },
  filters: {
    baseImageURL (mid) {
      return mid ? `https://y.gtimg.cn/music/photo_new/T002R300x300M000${mid}.jpg?max_age=2592000` : ''
    },
    baseSingerName (singerName) {
      return singerName ? singerName.split('·')[0] : ''
    }
  },
  components: {
    Scroll,
    PlayList
  },
  mounted () {
    this.$refs.cover.addEventListener('transitionend', function () {
      this.style.transitionDuration = '0ms'
    })
    this.$refs.lyric.addEventListener('transitionend', function () {
      this.style.transitionDuration = '0ms'
    })
  }
}
</script>

<style lang="stylus">
@import "../assets/stylus/variable.styl"

.player
  .normal-player
    position fixed
    top 0
    left 0
    right 0
    bottom 0
    z-index 200
    .normal-header
      .back
        width 40px
        height 40px
        font-size 22px
        position absolute
        left 6px
        transform rotate(-90deg)
      .song-name
        width 300px
        height 40px
        margin 0 auto
        padding 0 10px
        box-sizing border-box
        line-height 40px
      .singer-name
        width 300px
        height 20px
        margin 0 auto
        padding 0 20px
        box-sizing border-box
        line-height 20px
    .middle
      position fixed
      top 80px
      left 0
      right 0
      bottom 170px
      .cover
        width 100%
        transition all 0
        .cd
          width 80vw
          height 80vw
          .cd-rotate
            width 100%
            height 100%
            border 10px solid hsla(0,0%,100%,.1)
            box-sizing border-box
            overflow hidden
            animation cdRotate 20s linear infinite
            &.play
              animation-play-state play
            &.pause
              animation-play-state paused
      .lyric
        width 100%
        // height 100%
        overflow hidden
        transition all 0
        .item-lyric
          height 32px
          line-height 32px
    .bottom
      position absolute
      left 0
      right 0
      bottom 10px
      .dots
        .dots-item
          width 8px
          height 8px
          background $back-whiteTranslucent
          border-radius 8px
          &.active
            width 20px
            background $back-white
      .progress-bar
        width 80%
        height 50px
        margin 0 auto
        .progress
          height 4px
          box-sizing border-box
          .inner
            width 0
            height 100%
          .bar
            width 16px
            height 16px
            border 3px solid #fff
            box-sizing border-box
            position absolute
            top -6px
            left 0
        .current
        .duration
          width 30px
      .control
        width 80%
        margin 0 auto
        font-size 30px
        .play
          font-size 40px
        .disbale
          opacity 0.4
    .background
      position absolute
      top 0
      left 0
      right 0
      bottom 0
      filter blur(20px)
      opacity 0.6
      z-index -1
  .normal-enter, .normal-leave-to
    opacity 0
    .normal-header
      transform translate3d(0, -100px, 0)
    .bottom
      transform translate3d(0 , 100px, 0)
  .normal-enter-active, .normal-leave-active
    transition all 0.5s
    .normal-header
    .bottom
      transition all 0.5s cubic-bezier(0.86, 0.18, 0.82, 1.32)
  .normal-enter-to, .normal-leave
    opacity 1
    .normal-header
      transform translate3d(0, 0, 0)
    .bottom
      transform translate3d(0, 0, 0)
  .mini-player
    width 100%
    height 60px
    position fixed
    left 0
    bottom 0
    z-index 180
    .cover
      width 40px
      height 40px
      overflow hidden
      animation cdRotate 20s linear infinite
      &.play
        animation-play-state play
      &.pause
        animation-play-state paused
    .song-info
      overflow hidden
      .song-name
      .singer-name
        height 20px
        line-height 20px
    .control
      font-size 30px
  .mini-enter, .mini-leave-to
    opacity 0
  .mini-enter-active, .mini-leave-active
    transition all 0.5s
  .mini-enter-to, .mini-leave
    opacity 1
@keyframes cdRotate
  form
    transform rotate(0)
  to
    transform rotate(360deg)
</style>
