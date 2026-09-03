export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const getAuthHeaders = () => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("dms_token");
    if (token) {
      // Remove any extra quotes if token was JSON stringified
      const cleanToken = token.replace(/^"(.*)"$/, '$1');
      headers["Authorization"] = `Bearer ${cleanToken}`;
    }
  }
  
  return headers;
};

export const api = {
  get: async (endpoint: string) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return parseResponse(res);
  },
  
  post: async (endpoint: string, body: any) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });
    return parseResponse(res);
  },
  
  put: async (endpoint: string, body: any) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });
    return parseResponse(res);
  },

  patch: async (endpoint: string, body: any) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });
    return parseResponse(res);
  },
  
  delete: async (endpoint: string) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return parseResponse(res);
  },
};

const parseResponse = async (res: Response) => {
  try {
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "An error occurred");
    }
    return data;
  } catch (error: any) {
    // If it's a JSON parse error but response is ok
    if (res.ok) return { success: true };
    throw error;
  }
};
