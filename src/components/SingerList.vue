<template>
  <scroll v-if="singerData.length" :scrollParams="scrollParams" @scroll="scroll" ref="wrapper">
    <ul class="singer-list">
      <li class="singer-item" v-for="item in singerData" :key="item.title" ref="singerItem">
        <h2 class="title back-sio size-sio color-whiteTranslucent padding-left-20">{{item.title}}</h2>
        <ul class="item-list padding-bottom-20">
          <li class="items-item flex cross-center padding-left-30 padding-top-20 size-lord color-lord" v-for="items in item.items" :key="items.singer_id" @click="selectSinger(items)">
            <img v-lazy="items.singer_cover" class="img radius-round">
            <div class="name margin-left-20">{{items.singer_name}}</div>
          </li>
        </ul>
      </li>
    </ul>
    <ul class="anchor flex column cross-center color-lord size-sio padding-top-17 padding-bottom-17" @touchstart.stop.prevent="anchorStart($event)" @touchmove.stop.prevent="anchorMove($event)" ref="anchor">
      <li class="anchor-item" :class="{'color-highlight': currentIndex === index}" v-for="(item, index) in anchorTitle" :key="item" :data-index="index" ref="anchorItem">{{item}}</li>
    </ul>
    <div class="fixed-header back-sio size-sio color-whiteTranslucent padding-left-20" :style="{transform: 'translateY('+ fixedTo +'px)'}" v-show="fixedHeaderState" ref="fixedHeader">{{fixedTitle}}</div>
  </scroll>
</template>

<script>
import Scroll from '@/components/Scroll'

export default {
  props: {
    singerData: {
      type: Array,
      redirect: true
    }
  },
  data () {
    return {
      touch: {},
      singerItemHeight: [],
      currentIndex: 0,
      scrollParams: {
        probeType: 3,
        click: true
      },
      fixedHeaderState: false,
      diff: -1,
      fixedTo: 0
    }
  },
  methods: {
    refresh () {
      this.$refs.wrapper.refresh()
    },
    selectSinger (items) {
      // 因为是基础组件，不在这里写业务逻辑，我们派发事件由 singer.vue 进行业务处理
      this.$emit('selectSinger', items)
    },
    anchorStart (e) {
      // 存储按下时的 Y 坐标
      this.touch.startY = e.touches[0].pageY

      // 获取自定义属性
      const anchorIndex = e.target.getAttribute('data-index') * 1

      // 存储按下时的锚点序号
      this.touch.anchorIndex = anchorIndex

      // 跳转目标元素
      this.$refs.wrapper.scrollToElement(this.$refs.singerItem[anchorIndex])

      this.currentIndex = anchorIndex
    },
    anchorMove (e) {
      // 触摸下滑时根据滑动到的某个元素跳转到目标元素

      // 存储滑动时的 Y 坐标
      this.touch.moveY = e.touches[0].pageY
      /**
       * (滑动的 Y 坐标 - 按下的 Y 坐标) / 锚点的高度，我们就能知道我们当前滑动到了哪个锚点
       * 最后的 | 0 等价于 Math.floor() ，会将结果向下取整
       */
      let index = (this.touch.moveY - this.touch.startY) / this.$refs.anchorItem[0].offsetHeight | 0

      // 按下时存储的锚点序号与当前滑动到的锚点序号相加，会在存储的锚点序号上一直累加
      index = (this.touch.anchorIndex + index)

      // 限制 index 范围，当滑动超出范围，currentIndex 会匹配不到 index，会导致锚点的高亮样式匹配不到
      index = index < 0 ? 0 : index > this.singerData.length - 1 ? this.singerData.length - 1 : index

      this.$refs.wrapper.scrollToElement(this.$refs.singerItem[index])

      this.currentIndex = index
    },
    scroll (pos) {
      // 结构对象，拿到滚动的 y 距离
      const { y } = pos

      // y 小于 0，说明是向上滑动的
      if (y < 0) {
        this.fixedHeaderState = true
      } else {
        this.fixedHeaderState = false
      }

      // 遍历歌手列表的高度，判断 y 是否在 i 与 i + 1 这个高度范围之间，如果在当前的这个 i 就是当前所在的楼层
      const singerItemHeight = this.singerItemHeight
      for (let i = 0; i < singerItemHeight.length; i++) {
        // y 是个负值，而高度是个正直，所以使用 Math.abs 方法转为绝对值，即为正值
        if ((Math.abs(y) >= singerItemHeight[i] && Math.abs(y) < singerItemHeight[i + 1]) || !singerItemHeight[i + 1]) {
          // 同步
          this.currentIndex = i

          // 求出一个差值， i + 1 的高度 + y 距离，会得到一个距离歌手列表滚动到顶部的距离，可以用这个值来实现固定标题的缓冲动画
          this._fixedDiff(singerItemHeight[i + 1] + y)

          return
        }
      }
    },
    _getSingerItemHeight () {
      // nextTick 会在DOM更新后去执行，防止获取不到元素的高度
      this.$nextTick(() => {
        // 获取每个歌手列表的高度并持续累加，这用于滚动时判断滚动距离获取对应的 index

        const arr = []

        let height = 0

        // 默认数组中的第一个是 0，表示的是起始值
        arr.push(height)

        // 累加每个楼层的高度，并添加到数组中
        this.$refs.singerItem.forEach(item => {
          height += item.offsetHeight
          arr.push(height)
        })

        this.singerItemHeight = arr
      })
    },
    _fixedDiff (diff) {
      const fixedHeaderHeight = this.$refs.fixedHeader.offsetHeight

      // 固定标题只在歌手列表距离顶部 0 - 30 距离才会产生动画效果
      if (diff > 0 && diff <= fixedHeaderHeight) {
        // 差值 - 标题高度，会得到一个从 30 递减的数值
        this.fixedTo = diff - fixedHeaderHeight
      } else {
        this.fixedTo = 0
      }
    }
  },
  computed: {
    anchorTitle () {
      // 返回 singerData 中的 title 属性，作用于锚点列表
      return this.singerData.map(item => item.title)
    },
    fixedTitle () {
      // 根据 currentIndex 返回对应的文案
      return this.singerData[this.currentIndex] && this.singerData[this.currentIndex].title
    }
  },
  components: {
    Scroll
  },
  mounted () {
    this._getSingerItemHeight()
  }
}
</script>

<style lang="stylus">
@import "../assets/stylus/variable.styl";

.singer-list
  .singer-item
    .title
      line-height 30px
    .item-list
      .items-item
        .img
          width 50px
          height 50px
.anchor
  position absolute
  top 50%
  right 0
  transform translate(0, -50%)
  background $back-blockTranslucent
  border-radius 18px
  font-weight 500
  .anchor-item
    padding 3px
.fixed-header
  line-height 30px
  position absolute
  top 0
  left 0
  right 0
</style>
