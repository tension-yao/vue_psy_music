/**
 * 将多个状态码整合在一起，在进行状态码判断时，import 此文件即可，这么做的目的是比较语义化，并且也比较规范好管理
 */
export const ERR_OK = 0

/**
 * MediaError 对象的 code 属性返回一个数字值，它表示音频/视频的错误状态：
 * 1 = MEDIA_ERR_ABORTED - 取回过程被用户中止
 * 2 = MEDIA_ERR_NETWORK - 当下载时发生错误
 * 3 = MEDIA_ERR_DECODE - 当解码时发生错误
 * 4 = MEDIA_ERR_SRC_NOT_SUPPORTED - 不支持音频/视频
 */
export const MEDIA_ERR_SRC_NOT_SUPPORTED = 4
