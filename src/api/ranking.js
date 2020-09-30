import axios from 'axios'
import { params } from '@/assets/js/api.public'

/**
 * 排行列表
 */

export async function getTopList () {
  const url = 'http://www.privatewebs.top/vue_tension_music_api/topList'

  const data = Object.assign({}, params, {
    uin: 0,
    needNewCode: 1,
    platform: 'h5'
  })

  return await axios({
    url,
    params: data
  })
}

export async function getTopListDetail (id) {
  const url = 'http://www.privatewebs.top/vue_tension_music_api/topListDetail'

  const data = Object.assign({}, params, {
    topid: id,
    needNewCode: 1,
    uin: 0,
    tpl: 3,
    page: 'detail',
    type: 'top',
    platform: 'h5'
  })

  return await axios({
    url,
    params: data
  })
}
