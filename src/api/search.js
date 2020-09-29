import axios from 'axios'

import { params } from '@/assets/js/api.public'

/**
 * 热门搜索
 */
export async function getHotSearch () {
  const url = 'http://www.privatewebs.top/psyMusicAPI/hotSearch'

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

/**
 * 搜索歌曲
 */
export async function getSearchResult (query, p, catZhida) {
  const url = 'http://www.privatewebs.top/psyMusicAPI/searchResult'

  const data = Object.assign({}, params, {
    // 搜索的内容
    w: query,
    // 歌曲起始页数，值为 1++ 递增
    p: p,
    // 获取的数据数量
    n: 20,
    perpage: 20,
    /**
     * catZhida:
     *  0 => 不包含歌手
     *  1 => 包含歌手
     */
    catZhida: catZhida,
    zhidaqu: 1,
    t: 0,
    flag: 1,
    ie: 'utf-8',
    sem: 1,
    aggr: 0,
    remoteplace: 'txt.mqq.all',
    uin: 0,
    needNewCode: 1,
    platform: 'h5'
  })

  return await axios({
    url,
    params: data
  })
}
