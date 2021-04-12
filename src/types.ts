export interface AlbumData {
  id: string
  title: string
  circle: string
  coverImage: string
  genre: string
  year: string
  discCount: number
  price: string
}
export interface TrackData {
  trackNumber: number
  discNumber: number
  title: string
  time: string
  originals: string
  artists: string
  lyricists: string
}
export interface OrderDetail {
  type: string
  id: string
  title?: string
}
