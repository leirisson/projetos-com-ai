import { app } from "./app";
import { env } from './src/env'


app.listen({
    port: env.PORT,
    host: '0.0.0.0',
}, (err) => {
    app.log.error(err)
    process.exit(1)
})