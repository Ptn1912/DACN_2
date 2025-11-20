// scripts/check-overdue-cron.ts - NO BLOCKCHAIN VERSION
import { PrismaClient } from '@prisma/client';
import cron from 'node-cron';

const prisma = new PrismaClient();

/**
 * Kiểm tra và cập nhật các giao dịch quá hạn
 */
async function checkOverdueTransactions() {
  console.log('🔍 [CRON] Checking overdue transactions...');
  const now = new Date();

  try {
    // Tìm các transaction quá hạn
    const overdueTransactions = await prisma.sPayLaterTransaction.findMany({
      where: {
        dueDate: { lt: now },
        status: { in: ['PENDING', 'PARTIALLY_PAID'] },
      },
      include: { 
        customer: {
          include: {
            user: true
          }
        },
        order: true,
      },
    });

    console.log(`📊 Found ${overdueTransactions.length} overdue transactions`);

    for (const txn of overdueTransactions) {
      try {
        const remainingAmount = Number(txn.amount) - Number(txn.paidAmount);
        
        // Tính phí trễ hạn 5%
        const lateFee = Math.round(remainingAmount * 0.05);

        console.log(`⚠️  Transaction #${txn.id} is overdue`);
        console.log(`   Customer: ${txn.customer.user.fullName}`);
        console.log(`   Order: ${txn.order?.orderNumber || 'N/A'}`);
        console.log(`   Amount: ${remainingAmount.toLocaleString()} VNĐ`);
        console.log(`   Late Fee (5%): ${lateFee.toLocaleString()} VNĐ`);

        // Cập nhật transaction
        await prisma.sPayLaterTransaction.update({
          where: { id: txn.id },
          data: {
            status: 'OVERDUE',
            lateFee,
          },
        });

        // Cập nhật customer
        await prisma.sPayLaterCustomer.update({
          where: { id: txn.customerId },
          data: {
            totalOverdue: { increment: remainingAmount },
          },
        });

        // Gửi thông báo
        await sendOverdueNotification(txn, lateFee);

        console.log(`✅ Updated transaction #${txn.id} - Late fee: ${lateFee.toLocaleString()} VNĐ`);
        
      } catch (txError) {
        console.error(`❌ Error processing transaction ${txn.id}:`, txError);
      }
    }

    console.log('✅ [CRON] Overdue check completed');
  } catch (error) {
    console.error('❌ [CRON] Error checking overdue transactions:', error);
  }
}

/**
 * Gửi thông báo quá hạn cho khách hàng
 */
async function sendOverdueNotification(transaction: any, lateFee: number) {
  console.log('📧 Sending overdue notification...');
  console.log(`   Customer: ${transaction.customer.user.fullName} (${transaction.customer.user.email})`);
  console.log(`   Phone: ${transaction.customer.user.phone}`);
  console.log(`   Order: ${transaction.order?.orderNumber || 'N/A'}`);
  console.log(`   Amount: ${Number(transaction.amount).toLocaleString()} VNĐ`);
  console.log(`   Late Fee: ${lateFee.toLocaleString()} VNĐ`);
  console.log(`   Due date: ${transaction.dueDate.toLocaleDateString('vi-VN')}`);
  
  // TODO: Tích hợp với hệ thống thông báo thực tế
  // Ví dụ:
  
  // 1. Gửi Email
  // await sendEmail({
  //   to: transaction.customer.user.email,
  //   subject: '⚠️ Thông báo thanh toán SPayLater quá hạn',
  //   html: `
  //     <h2>Kính gửi ${transaction.customer.user.fullName},</h2>
  //     <p>Khoản thanh toán SPayLater của bạn đã quá hạn:</p>
  //     <ul>
  //       <li>Số tiền: ${Number(transaction.amount).toLocaleString()} VNĐ</li>
  //       <li>Phí trễ hạn (5%): ${lateFee.toLocaleString()} VNĐ</li>
  //       <li>Hạn thanh toán: ${transaction.dueDate.toLocaleDateString('vi-VN')}</li>
  //     </ul>
  //     <p>Vui lòng thanh toán ngay để tránh ảnh hưởng đến hạn mức.</p>
  //   `
  // });

  // 2. Gửi SMS
  // await sendSMS({
  //   to: transaction.customer.user.phone,
  //   message: `[SPayLater] Khoản vay ${Number(transaction.amount).toLocaleString()}đ đã quá hạn. Phí trễ: ${lateFee.toLocaleString()}đ. Vui lòng thanh toán ngay.`
  // });

  // 3. Push Notification (nếu có app mobile)
  // await sendPushNotification({
  //   userId: transaction.customer.userId,
  //   title: 'Thanh toán SPayLater quá hạn',
  //   body: `Khoản vay ${Number(transaction.amount).toLocaleString()}đ đã quá hạn. Phí trễ: ${lateFee.toLocaleString()}đ`,
  //   data: {
  //     type: 'spaylater_overdue',
  //     transactionId: transaction.id
  //   }
  // });

  // 4. In-App Notification
  // await prisma.notification.create({
  //   data: {
  //     userId: transaction.customer.userId,
  //     type: 'SPAYLATER_OVERDUE',
  //     title: 'Thanh toán quá hạn',
  //     message: `Khoản vay ${Number(transaction.amount).toLocaleString()}đ đã quá hạn`,
  //     metadata: {
  //       transactionId: transaction.id,
  //       amount: Number(transaction.amount),
  //       lateFee: lateFee
  //     }
  //   }
  // });
}

