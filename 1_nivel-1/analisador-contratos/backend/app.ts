import Fastify, { fastify } from 'fastify'
import cors from '@fastify/cors'
import multipart from '@fastify/multipart'
import path from 'node:path'


export const app = Fastify({logger: true})

// plugins
const SIZE_FILE = 10 * 1024 * 2024 // maximo de 10 MB
app.register(cors)
app.register(multipart, {
    limits: {
        fileSize: SIZE_FILE //
    }
})

// ROTA DE TESTE
app.get("/health", async () => {
    return {status: "ok"}
})

