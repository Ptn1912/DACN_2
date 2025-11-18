// app/api/orders/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'shipping'
  | 'delivered'
  | 'cancelled'
  | 'returned';

type PaymentStatus = 'unpaid' | 'paid' | 'refunded';

/**
 * GET /api/orders/[id] - Lấy chi tiết đơn hàng
 */
export async function GET(
  request: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  const resolvedParams = await context.params;
  const orderId = parseInt(resolvedParams.id);

  if (isNaN(orderId)) {
    return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, images: true } },
            seller: { select: { id: true, fullName: true } },
          },
        },
        customer: { select: { id: true, fullName: true, phone: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    console.error('Get order detail error:', error);
    return NextResponse.json({ error: 'Failed to fetch order detail' }, { status: 500 });
  }
}

/**
 * PUT /api/orders/[id] - Cập nhật trạng thái đơn hàng
 */
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  const resolvedParams = await context.params;
  const orderId = parseInt(resolvedParams.id);

  if (isNaN(orderId)) {
    console.error("Order ID is NaN:", resolvedParams.id);
    return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { status, paymentStatus }: { status: OrderStatus; paymentStatus?: PaymentStatus } = body;

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status, ...(paymentStatus && { paymentStatus }) },
    });

    return NextResponse.json(updatedOrder, { status: 200 });
  } catch (error: any) {
    console.error('API Order Update Error:', error);
    return NextResponse.json(
      { error: error.code === 'P2025' ? 'Order not found' : 'Failed to update order' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/orders/[id] - Hủy đơn hàng
 */
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  const resolvedParams = await context.params;
  const orderId = parseInt(resolvedParams.id);

  if (isNaN(orderId)) {
    return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
  }

  try {
    const cancelledOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'cancelled' },
    });

    // TODO: Hoàn trả tồn kho nếu cần

    return NextResponse.json(cancelledOrder, { status: 200 });
  } catch (error: any) {
    console.error('API Order Cancel Error:', error);
    return NextResponse.json(
      { error: error.code === 'P2025' ? 'Order not found' : 'Failed to cancel order' },
      { status: 500 }
    );
  }
}

