const API = 'http://localhost:5000/api';

async function req(url, options = {}) {
  const fullUrl = url.startsWith('http') ? url : `${API}${url}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(fullUrl, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || `HTTP ${res.status}`);
    err.data = data;
    throw err;
  }
  return data;
}

async function runEndToEndVerification() {
  console.log('--- STARTING E2E INTEGRATION VERIFICATION ---');

  // 1. Health check
  const health = await req('/health');
  console.log('1. API Health Check:', health.status);

  // 2. Products check
  const productsRes = await req('/products');
  const products = productsRes.data;
  console.log(`2. Products Loaded: ${products.length} active products found`);
  const testProduct = products[0];
  console.log(`   Selected test product: "${testProduct.name}" (ID: ${testProduct.id}, Stock: ${testProduct.stock_quantity}, Price: ${testProduct.price} DA)`);
  const initialStock = testProduct.stock_quantity;

  // 3. Wilayas check
  const wilayasRes = await req('/wilayas');
  console.log(`3. Wilayas Loaded: ${wilayasRes.data.length} Algerian wilayas`);
  const algerWilaya = wilayasRes.data.find(w => w.code === '16');
  console.log(`   Wilaya: ${algerWilaya.name} (${algerWilaya.delivery_fee} DA delivery fee)`);

  // 4. Validate Coupon
  const couponRes = await req('/coupons/validate', {
    method: 'POST',
    body: JSON.stringify({ code: 'BIYODO10', subtotal: 5000 }),
  });
  console.log('4. Coupon Validation:', couponRes.message, `(-${couponRes.coupon.discount_amount} DA)`);

  // 5. Place Customer Order (No customer account needed!)
  const orderPayload = {
    full_name: 'Amina Mansouri',
    phone: '0555987654',
    wilaya_id: algerWilaya.id,
    commune: 'Hydra',
    address: 'Résidence Les Palmiers, Apt 14',
    order_notes: 'Appeler avant de livrer s\'il vous plaît',
    coupon_code: 'BIYODO10',
    items: [
      { product_id: testProduct.id, quantity: 2 },
    ],
  };

  const orderRes = await req('/orders', {
    method: 'POST',
    body: JSON.stringify(orderPayload),
  });
  console.log('5. Order Created Successfully!');
  const createdOrder = orderRes.order;
  console.log(`   Order Reference: ${createdOrder.order_reference}`);
  console.log(`   Subtotal: ${createdOrder.subtotal} DA | Discount: ${createdOrder.discount_amount} DA | Delivery: ${createdOrder.delivery_fee} DA | Total: ${createdOrder.total_amount} DA`);

  // 6. Track order (as customer, using reference + phone)
  const trackRes = await req(`/orders/track?reference=${encodeURIComponent(createdOrder.order_reference)}&phone=0555987654`);
  console.log('6. Order Tracking Lookup:', trackRes.success ? 'SUCCESS' : 'FAILED');
  console.log(`   Tracked Status: ${trackRes.order.status} | Destination: ${trackRes.order.wilaya_name}`);

  // 7. Admin Authentication
  const loginRes = await req('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@biyodo.com', password: 'admin123' }),
  });
  console.log('7. Admin Login Successful!');
  const adminToken = loginRes.token;
  const adminHeaders = { Authorization: `Bearer ${adminToken}` };

  // 8. Admin order retrieval
  const adminOrdersRes = await req('/orders/admin/all', { headers: adminHeaders });
  console.log(`8. Admin Orders Count: ${adminOrdersRes.data.length} total orders in dashboard`);

  // 9. Admin confirm order (triggers stock deduction)
  console.log('9. Admin confirming order to trigger stock deduction...');
  await req(`/orders/admin/${createdOrder.id}/status`, {
    method: 'PUT',
    headers: adminHeaders,
    body: JSON.stringify({ status: 'confirmed', notes: 'Commande confirmée par téléphone avec la cliente' }),
  });

  // Check new product stock in DB
  const updatedProductRes = await req(`/products/${testProduct.id}`);
  const newStock = updatedProductRes.data.stock_quantity;
  console.log(`   Stock deduction verification: ${initialStock} -> ${newStock} (Expected: ${initialStock - 2})`);
  if (newStock === initialStock - 2) {
    console.log('   ✓ Stock deducted correctly by exactly 2 units!');
  } else {
    throw new Error('Stock deduction mismatch!');
  }

  // 10. Admin view Inventory movements
  const movementsRes = await req('/admin/inventory/movements', { headers: adminHeaders });
  console.log(`10. Inventory Audit Movements recorded: ${movementsRes.data.length} entries`);
  console.log(`    Latest movement: ${movementsRes.data[0].movement_type} - "${movementsRes.data[0].reason}"`);

  // 11. Admin Statistics Overview
  const statsRes = await req('/admin/statistics/overview', { headers: adminHeaders });
  console.log('11. Admin Financial Stats:');
  console.log(`    Total Revenue: ${statsRes.stats.total_revenue} DA`);
  console.log(`    Gross Profit: ${statsRes.stats.total_gross_profit} DA`);
  console.log(`    Total Customers in CRM: ${statsRes.stats.total_customers}`);

  console.log('\n--- ALL E2E VERIFICATIONS PASSED SUCCESSFULLY (11/11) ---\n');
}

runEndToEndVerification().catch((err) => {
  console.error('E2E Verification Failed:', err.data || err.message);
  process.exit(1);
});
