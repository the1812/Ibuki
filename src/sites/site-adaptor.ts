import { AlbumData, OrderDetail, TrackData } from '../types'

export interface SiteAdaptorContext {
  trackRegex: string
  separators: {
    circle: string
    originals: string
    arrangers: string
    vocals: string
    lyricists: string
  }
}
export interface SiteAdaptor {
  isMatch: () => boolean
  getAlbumData: (context: SiteAdaptorContext) => Promise<AlbumData>
  getTrackText: (context: SiteAdaptorContext) => Promise<string>
  getTrackData: (context: SiteAdaptorContext) => Promise<TrackData[]>
  getOrderDetails: (context: SiteAdaptorContext) => Promise<OrderDetail[]>
}
export const getSiteAdaptor = async () => {
  const { melonbooks } = await import('./melonbooks')

  const adaptors = [
    melonbooks
  ]
  return adaptors.find(a => a.isMatch())
}
