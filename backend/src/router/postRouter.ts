import { Hono } from "hono";
import { createPost, getAllPosts, getPostById, getPostOwner, updatePostById } from "../controller/postController";
import { authMiddleware } from "../middleware/user";
export const postRouter = new Hono();

postRouter.get('/can-edit-post',authMiddleware,getPostOwner);
postRouter.get('/allPosts', getAllPosts); 

postRouter.post('/create',authMiddleware, createPost); 
postRouter.get('/:id',authMiddleware, getPostById); 
postRouter.put('/edit/:id',authMiddleware, updatePostById); 

