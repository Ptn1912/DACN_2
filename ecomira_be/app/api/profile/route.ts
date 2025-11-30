// app/api/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Helper function to get user from token
async function getUserFromToken(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No authorization header or invalid format');
      return null;
    }

    const token = authHeader.substring(7);
    console.log('🔑 Token received:', token.substring(0, 20) + '...');
    
    const decoded = verify(token, JWT_SECRET) as { userId: number };
    console.log('✅ Token verified, userId:', decoded.userId);
    
    return decoded.userId;
  } catch (error: any) {
    console.error('❌ Token verification error:', error.message);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('📥 GET /api/profile');
    
    const userId = await getUserFromToken(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid or missing token' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        userType: true,
        avatar: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('✅ User profile retrieved:', user.email);
    return NextResponse.json({ user });
  } catch (error) {
    console.error('❌ Get profile error:', error);
    return NextResponse.json(
      { error: 'Failed to get profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('📥 PUT /api/profile');
    
    const userId = await getUserFromToken(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login again' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { fullName, phone, avatar, currentPassword, newPassword } = body;

    console.log('📝 Update profile request for user:', userId);
    console.log('📝 Update data:', { fullName, phone, hasAvatar: !!avatar, changingPassword: !!(currentPassword && newPassword) });

    // Validate input
    if (!fullName) {
      return NextResponse.json(
        { error: 'Tên không được để trống' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {
      fullName,
      phone: phone || null,
      avatar: avatar || null,
    };

    // Handle password change if requested
    if (currentPassword && newPassword) {
      console.log('🔐 Password change requested');
      
      // Verify current password
      const bcrypt = require('bcryptjs');
      const isValidPassword = await bcrypt.compare(
        currentPassword,
        existingUser.passwordHash
      );

      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Mật khẩu hiện tại không đúng' },
          { status: 400 }
        );
      }

      // Validate new password
      if (newPassword.length < 8) {
        return NextResponse.json(
          { error: 'Mật khẩu mới phải có ít nhất 8 ký tự' },
          { status: 400 }
        );
      }

      updateData.passwordHash = await hashPassword(newPassword);
      console.log('✅ Password will be updated');
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        userType: true,
        avatar: true,
        createdAt: true,
      },
    });

    console.log('✅ Profile updated successfully');
    console.log('📤 Updated user data:', { ...updatedUser, avatar: updatedUser.avatar?.substring(0, 50) + '...' });

    return NextResponse.json({
      message: 'Cập nhật thông tin thành công',
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('❌ Update profile error:', error);
    return NextResponse.json(
      { error: 'Cập nhật thông tin thất bại' },
      { status: 500 }
    );
  }
}