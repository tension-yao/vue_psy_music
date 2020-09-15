import Vue from 'vue'

/**
 * 用于兄弟组件通信
 */
export const communication = new Vue()

/**
 * 处理 singer_mid 字段，拼接图片地址返回完整的图片 url，并且通过参数控制图片大小
 */
export function baseImageURL (mid, flag) {
  if (!mid) {
    return
  }

  if (flag === 0) {
    return `https://y.gtimg.cn/music/photo_new/T001R150x150M000${mid}.jpg?max_age=2592000`
  } else if (flag === 1) {
    return `https://y.gtimg.cn/music/photo_new/T001R300x300M000${mid}.jpg?max_age=2592000`
  } else if (flag === 2) {
    return `http://y.gtimg.cn//music/photo_new/T002R300x300M000${mid}.jpg?max_age=2592000`
  }
}

/**
 * 接受一个文案和一个歌手数组，转换为：薛之谦/郁可唯·文案
 */
export function baseSinger (cotyWriting, arr) {
  arr = arr.map(item => {
    return item.name
  })

  return `${arr.join('/')}·${cotyWriting}`
}

/**
 * 接受一个文案和一个歌手数组，转换为：文案-薛之谦/郁可唯
 */
export function baseSinger2 (cotyWriting, arr) {
  arr = arr.map(item => {
    return item.name
  })

  return `${cotyWriting}-${arr.join('/')}`
}

/**
 * 接受一个最大值与最小值，返回二者之间的随机数
 */
export function random (max, min) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

/**
 * 对数组进行洗牌，打乱顺序，需要结合随机数
 */
export function shuffle (arr) {
  /**
   * slice 方法不传入任何参数，会返回原数组中的所有元素，即为新数组，防止改变这个数组的时候会将原数组也改变
   */
  const _arr = arr.slice()

  for (let i = 0; i < _arr.length; i++) {
    const r = random(_arr.length - i, i)
    const temp = _arr[i]
    _arr[i] = _arr[r]
    _arr[r] = temp
  }
  return _arr
}

/**
 * 添加本地存储
 */
export function setStorage (key, val) {
  localStorage.setItem(key, JSON.stringify(val))
}

/**
 * 获取本地存储
 */
export function getStorage (key) {
  return JSON.parse(localStorage.getItem(key) || '[]')
}

/**
 * 节流函数
 *   对于持续触发的事件，规定一个间隔时间，每隔一段时间只执行一次，目的是防止重复的网络请求
 */
export function throttle (fn, delay) {
  let timer = null

  /**
   * 调用 throttle 函数立即返回一个匿名函数
   */
  return function (...args) {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      /**
       * 虽然原本的函数被 throttle 函数的返回值给代替，但是 throttle 参数中的 fn 并没有被销毁即为原本的函数 (没有调用 throttle 函数之前的函数)
       *
       * 定时器时间达到时就可以执行 throttle 参数中的 fn，继续我们的业务逻辑
       */
      fn.apply(this, args)
      console.log('???')
    }, delay)
  }
}
