import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Lấy thông tin khách hàng và giao dịch
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = parseInt(searchParams.get('userId') || '0');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Tìm khách hàng
    const customer = await prisma.sPayLaterCustomer.findUnique({
      where: { userId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          include: { 
            order: {
              select: {
                id: true,
                orderNumber: true,
                totalAmount: true,
              }
            },
            payments: true 
          },
        },
        payments: {
          orderBy: { paymentDate: 'desc' },
          take: 10,
        },
      },
    });

    if (!customer) {
      return NextResponse.json({ 
        registered: false,
        message: 'Chưa đăng ký SPayLater' 
      });
    }

    // Đảm bảo transactions luôn là array
    const result = {
      success: true, 
      registered: true,
      customer: {
        ...customer,
        transactions: customer.transactions || [],
      }
    };


    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Đăng ký / Tạo giao dịch
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, orderId, amount, bankAccount, bankName } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // ====================================
    // ACTION: REGISTER
    // ====================================
    if (action === 'register') {
      // Kiểm tra đã đăng ký chưa
      const existing = await prisma.sPayLaterCustomer.findUnique({
        where: { userId },
      });

      if (existing) {
        return NextResponse.json(
          { error: 'Đã đăng ký SPayLater rồi' },
          { status: 400 }
        );
      }

      // Validation
      if (!bankAccount || !bankName) {
        return NextResponse.json(
          { error: 'Vui lòng cung cấp thông tin ngân hàng' },
          { status: 400 }
        );
      }

      // Tạo tài khoản SPayLater
      const customer = await prisma.sPayLaterCustomer.create({
        data: {
          userId,
          creditLimit: 2000000, // 2 triệu VNĐ
          availableCredit: 2000000,
          bankAccount,
          bankName,
          isActive: true,
          kycStatus: 'APPROVED', // Tự động duyệt (có thể thêm KYC sau)
        },
      });

      return NextResponse.json({
        success: true,
        customer,
        message: 'Đăng ký SPayLater thành công! 🎉',
      });
    }

    // ====================================
    // ACTION: CREATE TRANSACTION (Mua hàng)
    // ====================================
    if (action === 'createTransaction') {
      if (!orderId || !amount) {
        return NextResponse.json(
          { error: 'Thiếu thông tin đơn hàng' },
          { status: 400 }
        );
      }

      // Tìm khách hàng
      const customer = await prisma.sPayLaterCustomer.findUnique({
        where: { userId },
      });

      if (!customer) {
        return NextResponse.json(
          { error: 'Vui lòng đăng ký SPayLater trước' },
          { status: 404 }
        );
      }

      // Kiểm tra trạng thái tài khoản
      if (!customer.isActive) {
        return NextResponse.json(
          { error: 'Tài khoản SPayLater đã bị khóa' },
          { status: 403 }
        );
      }

      // IMPORTANT: Don't check available credit here!
      // The remaining amount is a LOAN, not an immediate deduction
      // The advance payment was already deducted in the orders API

      // Tính ngày đến hạn (30 ngày sau)
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);

      // Tạo giao dịch (record the loan, don't deduct from credit)
      const transaction = await prisma.sPayLaterTransaction.create({
        data: {
          customerId: customer.id,
          orderId,
          amount, // This is the LOAN amount (remaining after advance payment)
          dueDate,
          status: 'PENDING',
        },
      });

      // DON'T update credit here - it was already updated for advance payment
      // The 'amount' here represents the loan that needs to be paid back

      // Update order payment status
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentMethod: 'spaylater',
          paymentStatus: 'PENDING',
        },
      });

      return NextResponse.json({
        success: true,
        transaction,
        message: `Đã tạo giao dịch ${amount.toLocaleString()} VNĐ. Hạn thanh toán: ${dueDate.toLocaleDateString('vi-VN')}`,
      });
    }

    return NextResponse.json({ error: 'Action không hợp lệ' }, { status: 400 });
  } catch (error: any) {
    console.error('POST error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Có lỗi xảy ra',
      },
      { status: 500 }
    );
  }
}