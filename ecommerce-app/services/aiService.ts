import api from "./api";

export const aiService = {
  async getBusinessRecommendation(sellerId: number) {
    try {
      const res = await api.post("/seller", { sellerId });

      return {
        success: true,
        data: res.data.recommendation,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.response?.data?.error || "Không thể tải đề xuất AI",
      };
    }
  },
};
