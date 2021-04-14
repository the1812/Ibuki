// 单独拉下面的字段可能是有多个值的
export interface AlbumData {
  id: string
  title: string
  coverImage: string
  genre: string
  year: string
  discCount: number
  price: string

  circle: string
}
export interface TrackData {
  title: string
  time: string

  originals: string
  arrangers: string
  vocals: string
  lyricists: string
}
export interface OrderDetail {
  type: string
  id: string
  title?: string
}
