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

// Thêm PATCH method vào file app/api/orders/[id]/route.ts

export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await context.params;
    const orderIdentifier = resolvedParams.id; // Có thể là ID hoặc orderNumber
    const body = await request.json();
    const { paymentStatus } = body;

    console.log(`Updating payment status for order ${orderIdentifier} to ${paymentStatus}`);

    if (!paymentStatus) {
      return NextResponse.json(
        { error: 'Payment status is required' },
        { status: 400 }
      );
    }

    // Validate payment status
    const validStatuses = ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'];
    if (!validStatuses.includes(paymentStatus)) {
      return NextResponse.json(
        { error: 'Invalid payment status' },
        { status: 400 }
      );
    }

    // ✅ Tìm đơn hàng bằng orderNumber thay vì id
    const whereClause = isNaN(Number(orderIdentifier))
      ? { orderNumber: orderIdentifier } // Nếu là string (orderNumber)
      : { id: parseInt(orderIdentifier) }; // Nếu là number (id)

    // Update order payment status
    const order = await prisma.order.update({
      where: whereClause,
      data: {
        paymentStatus,
        updatedAt: new Date(),
      },
    });

    console.log(`✅ Order ${orderIdentifier} payment status updated to ${paymentStatus}`);

    return NextResponse.json({
      success: true,
      paymentStatus: order.paymentStatus,
      message: 'Payment status updated successfully',
    });
  } catch (error: any) {
    console.error('Update payment status error:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update payment status' },
      { status: 500 }
    );
  }
}