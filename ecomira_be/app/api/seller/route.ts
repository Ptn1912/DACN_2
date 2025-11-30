import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { prisma } from "@/lib/prisma";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const { sellerId } = await req.json();
    if (!sellerId) {
      return NextResponse.json({ error: "Missing sellerId" }, { status: 400 });
    }
    //lay database
    const [
      products,
      recentOrders,
      totalSalesToday,
      totalOrdersToday,
      lowStockCount,
    ] = await Promise.all([

      prisma.product.findMany({
        where: { sellerId, isActive: true },
        include: { orderItems: true },
      }),

      prisma.order.findMany({
        where: {
          items: { some: { sellerId } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { items: true },
      }),

      prisma.order.aggregate({
        where: {
          items: { some: { sellerId } },
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
        _sum: { totalAmount: true },
      }),

      prisma.order.count({
        where: {
          items: { some: { sellerId } },
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),

      prisma.product.count({
        where: { sellerId, stock: { lt: 5 } },
      }),
    ]);

    // chuan hoa du lieu
    const stats = {
      totalProducts: products.length,
      totalOrdersToday,
      totalSalesToday: Number(totalSalesToday._sum.totalAmount || 0),
      lowStockCount,
      avgRating:
        products.length > 0
          ? products.reduce((s, p) => s + Number(p.rating || 0), 0) /
            products.length
          : 0,
      topSelling: products
        .sort((a, b) => b.soldCount - a.soldCount)
        .slice(0, 3)
        .map((p) => ({ name: p.name, sold: p.soldCount })),
      poorSelling: products
        .sort((a, b) => a.soldCount - b.soldCount)
        .slice(0, 3)
        .map((p) => ({ name: p.name, sold: p.soldCount })),
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        totalAmount: o.totalAmount,
        status: o.status,
        items: o.items.length,
      })),
    };

    // tao prompt
    const prompt = `
Bạn là chuyên gia phân tích dữ liệu thương mại điện tử.
Hãy phân tích và đưa ra 3 gợi ý chiến lược giúp người bán tăng doanh thu.

DỮ LIỆU NGƯỜI BÁN:
----------------------------------
- Tổng sản phẩm: ${stats.totalProducts}
- Đơn hôm nay: ${stats.totalOrdersToday}
- Doanh số hôm nay: ${stats.totalSalesToday.toLocaleString("vi-VN")}đ
- Sản phẩm sắp hết hàng (<5): ${stats.lowStockCount}
- Rating trung bình: ${stats.avgRating.toFixed(2)}

TOP SẢN PHẨM BÁN CHẠY:
${stats.topSelling
  .map((p) => `• ${p.name}: ${p.sold} sold`)
  .join("\n")}

SẢN PHẨM BÁN CHẬM:
${stats.poorSelling
  .map((p) => `• ${p.name}: ${p.sold} sold`)
  .join("\n")}

ĐƠN GẦN ĐÂY:
${stats.recentOrders
  .map(
    (o) =>
      `• Đơn ${o.id} - ${o.items} SP - ${o.status} - ${o.totalAmount}đ`
  )
  .join("\n")}
----------------------------------

YÊU CẦU TRẢ LỜI:
- Viết bằng tiếng Việt
- Viết ngắn gọn, rõ ràng
- Trình bày 3 giải pháp dưới dạng bullet point
- Đưa giải pháp hành động ngay (actionable)
- Tập trung vào: tối ưu kho hàng, tăng doanh số, cải thiện trải nghiệm khách hàng
`;
    // goi gemini
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const answer = await result.text;

    return NextResponse.json({ success: true, recommendation: answer });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "AI analysis failed" },
      { status: 500 }
    );
  }
}