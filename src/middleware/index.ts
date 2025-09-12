import { defineMiddleware } from "astro:middleware";
import { PATHS } from "@core/config";
import { jwtDecode } from "jwt-decode";
// import { UserType } from '@src/core/interfaces/core.interface';
//
//

export const onRequest = defineMiddleware(async (context, next) => {
  const { redirect } = context;
  const { pathname } = context.url;

  const token = context.cookies.get("token");

  const publicPaths = PATHS.filter((path) => !path.menu).map(
    (path) => path.path,
  );

  if (!token) {
    if (!publicPaths.includes(pathname)) {
      return redirect("/auth/login");
    }
  } else {
    // try {
    //   const decodedToken = jwtDecode(token.value);
    //   // const user = await getUserById(decodedToken.id);
    //   // if (!user) {
    //   //   return new Response("Unauthorized", { status: 401 });
    //   // }
    // } catch (error) {
    //   return new Response("Unauthorized", { status: 401 });
    // }
  }

  return next();
});
