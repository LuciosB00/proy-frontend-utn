// **Interfaz HttpClient:** Define los métodos HTTP esperados
interface HttpClient {
  get<T>(url: string): Promise<T>;
  post<T>(url: string, data: unknown): Promise<T>;
  put<T>(url: string, data: unknown): Promise<T>;
  patch<T>(url: string, data: unknown): Promise<T>;
  delete<T>(url: string): Promise<T>;
}

// **Clase base abstracta HttpAdapter:** Proporciona una estructura común para los adaptadores
export abstract class HttpAdapter implements HttpClient {
  abstract get<T>(url: string): Promise<T>;
  abstract post<T>(url: string, data: unknown): Promise<T>;
  abstract put<T>(url: string, data: unknown): Promise<T>;
  abstract patch<T>(url: string, data: unknown): Promise<T>;
  abstract delete<T>(url: string): Promise<T>;
}
