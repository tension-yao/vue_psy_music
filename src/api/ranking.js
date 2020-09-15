import axios from 'axios'
import { params } from '@/assets/js/api.public'

/**
 * 排行列表
 */

export async function getTopList () {
  // const url = '/api/v8/fcg-bin/fcg_myqq_toplist.fcg'
  const url = 'http://123.56.145.222/psyMusicAPI/topList'

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
  // const url = '/api/v8/fcg-bin/fcg_v8_toplist_cp.fcg'
  const url = 'http://123.56.145.222/psyMusicAPI/topListDetail'

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
