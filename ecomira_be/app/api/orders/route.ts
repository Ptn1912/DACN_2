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
      coinDiscount = 0, // Nhận coin discount từ frontend
    } = body;

    if (!customerId || !items || items.length === 0 || !shippingName || !shippingPhone || !shippingAddress) {
      return NextResponse.json({ error: 'Missing required fields or shipping information' }, { status: 400 });
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

    let subtotal = 0;
    const orderItems = items.map((item: any) => {
      const product = products.find((p: any) => p.id === item.productId);

      if (!product || product.stock < item.quantity) {
        throw new Error(`Product "${product?.name || item.productId}" has insufficient stock`);
      }

      const itemSubtotal = Number(product!.price) * item.quantity;
      subtotal += itemSubtotal;

      return {
        productId: item.productId,
        sellerId: product!.sellerId,
        productName: product!.name,
        price: product!.price,
        quantity: item.quantity,
        subtotal: itemSubtotal,
        image: product!.images[0] || null,
      };
    });

    const shippingFee = 30000;
    
    // QUAN TRỌNG: Tính totalAmount sau khi trừ coinDiscount
    const totalAmount = Math.max(0, subtotal + shippingFee - coinDiscount);

    console.log('💰 Order calculation:', {
      subtotal,
      shippingFee,
      coinDiscount,
      totalAmount
    });

    // Thực hiện transaction
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
          note: note || '',
          items: { create: orderItems },
        },
        include: { items: true },
      });

      // Cập nhật tồn kho và số lượng đã bán
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

    // Gửi thông báo cho sellers
    const notifiedSellers = new Set<number>();
    for (const item of order.items) {
      if (!notifiedSellers.has(item.sellerId)) {
        const title = "Đơn hàng mới";
        const message = `Bạn có đơn hàng mới #${order.orderNumber}`;

        await prisma.notification.create({
          data: { 
            userId: item.sellerId, 
            type: "order", 
            title: title, 
            message: message, 
            actionUrl: `/orders/${order.id}` 
          },
        });

        notifiedSellers.add(item.sellerId);
      }
    }

    // Lấy lại đơn hàng với đủ thông tin
    const finalOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        items: { 
          include: { 
            product: true, 
            seller: { select: { id: true, fullName: true } } 
          } 
        },
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