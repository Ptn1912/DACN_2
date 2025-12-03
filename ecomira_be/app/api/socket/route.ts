// GET /api/socket - Socket.IO events documentation

import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    info: "Socket.IO Real-time Chat Server",
    events: {
      client: {
        "user:join": "Join with userId and userType",
        "conversation:join": "Join a conversation room",
        "conversation:leave": "Leave a conversation room",
        "message:send": "Send a message",
        "typing:start": "Start typing indicator",
        "typing:stop": "Stop typing indicator",
        "message:read": "Mark messages as read",
        "users:online:get": "Get online status of users",
      },
      server: {
        "user:online": "User online status changed",
        "message:new": "New message received",
        "message:notification": "Message notification for receiver",
        "typing:start": "Someone is typing",
        "typing:stop": "Someone stopped typing",
        "message:read": "Message was read",
        "users:online:status": "Online status of requested users",
      },
    },
    usage: {
      note: "Run the Socket.IO server with: npm run socket",
      url: "http://YOUR_SERVER_IP:3000",
    },
  })
}