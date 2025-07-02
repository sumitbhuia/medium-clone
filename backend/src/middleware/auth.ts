import { Context, Next } from "hono";
import { Jwt } from "hono/utils/jwt";



// Required auth middleware - blocks requests without valid tokens
export async function requireAuth(c: Context, next: Next) {
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
    // Verify the Supabase JWT 
    const decoded = await Jwt.verify(token, c.env.SUPABASE_JWT_SECRET) ;

    // Supabase JWT payload has a `sub` field for the user ID (UUID)
    if (!decoded.sub || typeof decoded.sub !== "string") {
      return c.json({ error: "Invalid token: user ID (sub) missing" }, 401);
    }

    // Check token expiration (optional extra safety)
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return c.json({ error: "Token expired" }, 401);
    }

    // Set user information in the context for downstream handlers
    c.set("userId", decoded.sub);
    c.set("userEmail", decoded.email);
    c.set("userRole", decoded.role);

    await next();
  } catch (error) {
    console.error("JWT verification error:", error);
    return c.json({ error: "Invalid or expired token" }, 401);
  }
}

// Optional auth middleware - allows requests without tokens but sets context if available
export async function optionalAuth(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization");
  
  // If no auth header, continue without setting user context
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    await next();
    return;
  }

  // Extract the token
  const token = authHeader.split(" ")[1];
  if (!token) {
    await next();
    return;
  }

  try {
    // Verify the Supabase JWT 
    const decoded = await Jwt.verify(token, c.env.SUPABASE_JWT_SECRET);

    // Supabase JWT payload has a `sub` field for the user ID (UUID)
    if (decoded.sub && typeof decoded.sub === "string") {
      // Check token expiration
      if (!decoded.exp || Date.now() < decoded.exp * 1000) {
        // Set user information in the context
        c.set("userId", decoded.sub);
        c.set("userEmail", decoded.email);
        c.set("userRole", decoded.role);
      }
    }
  } catch (error) {
    // Silently fail for optional auth - just don't set user context
    console.warn("Optional auth failed:", error);
  }

  await next();
}

// Middleware to check specific roles (use after requireAuth)
export function requireRole(...allowedRoles: string[]) {
  return async (c: Context, next: Next) => {
    const userRole = c.get("userRole");
    
    if (!userRole || !allowedRoles.includes(userRole)) {
      return c.json({ error: "Insufficient permissions" }, 403);
    }

    await next();
  };
}
