import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
// Đã loại bỏ: import { Expo } from 'expo-server-sdk'; 

const prisma = new PrismaClient();
// Đã loại bỏ: const expo = new Expo();

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

    // Cần include customer để lấy customerId cho việc tạo Notification
    const oldOrder = await prisma.order.findUnique({ where: { id: orderId } });
    if (!oldOrder) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    // 1. Cập nhật trạng thái đơn hàng
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { ...(status && { status }), ...(paymentStatus && { paymentStatus }) },
      include: { customer: true },
    });

    // Nếu trạng thái thay đổi, tạo thông báo DB cho người mua
    if (status && status !== oldOrder.status) {
      const title = 'Cập nhật đơn hàng';
      const message = `Đơn hàng #${updatedOrder.orderNumber} đã được cập nhật: ${status}`;
      const actionUrl = `/orders/${updatedOrder.id}`;

      // Tạo thông báo DB
      await prisma.notification.create({
        data: {
          userId: updatedOrder.customerId,
          type: 'order',
          title: title,
          message: message,
          actionUrl: actionUrl,
        },
      });

      // Đã loại bỏ hoàn toàn khối code gửi Push Notification cho người mua.
    }

    // Nếu paymentStatus thay đổi, tạo thông báo DB cho người mua
    if (paymentStatus && paymentStatus !== oldOrder.paymentStatus) {
      // Tạo thông báo DB
      await prisma.notification.create({
        data: {
          userId: updatedOrder.customerId,
          type: 'order',
          title: 'Cập nhật thanh toán',
          message: `Thanh toán đơn hàng #${updatedOrder.orderNumber} đã được cập nhật: ${paymentStatus}`,
          actionUrl: `/orders/${updatedOrder.id}`,
        },
      });
    }

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
  const orderId = parseInt(await resolvedParams.id);

  if (isNaN(orderId)) {
    return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
  }

  try {
    const oldOrder = await prisma.order.findUnique({ where: { id: orderId } });
    if (!oldOrder) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    const cancelledOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'cancelled' },
      include: { customer: true },
    });

    // Thông báo DB cho người mua (giữ nguyên)
    await prisma.notification.create({
      data: {
        userId: cancelledOrder.customerId,
        type: 'order',
        title: 'Đơn hàng bị hủy',
        message: `Đơn hàng #${cancelledOrder.orderNumber} đã bị hủy.`,
        actionUrl: `/orders/${cancelledOrder.id}`,
      },
    });

    return NextResponse.json(cancelledOrder, { status: 200 });
  } catch (error: any) {
    console.error('API Order Cancel Error:', error);
    return NextResponse.json(
      { error: error.code === 'P2025' ? 'Order not found' : 'Failed to cancel order' },
      { status: 500 }
    );
  }
}