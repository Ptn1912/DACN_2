import api from "./api";

export const notificationService = {
  getNotifications: (userId: number) => {
    return api.get(`/notifications?userId=${userId}`);
  },

  markAsRead: (id: string) => {
    return api.put(`/notifications/mark-read`, { id });
  },

  markAllAsRead: (userId: number) => {
    return api.put(`/notifications/mark-all?userId=${userId}`);
  },

  deleteNotification: (id: string) => {
    return api.delete(`/notifications?id=${id}`);
  }
};