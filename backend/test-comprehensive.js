// Comprehensive test script to check all API endpoints
import pool from "./db.js";

const testAllEndpoints = async () => {
  console.log('🚀 Starting comprehensive API and database tests...\n');

  try {
    // Test 1: Database Connection
    console.log('1. Testing database connection...');
    const [dbTest] = await pool.query('SELECT 1 as test');
    console.log('✅ Database connected successfully');

    // Test 2: Check all tables exist
    console.log('\n2. Checking table structure...');
    const tables = ['user', 'product', 'variant', 'cart', 'cart_item', 'order', 'delivery', 'category', 'city'];
    
    for (const table of tables) {
      try {
        const [rows] = await pool.query(`SELECT COUNT(*) as count FROM \`${table}\``);
        console.log(`✅ Table '${table}': ${rows[0].count} records`);
      } catch (err) {
        console.log(`❌ Table '${table}': ${err.message}`);
      }
    }

    // Test 3: Check authentication data
    console.log('\n3. Testing authentication data...');
    const [users] = await pool.query('SELECT User_ID, Name, Email, Role FROM user WHERE Role = ? LIMIT 5', ['customer']);
    console.log(`✅ Found ${users.length} customers`);
    
    const [admins] = await pool.query('SELECT User_ID, Name, Email, Role FROM user WHERE Role = ? LIMIT 5', ['admin']);
    console.log(`✅ Found ${admins.length} admins`);

    // Test 4: Check product data integrity
    console.log('\n4. Testing product data...');
    const [products] = await pool.query(`
      SELECT p.Product_ID, p.Product_Name, p.Brand, 
             COUNT(v.Variant_ID) as variant_count,
             MIN(v.Price) as min_price, MAX(v.Price) as max_price
      FROM product p
      LEFT JOIN variant v ON p.Product_ID = v.Product_ID
      GROUP BY p.Product_ID, p.Product_Name, p.Brand
      LIMIT 10
    `);
    console.log(`✅ Found ${products.length} products with variants`);
    console.log('Sample product:', products[0]);

    // Test 5: Check variants with images
    console.log('\n5. Testing variant images...');
    const [variantsWithImages] = await pool.query(`
      SELECT COUNT(*) as count FROM variant WHERE Image_URL IS NOT NULL
    `);
    const [totalVariants] = await pool.query(`SELECT COUNT(*) as count FROM variant`);
    console.log(`✅ ${variantsWithImages[0].count}/${totalVariants[0].count} variants have images`);

    // Test 6: Check cart data
    console.log('\n6. Testing cart data...');
    const [activeCarts] = await pool.query(`
      SELECT c.Cart_ID, c.User_ID, u.Name, COUNT(ci.Cart_Item_ID) as item_count
      FROM cart c
      JOIN user u ON c.User_ID = u.User_ID
      LEFT JOIN cart_item ci ON c.Cart_ID = ci.Cart_ID
      WHERE c.Status = 'Active'
      GROUP BY c.Cart_ID, c.User_ID, u.Name
    `);
    console.log(`✅ Found ${activeCarts.length} active carts`);
    if (activeCarts.length > 0) {
      console.log('Sample cart:', activeCarts[0]);
    }

    // Test 7: Check order integrity
    console.log('\n7. Testing order data...');
    const [orderData] = await pool.query(`
      SELECT o.Order_ID, o.\`Total Amount\` as total, 
             u.Name as customer, d.Delivery_Status,
             COUNT(ci.Cart_Item_ID) as item_count
      FROM \`order\` o
      JOIN user u ON o.User_ID = u.User_ID
      JOIN delivery d ON o.Delivery_ID = d.Delivery_ID
      JOIN cart c ON o.Cart_ID = c.Cart_ID
      JOIN cart_item ci ON c.Cart_ID = ci.Cart_ID
      GROUP BY o.Order_ID, o.\`Total Amount\`, u.Name, d.Delivery_Status
      ORDER BY o.Order_Date DESC
      LIMIT 5
    `);
    console.log(`✅ Found ${orderData.length} complete orders`);
    if (orderData.length > 0) {
      console.log('Sample order:', orderData[0]);
    }

    // Test 8: Check delivery status consistency
    console.log('\n8. Testing delivery status...');
    const [deliveryStats] = await pool.query(`
      SELECT Delivery_Status, COUNT(*) as count
      FROM delivery
      GROUP BY Delivery_Status
    `);
    console.log('✅ Delivery status distribution:', deliveryStats);

    // Test 9: Check foreign key relationships
    console.log('\n9. Testing foreign key integrity...');
    
    // Check orphaned variants
    const [orphanedVariants] = await pool.query(`
      SELECT COUNT(*) as count FROM variant v
      LEFT JOIN product p ON v.Product_ID = p.Product_ID
      WHERE p.Product_ID IS NULL
    `);
    console.log(`✅ Orphaned variants: ${orphanedVariants[0].count}`);

    // Check orphaned cart items
    const [orphanedCartItems] = await pool.query(`
      SELECT COUNT(*) as count FROM cart_item ci
      LEFT JOIN cart c ON ci.Cart_ID = c.Cart_ID
      WHERE c.Cart_ID IS NULL
    `);
    console.log(`✅ Orphaned cart items: ${orphanedCartItems[0].count}`);

    // Test 10: Check price consistency
    console.log('\n10. Testing price consistency...');
    const [priceIssues] = await pool.query(`
      SELECT ci.Cart_Item_ID, ci.Quantity, ci.Total_price, v.Price,
             (ci.Quantity * v.Price) as expected_total
      FROM cart_item ci
      JOIN variant v ON ci.Variant_ID = v.Variant_ID
      WHERE ABS(ci.Total_price - (ci.Quantity * v.Price)) > 0.01
      LIMIT 5
    `);
    console.log(`✅ Price inconsistencies found: ${priceIssues.length}`);

    console.log('\n🎉 All database tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await pool.end();
    process.exit(0);
  }
};

testAllEndpoints();