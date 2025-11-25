import api from "./api";

export const chatService = {
  async sendMessage(sellerId: number, message: string) {
    try {
      const res = await api.post("/seller/chat", { sellerId, message });
      return { success: true, reply: res.data.reply };
    } catch (err: any) {
      return {
        success: false,
        error: err.response?.data?.error || "Không thể gửi tin nhắn",
      };
    }
  },
};
