import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * GET /api/reviews?productId=1&page=1&limit=10
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = Number(searchParams.get("productId"));
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);
    const skip = (page - 1) * limit;

    if (!productId || Number.isNaN(productId)) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { productId },
        include: {
          user: { select: { id: true, fullName: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.review.count({ where: { productId } }),
    ]);

    return NextResponse.json({
      reviews,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (e) {
    console.error("Get reviews error:", e);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

/**
 * POST /api/reviews
 * body: { productId, orderId, userId, rating, comment?, images? }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, orderId, userId, rating, comment, images } = body as {
      productId: number;
      orderId: number;
      userId: number;
      rating: number;
      comment?: string;
      images?: string[];
    };

    if (!productId || !orderId || !userId || !rating) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be 1..5" }, { status: 400 });
    }

    // 1) order phải delivered + đúng customer
    const order = await prisma.order.findFirst({
      where: { id: orderId, customerId: userId, status: "delivered" },
      include: { items: true },
    });
    if (!order) {
      return NextResponse.json(
        { error: "Bạn chỉ có thể đánh giá khi đơn hàng đã giao và thuộc về bạn." },
        { status: 403 }
      );
    }

    // 2) product phải nằm trong order
    const hasProduct = order.items.some((it) => it.productId === productId);
    if (!hasProduct) {
      return NextResponse.json({ error: "Sản phẩm không thuộc đơn hàng này." }, { status: 403 });
    }

    // 3) transaction: create review + update rating avg + ratingCount
    const result = await prisma.$transaction(async (tx) => {
      const created = await tx.review.create({
        data: {
          productId,
          orderId,
          userId,
          rating,
          comment: comment?.trim() || null,
          images: Array.isArray(images) ? images : [],
        },
      });

      // Tính lại ratingAvg + ratingCount từ DB (chuẩn nhất)
      const agg = await tx.review.aggregate({
        where: { productId },
        _avg: { rating: true },
        _count: { rating: true },
      });

      const avg = Number(agg._avg.rating || 0);
      const count = agg._count.rating || 0;

      await tx.product.update({
        where: { id: productId },
        data: {
          rating: avg,
          ratingCount: count,
        },
      });

      return created;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (e: any) {
    console.error("Create review error:", e);

    // Unique constraint: user đã review product này trong order này
    if (e?.code === "P2002") {
      return NextResponse.json({ error: "Bạn đã đánh giá sản phẩm này rồi." }, { status: 409 });
    }

    return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
  }
}
