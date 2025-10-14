// Test script to check API endpoints
import pool from "./db.js";

const testEndpoints = async () => {
  try {
    console.log('🔍 Testing database connections and endpoints...\n');

    // Test 1: Database connection
    console.log('1. Testing database connection...');
    const [dbTest] = await pool.query('SELECT 1 as test');
    console.log('✅ Database connected:', dbTest[0]);

    // Test 2: Check users table
    console.log('\n2. Testing users table...');
    const [users] = await pool.query('SELECT User_ID, Name, Email, Role FROM user LIMIT 5');
    console.log('✅ Users found:', users.length);
    console.log('Sample users:', users);

    // Test 3: Check products table
    console.log('\n3. Testing products table...');
    const [products] = await pool.query('SELECT Product_ID, Product_Name, Brand FROM product LIMIT 5');
    console.log('✅ Products found:', products.length);
    console.log('Sample products:', products);

    // Test 4: Check orders table
    console.log('\n4. Testing orders table...');
    const [orders] = await pool.query(`
      SELECT o.Order_ID, o.\`Total Amount\` as Total_Amount, o.Order_Date, 
             d.Delivery_Status, u.Name as Customer_Name
      FROM \`Order\` o
      JOIN Delivery d ON o.Delivery_ID = d.Delivery_ID
      JOIN User u ON o.User_ID = u.User_ID
      LIMIT 5
    `);
    console.log('✅ Orders found:', orders.length);
    console.log('Sample orders:', orders);

    // Test 5: Check cart and cart items
    console.log('\n5. Testing cart and cart items...');
    const [cartItems] = await pool.query(`
      SELECT c.Cart_ID, c.User_ID, ci.Quantity, p.Product_Name
      FROM Cart c
      JOIN Cart_Item ci ON c.Cart_ID = ci.Cart_ID
      JOIN Product p ON ci.Product_ID = p.Product_ID
      LIMIT 5
    `);
    console.log('✅ Cart items found:', cartItems.length);
    console.log('Sample cart items:', cartItems);

    // Test 6: Check variants and images
    console.log('\n6. Testing variants and images...');
    const [variants] = await pool.query(`
      SELECT v.Variant_ID, v.Product_ID, v.Price, v.Colour, v.Size,
             CASE WHEN v.Image_URL IS NOT NULL THEN 'Has Image' ELSE 'No Image' END as Image_Status
      FROM Variant v
      LIMIT 5
    `);
    console.log('✅ Variants found:', variants.length);
    console.log('Sample variants:', variants);

    console.log('\n🎉 All database tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await pool.end();
    process.exit(0);
  }
};

testEndpoints();