import { NextResponse, NextRequest } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { prisma } from "@/lib/prisma";

const ai = new GoogleGenAI({}); 

const formatDataToText = (data: any, title: string) => {
  if (!data || data.length === 0) {
    return `${title}: Không có dữ liệu.\n`;
  }
  return `${title}:\n${JSON.stringify(data, null, 2)}\n`;
};

export async function POST(req: NextRequest) {
  try {
    const { message, sellerId } = await req.json();

    if (!sellerId || !message) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // --- 1. Truy vấn Dữ liệu ---

    // Lấy thông tin người bán (User)
    const seller = await prisma.user.findUnique({
        where: { id: sellerId, userType: 'seller' },
        select: { fullName: true, email: true, createdAt: true }
    });

    // Lấy danh sách sản phẩm (Product) của người bán, giới hạn 5 sản phẩm gần đây nhất
    const products = await prisma.product.findMany({
        where: { sellerId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { name: true, price: true, stock: true, soldCount: true, category: { select: { name: true } } }
    });

    // Lấy danh sách 5 đơn hàng (Order) gần đây nhất mà người bán này có sản phẩm
    const recentOrders = await prisma.order.findMany({
        where: {
            items: {
                some: { sellerId } 
            }
        },
        orderBy: { createdAt: 'desc' },
        take: 15,
        select: { orderNumber: true, totalAmount: true, status: true, createdAt: true }
    });
    
    // --- 2. Chuẩn bị System Prompt với Dữ liệu Toàn bộ ---
    const sellerInfo = formatDataToText(seller, "Thông tin Người bán");
    const productInfo = formatDataToText(products, "5 Sản phẩm gần nhất");
    const orderInfo = formatDataToText(recentOrders, "5 Đơn hàng gần đây có sản phẩm của Shop");

    const fullDataPrompt = `
    ${sellerInfo}
    ${productInfo}
    ${orderInfo}
    `;

    const systemPrompt = `
Bạn là trợ lý AI phân tích dữ liệu bán hàng, trả lời ngắn gọn, rõ ràng, trực tiếp bằng tiếng Việt, không quá công nghiệp.
Bạn phải dùng các thông tin trong mục Dữ liệu được cung cấp để trả lời các câu hỏi về thống kê, bán hàng hoặc thông tin cửa hàng.
Nếu dữ liệu không đủ, hãy nói rõ ràng.

Dữ liệu Cửa hàng Cụ thể (JSON format):
---
${fullDataPrompt}
---
`;
    
    // --- 3. Gọi Gemini API =
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
      },
      contents: [{ role: "user", parts: [{ text: message }] }],
    });

    const reply = result.text ?? "Không có phản hồi từ AI.";

    return NextResponse.json({
      success: true,
      reply,
    });
  } catch (error) {
    console.error("Chatbot error:", error); 
    return NextResponse.json({ error: "Chatbot internal error" }, { status: 500 });
  }
}