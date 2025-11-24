import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function generateOrderNumber(): string {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD${timestamp}${random}`;
}

// --- GET: Lấy danh sách đơn hàng ---
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = parseInt(searchParams.get('userId') || '0');
    const userType = searchParams.get('userType') || 'customer';
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const where: any = {};

    if (userType === 'customer') {
      where.customerId = userId;
    } else if (userType === 'seller') {
      where.items = {
        some: {
          sellerId: userId,
        },
      };
    }

    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: { select: { id: true, name: true, images: true } },
              seller: { select: { id: true, fullName: true } },
            },
          },
          customer: { select: { id: true, fullName: true, phone: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// --- POST: Tạo đơn hàng mới ---
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerId,
      items,
      shippingName,
      shippingPhone,
      shippingAddress,
      paymentMethod,
      note,
      advancePaymentAmount = 0,
    } = body;

    if (!customerId || !items || items.length === 0 || !shippingName || !shippingPhone || !shippingAddress) {
      return NextResponse.json({ error: 'Missing required fields or shipping information' }, { status: 400 });
    }

    if (!shippingName || !shippingPhone || !shippingAddress) {
      return NextResponse.json(
        { error: 'Missing shipping information' },
        { status: 400 }
      );
    }

    
    // Verify customer exists
    const customer = await prisma.user.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Verify all products exist and have enough stock
    const productIds = items.map((item: any) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { seller: { select: { id: true } } } 
    });

    if (products.length !== productIds.length) {
      return NextResponse.json({ error: 'Some products not found' }, { status: 404 });
    }

    let totalAmount = 0;
    const orderItems = items.map((item: any) => {
      const product = products.find((p: any) => p.id === item.productId);

      if (!product || product.stock < item.quantity) {
        throw new Error(`Product "${product?.name || item.productId}" has insufficient stock`);
      }

      const subtotal = Number(product!.price) * item.quantity;
      totalAmount += subtotal;

      return {
        productId: item.productId,
        sellerId: product!.sellerId,
        productName: product!.name,
        price: product!.price,
        quantity: item.quantity,
        subtotal,
        image: product!.images[0] || null,
      };
    });

    const shippingFee = 30000;
    totalAmount += shippingFee;

    // 4. THỰC HIỆN TRANSACTION (Đảm bảo tạo đơn hàng và cập nhật tồn kho thành công đồng thời)
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          customerId,
          totalAmount,
          shippingFee,
          paymentMethod: paymentMethod || 'cod',
          shippingName,
          shippingPhone,
          shippingAddress,
          note,
          items: { create: orderItems },
        },
        include: { items: true },
      });

      // B. Cập nhật tồn kho và số lượng đã bán
      const updatePromises = items.map((item: any) =>
        tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
            soldCount: { increment: item.quantity },
          },
        })
      );

      await Promise.all(updatePromises);

      return newOrder;
    });

    // 5. Gửi thông báo DB
    const notifiedSellers = new Set<number>();
    for (const item of order.items) {
      if (!notifiedSellers.has(item.sellerId)) {
        const title = "Đơn hàng mới";
        const message = `Bạn có đơn hàng mới #${order.orderNumber}`;

        // Tạo thông báo DB
        await prisma.notification.create({
          data: { userId: item.sellerId, type: "order", title: title, message: message, actionUrl: `/orders/${order.id}` },
        });

        notifiedSellers.add(item.sellerId);
      }
    }

    // 6. Lấy lại đơn hàng với đủ thông tin include cho response
    const finalOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        items: { include: { product: true, seller: { select: { id: true, fullName: true } } } },
        customer: { select: { id: true, fullName: true, phone: true } },
      }
    });

    return NextResponse.json(finalOrder, { status: 201 });
  } catch (error: any) {
    console.error('Create order error:', error);
    if (error.message.includes('insufficient stock')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}