import { Hono } from "hono";
import { createPost, getAllPosts, getPostById, getPostOwner, updatePostById } from "../controller/postController";
import { requireAuth } from "../middleware/auth";
export const postRouter = new Hono();

postRouter.get('/can-edit-post',requireAuth,getPostOwner);
postRouter.get('/allPosts', getAllPosts); 

postRouter.post('/create',requireAuth, createPost); 
postRouter.get('/:id',requireAuth, getPostById); 
postRouter.put('/edit/:id',requireAuth, updatePostById); 

