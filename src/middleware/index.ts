import { defineMiddleware } from "astro:middleware";
import { PATHS } from "@core/config";
import { jwtDecode } from "jwt-decode";
import { Role } from "@src/interfaces/user.interface";
// import { string } from "astro:schema";
// import { UserType } from '@src/core/interfaces/core.interface';


export const onRequest = defineMiddleware(async (context, next) => {
  const { redirect } = context;
  const { pathname } = context.url;

  const token = context.cookies.get("token");

  const publicPaths = PATHS.filter((path) => path.public).map(
    (path) => path.path,
  );

  if (!token) {
    if (!publicPaths.includes(pathname)) {
      return redirect("/auth/login");
    }
  } else {
    try {
      const decodedToken = jwtDecode<{ id: string, role: string, iat: number, exp: number }>(token.value);

      const routes: Record<Role, string[]> = {
        [Role.ADMIN]: <string[]>[],
        [Role.STUDENT]: <string[]>[],
        [Role.TEACHER]: <string[]>[]
      };

      PATHS.forEach((path) => {
        if (path.role.includes(decodedToken.role as Role)) {
          routes[decodedToken.role as Role].push(path.path);
        }
      });

      if (
        !routes[decodedToken.role as Role].includes(pathname) &&
        !publicPaths.includes(pathname)
      ) {
        return redirect("/401");
      }
    } catch (error) {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  return next();
});
