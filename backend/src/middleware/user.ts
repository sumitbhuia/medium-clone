import { Context, Next } from "hono";
import { Jwt } from "hono/utils/jwt";

// Define a custom context type to include userId
interface Env {
  Variables: {
    userId: string;
  };
  Bindings: {
    SUPABASE_JWT_SECRET: string;
    // add other env vars here if needed
  };
}

export async function authMiddleware(c: Context<Env>, next: Next) {
  // Extract the Authorization header
  const authHeader = c.req.header("Authorization");
  
  // Check if the header exists and starts with "Bearer "
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Authorization header missing or invalid" }, 401);
  }

  // Extract the token
  const token = authHeader.split(" ")[1];
  if (!token) {
    return c.json({ error: "Token missing in Authorization header" }, 401);
  }

  try {
    // Verify the Supabase JWT using the Supabase JWT secret
    const decoded = await Jwt.verify(token, c.env.SUPABASE_JWT_SECRET);

    // Supabase JWT payload has a `sub` field for the user ID (UUID)
    if (!decoded.sub || typeof decoded.sub !== "string") {
      return c.json({ error: "Invalid token: user ID (sub) missing" }, 401);
    }

    // Set the userId in the context for downstream handlers
    c.set("userId", decoded.sub);

    await next();
  } catch (error) {
    return c.json({ error: "Invalid or expired token" }, 401);
  }
}