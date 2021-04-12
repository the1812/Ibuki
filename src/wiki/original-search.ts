import Fuse from 'fuse.js'
import { originals } from './originals'

const options = {
  keys: ['title', 'id', 'alias'],
}
const fuse = new Fuse(originals, options)
export const matchOriginal = (text: string) => {
  const result = fuse.search(text)
  if (result.length === 0) {
    return text
  }
  return result[0].item.id
}
