import { HttpAdapter } from "@core/http/http.adapter";

export class HttpService {
  private adapter: HttpAdapter;

  constructor(adapter: HttpAdapter) {
    this.adapter = adapter;
  }

  get<T>(url: string): Promise<T> {
    return this.adapter.get<T>(url);
  }

  post<T>(url: string, data: unknown): Promise<T> {
    return this.adapter.post<T>(url, data);
  }

  put<T>(url: string, data: unknown): Promise<T> {
    return this.adapter.put<T>(url, data);
  }

  patch<T>(url: string, data: unknown): Promise<T> {
    return this.adapter.patch<T>(url, data);
  }

  delete<T>(url: string): Promise<T> {
    return this.adapter.delete<T>(url);
  }
}
