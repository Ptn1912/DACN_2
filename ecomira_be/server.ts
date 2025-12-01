// Custom server with Socket.IO support
// Run with: npm run socket or npx ts-node server.ts

import { createServer } from "http"
import { parse } from "url"
import next from "next"
import { Server as SocketIOServer } from "socket.io"

const dev = process.env.NODE_ENV !== "production"
const hostname = "0.0.0.0"
const port = Number.parseInt(process.env.PORT || "3000", 10)

const app = next({ dev, hostname: "localhost", port })
const handle = app.getRequestHandler()

interface OnlineUser {
  odId: number
  socketId: string
  userType: "customer" | "seller"
}

const onlineUsers = new Map<number, OnlineUser>()
let odId = 1

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true)
    handle(req, res, parsedUrl)
  })

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["polling", "websocket"],
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000,
  })

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id)

    // User joins
    socket.on("user:join", (data: { userId: number; userType: "customer" | "seller" }) => {
      const { userId, userType } = data
      onlineUsers.set(userId, {
        odId: odId++,
        socketId: socket.id,
        userType,
      })

      socket.join(`user:${userId}`)
      console.log(`User ${userId} (${userType}) joined`)

      // Broadcast online status to all
      io.emit("user:online", { userId, isOnline: true })
    })

    // Join conversation room
    socket.on("conversation:join", (conversationId: number) => {
      socket.join(`conversation:${conversationId}`)
      console.log(`Socket ${socket.id} joined conversation:${conversationId}`)
    })

    // Leave conversation room
    socket.on("conversation:leave", (conversationId: number) => {
      socket.leave(`conversation:${conversationId}`)
    })

    // Send message
    socket.on(
      "message:send",
      (data: {
        conversationId: number
        senderId: number
        receiverId: number
        content: string
        messageType?: string
        productId?: number
        tempId?: string
        senderType?: string
        senderName?: string
      }) => {
        const messageData = {
          ...data,
          id: `temp_${Date.now()}`,
          timestamp: new Date().toISOString(),
          text: data.content,
          isRead: false,
        }

        // Emit to conversation room
        io.to(`conversation:${data.conversationId}`).emit("message:new", messageData)

        // Emit notification to receiver
        io.to(`user:${data.receiverId}`).emit("message:notification", {
          conversationId: data.conversationId,
          senderId: data.senderId,
          senderName: data.senderName,
          content: data.content,
          timestamp: messageData.timestamp,
        })
      },
    )

    // Typing indicators
    socket.on("typing:start", (data: { conversationId: number; userId: number; userName?: string }) => {
      socket.to(`conversation:${data.conversationId}`).emit("typing:start", data)
    })

    socket.on("typing:stop", (data: { conversationId: number; userId: number }) => {
      socket.to(`conversation:${data.conversationId}`).emit("typing:stop", data)
    })

    // Read receipt
    socket.on("message:read", (data: { conversationId: number; userId: number }) => {
      socket.to(`conversation:${data.conversationId}`).emit("message:read", {
        ...data,
        readAt: new Date().toISOString(),
      })
    })

    // Get online users
    socket.on("users:online:get", (userIds: number[]) => {
      const onlineStatus: Record<number, boolean> = {}
      userIds.forEach((id) => {
        onlineStatus[id] = onlineUsers.has(id)
      })
      socket.emit("users:online:status", onlineStatus)
    })

    // Disconnect
    socket.on("disconnect", () => {
      for (const [userId, user] of onlineUsers.entries()) {
        if (user.socketId === socket.id) {
          onlineUsers.delete(userId)
          io.emit("user:online", { userId, isOnline: false })
          console.log(`User ${userId} disconnected`)
          break
        }
      }
    })
  })

  httpServer.listen(port, hostname, () => {
    console.log(`> Ready on http://localhost:${port}`)
    console.log(`> Socket.IO server running on all interfaces (0.0.0.0:${port})`)
    console.log(`> For mobile device, use your computer's IP address`)
  })
})
