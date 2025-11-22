// app/api/users/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/users/search?q=query&limit=20&excludeUserId=1
 * Search users by name, email, or ID
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '20');
    const excludeUserId = searchParams.get('excludeUserId');

    // Build where clause
    const where: any = {
      userType: 'customer', // Chỉ lấy customer
    };
    
    if (query) {
      where.OR = [
        { fullName: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
      ];
      
      // If query is a number, also search by ID
      const queryAsNumber = parseInt(query);
      if (!isNaN(queryAsNumber)) {
        where.OR.push({ id: queryAsNumber });
      }
    }

    // Exclude specific user (usually current user)
    if (excludeUserId) {
      where.id = { not: parseInt(excludeUserId) };
    }

    // Get users
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        userType: true,
      },
      take: limit,
      orderBy: {
        fullName: 'asc',
      },
    });

    const total = await prisma.user.count({ where });

    return NextResponse.json({
      users,
      total,
    });
  } catch (error: any) {
    console.error('Search users error:', error);
    return NextResponse.json(
      { error: 'Không thể tìm kiếm người dùng' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users/search
 * Get user by ID
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'Vui lòng cung cấp userId' },
        { status: 400 }
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
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Không tìm thấy người dùng' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Không thể lấy thông tin người dùng' },
      { status: 500 }
    );
  }
}