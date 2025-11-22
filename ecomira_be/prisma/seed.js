// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.category.createMany({
    data: [
      { id: 7,  name: 'Mỹ phẩm',            icon: 'spa',             color: '#FF69B4', description: 'Sản phẩm chăm sóc da, trang điểm, mỹ phẩm', isActive: true },
      { id: 8,  name: 'Gia vị & Thực phẩm khô', icon: 'restaurant',  color: '#FFA500', description: 'Gia vị nấu ăn, hạt, bột và thực phẩm khô', isActive: true },
      { id: 9,  name: 'Quần áo',            icon: 'tshirt',          color: '#1E90FF', description: 'Thời trang nam nữ, áo, quần, váy', isActive: true },
      { id: 10, name: 'Giày dép',           icon: 'shoe-prints',     color: '#8B4513', description: 'Giày thể thao, giày da, dép', isActive: true },
      { id: 11, name: 'Đồ gia dụng & Nhà bếp', icon: 'kitchen',      color: '#32CD32', description: 'Dụng cụ nấu ăn, bếp, đồ dùng nhà bếp', isActive: true },
      { id: 12, name: 'Đồ chơi trẻ em',     icon: 'puzzle-piece',    color: '#FFD700', description: 'Đồ chơi, giáo cụ, đồ chơi giáo dục cho trẻ', isActive: true },
      { id: 13, name: 'Sức khỏe & Dược phẩm', icon: 'medical-bag',   color: '#DC143C', description: 'Thuốc không kê đơn, thực phẩm chức năng, chăm sóc sức khỏe', isActive: true },
      { id: 14, name: 'Thể thao & Dã ngoại', icon: 'dumbbell',       color: '#00CED1', description: 'Thiết bị thể thao, đồ dã ngoại, đi bộ, tập gym', isActive: true },
      { id: 15, name: 'Nội thất & Trang trí', icon: 'sofa',          color: '#6A5ACD', description: 'Bàn ghế, giường, trang trí nhà', isActive: true },
      { id: 16, name: 'Văn phòng phẩm',      icon: 'pen-fancy',       color: '#2E8B57', description: 'Bút, sổ, đồ dùng văn phòng', isActive: true },
      { id: 17, name: 'Thực phẩm & Đồ uống', icon: 'coffee',         color: '#A0522D', description: 'Thực phẩm tươi, đồ uống, chế biến sẵn', isActive: true },
      { id: 18, name: 'Mẹ & Bé',             icon: 'baby',           color: '#FFB6C1', description: 'Sữa, tã, đồ dùng cho mẹ và bé', isActive: true },
      { id: 19, name: 'Ô tô & Xe máy',       icon: 'car',            color: '#708090', description: 'Phụ tùng, phụ kiện, chăm sóc xe', isActive: true },
      { id: 20, name: 'Làm vườn & Ngoài trời', icon: 'seedling',     color: '#3CB371', description: 'Dụng cụ làm vườn, cây cảnh, phân bón', isActive: true },
      { id: 21, name: 'Điện gia dụng',       icon: 'power-plug',      color: '#4682B4', description: 'Thiết bị điện tử gia dụng: tủ lạnh, máy giặt, máy hút bụi', isActive: true }
    ],
    skipDuplicates: true  // tránh lỗi nếu trùng
  });

  console.log('Seed categories inserted.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
