import 'dotenv'
import z from 'zod'



const envSchema = z.object({
    OPENROUTER_API_KEY: z.string(),
    PORT: z.coerce.number(),
    SITE_URL: z.string(),
    SITE_NAME: z.string()
})


const _env = envSchema.safeParse(process.env)

if(_env.error){
    throw new Error("Erro ao carregar as variaveis de ambiente")
}

export const env = _env.data


