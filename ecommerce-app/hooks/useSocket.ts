"use client"

// Socket.IO Hook for React Native

import { useEffect, useRef, useCallback, useState } from "react"
import { io, type Socket } from "socket.io-client"
import { useAuth } from "./useAuth"

// Socket URL configuration
const getSocketUrl = () => {
  if (process.env.EXPO_PUBLIC_SOCKET_URL) {
    return process.env.EXPO_PUBLIC_SOCKET_URL
  }
  // Default: Change this to your computer's IP for physical devices
  // Android Emulator: http://10.0.2.2:3000
  // iOS Simulator: http://localhost:3000
  // Physical Device: http://YOUR_IP:3000
  return "http://10.0.2.2:3000"
}

const SOCKET_URL = getSocketUrl()

interface UseSocketOptions {
  autoConnect?: boolean
}

export const useSocket = (options: UseSocketOptions = { autoConnect: true }) => {
  const { user } = useAuth()
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  // Connect to socket server
  const connect = useCallback(() => {
    if (socketRef.current?.connected) return

    console.log("[useSocket] Connecting to:", SOCKET_URL)

    socketRef.current = io(SOCKET_URL, {
      transports: ["polling", "websocket"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      forceNew: true,
    })

    socketRef.current.on("connect", () => {
      console.log("[useSocket] Connected:", socketRef.current?.id)
      setIsConnected(true)
      setConnectionError(null)

      // Auto join with user info
      if (user?.id) {
        socketRef.current?.emit("user:join", {
          userId: user.id,
          userType: user.userType,
        })
      }
    })

    socketRef.current.on("disconnect", (reason: string) => {
      console.log("[useSocket] Disconnected:", reason)
      setIsConnected(false)
    })

    socketRef.current.on("connect_error", (error: Error) => {
      console.error("[useSocket] Connection error:", error.message)
      console.error("[useSocket] Make sure backend is running with: npm run socket")
      setConnectionError(error.message)
      setIsConnected(false)
    })
  }, [user])

  // Disconnect from socket server
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
      setIsConnected(false)
    }
  }, [])

  // Emit event to server
  const emit = useCallback((event: string, data?: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data)
    } else {
      console.warn("[useSocket] Not connected, cannot emit:", event)
    }
  }, [])

  // Listen to event from server
  const on = useCallback((event: string, callback: (...args: any[]) => void) => {
    socketRef.current?.on(event, callback)
    return () => {
      socketRef.current?.off(event, callback)
    }
  }, [])

  // Remove event listener
  const off = useCallback((event: string, callback?: (...args: any[]) => void) => {
    if (callback) {
      socketRef.current?.off(event, callback)
    } else {
      socketRef.current?.removeAllListeners(event)
    }
  }, [])

  // Join a conversation room
  const joinConversation = useCallback(
    (conversationId: number | string) => {
      emit("conversation:join", Number(conversationId))
    },
    [emit],
  )

  // Leave a conversation room
  const leaveConversation = useCallback(
    (conversationId: number | string) => {
      emit("conversation:leave", Number(conversationId))
    },
    [emit],
  )

  // Auto connect on mount
  useEffect(() => {
    if (options.autoConnect && user?.id) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [options.autoConnect, user?.id, connect, disconnect])

  return {
    socket: socketRef.current,
    isConnected,
    connectionError,
    connect,
    disconnect,
    emit,
    on,
    off,
    joinConversation,
    leaveConversation,
  }
}