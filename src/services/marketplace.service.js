const prisma = require("../config/prisma");
const ApiError = require("../utils/api-error");

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

const mapProduct = (p) => ({
  id: p.id,
  name: p.name,
  brand: "Apotek PawSphere",
  category: cap(p.category),
  description: p.description || "",
  price: p.price,
  oldPrice: null,
  discount: null,
  rating: 4.8,
  reviews: 0,
  stock: p.stock,
  image: p.imageUrl || "https://placehold.co/300x300?text=PawSphere",
  hasPrescription: p.requiresPrescription,
});

const listProducts = async () => {
  const rows = await prisma.product.findMany({ orderBy: { createdAt: "asc" } });
  return rows.map(mapProduct);
};

const getProductById = async (id) => {
  const p = await prisma.product.findUnique({ where: { id } });
  if (!p) throw ApiError.notFound("Produk tidak ditemukan");
  return mapProduct(p);
};

const createOrder = async (userId, { items, shippingAddress, paymentMethod }) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw ApiError.badRequest("Keranjang kosong");
  }

  const detailed = [];
  for (const it of items) {
    const product = await prisma.product.findUnique({ where: { id: it.product_id } });
    if (!product) throw ApiError.notFound("Produk tidak ditemukan: " + it.product_id);
    const qty = Math.max(1, parseInt(it.quantity, 10) || 1);
    detailed.push({ product, qty, unitPrice: product.price });
  }

  const totalAmount = detailed.reduce((sum, d) => sum + d.unitPrice * d.qty, 0);

  const order = await prisma.order.create({
    data: {
      userId,
      totalAmount,
      shippingAddress: shippingAddress || null,
      paymentMethod: paymentMethod || null,
      status: "paid",
      items: {
        create: detailed.map((d) => ({
          productId: d.product.id,
          quantity: d.qty,
          unitPrice: d.unitPrice,
        })),
      },
    },
    include: { items: { include: { product: true } } },
  });

  for (const d of detailed) {
    await prisma.product.update({
      where: { id: d.product.id },
      data: { stock: Math.max(0, d.product.stock - d.qty) },
    });
  }

  return {
    id: order.id,
    total_amount: order.totalAmount,
    status: order.status,
    created_at: order.createdAt,
    items: order.items.map((i) => ({ name: i.product?.name, quantity: i.quantity, unit_price: i.unitPrice })),
  };
};

const listMyOrders = async (userId) => {
  const rows = await prisma.order.findMany({
    where: { userId },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((o) => ({
    id: o.id,
    total_amount: o.totalAmount,
    status: o.status,
    created_at: o.createdAt,
    items: o.items.map((i) => ({ name: i.product?.name, quantity: i.quantity, unit_price: i.unitPrice })),
  }));
};

module.exports = { listProducts, getProductById, createOrder, listMyOrders };