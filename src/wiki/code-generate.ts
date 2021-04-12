import { AlbumData, OrderDetail, TrackData } from '../types'
import { matchOriginal } from './original-search'

const trySplit = (text: string, mapFn: (s: string) => string = s => s) => {
  return text.split(/[,，]/).map(mapFn).join('，')
}
export const generateCode = (data: {
  albumData: AlbumData
  trackData: TrackData[]
  orderDetails: OrderDetail[]
}) => {
  const {
    albumData: {
      title,
      circle,
      id,
      genre,
      price,
    },
    trackData,
    orderDetails,
  } = data
  return `{{同人专辑头部}}

== 专辑信息 ==
{{同人专辑信息|
| 封面 =
| 封面角色 =
| 名称 = ${title}
| 译名 =
| 制作方 = ${circle}
| 展会 =
| 编号 = ${id}
| 类型 = 全长
| 风格类型 = ${genre}
| 会场售价 =
| 通贩售价 = ${price}
| 官网页面 =
}}
{{通贩列表|
| 官方 =
${orderDetails.map(({ type, id, title }) => {
  return `
{{通贩网址|
| 类型 = ${type}
| 编号 = ${id}
| 标题 = ${title || ''}
}}
`.trim()
}).join('\n')}

}}

== Staff ==
{{专辑人员列表|
|碟号=1
|替换=
}}

== 试听 ==
{{专辑音频|
| 类型 =
| 编号 =
| 标题 =
}}

== 曲目列表 ==
{{专辑曲目列表|
| 嵌套 =
${trackData.map(track => {
  return `
{{同人曲目信息|
|名称 = ${track.title}
|时长 = ${track.time}
|编曲 = ${trySplit(track.artists)}
|演唱 =
${track.lyricists ? `|作词 = ${trySplit(track.lyricists)}\n` : ''}|原曲 = ${trySplit(
    track.originals,
    matchOriginal
  )}
}}
`.trim()
}).join('\n')}

}}

== 评论 ==

{{Bottom}}`
}
