import Fastify from 'fastify'
import cors from '@fastify/cors'
import multipart from '@fastify/multipart'
import staticFiles from '@fastify/static'
import path from 'node:path'
import { rotaAnalisar } from './routes/analisar'

export const app = Fastify({ logger: true })

const MAX_PDF_BYTES = 10 * 1024 * 1024 // 10 MB

app.register(cors)
app.register(multipart, {
  limits: { fileSize: MAX_PDF_BYTES },
})
app.register(staticFiles, {
  root: path.join(__dirname, '..', 'public'),
  prefix: '/',
})

app.get('/health', async () => {
  return { status: 'ok' }
})

app.register(rotaAnalisar)
