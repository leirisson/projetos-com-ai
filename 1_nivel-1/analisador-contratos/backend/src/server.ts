import { app } from "./app";
import { env } from './env'


app.listen({
    port: env.PORT,
    host: '0.0.0.0',
}, (err) => {
    if (err) {
        app.log.error(err)
        process.exit(1)
    }
})