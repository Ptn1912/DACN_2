// app/api/spaylater/payment/route.ts - NO BLOCKCHAIN VERSION
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST - Thanh toán khoản vay
export async function POST(request: NextRequest) {
  try {
    const { transactionId, userId, amount, paymentMethod = 'bank_transfer' } = await request.json();

    if (!transactionId || !userId || !amount) {
      return NextResponse.json(
        { error: 'Thiếu thông tin thanh toán' },
        { status: 400 }
      );
    }

    // Tìm giao dịch
    const transaction = await prisma.sPayLaterTransaction.findUnique({
      where: { id: transactionId },
      include: { 
        customer: true, 
        order: true 
      },
    });

    if (!transaction) {
      return NextResponse.json({ 
        error: 'Không tìm thấy giao dịch' 
      }, { status: 404 });
    }

    // Kiểm tra quyền
    if (transaction.customer.userId !== userId) {
      return NextResponse.json({ 
        error: 'Không có quyền thanh toán giao dịch này' 
      }, { status: 403 });
    }

    // Kiểm tra đã thanh toán đủ chưa
    if (transaction.status === 'PAID') {
      return NextResponse.json({ 
        error: 'Giao dịch đã được thanh toán đầy đủ' 
      }, { status: 400 });
    }

    // Tính số tiền còn lại
    const remainingAmount = Number(transaction.amount) + Number(transaction.lateFee) - Number(transaction.paidAmount);
    
    if (amount > remainingAmount) {
      return NextResponse.json(
        { 
          error: `Số tiền thanh toán vượt quá số tiền còn lại`,
          remainingAmount: remainingAmount,
          requestedAmount: amount
        },
        { status: 400 }
      );
    }

    // Tạo bản ghi thanh toán
    const payment = await prisma.sPayLaterPayment.create({
      data: {
        transactionId,
        customerId: transaction.customerId,
        amount,
        paymentMethod,
        status: 'COMPLETED',
      },
    });

    // Cập nhật giao dịch
    const newPaidAmount = Number(transaction.paidAmount) + amount;
    const totalAmount = Number(transaction.amount) + Number(transaction.lateFee);
    const isFullyPaid = newPaidAmount >= totalAmount;

    await prisma.sPayLaterTransaction.update({
      where: { id: transactionId },
      data: {
        paidAmount: newPaidAmount,
        status: isFullyPaid ? 'PAID' : 'PARTIALLY_PAID',
      },
    });

    // Cập nhật hạn mức khách hàng
    await prisma.sPayLaterCustomer.update({
      where: { id: transaction.customerId },
      data: {
        usedCredit: { decrement: amount },
        availableCredit: { increment: amount },
        totalPaid: { increment: amount },
        // Nếu thanh toán đủ phí trễ hạn, trừ totalOverdue
        ...(transaction.status === 'OVERDUE' && isFullyPaid && {
          totalOverdue: { decrement: Number(transaction.amount) }
        })
      },
    });

    // Nếu thanh toán đủ, cập nhật trạng thái đơn hàng
    if (isFullyPaid && transaction.orderId) {
      await prisma.order.update({
        where: { id: transaction.orderId },
        data: { paymentStatus: 'COMPLETED' },
      });
    }

    return NextResponse.json({
      success: true,
      payment,
      transaction: {
        id: transactionId,
        totalPaid: newPaidAmount,
        remaining: totalAmount - newPaidAmount,
        status: isFullyPaid ? 'PAID' : 'PARTIALLY_PAID'
      },
      message: isFullyPaid
        ? '✅ Thanh toán hoàn tất! 🎉'
        : `✅ Đã thanh toán ${amount.toLocaleString()} VNĐ. Còn lại: ${(totalAmount - newPaidAmount).toLocaleString()} VNĐ`,
    });
  } catch (error: any) {
    console.error('Payment error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Thanh toán thất bại',
      },
      { status: 500 }
    );
  }
}

// GET - Lấy lịch sử thanh toán
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = parseInt(searchParams.get('userId') || '0');
    const transactionId = searchParams.get('transactionId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Tìm customer
    const customer = await prisma.sPayLaterCustomer.findUnique({
      where: { userId },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Chưa đăng ký SPayLater' }, { status: 404 });
    }

    // Lấy lịch sử thanh toán
    const payments = await prisma.sPayLaterPayment.findMany({
      where: {
        customerId: customer.id,
        ...(transactionId && { transactionId: parseInt(transactionId) })
      },
      include: {
        transaction: {
          include: {
            order: true
          }
        }
      },
      orderBy: { paymentDate: 'desc' },
    });

    return NextResponse.json({
      success: true,
      payments,
    });
  } catch (error: any) {
    console.error('GET payment error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}