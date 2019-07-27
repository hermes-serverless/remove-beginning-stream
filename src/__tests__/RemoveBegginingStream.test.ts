import getStream from 'get-stream'
import { finished, PassThrough } from 'stream'
import { promisify } from 'util'
import { RemoveBeginningStream } from '..'

test('Single chunk', () => {
  const expectedStream = '.'.repeat(10 * 1000)
  const s = new PassThrough()
  const r = new RemoveBeginningStream('--remove--')
  s.pipe(r)
  s.end('--remove--' + expectedStream)
  return expect(getStream(r)).resolves.toBe(expectedStream)
})

test('Divided chunk', () => {
  const s = new PassThrough()
  const r = new RemoveBeginningStream('--remove--')
  s.pipe(r)
  s.write('--rem')
  setTimeout(() => s.write('ove'), 500)
  setTimeout(() => s.write('--' + '.'.repeat(1000)), 1000)
  setTimeout(() => s.end('.'.repeat(10 * 1000)), 1500)
  return expect(getStream(r)).resolves.toBe('.'.repeat(11 * 1000))
})

test('Big start', () => {
  const s = new PassThrough()
  const r = new RemoveBeginningStream('.'.repeat(1 * 1000000))
  s.pipe(r)
  s.end('.'.repeat(10 * 1000000))
  return expect(getStream(r)).resolves.toBe('.'.repeat(9 * 1000000))
})

test('Error: Early end', () => {
  const s = new PassThrough()
  const r = new RemoveBeginningStream('--remove--')
  const p = promisify(finished)(r)
  s.pipe(r)
  r.resume()
  s.end('--remove-')
  return expect(p).rejects.toThrow('ENDED_BEFORE_START_STREAM')
})

test('Error: Doesnt start with given string', () => {
  const s = new PassThrough()
  const r = new RemoveBeginningStream('--remove--')
  const p = promisify(finished)(r)
  s.pipe(r)
  r.resume()
  s.end('--remove-a')
  return expect(p).rejects.toThrow('INVALID_START')
})

test('Error: Doesnt start with given string', () => {
  const s = new PassThrough()
  const r = new RemoveBeginningStream('--remove--')
  const p = promisify(finished)(r)
  s.pipe(r)
  r.resume()
  s.end('--remove-aaaaaaa'.repeat(100))
  return expect(p).rejects.toThrow('INVALID_START')
})
