import axios from 'axios'
import { params } from '@/assets/js/api.public'

/**
 * 歌手列表
 */
export async function getSingerList () {
  const url = 'http://www.privatewebs.top/psyMusicAPI/singerList'

  const data = Object.assign({}, params, {
    channel: 'singer',
    page: 'list',
    key: 'all_all_all',
    pagesize: 100,
    pagenum: 1,
    hostUin: 0,
    needNewCode: 0,
    platform: 'yqq'
  })
  return await axios({
    url,
    params: data
  })
}

/**
 * 歌手详情
 */
export async function getSingerDetail (mid) {
  const url = 'http://www.privatewebs.top/psyMusicAPI/singerDetail'

  const data = Object.assign({}, params, {
    hostUin: 0,
    needNewCode: 0,
    platform: 'yqq',
    order: 'listen',
    begin: 0,
    num: 80,
    songstatus: 1,
    singermid: mid
  })

  return await axios({
    url,
    params: data
  })
}
