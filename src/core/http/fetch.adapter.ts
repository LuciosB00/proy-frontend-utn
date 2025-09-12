import { HttpAdapter } from "@core/http/http.adapter";

export class FetchAdapter implements HttpAdapter {
  async get<T>(url: string): Promise<T> {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.getCookie("token")}`,
      },
    });

    if (!response.ok) {
      throw await response.json();
    }
    return (await response.json()) as T;
  }

  async post<T>(url: string, data: unknown): Promise<T> {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.getCookie("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw await response.json();
    }
    return (await response.json()) as T;
  }

  async put<T>(url: string, data: unknown): Promise<T> {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${this.getCookie("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw await response.json();
    }
    return (await response.json()) as T;
  }

  async patch<T>(url: string, data: unknown): Promise<T> {
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${this.getCookie("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw await response.json();
    }
    return (await response.json()) as T;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.getCookie("token")}`,
      },
      method: "DELETE",
    });

    if (!response.ok) {
      throw await response.json();
    }
    return (await response.json()) as T;
  }

  private getCookie(name: string): string {
    const match = document.cookie.match(
      new RegExp("(^| )" + name + "=([^;]+)"),
    );
    return match ? match[2] : "";
  }
}
