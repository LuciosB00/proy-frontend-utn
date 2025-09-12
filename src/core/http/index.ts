import { FetchAdapter } from "@core/http/fetch.adapter";
import { HttpService } from "@core/http/http.service";

export const http = new HttpService(new FetchAdapter());
