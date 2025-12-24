import api from "./api";

export interface Review {
  id: number;
  productId: number;
  userId: number;
  orderId: number;
  rating: number;
  comment?: string | null;
  images: string[];
  createdAt: string;
  user?: { id: number; fullName: string };
}

export const reviewService = {
  async getReviewsByProduct(productId: number, params?: { page?: number; limit?: number }) {
    const qp = new URLSearchParams();
    qp.append("productId", String(productId));
    if (params?.page) qp.append("page", String(params.page));
    if (params?.limit) qp.append("limit", String(params.limit));

    const res = await api.get(`/reviews?${qp.toString()}`);
    return { success: true, data: res.data } as const;
  },

  async createReview(data: {
    productId: number;
    orderId: number;
    userId: number;
    rating: number;
    comment?: string;
    images?: string[];
  }) {
    const res = await api.post("/reviews", data);
    return { success: true, data: res.data } as const;
  },
};