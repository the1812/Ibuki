import { TrackData } from '../../types'
import { SiteAdaptor } from '../site-adaptor'

const genreMap: Record<string, string> = {
  トランス: 'Trance',
  ハウス: 'House',
  ドラムンベース: 'Drum & Bass',
  クラブ: 'Club',
  ユーロビート: 'Eurobeat',
  ハードコア: 'Hardcore',
  エレクトロ: 'Electro',
}
const genreIgnore = ['コンピレーション', 'オムニバス', '東方Project']
const getTrackText = async () => {
  const descTitle = document.querySelector('#description h2')
  return descTitle?.nextElementSibling?.textContent.trim() ?? ''
}
export const melonbooks: SiteAdaptor = {
  isMatch: () =>
    document.URL.startsWith('https://www.melonbooks.co.jp/detail/detail.php?product_id='),
  getAlbumData: async () => {
    const title = document.querySelector('#title .head h1') as HTMLElement
    const circle = document.querySelector('#title .head .circle') as HTMLElement
    const image = document.querySelector('#main_new .image a') as HTMLAnchorElement
    const tableData = (rowName: string) => {
      const [element] = [...document.querySelectorAll('.odd th')].filter(
        it => it.textContent.trim() === rowName
      )
      return element?.nextElementSibling?.textContent.trim()
    }
    const date = tableData('発行日')
    const price = document.querySelector('#main_new .price, #title .price')
    const genreTags = [...document.querySelectorAll('#related_tags li a')]
      .map(it => it.textContent.trim().match(/音楽\((.+)\)/)?.[1])
      .filter(it => it !== undefined && !genreIgnore.includes(it))
      .map(it => (it in genreMap ? genreMap[it] : it))
    return {
      id: '',
      title: title?.textContent.trim() ?? '',
      circle: circle?.textContent.trim() ?? '',
      coverImage: image?.href ?? '',
      discCount: 1,
      year: date?.match(/^(\d+)\//)?.[1] ?? '',
      genre: genreTags.join('，'),
      price: price?.textContent.trim().replace(/[¥,]/g, '') + '日元' ?? '',
    }
  },
  getTrackText,
  getTrackData: async ({ trackRegex }) => {
    const text = await getTrackText()
    const matches = [...text.matchAll(new RegExp(trackRegex, 'g'))]
    return matches.map(m => {
      const defaultItem: TrackData = {
        trackNumber: 1,
        discNumber: 1,
        time: '',
        title: '',
        originals: '',
        artists: '',
        lyricists: '',
      }
      return Object.assign({}, defaultItem, m.groups)
    })
  },
  getOrderDetails: async () => {
    const id = window.location.search.match(/product_id=(\d+)/)?.[1] ?? '0'
    return [
      {
        type: '蜜瓜',
        id,
      }
    ]
  },
}
