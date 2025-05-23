import { Context } from "hono";
import { Jwt } from "hono/utils/jwt";
import { signInSchema , signUpSchema } from "@sumitbhuia/medium_common";
import { getPrisma } from "../lib/prisma";


enum StatusCodes{
    OK = 200,
    BAD_REQUEST = 400,
    UNAUTHORISED = 401,
    NOT_FOUND = 404,
    INTERNAL_SERVER_ERROR = 500,
}

export async function signup(c:Context) {
    const prisma = getPrisma(c.env.DATABASE_URL);

    try {
        const body : {
            username : string ,
            email : string, 
            password : string
        } = await c.req.json();

        const {username , email , password} = body;
        const parsedUser = signUpSchema.safeParse(body);
        
        // Zod error handling
        if(!parsedUser.success){
            return c.json('Invalid user input', StatusCodes.BAD_REQUEST);
        }
        
        const checkUser = await prisma.user.findFirst({
            where:{
                email
            }
        })
        
        // Check if user already exists
        if(checkUser?.email == email){
            return c.json('User already exists', StatusCodes.BAD_REQUEST);
        }

        const newUser = await prisma.user.create({
            data:{
                username ,
                email,
                password

            }
        })
        const token = await Jwt.sign({userId:newUser.id},c.env.JWT_SECRET);
        
        return c.json({
            msg: 'User created successfully ',
            token : token,
            user : {
                userId : newUser.id,
                username : newUser.username,
                email : newUser.email
            }
            } ,StatusCodes.OK );

    }
    catch(error){
        return c.json(`Error creating user ${error}`, StatusCodes.INTERNAL_SERVER_ERROR);
    }   
}
export async function signin(c:Context) {
    const prisma = getPrisma(c.env.DATABASE_URL);

    try {

        const body : {
            email : string, 
            password  :string} = await c.req.json();

        const parsedUser = signInSchema.safeParse(body);

        //Zod error handling
        if(!parsedUser.success){
            return c.json('Invalid user input', StatusCodes.BAD_REQUEST);
        }
        const {email , password} = body;


        const checkUser = await prisma.user.findFirst({
            where:{
                email,
                password
            } });

        // Checking if user exists
        if(!checkUser){
            return c.json('User not found', StatusCodes.BAD_REQUEST);
        }

        //  This is not required as prisma will throw an error if user not found
        //  Checking credential match
        if(checkUser.password != password){
            return c.json('Wrong credentials', StatusCodes.BAD_REQUEST);
        }


        const token = await Jwt.sign({userId:checkUser?.id},c.env.JWT_SECRET);

        return c.json(
            {
                msg:  'Signed in successfully',
                token : token,
                user : {
                    userId : checkUser.id,
                    username : checkUser.username,
                    email : checkUser.email
                }
            }, 
            StatusCodes.OK
        );
    } catch (error) {
        return c.json(`Error signing in . ${error}`, StatusCodes.INTERNAL_SERVER_ERROR);       
    }  
}

