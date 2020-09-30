import axios from 'axios'
import { params } from '@/assets/js/api.public'

/**
 * 歌曲播放地址
 */
export async function getSongURL (songmidArr) {
  const url = 'http://www.privatewebs.top/vue_tension_music_api/songURL'

  const data = Object.assign({}, params, {
    g_tk: 5381,
    loginUin: 0,
    hostUin: 0,
    platform: 'yqq.json',
    needNewCode: 0,
    data: {
      req_0: {
        module: 'vkey.GetVkeyServer',
        method: 'CgiGetVkey',
        param: {
          guid: '7066161192',
          songmid: songmidArr,
          songtype: [0],
          uin: '0',
          loginflag: 1,
          platform: '20'
        }
      },
      comm: {
        uin: 0,
        format: 'json',
        ct: 24,
        cv: 0
      }
    }
  })
  return await axios({
    url,
    params: data
  })
}
/**
 * 歌词接口
 */
export async function getLyric (songid) {
  const url = 'http://www.privatewebs.top/vue_tension_music_api/lyric'

  const data = Object.assign({}, params, {
    /**
     * nobase64
     *  0 => base64
     *  1 => Unicode
     */
    nobase64: 0,
    musicid: songid,
    g_tk_new_20200303: 5381,
    g_tk: 5381,
    platform: 'yqq.json',
    loginUin: 0,
    hostUin: 0,
    needNewCode: 0
  })

  return await axios({
    url,
    params: data
  })
}
