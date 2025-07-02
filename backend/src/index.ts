import { Hono } from 'hono'

import { postRouter } from './router/postRouter'

import { cors } from 'hono/cors'
import { userRouter } from './router/userRouter';
import { engagementRouter } from './router/engagementRouter';



const app = new Hono();
app.use(cors())

app.get('/', (c) => c.text('You server is running! Check backend routes .'));


app.route('/api/v1/blog', postRouter);
app.route('/api/v1/user',userRouter);
app.route('/api/v1/stats',engagementRouter);


export default app
