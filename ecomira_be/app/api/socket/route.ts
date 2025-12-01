// Socket.IO API endpoint info

import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    message: "Socket.IO server is running on a separate process",
    info: "Connect to ws://YOUR_SERVER_URL for real-time chat",
    events: {
      client: [
        "user:join - Join with userId and userType",
        "conversation:join - Join a conversation room",
        "conversation:leave - Leave a conversation room",
        "message:send - Send a new message",
        "typing:start - Start typing indicator",
        "typing:stop - Stop typing indicator",
        "message:read - Mark messages as read",
      ],
      server: [
        "user:online - User online status change",
        "message:new - New message received",
        "message:notification - Message notification",
        "typing:start - Someone started typing",
        "typing:stop - Someone stopped typing",
        "message:read - Messages marked as read",
      ],
    },
  })
}
