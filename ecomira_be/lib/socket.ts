// Socket.IO Server Configuration
import { Server as SocketIOServer } from "socket.io"
import type { Server as HTTPServer } from "http"

interface OnlineUser {
  odId: number
  socketId: string
  userType: "customer" | "seller"
}

class SocketService {
  private io: SocketIOServer | null = null
  private onlineUsers: Map<number, OnlineUser> = new Map()

  initialize(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
      transports: ["websocket", "polling"],
    })

    this.io.on("connection", (socket) => {
      console.log("New client connected:", socket.id)

      // User joins with their userId
      socket.on("user:join", (data: { userId: number; userType: "customer" | "seller" }) => {
        const { userId, userType } = data
        const odId = userId // Declare odId variable here
        this.onlineUsers.set(userId, {
          odId,
          socketId: socket.id,
          userType,
        })

        // Join user's personal room
        socket.join(`user:${userId}`)
        console.log(`User ${userId} (${userType}) joined`)

        // Broadcast online status
        this.io?.emit("user:online", { userId, isOnline: true })
      })

      // Join a conversation room
      socket.on("conversation:join", (conversationId: number) => {
        socket.join(`conversation:${conversationId}`)
        console.log(`Socket ${socket.id} joined conversation:${conversationId}`)
      })

      // Leave a conversation room
      socket.on("conversation:leave", (conversationId: number) => {
        socket.leave(`conversation:${conversationId}`)
        console.log(`Socket ${socket.id} left conversation:${conversationId}`)
      })

      // Handle new message
      socket.on(
        "message:send",
        async (data: {
          conversationId: number
          senderId: number
          receiverId: number
          content: string
          messageType?: string
          productId?: number
          tempId?: string
        }) => {
          const { conversationId, senderId, receiverId, content, messageType, productId, tempId } = data

          // Emit to conversation room (both sender and receiver in the conversation)
          this.io?.to(`conversation:${conversationId}`).emit("message:new", {
            ...data,
            createdAt: new Date().toISOString(),
          })

          // Also emit to receiver's personal room in case they're not in the conversation
          this.io?.to(`user:${receiverId}`).emit("message:notification", {
            conversationId,
            senderId,
            content,
            createdAt: new Date().toISOString(),
          })
        },
      )

      // Handle typing indicator
      socket.on("typing:start", (data: { conversationId: number; userId: number }) => {
        socket.to(`conversation:${data.conversationId}`).emit("typing:start", {
          userId: data.userId,
          conversationId: data.conversationId,
        })
      })

      socket.on("typing:stop", (data: { conversationId: number; userId: number }) => {
        socket.to(`conversation:${data.conversationId}`).emit("typing:stop", {
          userId: data.userId,
          conversationId: data.conversationId,
        })
      })

      // Handle read receipt
      socket.on("message:read", (data: { conversationId: number; userId: number }) => {
        socket.to(`conversation:${data.conversationId}`).emit("message:read", {
          conversationId: data.conversationId,
          userId: data.userId,
          readAt: new Date().toISOString(),
        })
      })

      // Handle disconnect
      socket.on("disconnect", () => {
        // Find and remove the disconnected user
        for (const [userId, user] of this.onlineUsers.entries()) {
          if (user.socketId === socket.id) {
            this.onlineUsers.delete(userId)
            this.io?.emit("user:online", { userId, isOnline: false })
            console.log(`User ${userId} disconnected`)
            break
          }
        }
      })
    })

    return this.io
  }

  getIO() {
    return this.io
  }

  isUserOnline(userId: number): boolean {
    return this.onlineUsers.has(userId)
  }

  getOnlineUsers(): number[] {
    return Array.from(this.onlineUsers.keys())
  }

  // Emit message to specific conversation
  emitToConversation(conversationId: number, event: string, data: any) {
    this.io?.to(`conversation:${conversationId}`).emit(event, data)
  }

  // Emit to specific user
  emitToUser(userId: number, event: string, data: any) {
    this.io?.to(`user:${userId}`).emit(event, data)
  }
}

export const socketService = new SocketService()
