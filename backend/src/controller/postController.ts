import { Context } from "hono";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from "@prisma/extension-accelerate";
// import prisma from "../lib/prisma";
import { postInputSchema ,updatePostInputSchema } from "@sumitbhuia/medium_common";
import { getPrisma } from "../lib/prisma";


enum StatusCodes{
    OK = 200,
    BAD_REQUEST = 400,
    UNAUTHORISED = 401,
    NOT_FOUND = 404,
    INTERNAL_SERVER_ERROR = 500,
}


export async function getAllPosts(c:Context) {
    const prisma = getPrisma(c.env.DATABASE_URL);

    try {
        const allPost = await prisma.post.findMany({
            include:{
                User:true
            }
        });
        return c.json(allPost,StatusCodes.OK);
        
    } catch (error) {
        return c.json({error : `Error getting all posts.${error}`},StatusCodes.INTERNAL_SERVER_ERROR)
        
    }
}
export async function createPost(c:Context) {

    const prisma = getPrisma(c.env.DATABASE_URL);

    try {
        const body  = await c.req.json();
        const parsedPost = postInputSchema.safeParse(body);

        if(!parsedPost.success){
            return c.json({error : 'Invalid post input'},StatusCodes.BAD_REQUEST);
        }

        const {title, description} = parsedPost.data;


        if(!title || !description){
            return c.json({error : 'Please provide title, description'},StatusCodes.BAD_REQUEST);
        }

        // Because c.get(`userId`) returned an object not an int
        // something like this {userId : 1}
        const userId = c.get(`userId`).userId;

        
        const newPost = await prisma.post.create({
            data:{
                title,
                description,
                userId,
            }
        })

        return c.json(newPost,StatusCodes.OK);
        
    } catch (error) {
        return c.json({error : `Error creating post.${error}`},StatusCodes.INTERNAL_SERVER_ERROR)
        
    }
}
export async function getPostById(c:Context) {

    const prisma = getPrisma(c.env.DATABASE_URL);

    try {

         // Typecasting id to number
         const pid:number  = Number(c.req.param('id'));

         // Whenever checking if exists or not 
         // give two parameters to findUnique (i.e.post only of that user)
         const post = await prisma.post.findUnique({
             where:{
                 id:pid,
                //  userId : c.get(`userId`).userId
             }, 
                include:{
                    User:true
                }
         });

         if(!post){
             return c.json({msg :'Post not found'}, StatusCodes.NOT_FOUND);
         }
         return c.json(post);
        
        
    } catch (error) {
        return c.json({error : `Error getting post by id.${error}`},StatusCodes.INTERNAL_SERVER_ERROR)
        
    }
}
export async function updatePostById(c:Context) {

    const prisma = getPrisma(c.env.DATABASE_URL);

    try {
        const id = Number(c.req.param('id'));
        const body = await c.req.json();
        const parsedPost = updatePostInputSchema.safeParse({ ...body , id });
        if(!parsedPost.success){
            return c.json({error : 'Invalid post input'},StatusCodes.BAD_REQUEST);
        }

        const { title, description } = parsedPost.data;
      

        const post = await prisma.post.findUnique({
            where:{
                id,
                userId : c.get(`userId`).userId
            }
        });

        if(!post){
            return c.json({msg :'Post not found'}, StatusCodes.NOT_FOUND);
        }

        const updatedPost = await prisma.post.update({
                where : {
                    id,
                    userId : c.get(`userId`).userId
                },
                data:{
                    title,
                    description,
                },

            
        })

        return c.json(updatedPost,StatusCodes.OK);


    } catch (error) {
        return c.json({error : `Error updating post by id.${error}`},StatusCodes.INTERNAL_SERVER_ERROR)
        
    }
}
