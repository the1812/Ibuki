import React, { useCallback, useState } from 'react'
import { getSiteAdaptor, SiteAdaptorContext } from '../sites/site-adaptor'
import { generateCode } from '../wiki/code-generate'
import './index.less'
import { AlbumData, TrackData } from '../types'

const emptyAlbumData: AlbumData = {
  id: '',
  coverImage: '',
  title: '',
  circle: '',
  year: '',
  genre: '',
  discCount: 1,
  price: '',
}
export const Main = () => {
  const [trackRegex, setTrackRegex] = useState('')
  const [albumData, setAlbumData] = useState<AlbumData>(emptyAlbumData)
  const [trackData, setTrackData] = useState<TrackData[]>([])
  const [code, setCode] = useState('')
  const copyCode = useCallback(() => {
    GM_setClipboard(code, { mimetype: 'text/plain' })
  }, [code])
  const resetOutput = () => {
    console.log('reset')
    setAlbumData(emptyAlbumData)
    setTrackData([])
    setCode('')
  }
  const [isBusy, setIsBusy] = useState(false)
  const start = useCallback(async () => {
    try {
      setIsBusy(true)
      if (!trackRegex) {
        resetOutput()
        return
      }
      const adaptor = await getSiteAdaptor()
      const context: SiteAdaptorContext = {
        trackRegex: new RegExp(trackRegex, 'g'),
      }
      console.log('run with regex = ', context.trackRegex)
      const newAlbumData = await adaptor.getAlbumData(context)
      const newTrackData = await adaptor.getTrackData(context)
      if (newTrackData.length === 0) {
        return
      }
      console.time('code')
      const newCode = generateCode({
        albumData: newAlbumData,
        trackData: newTrackData,
        orderDetails: await adaptor.getOrderDetails(context),
      })
      console.timeEnd('code')
      setAlbumData(newAlbumData)
      setTrackData(newTrackData)
      setCode(newCode)
    } catch (error) {
      console.error(error)
      resetOutput()
    } finally {
      setIsBusy(false)
    }
  }, [trackRegex])
  return (
    <div className='ibuki-main-window'>
      <div className='site-data'></div>
      <div className='inputs'>
        <div className='input-row'>
          Regex:
          <textarea
            rows={3}
            cols={50}
            value={trackRegex}
            onChange={e => {
              setTrackRegex(e.target.value)
            }}
          />
        </div>
      </div>
      <button disabled={isBusy} onClick={start}>
        Start
      </button>
      <pre className='album-data'>{JSON.stringify(albumData, undefined, 2)}</pre>
      <div className='track-data'>{trackData.length} track(s) detected.</div>
      <div className='code'>
        {code.length} bytes of wiki code generated.
        <button onClick={copyCode}>Copy</button>
      </div>
    </div>
  )
}