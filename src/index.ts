import { Transform, TransformOptions } from 'stream'

interface RemoveBeginningStreamOptions {}

export class RemoveBeginningStream extends Transform {
  private strToRemove: string
  private buffer: string
  private done: boolean

  constructor(strToRemove: string, options?: RemoveBeginningStreamOptions, duplexOptions?: TransformOptions) {
    super(duplexOptions)

    this.done = false
    this.strToRemove = strToRemove
    this.buffer = ''
  }

  _transform = (chunk: Buffer | string, encoding: string, cb: any) => {
    if (this.done) return cb(null, chunk)

    this.buffer += chunk.toString('utf-8')
    if (this.buffer.startsWith(this.strToRemove)) {
      this.buffer = this.buffer.substring(this.strToRemove.length)
      this.done = true
      this.push(this.buffer)
      this.buffer = null
      return cb(null)
    }

    if (this.buffer.length >= this.strToRemove.length) {
      this.push(null)
      this.done = true
      return cb(new Error('INVALID_START'))
    }

    cb(null)
  }

  _flush = (cb: any) => {
    if (!this.done) return cb(new Error('ENDED_BEFORE_START_STREAM'))
    cb(null)
  }
}
