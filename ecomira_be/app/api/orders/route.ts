import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Generate unique order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD${timestamp}${random}`;
}

// GET /api/orders - Get orders (customer: their orders, seller: orders containing their products)
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

    let where: any = {};

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
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                },
              },
              seller: {
                select: {
                  id: true,
                  fullName: true,
                },
              },
            },
          },
          customer: {
            select: {
              id: true,
              fullName: true,
              phone: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
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

// POST /api/orders - Create new order
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

    // Validation
    if (!customerId || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
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
      where: {
        id: { in: productIds },
      },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { error: 'Some products not found' },
        { status: 404 }
      );
    }

    // Check stock availability
    for (const item of items) {
      const product = products.find((p: any) => p.id === item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found` },
          { status: 404 }
        );
      }
      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Product "${product.name}" has insufficient stock` },
          { status: 400 }
        );
      }
    }

    // Calculate totals
    let totalAmount = 0;
    const orderItems = items.map((item: any) => {
      const product = products.find((p: any) => p.id === item.productId);
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

    // Create order with items
    const order = await prisma.order.create({
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
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: {
            product: true,
            seller: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
        },
        customer: {
          select: {
            id: true,
            fullName: true,
            phone: true,
          },
        },
      },
    });

    // Update product stock and sold count
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
          soldCount: {
            increment: item.quantity,
          },
        },
      });
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}