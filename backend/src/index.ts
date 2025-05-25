import { Hono } from 'hono'

import { postRouter } from './router/postRouter'

import { cors } from 'hono/cors'



const app = new Hono();
app.use(cors())

app.get('/', (c) => c.text('You server is running! Check backend routes .'));


app.route('/api/v1/blog', postRouter)


export default app
