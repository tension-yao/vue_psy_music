import axios from 'axios'
import { params, jsonpOptions } from '@/assets/js/api.public'
import jsonp from '@/assets/js/jsonp'

/**
 * 焦点图
 */
export async function getRecommendSlider () {
  const url = 'https://c.y.qq.com/musichall/fcgi-bin/fcg_yqqhomepagerecommend.fcg'

  const data = Object.assign({}, params, {
    format: 'jsonp',
    platform: 'h5',
    uin: 0,
    needNewCode: 1
  })

  return await jsonp(url, data, jsonpOptions)
}

/**
 * 歌单列表
 */
export async function getRecommendList () {
  const url = 'http://www.privatewebs.top/vue_tension_music_api/recommendList'

  const data = Object.assign({}, params, {
    platform: 'yqq',
    hostUin: 0,
    sin: 0,
    ein: 29,
    sortId: 5,
    needNewCode: 0,
    categoryId: 10000000,
    rnd: Math.random(),
    format: 'json'
  })

  return await axios({
    url,
    params: data
  })
}

/**
 * 歌单列表详情
 */
export async function getSongList (dissid) {
  const url = 'http://www.privatewebs.top/psyMusicAPI/songList'

  const data = Object.assign({}, params, {
    /**
     * type
     *  0 => 不包含 songlist
     *  1 => 包含 songlist
     */
    type: 1,
    json: 1,
    utf8: 1,
    onlysong: 0,
    new_format: 1,
    disstid: dissid,
    g_tk_new_20200303: 5381,
    loginUin: 0,
    hostUin: 0,
    platform: 'yqq.json',
    needNewCode: 0
  })

  return await axios({
    url,
    params: data
  })
}
