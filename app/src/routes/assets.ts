import { Hono } from 'hono'
import { Bindings, Variables } from '../types'

const assets = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// /assets/favicon.png
assets.get('/favicon.png', async (c) => {
  const object = await c.env.BUCKET.get('favicon.png')
  if (!object) return c.notFound()

  const headers = new Headers()
  object.writeHttpMetadata(headers)
  headers.set('etag', object.httpEtag)
  headers.set('Content-Type', 'image/png')

  return c.body(object.body, 200, Object.fromEntries(headers))
})

// /assets/courses/:slug/:filename
assets.get('/courses/:slug/:filename', async (c) => {
  const { slug, filename } = c.req.param()
  const key = `courses/${slug}/${filename}`
  
  const object = await c.env.BUCKET.get(key)
  if (!object) return c.notFound()

  const headers = new Headers()
  object.writeHttpMetadata(headers)
  headers.set('etag', object.httpEtag)

  return c.body(object.body, 200, Object.fromEntries(headers))
})

// /assets/courses/:slug/:session/:filename
assets.get('/courses/:slug/:session/:filename', async (c) => {
  const { slug, session, filename } = c.req.param()
  const key = `courses/${slug}/${session}/${filename}`
  
  const object = await c.env.BUCKET.get(key)
  if (!object) return c.notFound()

  const headers = new Headers()
  object.writeHttpMetadata(headers)
  headers.set('etag', object.httpEtag)

  return c.body(object.body, 200, Object.fromEntries(headers))
})

export default assets