/**
 * Kiểm tra giao dịch sắp đến hạn (nhắc nhở trước 3 ngày)
 */
async function checkUpcomingDueTransactions() {
  console.log('🔔 [CRON] Checking upcoming due transactions...');
  
  const threeDaysLater = new Date();
  threeDaysLater.setDate(threeDaysLater.getDate() + 3);
  
  const now = new Date();

  try {
    const upcomingTransactions = await prisma.sPayLaterTransaction.findMany({
      where: {
        dueDate: {
          gte: now,
          lte: threeDaysLater
        },
        status: { in: ['PENDING', 'PARTIALLY_PAID'] },
      },
      include: { 
        customer: {
          include: {
            user: true
          }
        },
        order: true,
      },
    });

    console.log(`📊 Found ${upcomingTransactions.length} upcoming due transactions`);

    for (const txn of upcomingTransactions) {
      const daysRemaining = Math.ceil((txn.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      console.log(`⏰ Transaction #${txn.id} due in ${daysRemaining} days`);
      
      // Gửi nhắc nhở
      await sendReminderNotification(txn, daysRemaining);
    }

    console.log('✅ [CRON] Reminder check completed');
  } catch (error) {
    console.error('❌ [CRON] Error checking upcoming transactions:', error);
  }
}

async function sendReminderNotification(transaction: any, daysRemaining: number) {
  console.log(`📧 Sending reminder to ${transaction.customer.user.email}`);
  console.log(`   Days remaining: ${daysRemaining}`);
  
  // TODO: Gửi email/SMS nhắc nhở
  // await sendEmail({
  //   to: transaction.customer.user.email,
  //   subject: '🔔 Nhắc nhở thanh toán SPayLater',
  //   html: `
  //     <p>Khoản thanh toán SPayLater của bạn sẽ đến hạn trong ${daysRemaining} ngày.</p>
  //     <p>Số tiền: ${Number(transaction.amount).toLocaleString()} VNĐ</p>
  //   `
  // });
}

// ============================================
// MAIN: Khởi động cron jobs
// ============================================

console.log('🚀 Starting SPayLater Cron Jobs...');

// Chạy ngay khi start
checkOverdueTransactions();
checkUpcomingDueTransactions();

// Schedule: Kiểm tra quá hạn mỗi ngày lúc 00:00
cron.schedule('0 0 * * *', () => {
  console.log('\n⏰ Running daily overdue check...');
  checkOverdueTransactions();
});

// Schedule: Kiểm tra quá hạn mỗi 6 giờ (optional - để bắt sớm)
cron.schedule('0 */6 * * *', () => {
  console.log('\n⏰ Running 6-hour overdue check...');
  checkOverdueTransactions();
});

// Schedule: Nhắc nhở trước hạn mỗi ngày lúc 09:00
cron.schedule('0 9 * * *', () => {
  console.log('\n⏰ Running daily reminder check...');
  checkUpcomingDueTransactions();
});

console.log('✅ Cron jobs scheduled:');
console.log('   - Overdue check: Daily at 00:00 & every 6 hours');
console.log('   - Reminder check: Daily at 09:00');

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n👋 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n👋 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});