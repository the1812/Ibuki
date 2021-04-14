import { SiteAdaptorContext } from '../sites/site-adaptor'
import { AlbumData, OrderDetail, TrackData } from '../types'
import { matchOriginal } from './original-search'

const trySplit = (text: string, separator: string, mapFn: (s: string) => string = s => s) => {
  console.log('[trySplit]', text, separator, text.split(new RegExp(separator)))
  return text
    .split(new RegExp(separator))
    .map(it => it.trim())
    .map(mapFn)
    .join('，')
}
const optionalField = (fieldName: string, splitData: string) => {
  if (!splitData) {
    return ''
  }
  return `|${fieldName} = ${splitData}`
}
export const generateCode = (
  data: {
    albumData: AlbumData
    trackData: TrackData[]
    orderDetails: OrderDetail[]
  },
  context: SiteAdaptorContext
) => {
  const {
    albumData: { title, circle, id, genre, price },
    trackData,
    orderDetails,
  } = data
  console.log(data)
  const { separators } = context
  return `{{同人专辑头部}}

== 专辑信息 ==
{{同人专辑信息|
| 封面 =
| 封面角色 =
| 名称 = ${title}
| 译名 =
| 制作方 = ${trySplit(circle, separators.circle)}
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
${orderDetails
  .map(({ type, id, title }) => {
    return `
{{通贩网址|
| 类型 = ${type}
| 编号 = ${id}
| 标题 = ${title || ''}
}}
`.trim()
  })
  .join('\n')}

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
${trackData
  .map(track => {
    return `
{{同人曲目信息|
|名称 = ${track.title}
|时长 = ${track.time}
${optionalField('编曲', trySplit(track.arrangers, separators.arrangers))}
${optionalField('演唱', trySplit(track.vocals, separators.vocals))}
${optionalField('作词', trySplit(track.lyricists, separators.lyricists))}
${optionalField('原曲', trySplit(track.originals, separators.originals, matchOriginal))}
}}
`.trim().replace(/\n\n/g, '\n')
  })
  .join('\n')}
}}

== 评论 ==

{{Bottom}}`
}
