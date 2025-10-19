-- if one exist, drop it
drop database brightbuy;

create database brightbuy;
use brightbuy;

CREATE TABLE `Product` (
  `Product_ID` Int not null AUTO_INCREMENT,
  `Category_ID` Int,
  `Product_Name` Varchar(225),
  `Brand` Varchar(225),
  `SKU` Varchar(255),
  `Description` TEXT,
  PRIMARY KEY (`Product_ID`)
);

CREATE TABLE `Cart` (
  `Cart_ID` Int AUTO_INCREMENT,
  `User_ID` Int,
  Status ENUM('Active', 'CheckedOut') DEFAULT 'Active',
  PRIMARY KEY (`Cart_ID`)
);

CREATE TABLE `Variant` (
  `Variant_ID` Int not null AUTO_INCREMENT,
  `Product_ID` Int,
  `Price` decimal(10,2),
  `Stock_quantity` int,
  `Colour` varchar(25),
  `Size` Int,
  `Image_URL` Varchar(2500),
  PRIMARY KEY (`Variant_ID`),
  FOREIGN KEY (`Product_ID`)
      REFERENCES `Product`(`Product_ID`)
);

CREATE TABLE `Cart_Item` (
  `Cart_Item_ID` Int AUTO_INCREMENT,
  `Cart_ID` Int,
  `Product_ID` Int,
  `Variant_ID` Int,
  `Quantity` Int,
  `Total_price` Numeric(9,2),
  PRIMARY KEY (`Cart_Item_ID`),
  FOREIGN KEY (`Product_ID`)
      REFERENCES `Product`(`Product_ID`),
  FOREIGN KEY (`Cart_ID`)
      REFERENCES `Cart`(`Cart_ID`),
  FOREIGN KEY (`Variant_ID`)
      REFERENCES `Variant`(`Variant_ID`)
);

CREATE TABLE `City` (
  `City_ID` Int AUTO_INCREMENT,
  `City_Name` Varchar(25),
  `Main_City` BOOL default 0,
  PRIMARY KEY (`City_ID`)
);

CREATE TABLE `User` (
  `User_ID` Int AUTO_INCREMENT,
  `Name` Varchar(25),
  `Password` Varchar(100),
  `Address` Varchar(50),
  `City_ID` Int,
  `Email` Varchar(25),
  `Role` Varchar(10),
  `image_URL` varchar(300),
  PRIMARY KEY (`User_ID`),
  FOREIGN KEY (`City_ID`)
      REFERENCES `City`(`City_ID`)
);

CREATE TABLE `Category` (
  `Category_ID` Int ,
  `Category_Name` Varchar(25),
  PRIMARY KEY (`Category_ID`)
);

CREATE TABLE `Order` (
  `Order_ID` Int AUTO_INCREMENT,
  `User_ID` Int,
  `Cart_ID` Int,
  `Total_Amount` Numeric(9,2),
  `Payment_method` Varchar(25),
  `Delivery_ID` Int,
  `Order_Date` DATE,
  `Order_Number` BIGINT,
  PRIMARY KEY (`Order_ID`),
  FOREIGN KEY (`User_ID`)
      REFERENCES `User`(`User_ID`)
);

CREATE TABLE `Delivery` (
  `Delivery_ID` Int AUTO_INCREMENT,
  `Delivery_Method` Varchar(25),
  `Delivery_Address` Varchar(50),
  `Delivery_Status` ENUM('Delivered', 'Pending') default NULL,
  `Estimated_delivery_Date` DATE,
  PRIMARY KEY (`Delivery_ID`)
);

-- CART  → USER
ALTER TABLE cart
  ADD CONSTRAINT fk_cart_user
  FOREIGN KEY (User_ID) REFERENCES user(User_ID);

-- CART_ITEM → CART / VARIANT / PRODUCT
ALTER TABLE cart_item
  MODIFY Quantity INT NOT NULL DEFAULT 1,
  ADD CONSTRAINT fk_ci_cart
    FOREIGN KEY (Cart_ID) REFERENCES cart(Cart_ID) ON DELETE CASCADE,
  ADD CONSTRAINT fk_ci_variant
    FOREIGN KEY (Variant_ID) REFERENCES variant(Variant_ID),
  ADD CONSTRAINT fk_ci_product
    FOREIGN KEY (Product_ID) REFERENCES product(Product_ID);

-- Prevent duplicate rows for the same variant in the same cart
ALTER TABLE cart_item
  ADD UNIQUE KEY uq_cart_variant (Cart_ID, Variant_ID);

-- (Optional) keep Total_price in sync via triggers (or just compute in SELECTs)
DELIMITER //
CREATE TRIGGER trg_ci_before_insert
BEFORE INSERT ON cart_item FOR EACH ROW
BEGIN
  DECLARE v_price DECIMAL(10,2);
  SELECT Price INTO v_price FROM variant WHERE Variant_ID = NEW.Variant_ID;
  IF NEW.Quantity IS NULL OR NEW.Quantity < 1 THEN SET NEW.Quantity = 1; END IF;
  SET NEW.Total_price = v_price * NEW.Quantity;
END//

CREATE TRIGGER trg_ci_before_update
BEFORE UPDATE ON cart_item FOR EACH ROW
BEGIN
  DECLARE v_price DECIMAL(10,2);
  SELECT Price INTO v_price FROM variant WHERE Variant_ID = NEW.Variant_ID;
  IF NEW.Quantity IS NULL OR NEW.Quantity < 1 THEN SET NEW.Quantity = 1; END IF;
  SET NEW.Total_price = v_price * NEW.Quantity;
END//
DELIMITER ;

ALTER TABLE Product 
ADD CONSTRAINT fk_product_category 
FOREIGN KEY (Category_ID) REFERENCES Category(Category_ID);

-- Add foreign key constraint for Order -> Delivery (if not already added)
ALTER TABLE `Order` 
ADD CONSTRAINT fk_order_delivery 
FOREIGN KEY (Delivery_ID) REFERENCES Delivery(Delivery_ID);

-- Add foreign key constraint for Order -> Cart (if not already added)
ALTER TABLE `Order` 
ADD CONSTRAINT fk_order_cart 
FOREIGN KEY (Cart_ID) REFERENCES Cart(Cart_ID);

-- Create indexes to optimize queries
CREATE INDEX idx_delivery_estimated_date ON delivery (Estimated_delivery_Date);
CREATE INDEX idx_delivery_status ON delivery (Delivery_Status);

-- Create stored procedure to get quarterly sales report
DELIMITER $$
CREATE PROCEDURE GetQuarterlySales(IN selectedYear INT)
BEGIN
  SELECT
    YEAR(o.Order_Date) AS Year,
    QUARTER(o.Order_Date) AS Quarter,
    -- use the actual column name in the orders table (has a space), alias as Total_Sales
    SUM(o.`Total_Amount`) AS Total_Sales,
    COUNT(o.Order_ID) AS Total_Orders,
    AVG(o.`Total_Amount`) AS Avg_Order_Value
  FROM brightbuy.`Order` o
  WHERE YEAR(o.Order_Date) = selectedYear
  GROUP BY Year, Quarter
  ORDER BY Quarter;
END $$
DELIMITER ;

-- Create a view to summarize total orders per category
CREATE VIEW CategoryOrderSummary AS
SELECT 
    c.Category_Name, 
    COUNT(DISTINCT o.Order_ID) AS TotalOrders
FROM Category c
LEFT JOIN Product p ON c.Category_ID = p.Category_ID
LEFT JOIN Variant v ON p.Product_ID = v.Product_ID
LEFT JOIN Cart_Item ci ON v.Variant_ID = ci.Variant_ID
LEFT JOIN brightbuy.`order` o ON ci.Cart_ID = o.Cart_ID 
WHERE o.Order_ID IS NOT NULL
GROUP BY c.Category_ID, c.Category_Name
ORDER BY TotalOrders DESC;

-- Create view for monthly top-selling products
CREATE OR REPLACE VIEW MonthlyTopSellingProducts AS
SELECT
    DATE_FORMAT(o.Order_Date, '%Y-%m') AS month,
    p.Product_ID,
    p.Product_Name,
    p.Brand,
    SUM(ci.Quantity) AS total_quantity_sold,
    SUM(ci.Total_price) AS total_revenue
FROM
    `Order` o
JOIN
    Cart_Item ci ON o.Cart_ID = ci.Cart_ID
JOIN
    Variant v ON ci.Variant_ID = v.Variant_ID
JOIN
    Product p ON v.Product_ID = p.Product_ID
GROUP BY
    month, p.Product_ID
ORDER BY
    month, total_quantity_sold DESC;
    
-- add sample data for category table
INSERT INTO Category (Category_ID, Category_Name)
VALUES
  (1, 'Mobile Phones'),
  (2, 'Laptops'),
  (3, 'Chargers'),
  (4, 'Headsets'),
  (5, 'Camera'),
  (6, 'Watch'),
  (7, 'Electronic Device'),
  (8, 'Tablets'),
  (9, 'Shoes'),
  (10, 'Bags'),
  (11, 'Storage Devices');
  
INSERT INTO Product (Product_ID, Category_ID, Product_Name, Brand, SKU, Description) VALUES
-- Category 1: Mobile Phones
(1, 1, 'Galaxy S25 Ultra', 'Samsung', 'SAMSUNG_GALAXY_S25_ULTRA', 'Flagship model from Samsung'),
(2, 1, 'iPhone 16 Pro Max', 'Apple', 'APPLE_IPHONE_16_PRO_MAX', 'Latest Pro Max version of iPhone'),
(3, 1, 'Google Pixel 10', 'Google', 'GOOGLE_PIXEL_10', 'Pixel flagship with advanced AI camera'),
(4, 1, 'OnePlus 13', 'OnePlus', 'ONEPLUS_ONEPLUS_13', 'High performance Android phone'),

-- Category 2: Laptops
(5, 2, 'MacBook Air M4', 'Apple', 'APPLE_MACBOOK_AIR_M4', 'Lightweight laptop with Apple Silicon M4'),
(6, 2, 'Dell XPS 15 2025', 'Dell', 'DELL_XPS_15_2025', 'Dell flagship 15-inch XPS'),
(7, 2, 'ThinkPad X1 Carbon', 'Lenovo', 'LENOVO_THINKPAD_X1_CARBON', 'Durable business ultrabook'),
(8, 2, 'ROG Strix G17', 'ASUS', 'ASUS_ROG_STRIX_G17', 'Gaming laptop with RTX GPU'),

-- Category 3: Chargers
(9, 3, 'USB-C 65W GaN Charger', 'Anker', 'ANKER_USB_C_65W_GAN_CHARGER', 'Compact gallium nitride charger 65W'),
(10, 3, 'MagSafe Fast Charger', 'Apple', 'APPLE_MAGSAFE_FAST_CHARGER', 'MagSafe wireless fast charger'),
(11, 3, 'PowerPort III 108W', 'Anker', 'ANKER_POWERPORT_III_108W', 'GaN charger with 2 USB-C ports'),
(12, 3, 'HyperJuice 100W Charging Station', 'Hyper', 'HYPER_HYPERJUICE_100W_CHARGING_STATION', 'Multi-port USB-C charging station'),

-- Category 4: Headsets
(13, 4, 'AirPods Pro 3', 'Apple', 'APPLE_AIRPODS_PRO_3', 'Latest Apple noise cancelling earbuds'),
(14, 4, 'WH-1000XM6', 'Sony', 'SONY_WH_1000XM6', 'Flagship Sony noise cancelling over-ear'),
(15, 4, 'QuietComfort Ultra', 'Bose', 'BOSE_QUIETCOMFORT_ULTRA', 'Ultra noise cancelling headset'),
(16, 4, 'Elite 10', 'Jabra', 'JABRA_ELITE_10', 'True wireless earbuds with ANC'),

-- Category 5: Cameras
(17, 5, 'EOS R8', 'Canon', 'CANON_EOS_R8', 'Mirrorless full-frame camera'),
(18, 5, 'A7 IV', 'Sony', 'SONY_A7_IV', 'Sony’s full-frame mirrorless camera'),
(19, 5, 'Z5 II', 'Nikon', 'NIKON_Z5_II', 'Entry-level full-frame mirrorless camera'),
(20, 5, 'X-T5', 'Fujifilm', 'FUJIFILM_X_T5', 'APS-C mirrorless camera'),

-- Category 6: Watches
(21, 6, 'Apple Watch Series 11', 'Apple', 'APPLE_APPLE_WATCH_SERIES_11', 'Latest Apple smartwatch'),
(22, 6, 'Galaxy Watch 7', 'Samsung', 'SAMSUNG_GALAXY_WATCH_7', 'Samsung flagship smartwatch'),
(23, 6, 'Fenix 8', 'Garmin', 'GARMIN_FENIX_8', 'High end multisport GPS watch'),
(24, 6, 'Charge 7 Pro', 'Fitbit', 'FITBIT_CHARGE_7_PRO', 'Fitness tracker and smartwatch hybrid'),

-- Category 7: Electronic Devices
(25, 7, 'Echo Show 15', 'Amazon', 'AMAZON_ECHO_SHOW_15', 'Smart display with Alexa'),
(26, 7, 'Nest Hub Max', 'Google', 'GOOGLE_NEST_HUB_MAX', 'Google smart home hub display'),
(27, 7, 'Streaming Stick Plus', 'Roku', 'ROKU_STREAMING_STICK_PLUS', '4K streaming stick device'),
(28, 7, 'Fire TV Cube 3rd Gen', 'Amazon', 'AMAZON_FIRE_TV_CUBE_3RD_GEN', 'Streaming device plus Alexa hub'),

-- Category 8: Tablets
(29, 8, 'iPad Pro 13', 'Apple', 'APPLE_IPAD_PRO_13', 'Latest iPad Pro large model'),
(30, 8, 'Galaxy Tab S10', 'Samsung', 'SAMSUNG_GALAXY_TAB_S10', 'Flagship Android tablet'),
(31, 8, 'Surface Pro 11', 'Microsoft', 'MICROSOFT_SURFACE_PRO_11', 'Hybrid 2-in-1 tablet PC'),
(32, 8, 'Tab P12', 'Lenovo', 'LENOVO_TAB_P12', 'High performance Android tablet'),

-- Category 9: Shoes
(33, 9, 'Air Jordan 1 High', 'Nike', 'NIKE_AIR_JORDAN_1_HIGH', 'Classic high-top basketball shoe'),
(34, 9, 'UltraBoost 24', 'Adidas', 'ADIDAS_ULTRABOOST_24', 'Running shoe with Boost midsole'),
(35, 9, 'RS-X3', 'Puma', 'PUMA_RS_X3', 'Lifestyle chunky sneaker'),
(36, 9, '550', 'New Balance', 'NEW_BALANCE_550', 'Retro basketball style shoe'),

-- Category 10: Bags
(37, 10, 'Neverfull MM', 'Louis Vuitton', 'LOUIS_VUITTON_NEVERFULL_MM', 'Luxury tote bag'),
(38, 10, 'Little America Backpack', 'Herschel', 'HERSCHEL_LITTLE_AMERICA_BACKPACK', 'Classic backpack style'),
(39, 10, 'Alpha Bravo Sling', 'Tumi', 'TUMI_ALPHA_BRAVO_SLING', 'Crossbody sling bag'),
(40, 10, 'Winfield 3', 'Samsonite', 'SAMSONITE_WINFIELD_3', 'Hard shell carry-on suitcase'),

-- Category 11: Storage Devices
(41, 11, 'T7 Shield 1TB', 'Samsung', 'SAMSUNG_T7_SHIELD_1TB', 'Portable SSD with rugged design'),
(42, 11, 'Extreme Pro 1TB', 'SanDisk', 'SANDISK_EXTREME_PRO_1TB', 'High speed portable SSD'),
(43, 11, 'MyBook 10TB', 'Western Digital', 'WESTERN_DIGITAL_MYBOOK_10TB', 'Desktop external HDD'),
(44, 11, 'Barracuda 4TB', 'Seagate', 'SEAGATE_BARRACUDA_4TB', 'Internal HDD 3.5 inch model');

INSERT INTO Variant (Product_ID, Price, Stock_quantity, Colour, Size, Image_URL) VALUES
-- Category 1: Mobile Phones (Product_ID 1–4)
(1, 1299.00, 50, 'Black', 256, NULL),
(1, 1399.00, 40, 'Silver', 512, NULL),
(2, 1599.00, 35, 'Gold', 256, NULL),
(2, 1799.00, 25, 'Blue', 512, NULL),
(3, 999.00, 45, 'Obsidian', 128, NULL),
(3, 1099.00, 40, 'Snow', 256, NULL),
(4, 899.00, 60, 'Green', 128, NULL),
(4, 999.00, 50, 'Black', 256, NULL),

-- Category 2: Laptops (Product_ID 5–8)
(5, 1399.00, 30, 'Silver', 512, NULL),
(5, 1599.00, 25, 'Space Gray', 1024, NULL),
(6, 1699.00, 20, 'Platinum', 1024, NULL),
(6, 1899.00, 15, 'Black', 2048, NULL),
(7, 1499.00, 30, 'Black', 512, NULL),
(7, 1699.00, 25, 'Carbon Fiber', 1024, NULL),
(8, 1799.00, 20, 'Black', 1024, NULL),
(8, 1999.00, 15, 'Red', 2048, NULL),

-- Category 3: Chargers (Product_ID 9–12)
(9, 59.00, 100, 'White', NULL, NULL),
(9, 64.00, 80, 'Black', NULL, NULL),
(10, 79.00, 60, 'White', NULL, NULL),
(10, 85.00, 50, 'Midnight', NULL, NULL),
(11, 89.00, 70, 'Black', NULL, NULL),
(11, 95.00, 65, 'Silver', NULL, NULL),
(12, 99.00, 40, 'Gray', NULL, NULL),
(12, 109.00, 35, 'White', NULL, NULL),

-- Category 4: Headsets (Product_ID 13–16)
(13, 249.00, 70, 'White', NULL, NULL),
(13, 259.00, 60, 'Black', NULL, NULL),
(14, 399.00, 50, 'Black', NULL, NULL),
(14, 429.00, 45, 'Silver', NULL, NULL),
(15, 349.00, 55, 'White', NULL, NULL),
(15, 359.00, 50, 'Blue', NULL, NULL),
(16, 199.00, 80, 'Gray', NULL, NULL),
(16, 209.00, 70, 'Beige', NULL, NULL),

(17, 2499.00, 10, 'Black', NULL, NULL),
(17, 2699.00, 5, 'Silver', NULL, NULL),
(18, 2199.00, 12, 'Black', NULL, NULL),
(18, 2399.00, 6, 'Silver', NULL, NULL),
(19, 1499.00, 14, 'Black', NULL, NULL),
(19, 1599.00, 7, 'Silver', NULL, NULL),
(20, 1699.00, 13, 'Black', NULL, NULL),
(20, 1799.00, 8, 'Silver', NULL, NULL),


-- Category 6: Watches (Product_ID 21–24)
(21, 499.00, 60, 'Midnight', NULL, NULL),
(21, 549.00, 55, 'Starlight', NULL, NULL),
(22, 449.00, 70, 'Graphite', NULL, NULL),
(22, 469.00, 60, 'Silver', NULL, NULL),
(23, 899.00, 40, 'Black', NULL, NULL),
(23, 949.00, 35, 'Blue', NULL, NULL),
(24, 299.00, 80, 'Black', NULL, NULL),
(24, 319.00, 70, 'White', NULL, NULL),

-- Category 7: Electronic Devices (Product_ID 25–28)
(25, 249.00, 60, 'White', NULL, NULL),
(25, 269.00, 50, 'Black', NULL, NULL),
(26, 229.00, 55, 'White', NULL, NULL),
(26, 239.00, 45, 'Gray', NULL, NULL),
(27, 59.00, 100, 'Black', NULL, NULL),
(27, 69.00, 90, 'Purple', NULL, NULL),
(28, 139.00, 50, 'Black', NULL, NULL),
(28, 149.00, 40, 'Gray', NULL, NULL),

-- Category 8: Tablets (Product_ID 29–32)
(29, 1299.00, 40, 'Silver', 512, NULL),
(29, 1399.00, 35, 'Space Gray', 1024, NULL),
(30, 1099.00, 50, 'Graphite', 256, NULL),
(30, 1199.00, 40, 'Beige', 512, NULL),
(31, 1399.00, 35, 'Silver', 512, NULL),
(31, 1499.00, 30, 'Black', 1024, NULL),
(32, 999.00, 50, 'Gray', 128, NULL),
(32, 1099.00, 45, 'Blue', 256, NULL),

-- Category 9: Shoes (Product_ID 33–36)
(33, 179.00, 60, 'Black', NULL, NULL),
(33, 189.00, 50, 'White', NULL, NULL),
(34, 159.00, 70, 'Gray', NULL, NULL),
(34, 169.00, 65, 'Navy', NULL, NULL),
(35, 149.00, 75, 'Red', NULL, NULL),
(35, 159.00, 65, 'Blue', NULL, NULL),
(36, 139.00, 80, 'Green', NULL, NULL),
(36, 149.00, 70, 'White', NULL, NULL),

-- Category 10: Bags (Product_ID 37–40)
(37, 1599.00, 20, 'Brown', NULL, NULL),
(37, 1699.00, 15, 'Monogram', NULL, NULL),
(38, 129.00, 50, 'Navy', NULL, NULL),
(38, 139.00, 45, 'Black', NULL, NULL),
(39, 249.00, 40, 'Gray', NULL, NULL),
(39, 259.00, 35, 'Black', NULL, NULL),
(40, 199.00, 50, 'Silver', NULL, NULL),
(40, 219.00, 45, 'Blue', NULL, NULL),

-- Category 11: Storage Devices (Product_ID 41–44)
(41, 129.00, 80, 'Blue', 1000, NULL),
(41, 149.00, 70, 'Black', 2000, NULL),
(42, 139.00, 75, 'Gray', 1000, NULL),
(42, 159.00, 65, 'Red', 2000, NULL),
(43, 259.00, 60, 'Black', 10000, NULL),
(43, 279.00, 55, 'White', 10000, NULL),
(44, 109.00, 90, 'Green', 4000, NULL),
(44, 119.00, 85, 'Black', 6000, NULL);

-- Category 1: Mobile Phones
UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875752/dfqpkjvh8/hgmmrbcaf1aw3p5c8j5m.webp' WHERE Product_ID = 1 AND Colour = 'Black';
UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875755/dfqpkjvh8/vbkvdmjphyrdidlogbds.jpg' WHERE Product_ID = 1 AND Colour = 'Silver';
UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875746/dfqpkjvh8/qxycyracr3glvm98gtnv.jpg' WHERE Product_ID = 2 AND Colour = 'Gold';
UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875744/dfqpkjvh8/mx3fgkydfjtnzqgx7w9x.avif' WHERE Product_ID = 2 AND Colour = 'Blue';
UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875747/dfqpkjvh8/ngt7yni8yjxsheuxse0s.jpg' WHERE Product_ID = 3 AND Colour = 'Obsidian';
UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875748/dfqpkjvh8/ruiok5qef8xzvr3mud17.webp' WHERE Product_ID = 3 AND Colour = 'Snow';
UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875751/dfqpkjvh8/tugtp1jksszykc2h7u46.png' WHERE Product_ID = 4 AND Colour = 'Green';
UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875749/dfqpkjvh8/yq1wa4fwux7cdye4hssb.avif' WHERE Product_ID = 4 AND Colour = 'Black';

-- Category 2: Laptops
UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875675/dfqpkjvh8/sxujqrbu2yqyd2pinrlc.jpg' WHERE Product_ID = 5 AND Colour = 'Silver';
UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875678/dfqpkjvh8/iquhl88qt6l1dzxkg6q7.jpg' WHERE Product_ID = 5 AND Colour = 'Space Gray';
UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875689/dfqpkjvh8/q843i5xgbs31soa19ggw.avif' WHERE Product_ID = 6 AND Colour = 'Platinum';
UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875690/dfqpkjvh8/xyylqojhherh9bxetdiq.avif' WHERE Product_ID = 6 AND Colour = 'Black';
UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875691/dfqpkjvh8/f6nnysmabzioaibejlza.jpg' WHERE Product_ID = 7 AND Colour = 'Black';
UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875693/dfqpkjvh8/nay2pcftrawz5hu7rq6e.avif' WHERE Product_ID = 7 AND Colour = 'Carbon Fiber';
UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875679/dfqpkjvh8/onbuce12axxfpqrnqob4.png' WHERE Product_ID = 8 AND Colour = 'Black';
UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875687/dfqpkjvh8/slwl5pkjhanqqx76zjbc.png' WHERE Product_ID = 8 AND Colour = 'Red';

-- Category 3: Chargers
UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875561/dfqpkjvh8/leyalydx1lrmablnyods.avif' WHERE Product_ID = 9 AND Colour = 'Black';
UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875562/dfqpkjvh8/dggxprfefokfkhhgd06f.avif' WHERE Product_ID = 9 AND Colour = 'White';
UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875565/dfqpkjvh8/pymtdn7mcgqrgjbkn3ky.webp' WHERE Product_ID = 10 AND Colour = 'White';
UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875564/dfqpkjvh8/xpkabacc1ajd7hfnfw00.jpg' WHERE Product_ID = 10 AND Colour = 'Midnight';
UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875559/dfqpkjvh8/dw9amqc1e4f326iwbtcd.avif' WHERE Product_ID = 11 AND Colour = 'Black';
UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875560/dfqpkjvh8/ccv6n9ztslxckjtzwepw.avif' WHERE Product_ID = 11 AND Colour = 'Silver';
UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875566/dfqpkjvh8/f3uem8wjrq0bkyiyjfpy.webp' WHERE Product_ID = 12 AND Colour = 'Gray';
UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875567/dfqpkjvh8/g3pjkoa0zitc8ewr3mnl.jpg' WHERE Product_ID = 12 AND Colour = 'White';

-- Category 4: Headsets
UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875642/dfqpkjvh8/rhwyt3diywhzjkiy43iw.jpg' WHERE Product_ID = 13 AND Colour = 'White';
UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875641/dfqpkjvh8/rzcwaie8ccw23x5dfwhq.jpg' WHERE Product_ID = 13 AND Colour = 'Black';
UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875648/dfqpkjvh8/q3etbprwda7fkam4lxad.webp' WHERE Product_ID = 14 AND Colour = 'Black';
UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875649/dfqpkjvh8/liitmun8ugytkhbgiuw1.png' WHERE Product_ID = 14 AND Colour = 'Silver';
UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875645/dfqpkjvh8/lwgtimwuvzhzkv0jygkr.jpg' WHERE Product_ID = 15 AND Colour = 'White';
UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875643/dfqpkjvh8/kqeuuzqwwftedtglih32.jpg' WHERE Product_ID = 15 AND Colour = 'Blue';
UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875647/dfqpkjvh8/i5yctpbrzzda6rweu9fx.jpg' WHERE Product_ID = 16 AND Colour = 'Gray';
UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875646/dfqpkjvh8/ir6orqfhf18prine6fta.jpg' WHERE Product_ID = 16 AND Colour = 'Beige';

-- Category 5: Cameras
UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875509/dfqpkjvh8/ea1kitccmdtzkqyfb01l.jpg' WHERE Product_ID = 17 AND Colour = 'Black';
UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875510/dfqpkjvh8/rmbrbnlklzimmzzqwjnn.jpg' WHERE Product_ID = 17 AND Colour = 'Silver';
UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875515/dfqpkjvh8/xb8j2lj6dzquomojznze.webp' WHERE Product_ID = 18 AND Colour = 'Black';
UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875516/dfqpkjvh8/jzjgltys6smyoubn6ajy.jpg' WHERE Product_ID = 18 AND Colour = 'Silver';
UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875513/dfqpkjvh8/x0xlolmtyxrepkjakbye.jpg' WHERE Product_ID = 19 AND Colour = 'Black';
UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875514/dfqpkjvh8/mkzklxcfh0zcnwhwf2ut.jpg' WHERE Product_ID = 19 AND Colour = 'Silver';
UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875511/dfqpkjvh8/ac3ntqcsrkke0isgqgjb.jpg' WHERE Product_ID = 20 AND Colour = 'Black';
UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875512/dfqpkjvh8/zxz8isjgkdnm7qcdbyat.jpg' WHERE Product_ID = 20 AND Colour = 'Silver';

-- Category 6: Watches
UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875916/dfqpkjvh8/wa2udphmsivbhcvndsvf.jpg' WHERE Product_ID = 21 AND Colour = 'Midnight';
UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875917/dfqpkjvh8/yuan3lgeidaxzlgmxv9w.jpg' WHERE Product_ID = 21 AND Colour = 'Starlight';
UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875923/dfqpkjvh8/k4sg6cmjxeabkqnpr799.webp' WHERE Product_ID = 22 AND Colour = 'Graphite';
UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875925/dfqpkjvh8/hkekyxoof5dyuth9gcbr.jpg' WHERE Product_ID = 22 AND Colour = 'Silver';
UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875921/dfqpkjvh8/xygehulttzc4g2kvxzh5.webp' WHERE Product_ID = 23 AND Colour = 'Black';
UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875922/dfqpkjvh8/ww1ce2uqyqa70a8po4jt.webp' WHERE Product_ID = 23 AND Colour = 'Blue';
UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875918/dfqpkjvh8/poys7acidq8abgdjnkjr.jpg' WHERE Product_ID = 24 AND Colour = 'Black';
UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875920/dfqpkjvh8/ne3oavdks2lysrmibhxr.webp' WHERE Product_ID = 24 AND Colour = 'White';

-- Category 7: Electronic Devices
UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875606/dfqpkjvh8/bcuzzii4pfwkay34ckqm.avif' WHERE Product_ID = 25 AND Colour = 'Black';
UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875610/dfqpkjvh8/pxxhf6aiqdixm1t1qhe9.png' WHERE Product_ID = 25 AND Colour = 'White';
UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875617/dfqpkjvh8/rnorbiyahyydjl096ei2.jpg' WHERE Product_ID = 26 AND Colour = 'White';
UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875615/dfqpkjvh8/ylvjqqdjqxzvfyhkquab.avif' WHERE Product_ID = 26 AND Colour = 'Gray';
UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875618/dfqpkjvh8/sh5aa8urbwl02xzpjo8o.jpg' WHERE Product_ID = 27 AND Colour = 'Black';
UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875619/dfqpkjvh8/vaymolmzc2boqousz053.webp' WHERE Product_ID = 27 AND Colour = 'Purple';
UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875612/dfqpkjvh8/spm6ydmtb444qqvhwwjm.webp' WHERE Product_ID = 28 AND Colour = 'Black';
UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875614/dfqpkjvh8/wttpi8fgmsvwd3mcjhap.jpg' WHERE Product_ID = 28 AND Colour = 'Gray';

-- Category 8: Tablets
UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875881/dfqpkjvh8/taxn5irvmjwokectfwwp.jpg' 
WHERE Product_ID = 29 AND Colour = 'Silver';

UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875882/dfqpkjvh8/uow3il1plwnaxezbqzzn.jpg' 
WHERE Product_ID = 29 AND Colour = 'Space Gray';

UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875887/dfqpkjvh8/gg5wruelwpq4hvy6bmx3.jpg' 
WHERE Product_ID = 30 AND Colour = 'Graphite';

UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875888/dfqpkjvh8/ydre6excdl4ef85ksnzj.avif' 
WHERE Product_ID = 30 AND Colour = 'Beige';

UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875885/dfqpkjvh8/i6puejt11gop9k3nmrpv.jpg' 
WHERE Product_ID = 31 AND Colour = 'Black';

UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875886/dfqpkjvh8/gl7de8wyuug9b8wzl5rx.jpg' 
WHERE Product_ID = 31 AND Colour = 'Silver';

UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875883/dfqpkjvh8/jsjpzuaqlkioywyisj2d.jpg' 
WHERE Product_ID = 32 AND Colour = 'Gray';

UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875884/dfqpkjvh8/ovkzcho5yxygruadu1dr.jpg' 
WHERE Product_ID = 32 AND Colour = 'Blue';

-- Category 9: Shoes
UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875782/dfqpkjvh8/gtmbzkafjjadtzbpkovb.jpg' 
WHERE Product_ID = 33 AND Colour = 'Black';

UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875783/dfqpkjvh8/vsu6xcneplkhuo1lzl4s.webp' 
WHERE Product_ID = 33 AND Colour = 'White';

UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875778/dfqpkjvh8/nl055nx3fiw7fefxdvvv.webp' 
WHERE Product_ID = 34 AND Colour = 'Gray';

UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875779/dfqpkjvh8/xztcsewzocsuyvqpmhps.jpg' 
WHERE Product_ID = 34 AND Colour = 'Navy';

UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875784/dfqpkjvh8/kzzjvyafakg10t4zqalx.avif' 
WHERE Product_ID = 35 AND Colour = 'Blue';

UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875785/dfqpkjvh8/r9kgsvfoingfwuwug94w.webp' 
WHERE Product_ID = 35 AND Colour = 'Red';

UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875780/dfqpkjvh8/labewa8hrq2g1djq1gum.webp' 
WHERE Product_ID = 36 AND Colour = 'Green';

UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875781/dfqpkjvh8/dxoxtbe2smx5jiousj8r.jpg' 
WHERE Product_ID = 36 AND Colour = 'White';

-- Category 10: Bags
UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875006/dfqpkjvh8/gfgc8u5au4ylcv8b5xqm.webp' 
WHERE Product_ID = 37 AND Colour = 'Brown';

UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875007/dfqpkjvh8/sdnjh7z7lhrifq0zcolw.webp' 
WHERE Product_ID = 37 AND Colour = 'Monogram';

UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875005/dfqpkjvh8/uyvxquinuggrtuuskxou.jpg' 
WHERE Product_ID = 38 AND Colour = 'Navy';

UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875004/dfqpkjvh8/oh6ou9ibpuh8otarlsis.jpg' 
WHERE Product_ID = 38 AND Colour = 'Black';

UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875011/dfqpkjvh8/chi8pr3be7dcvfcxzhlc.jpg' 
WHERE Product_ID = 39 AND Colour = 'Gray';

UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875012/dfqpkjvh8/ugmdqrx2jsesqaxdeiuu.jpg' 
WHERE Product_ID = 39 AND Colour = 'Black';

UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875010/dfqpkjvh8jvh8/image/upload/v1760875010/dfqpkjvh8/dcnki1ly5lmnkljy0vwg.jpg' 
WHERE Product_ID = 40 AND Colour = 'Silver';

UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875008/dfqpkjvh8/qpu86w4gvt9u3m3mjdvw.jpg' 
WHERE Product_ID = 40 AND Colour = 'Blue';

-- Category 11: Storage Devices
UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875850/dfqpkjvh8/kei9ewampl45ziurhbe1.webp' 
WHERE Product_ID = 41 AND Colour = 'Blue';

UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875848/dfqpkjvh8/atdzk5jl7ogdce3ucthz.avif' 
WHERE Product_ID = 41 AND Colour = 'Black';

UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875851/dfqpkjvh8/ghyuzly7c47uidyxt83l.webp' 
WHERE Product_ID = 42 AND Colour = 'Gray';

UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875852/dfqpkjvh8/l0gnlqccch8flwzv97qi.png' 
WHERE Product_ID = 42 AND Colour = 'Red';

UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875855/dfqpkjvh8/darv0dpgsqddknqcew0x.png' 
WHERE Product_ID = 43 AND Colour = 'Black';

UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875856/dfqpkjvh8/mg8jqzflooukzxzvqfrx.jpg' 
WHERE Product_ID = 43 AND Colour = 'White';

UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875854/dfqpkjvh8/enxlyxkcgrsi7nztrpkj.jpg' 
WHERE Product_ID = 44 AND Colour = 'Green';

UPDATE Variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875853/dfqpkjvh8/tdvsrhzoq2xhyxk1hxal.webp' 
WHERE Product_ID = 44 AND Colour ='Black';

-- Insert Sample Cities (with New York as main city)
INSERT INTO City (City_ID, City_Name, Main_City) VALUES
(1, 'New York', 1),
(2, 'Los Angeles', 0),
(3, 'Chicago', 0),
(4, 'Houston', 0),
(5, 'Phoenix', 0),
(6, 'Philadelphia', 0),
(7, 'San Antonio', 0),
(8, 'San Diego', 0),
(9, 'Dallas', 0),
(10, 'San Jose', 0);

-- Insert Sample Users (20 users)
INSERT INTO User (User_ID, Name, Password, Address, City_ID, Email, Role, image_URL) VALUES
(1, 'John Smith', '$2b$10$Vh8O4vV3eACDm4z9yqFZ7u4Q8klGPGi5zX5tKZy6x7Zxu6hM9k7hW', '123 Main St', 1, 'john@email.com', 'user', NULL),
(2, 'Sarah Johnson', '$2b$10$Vh8O4vV3eACDm4z9yqFZ7u4Q8klGPGi5zX5tKZy6x7Zxu6hM9k7hW', '456 Oak Ave', 2, 'sarah@email.com', 'user', NULL),
(3, 'Michael Brown', '$2b$10$Vh8O4vV3eACDm4z9yqFZ7u4Q8klGPGi5zX5tKZy6x7Zxu6hM9k7hW', '789 Pine Rd', 3, 'michael@email.com', 'user', NULL),
(4, 'Emily Davis', '$2b$10$Vh8O4vV3eACDm4z9yqFZ7u4Q8klGPGi5zX5tKZy6x7Zxu6hM9k7hW', '321 Elm St', 4, 'emily@email.com', 'user', NULL),
(5, 'David Wilson', '$2b$10$Vh8O4vV3eACDm4z9yqFZ7u4Q8klGPGi5zX5tKZy6x7Zxu6hM9k7hW', '654 Maple Dr', 5, 'david@email.com', 'user', NULL),
(6, 'Jessica Miller', '$2b$10$Vh8O4vV3eACDm4z9yqFZ7u4Q8klGPGi5zX5tKZy6x7Zxu6hM9k7hW', '987 Cedar Ln', 6, 'jessica@email.com', 'user', NULL),
(7, 'Chris Taylor', '$2b$10$Vh8O4vV3eACDm4z9yqFZ7u4Q8klGPGi5zX5tKZy6x7Zxu6hM9k7hW', '111 Birch St', 7, 'chris@email.com', 'user', NULL),
(8, 'Amanda Anderson', '$2b$10$Vh8O4vV3eACDm4z9yqFZ7u4Q8klGPGi5zX5tKZy6x7Zxu6hM9k7hW', '222 Spruce Ave', 8, 'amanda@email.com', 'user', NULL),
(9, 'Robert Thomas', '$2b$10$Vh8O4vV3eACDm4z9yqFZ7u4Q8klGPGi5zX5tKZy6x7Zxu6hM9k7hW', '333 Ash Rd', 9, 'robert@email.com', 'user', NULL),
(10, 'Lisa Jackson', '$2b$10$Vh8O4vV3eACDm4z9yqFZ7u4Q8klGPGi5zX5tKZy6x7Zxu6hM9k7hW', '444 Willow Dr', 10, 'lisa@email.com', 'user', NULL),
(11, 'James White', '$2b$10$Vh8O4vV3eACDm4z9yqFZ7u4Q8klGPGi5zX5tKZy6x7Zxu6hM9k7hW', '555 Poplar Ln', 1, 'james@email.com', 'user', NULL),
(12, 'Michelle Harris', '$2b$10$Vh8O4vV3eACDm4z9yqFZ7u4Q8klGPGi5zX5tKZy6x7Zxu6hM9k7hW', '666 Laurel St', 2, 'michelle@email.com', 'user', NULL),
(13, 'Daniel Martin', '$2b$10$Vh8O4vV3eACDm4z9yqFZ7u4Q8klGPGi5zX5tKZy6x7Zxu6hM9k7hW', '777 Oak St', 3, 'daniel@email.com', 'user', NULL),
(14, 'Karen Lee', '$2b$10$Vh8O4vV3eACDm4z9yqFZ7u4Q8klGPGi5zX5tKZy6x7Zxu6hM9k7hW', '888 Pine Ave', 4, 'karen@email.com', 'user', NULL),
(15, 'Matthew Perez', '$2b$10$Vh8O4vV3eACDm4z9yqFZ7u4Q8klGPGi5zX5tKZy6x7Zxu6hM9k7hW', '999 Elm Rd', 5, 'matthew@email.com', 'user', NULL),
(16, 'Jennifer Garcia', '$2b$10$Vh8O4vV3eACDm4z9yqFZ7u4Q8klGPGi5zX5tKZy6x7Zxu6hM9k7hW', '1010 Maple St', 6, 'jennifer@email.com', 'user', NULL),
(17, 'Mark Rodriguez', '$2b$10$Vh8O4vV3eACDm4z9yqFZ7u4Q8klGPGi5zX5tKZy6x7Zxu6hM9k7hW', '1111 Cedar Ave', 7, 'mark@email.com', 'user', NULL),
(18, 'Patricia Lewis', '$2b$10$Vh8O4vV3eACDm4z9yqFZ7u4Q8klGPGi5zX5tKZy6x7Zxu6hM9k7hW', '1212 Birch Rd', 8, 'patricia@email.com', 'user', NULL),
(19, 'Steven Walker', '$2b$10$Vh8O4vV3eACDm4z9yqFZ7u4Q8klGPGi5zX5tKZy6x7Zxu6hM9k7hW', '1313 Spruce St', 9, 'steven@email.com', 'user', NULL),
(20, 'Nancy Hall', '$2b$10$Vh8O4vV3eACDm4z9yqFZ7u4Q8klGPGi5zX5tKZy6x7Zxu6hM9k7hW', '1414 Ash Ave', 10, 'nancy@email.com', 'user', NULL),
(21, 'Admin', '$2b$10$FMtxpGM3MQqDvpG014l5bOPEjIk4JI1ZHu7ilN6K95iehw9YKq98y', NULL,NULL, 'Admin1@example.com', 'admin', NULL);

-- Insert Sample Delivery Records (120 delivery records for 120 orders)
INSERT INTO Delivery (Delivery_ID, Delivery_Method, Delivery_Address, Delivery_Status, Estimated_delivery_Date) VALUES
-- 2023 Deliveries (40 records)
(1, 'Standard', '123 Main St, New York', 'Delivered', '2023-01-15'),
(2, 'Pickup', '456 Oak Ave, Los Angeles', 'Delivered', '2023-01-20'),
(3, 'Standard', '789 Pine Rd, Chicago', 'Delivered', '2023-02-10'),
(4, 'Pickup', '321 Elm St, Houston', 'Delivered', '2023-02-18'),
(5, 'Standard', '654 Maple Dr, Phoenix', 'Delivered', '2023-03-05'),
(6, 'Standard', '987 Cedar Ln, Philadelphia', 'Delivered', '2023-03-15'),
(7, 'Standard', '111 Birch St, San Antonio', 'Delivered', '2023-04-12'),
(8, 'Pickup', '222 Spruce Ave, San Diego', 'Delivered', '2023-04-22'),
(9, 'Standard', '333 Ash Rd, Dallas', 'Delivered', '2023-05-08'),
(10, 'Standard', '444 Willow Dr, San Jose', 'Delivered', '2023-05-18'),
(11, 'Standard', '555 Poplar Ln, New York', 'Delivered', '2023-06-10'),
(12, 'Pickup', '666 Laurel St, Los Angeles', 'Delivered', '2023-06-20'),
(13, 'Standard', '777 Oak St, Chicago', 'Delivered', '2023-07-12'),
(14, 'Pickup', '888 Pine Ave, Houston', 'Delivered', '2023-07-25'),
(15, 'Standard', '999 Elm Rd, Phoenix', 'Delivered', '2023-08-08'),
(16, 'Standard', '1010 Maple St, Philadelphia', 'Delivered', '2023-08-18'),
(17, 'Standard', '1111 Cedar Ave, San Antonio', 'Delivered', '2023-09-05'),
(18, 'Pickup', '1212 Birch Rd, San Diego', 'Delivered', '2023-09-15'),
(19, 'Standard', '1313 Spruce St, Dallas', 'Delivered', '2023-10-10'),
(20, 'Standard', '1414 Ash Ave, San Jose', 'Delivered', '2023-10-20'),
(21, 'Standard', '123 Main St, New York', 'Delivered', '2023-11-08'),
(22, 'Pickup', '456 Oak Ave, Los Angeles', 'Delivered', '2023-11-18'),
(23, 'Standard', '789 Pine Rd, Chicago', 'Delivered', '2023-12-05'),
(24, 'Standard', '321 Elm St, Houston', 'Delivered', '2023-12-15'),
(25, 'Standard', '654 Maple Dr, Phoenix', 'Delivered', '2023-01-25'),
(26, 'Pickup', '987 Cedar Ln, Philadelphia', 'Delivered', '2023-02-28'),
(27, 'Standard', '111 Birch St, San Antonio', 'Delivered', '2023-03-28'),
(28, 'Standard', '222 Spruce Ave, San Diego', 'Delivered', '2023-04-30'),
(29, 'Standard', '333 Ash Rd, Dallas', 'Delivered', '2023-05-25'),
(30, 'Pickup', '444 Willow Dr, San Jose', 'Delivered', '2023-06-28'),
(31, 'Standard', '555 Poplar Ln, New York', 'Delivered', '2023-07-30'),
(32, 'Standard', '666 Laurel St, Los Angeles', 'Delivered', '2023-08-25'),
(33, 'Standard', '777 Oak St, Chicago', 'Delivered', '2023-09-20'),
(34, 'Pickup', '888 Pine Ave, Houston', 'Delivered', '2023-10-28'),
(35, 'Standard', '999 Elm Rd, Phoenix', 'Delivered', '2023-11-15'),
(36, 'Standard', '1010 Maple St, Philadelphia', 'Delivered', '2023-12-10'),
(37, 'Standard', '1111 Cedar Ave, San Antonio', 'Delivered', '2023-01-30'),
(38, 'Pickup', '1212 Birch Rd, San Diego', 'Delivered', '2023-02-20'),
(39, 'Standard', '1313 Spruce St, Dallas', 'Delivered', '2023-03-22'),
(40, 'Standard', '1414 Ash Ave, San Jose', 'Delivered', '2023-04-25'),

-- 2024 Deliveries (40 records)
(41, 'Standard', '123 Main St, New York', 'Delivered', '2024-01-15'),
(42, 'Pickup', '456 Oak Ave, Los Angeles', 'Delivered', '2024-01-25'),
(43, 'Standard', '789 Pine Rd, Chicago', 'Delivered', '2024-02-12'),
(44, 'Standard', '321 Elm St, Houston', 'Delivered', '2024-02-22'),
(45, 'Standard', '654 Maple Dr, Phoenix', 'Delivered', '2024-03-10'),
(46, 'Pickup', '987 Cedar Ln, Philadelphia', 'Delivered', '2024-03-20'),
(47, 'Standard', '111 Birch St, San Antonio', 'Delivered', '2024-04-08'),
(48, 'Standard', '222 Spruce Ave, San Diego', 'Delivered', '2024-04-18'),
(49, 'Standard', '333 Ash Rd, Dallas', 'Delivered', '2024-05-12'),
(50, 'Pickup', '444 Willow Dr, San Jose', 'Delivered', '2024-05-22'),
(51, 'Standard', '555 Poplar Ln, New York', 'Delivered', '2024-06-08'),
(52, 'Standard', '666 Laurel St, Los Angeles', 'Delivered', '2024-06-18'),
(53, 'Standard', '777 Oak St, Chicago', 'Pending', '2024-07-15'),
(54, 'Pickup', '888 Pine Ave, Houston', 'Delivered', '2024-07-25'),
(55, 'Standard', '999 Elm Rd, Phoenix', 'Delivered', '2024-08-10'),
(56, 'Standard', '1010 Maple St, Philadelphia', 'Pending', '2024-08-20'),
(57, 'Standard', '1111 Cedar Ave, San Antonio', 'Delivered', '2024-09-08'),
(58, 'Pickup', '1212 Birch Rd, San Diego', 'Delivered', '2024-09-18'),
(59, 'Standard', '1313 Spruce St, Dallas', 'Pending', '2024-10-12'),
(60, 'Standard', '1414 Ash Ave, San Jose', 'Delivered', '2024-10-22'),
(61, 'Standard', '123 Main St, New York', 'Delivered', '2024-11-10'),
(62, 'Pickup', '456 Oak Ave, Los Angeles', 'Pending', '2024-11-20'),
(63, 'Standard', '789 Pine Rd, Chicago', 'Delivered', '2024-12-08'),
(64, 'Standard', '321 Elm St, Houston', 'Delivered', '2024-12-18'),
(65, 'Standard', '654 Maple Dr, Phoenix', 'Delivered', '2024-01-28'),
(66, 'Pickup', '987 Cedar Ln, Philadelphia', 'Delivered', '2024-02-28'),
(67, 'Standard', '111 Birch St, San Antonio', 'Pending', '2024-03-30'),
(68, 'Standard', '222 Spruce Ave, San Diego', 'Delivered', '2024-04-28'),
(69, 'Standard', '333 Ash Rd, Dallas', 'Delivered', '2024-05-28'),
(70, 'Pickup', '444 Willow Dr, San Jose', 'Pending', '2024-06-28'),
(71, 'Standard', '555 Poplar Ln, New York', 'Delivered', '2024-07-28'),
(72, 'Standard', '666 Laurel St, Los Angeles', 'Delivered', '2024-08-28'),
(73, 'Standard', '777 Oak St, Chicago', 'Delivered', '2024-09-25'),
(74, 'Pickup', '888 Pine Ave, Houston', 'Pending', '2024-10-28'),
(75, 'Standard', '999 Elm Rd, Phoenix', 'Delivered', '2024-11-20'),
(76, 'Standard', '1010 Maple St, Philadelphia', 'Delivered', '2024-12-15'),
(77, 'Standard', '1111 Cedar Ave, San Antonio', 'Delivered', '2024-02-05'),
(78, 'Pickup', '1212 Birch Rd, San Diego', 'Delivered', '2024-03-08'),
(79, 'Standard', '1313 Spruce St, Dallas', 'Pending', '2024-04-10'),
(80, 'Standard', '1414 Ash Ave, San Jose', 'Delivered', '2024-05-12'),

-- 2025 Deliveries (40 records)
(81, 'Standard', '123 Main St, New York', 'Pending', '2025-01-20'),
(82, 'Pickup', '456 Oak Ave, Los Angeles', 'Pending', '2025-01-28'),
(83, 'Standard', '789 Pine Rd, Chicago', 'Pending', '2025-02-15'),
(84, 'Standard', '321 Elm St, Houston', 'Pending', '2025-02-25'),
(85, 'Standard', '654 Maple Dr, Phoenix', 'Pending', '2025-03-15'),
(86, 'Pickup', '987 Cedar Ln, Philadelphia', 'Pending', '2025-03-25'),
(87, 'Standard', '111 Birch St, San Antonio', 'Pending', '2025-04-12'),
(88, 'Standard', '222 Spruce Ave, San Diego', 'Pending', '2025-04-22'),
(89, 'Standard', '333 Ash Rd, Dallas', 'Pending', '2025-05-15'),
(90, 'Pickup', '444 Willow Dr, San Jose', 'Pending', '2025-05-25'),
(91, 'Standard', '555 Poplar Ln, New York', 'Pending', '2025-06-12'),
(92, 'Standard', '666 Laurel St, Los Angeles', 'Pending', '2025-06-22'),
(93, 'Standard', '777 Oak St, Chicago', 'Pending', '2025-07-18'),
(94, 'Pickup', '888 Pine Ave, Houston', 'Pending', '2025-07-28'),
(95, 'Standard', '999 Elm Rd, Phoenix', 'Pending', '2025-08-15'),
(96, 'Standard', '1010 Maple St, Philadelphia', 'Pending', '2025-08-25'),
(97, 'Standard', '1111 Cedar Ave, San Antonio', 'Pending', '2025-09-12'),
(98, 'Pickup', '1212 Birch Rd, San Diego', 'Pending', '2025-09-22'),
(99, 'Standard', '1313 Spruce St, Dallas', 'Pending', '2025-10-15'),
(100, 'Standard', '1414 Ash Ave, San Jose', 'Pending', '2025-10-25'),
(101, 'Standard', '123 Main St, New York', 'Pending', '2025-11-12'),
(102, 'Pickup', '456 Oak Ave, Los Angeles', 'Pending', '2025-11-22'),
(103, 'Standard', '789 Pine Rd, Chicago', 'Pending', '2025-12-10'),
(104, 'Standard', '321 Elm St, Houston', 'Pending', '2025-12-20'),
(105, 'Standard', '654 Maple Dr, Phoenix', 'Pending', '2025-01-25'),
(106, 'Pickup', '987 Cedar Ln, Philadelphia', 'Pending', '2025-02-28'),
(107, 'Standard', '111 Birch St, San Antonio', 'Pending', '2025-03-28'),
(108, 'Standard', '222 Spruce Ave, San Diego', 'Pending', '2025-04-30'),
(109, 'Standard', '333 Ash Rd, Dallas', 'Pending', '2025-05-28'),
(110, 'Pickup', '444 Willow Dr, San Jose', 'Pending', '2025-06-30'),
(111, 'Standard', '555 Poplar Ln, New York', 'Pending', '2025-07-30'),
(112, 'Standard', '666 Laurel St, Los Angeles', 'Pending', '2025-08-28'),
(113, 'Standard', '777 Oak St, Chicago', 'Pending', '2025-09-22'),
(114, 'Pickup', '888 Pine Ave, Houston', 'Pending', '2025-10-30'),
(115, 'Standard', '999 Elm Rd, Phoenix', 'Pending', '2025-11-18'),
(116, 'Standard', '1010 Maple St, Philadelphia', 'Pending', '2025-12-12'),
(117, 'Standard', '1111 Cedar Ave, San Antonio', 'Pending', '2025-02-08'),
(118, 'Pickup', '1212 Birch Rd, San Diego', 'Pending', '2025-03-10'),
(119, 'Standard', '1313 Spruce St, Dallas', 'Pending', '2025-04-12'),
(120, 'Standard', '1414 Ash Ave, San Jose', 'Pending', '2025-05-15');

-- Insert Sample Carts (120 carts, one per order)
INSERT INTO Cart (Cart_ID, User_ID, Status) VALUES
(1, 1, 'CheckedOut'), (2, 2, 'CheckedOut'), (3, 3, 'CheckedOut'), (4, 4, 'CheckedOut'), (5, 5, 'CheckedOut'),
(6, 6, 'CheckedOut'), (7, 7, 'CheckedOut'), (8, 8, 'CheckedOut'), (9, 9, 'CheckedOut'), (10, 10, 'CheckedOut'),
(11, 11, 'CheckedOut'), (12, 12, 'CheckedOut'), (13, 13, 'CheckedOut'), (14, 14, 'CheckedOut'), (15, 15, 'CheckedOut'),
(16, 16, 'CheckedOut'), (17, 17, 'CheckedOut'), (18, 18, 'CheckedOut'), (19, 19, 'CheckedOut'), (20, 20, 'CheckedOut'),
(21, 1, 'CheckedOut'), (22, 2, 'CheckedOut'), (23, 3, 'CheckedOut'), (24, 4, 'CheckedOut'), (25, 5, 'CheckedOut'),
(26, 6, 'CheckedOut'), (27, 7, 'CheckedOut'), (28, 8, 'CheckedOut'), (29, 9, 'CheckedOut'), (30, 10, 'CheckedOut'),
(31, 11, 'CheckedOut'), (32, 12, 'CheckedOut'), (33, 13, 'CheckedOut'), (34, 14, 'CheckedOut'), (35, 15, 'CheckedOut'),
(36, 16, 'CheckedOut'), (37, 17, 'CheckedOut'), (38, 18, 'CheckedOut'), (39, 19, 'CheckedOut'), (40, 20, 'CheckedOut'),
(41, 1, 'CheckedOut'), (42, 2, 'CheckedOut'), (43, 3, 'CheckedOut'), (44, 4, 'CheckedOut'), (45, 5, 'CheckedOut'),
(46, 6, 'CheckedOut'), (47, 7, 'CheckedOut'), (48, 8, 'CheckedOut'), (49, 9, 'CheckedOut'), (50, 10, 'CheckedOut'),
(51, 11, 'CheckedOut'), (52, 12, 'CheckedOut'), (53, 13, 'CheckedOut'), (54, 14, 'CheckedOut'), (55, 15, 'CheckedOut'),
(56, 16, 'CheckedOut'), (57, 17, 'CheckedOut'), (58, 18, 'CheckedOut'), (59, 19, 'CheckedOut'), (60, 20, 'CheckedOut'),
(61, 1, 'CheckedOut'), (62, 2, 'CheckedOut'), (63, 3, 'CheckedOut'), (64, 4, 'CheckedOut'), (65, 5, 'CheckedOut'),
(66, 6, 'CheckedOut'), (67, 7, 'CheckedOut'), (68, 8, 'CheckedOut'), (69, 9, 'CheckedOut'), (70, 10, 'CheckedOut'),
(71, 11, 'CheckedOut'), (72, 12, 'CheckedOut'), (73, 13, 'CheckedOut'), (74, 14, 'CheckedOut'), (75, 15, 'CheckedOut'),
(76, 16, 'CheckedOut'), (77, 17, 'CheckedOut'), (78, 18, 'CheckedOut'), (79, 19, 'CheckedOut'), (80, 20, 'CheckedOut'),
(81, 1, 'CheckedOut'), (82, 2, 'CheckedOut'), (83, 3, 'CheckedOut'), (84, 4, 'CheckedOut'), (85, 5, 'CheckedOut'),
(86, 6, 'CheckedOut'), (87, 7, 'CheckedOut'), (88, 8, 'CheckedOut'), (89, 9, 'CheckedOut'), (90, 10, 'CheckedOut'),
(91, 11, 'CheckedOut'), (92, 12, 'CheckedOut'), (93, 13, 'CheckedOut'), (94, 14, 'CheckedOut'), (95, 15, 'CheckedOut'),
(96, 16, 'CheckedOut'), (97, 17, 'CheckedOut'), (98, 18, 'CheckedOut'), (99, 19, 'CheckedOut'), (100, 20, 'CheckedOut'),
(101, 1, 'CheckedOut'), (102, 2, 'CheckedOut'), (103, 3, 'CheckedOut'), (104, 4, 'CheckedOut'), (105, 5, 'CheckedOut'),
(106, 6, 'CheckedOut'), (107, 7, 'CheckedOut'), (108, 8, 'CheckedOut'), (109, 9, 'CheckedOut'), (110, 10, 'CheckedOut'),
(111, 11, 'CheckedOut'), (112, 12, 'CheckedOut'), (113, 13, 'CheckedOut'), (114, 14, 'CheckedOut'), (115, 15, 'CheckedOut'),
(116, 16, 'CheckedOut'), (117, 17, 'CheckedOut'), (118, 18, 'CheckedOut'), (119, 19, 'CheckedOut'), (120, 20, 'CheckOut');

-- Insert Sample Cart Items (2-3 items per cart)
INSERT INTO Cart_Item (Cart_ID, Product_ID, Variant_ID, Quantity, Total_price) VALUES
(1, 1, 1, 1, 1299.00), (1, 9, 9, 2, 118.00),
(2, 5, 9, 1, 1399.00), (2, 13, 17, 1, 249.00),
(3, 2, 3, 1, 1599.00), (3, 21, 41, 2, 998.00),
(4, 6, 11, 1, 1699.00), (4, 33, 65, 1, 179.00),
(5, 3, 5, 1, 999.00), (5, 14, 19, 1, 399.00),
(6, 7, 13, 1, 1499.00), (6, 38, 71, 1, 129.00),
(7, 4, 7, 2, 1798.00), (7, 15, 21, 1, 349.00),
(8, 10, 15, 1, 79.00), (8, 22, 43, 2, 898.00),
(9, 11, 17, 1, 89.00), (9, 29, 57, 1, 1299.00),
(10, 12, 19, 2, 198.00), (10, 34, 67, 1, 159.00),
(11, 17, 25, 1, 2499.00), (11, 24, 47, 2, 598.00),
(12, 18, 29, 1, 2199.00), (12, 39, 75, 1, 249.00),
(13, 19, 33, 1, 1499.00), (13, 41, 81, 2, 258.00),
(14, 20, 37, 1, 1699.00), (14, 37, 69, 1, 1599.00),
(15, 25, 45, 1, 249.00), (15, 42, 83, 1, 139.00),
(16, 26, 49, 2, 458.00), (16, 35, 69, 1, 149.00),
(17, 27, 53, 1, 59.00), (17, 43, 85, 1, 259.00),
(18, 28, 55, 1, 139.00), (18, 30, 59, 1, 1099.00),
(19, 31, 61, 1, 1399.00), (19, 36, 71, 2, 278.00),
(20, 32, 63, 1, 999.00), (20, 40, 77, 1, 199.00),
(21, 1, 2, 1, 1399.00), (21, 16, 25, 1, 199.00),
(22, 2, 4, 1, 1799.00), (22, 23, 45, 1, 899.00),
(23, 5, 10, 1, 1599.00), (23, 44, 87, 1, 109.00),
(24, 6, 12, 1, 1899.00), (24, 13, 18, 1, 259.00),
(25, 3, 6, 1, 1099.00), (25, 28, 56, 2, 298.00),
(26, 7, 14, 1, 1699.00), (26, 14, 20, 1, 429.00),
(27, 4, 8, 1, 999.00), (27, 21, 42, 1, 549.00),
(28, 10, 16, 1, 85.00), (28, 29, 58, 1, 1399.00),
(29, 11, 18, 1, 95.00), (29, 38, 72, 1, 139.00),
(30, 12, 20, 1, 109.00), (30, 27, 54, 2, 118.00),
(31, 17, 26, 1, 2699.00), (31, 39, 76, 1, 259.00),
(32, 18, 30, 1, 2399.00), (32, 41, 82, 1, 149.00),
(33, 19, 34, 1, 1599.00), (33, 31, 62, 1, 1499.00),
(34, 20, 38, 1, 1799.00), (34, 40, 78, 1, 219.00),
(35, 25, 46, 1, 269.00), (35, 34, 68, 1, 169.00),
(36, 26, 50, 1, 239.00), (36, 37, 70, 1, 1699.00),
(37, 27, 54, 1, 69.00), (37, 42, 84, 1, 159.00),
(38, 28, 56, 1, 149.00), (38, 22, 44, 1, 469.00),
(39, 30, 60, 1, 1199.00), (39, 35, 70, 1, 159.00),
(40, 32, 64, 1, 1099.00), (40, 43, 86, 1, 279.00),
(41, 1, 1, 2, 2598.00), (41, 9, 10, 1, 64.00),
(42, 5, 9, 1, 1399.00), (42, 13, 17, 2, 498.00),
(43, 2, 3, 1, 1599.00), (43, 21, 41, 1, 499.00),
(44, 6, 11, 1, 1699.00), (44, 33, 65, 2, 358.00),
(45, 3, 5, 1, 999.00), (45, 14, 19, 1, 399.00),
(46, 7, 13, 1, 1499.00), (46, 38, 71, 2, 258.00),
(47, 4, 7, 1, 899.00), (47, 15, 21, 1, 349.00),
(48, 10, 15, 2, 158.00), (48, 22, 43, 1, 449.00),
(49, 11, 17, 1, 89.00), (49, 29, 57, 1, 1299.00),
(50, 12, 20, 2, 218.00), (50, 34, 67, 1, 169.00),
(51, 17, 25, 1, 2499.00), (51, 24, 47, 1, 299.00),
(52, 18, 29, 1, 2199.00), (52, 39, 75, 1, 249.00),
(53, 19, 33, 2, 2998.00), (53, 41, 81, 1, 129.00),
(54, 20, 37, 1, 1699.00), (54, 37, 69, 1, 1599.00),
(55, 25, 45, 1, 249.00), (55, 42, 83, 2, 278.00),
(56, 26, 49, 1, 229.00), (56, 35, 69, 1, 149.00),
(57, 27, 53, 2, 118.00), (57, 43, 85, 1, 259.00),
(58, 28, 55, 1, 139.00), (58, 30, 59, 1, 1099.00),
(59, 31, 61, 1, 1399.00), (59, 36, 71, 1, 139.00),
(60, 32, 63, 2, 1998.00), (60, 40, 77, 1, 199.00),
(61, 1, 2, 1, 1399.00), (61, 16, 25, 2, 398.00),
(62, 2, 4, 1, 1799.00), (62, 23, 45, 1, 899.00),
(63, 5, 10, 1, 1599.00), (63, 44, 87, 2, 218.00),
(64, 6, 12, 1, 1899.00), (64, 13, 18, 1, 259.00),
(65, 3, 6, 1, 1099.00), (65, 28, 56, 1, 149.00),
(66, 7, 14, 1, 1699.00), (66, 14, 20, 1, 429.00),
(67, 4, 8, 1, 999.00), (67, 21, 42, 1, 549.00),
(68, 10, 16, 1, 85.00), (68, 29, 58, 1, 1399.00),
(69, 11, 18, 2, 190.00), (69, 38, 72, 1, 139.00),
(70, 12, 20, 1, 109.00), (70, 27, 54, 1, 59.00),
(71, 17, 26, 1, 2699.00), (71, 39, 76, 1, 259.00),
(72, 18, 30, 1, 2399.00), (72, 41, 82, 1, 149.00),
(73, 19, 34, 1, 1599.00), (73, 31, 62, 1, 1499.00),
(74, 20, 38, 2, 3598.00), (74, 40, 78, 1, 219.00),
(75, 25, 46, 1, 269.00), (75, 34, 68, 1, 169.00),
(76, 26, 50, 1, 239.00), (76, 37, 70, 1, 1699.00),
(77, 27, 54, 1, 69.00), (77, 42, 84, 1, 159.00),
(78, 28, 56, 1, 149.00), (78, 22, 44, 1, 469.00),
(79, 30, 60, 1, 1199.00), (79, 35, 70, 1, 159.00),
(80, 32, 64, 1, 1099.00), (80, 43, 86, 1, 279.00),
(81, 1, 1, 1, 1299.00), (81, 9, 9, 1, 59.00),
(82, 5, 9, 1, 1399.00), (82, 13, 17, 1, 249.00),
(83, 2, 3, 2, 3198.00), (83, 21, 41, 1, 499.00),
(84, 6, 11, 1, 1699.00), (84, 33, 65, 1, 179.00),
(85, 3, 5, 1, 999.00), (85, 14, 19, 1, 399.00),
(86, 7, 13, 1, 1499.00), (86, 38, 71, 1, 129.00),
(87, 4, 7, 1, 899.00), (87, 15, 21, 2, 698.00),
(88, 10, 15, 1, 79.00), (88, 22, 43, 1, 449.00),
(89, 11, 17, 1, 89.00), (89, 29, 57, 1, 1299.00),
(90, 12, 20, 1, 109.00), (90, 34, 67, 1, 169.00),
(91, 17, 25, 1, 2499.00), (91, 24, 47, 1, 299.00),
(92, 18, 29, 1, 2199.00), (92, 39, 75, 2, 498.00),
(93, 19, 33, 1, 1499.00), (93, 41, 81, 1, 129.00),
(94, 20, 37, 1, 1699.00), (94, 37, 69, 1, 1599.00),
(95, 25, 45, 1, 249.00), (95, 42, 83, 1, 139.00),
(96, 26, 49, 1, 229.00), (96, 35, 69, 1, 149.00),
(97, 27, 53, 1, 59.00), (97, 43, 85, 1, 259.00),
(98, 28, 55, 1, 139.00), (98, 30, 59, 1, 1099.00),
(99, 31, 61, 1, 1399.00), (99, 36, 71, 1, 139.00),
(100, 32, 63, 1, 999.00), (100, 40, 77, 1, 199.00),
(101, 1, 2, 1, 1399.00), (101, 16, 25, 1, 199.00),
(102, 2, 4, 1, 1799.00), (102, 23, 45, 1, 899.00),
(103, 5, 10, 1, 1599.00), (103, 44, 87, 1, 109.00),
(104, 6, 12, 1, 1899.00), (104, 13, 18, 1, 259.00),
(105, 3, 6, 1, 1099.00), (105, 28, 56, 1, 149.00),
(106, 7, 14, 1, 1699.00), (106, 14, 20, 1, 429.00),
(107, 4, 8, 1, 999.00), (107, 21, 42, 1, 549.00),
(108, 10, 16, 2, 158.00), (108, 29, 58, 1, 1399.00),
(109, 11, 18, 1, 95.00), (109, 38, 72, 1, 139.00),
(110, 12, 20, 1, 109.00), (110, 27, 54, 1, 59.00),
(111, 17, 26, 1, 2699.00), (111, 39, 76, 1, 259.00),
(112, 18, 30, 1, 2399.00), (112, 41, 82, 1, 149.00),
(113, 19, 34, 1, 1599.00), (113, 31, 62, 1, 1499.00),
(114, 20, 38, 1, 1799.00), (114, 40, 78, 1, 219.00),
(115, 25, 46, 1, 269.00), (115, 34, 68, 1, 169.00),
(116, 26, 50, 1, 239.00), (116, 37, 70, 1, 1699.00),
(117, 27, 54, 1, 69.00), (117, 42, 84, 1, 159.00),
(118, 28, 56, 1, 149.00), (118, 22, 44, 1, 469.00),
(119, 30, 60, 1, 1199.00), (119, 35, 70, 1, 159.00),
(120, 32, 64, 1, 1099.00), (120, 43, 86, 1, 279.00);

-- Insert Sample Orders (120 orders - Unique sequential Order_IDs 1-120)
INSERT INTO `Order` (Order_ID, User_ID, Cart_ID, Total_Amount, Payment_method, Delivery_ID, Order_Date, Order_Number) VALUES
-- 2023 Orders (1-40)
(1, 1, 1, 1417.00, 'Card', 1, '2023-01-10', 1673299200000),
(2, 2, 2, 1648.00, 'COD', 2, '2023-01-15', 1673558400000),
(3, 3, 3, 2597.00, 'Card', 3, '2023-02-05', 1675728000000),
(4, 4, 4, 1878.00, 'Card', 4, '2023-02-12', 1676332800000),
(5, 5, 5, 1398.00, 'COD', 5, '2023-03-01', 1677628800000),
(6, 6, 6, 1628.00, 'Card', 6, '2023-03-10', 1678464000000),
(7, 7, 7, 2147.00, 'Card', 7, '2023-04-05', 1680633600000),
(8, 8, 8, 1218.00, 'COD', 8, '2023-04-15', 1681516800000),
(9, 9, 9, 1388.00, 'Card', 9, '2023-05-08', 1683302400000),
(10, 10, 10, 357.00, 'Card', 10, '2023-05-18', 1684416000000),
(11, 11, 11, 3097.00, 'COD', 11, '2023-06-10', 1686355200000),
(12, 12, 12, 2448.00, 'Card', 12, '2023-06-20', 1687180800000),
(13, 13, 13, 1757.00, 'Card', 13, '2023-07-12', 1689206400000),
(14, 14, 14, 3398.00, 'COD', 14, '2023-07-22', 1690022400000),
(15, 15, 15, 518.00, 'Card', 15, '2023-08-08', 1691510400000),
(16, 16, 16, 1587.00, 'Card', 16, '2023-08-18', 1692374400000),
(17, 17, 17, 318.00, 'COD', 17, '2023-09-05', 1694275200000),
(18, 18, 18, 1188.00, 'Card', 18, '2023-09-15', 1695052800000),
(19, 19, 19, 1677.00, 'Card', 19, '2023-10-10', 1697155200000),
(20, 20, 20, 1198.00, 'COD', 20, '2023-10-20', 1697932800000),
(21, 1, 21, 1648.00, 'Card', 21, '2023-11-08', 1699468800000),
(22, 2, 22, 2698.00, 'Card', 22, '2023-11-18', 1700332800000),
(23, 3, 23, 1608.00, 'COD', 23, '2023-12-05', 1701734400000),
(24, 4, 24, 3598.00, 'Card', 24, '2023-12-15', 1702598400000),
(25, 5, 25, 2198.00, 'Card', 25, '2023-01-25', 1674662400000),
(26, 6, 26, 2128.00, 'COD', 26, '2023-02-28', 1677052800000),
(27, 7, 27, 1898.00, 'Card', 27, '2023-03-28', 1679875200000),
(28, 8, 28, 1688.00, 'Card', 28, '2023-04-30', 1682908800000),
(29, 9, 29, 1178.00, 'COD', 29, '2023-05-25', 1685030400000),
(30, 10, 30, 1178.00, 'Card', 30, '2023-06-28', 1687891200000),
(31, 11, 31, 3097.00, 'Card', 31, '2023-07-30', 1690281600000),
(32, 12, 32, 2428.00, 'COD', 32, '2023-08-25', 1692864000000),
(33, 13, 33, 2998.00, 'Card', 33, '2023-09-20', 1695254400000),
(34, 14, 34, 3318.00, 'Card', 34, '2023-10-28', 1698412800000),
(35, 15, 35, 1518.00, 'COD', 35, '2023-11-15', 1700083200000),
(36, 16, 36, 1958.00, 'Card', 36, '2023-12-10', 1702224000000),
(37, 17, 37, 1518.00, 'Card', 37, '2023-01-30', 1675900800000),
(38, 18, 38, 1288.00, 'COD', 38, '2023-02-20', 1676851200000),
(39, 19, 39, 1437.00, 'Card', 39, '2023-03-22', 1679510400000),
(40, 20, 40, 1318.00, 'Card', 40, '2023-04-25', 1682380800000),

-- 2024 Orders (41-80)
(41, 1, 41, 2662.00, 'Card', 41, '2024-01-10', 1704902400000),
(42, 2, 42, 1897.00, 'COD', 42, '2024-01-25', 1705939200000),
(43, 3, 43, 1817.00, 'Card', 43, '2024-02-12', 1707686400000),
(44, 4, 44, 2158.00, 'Card', 44, '2024-02-22', 1708636800000),
(45, 5, 45, 1398.00, 'COD', 45, '2024-03-10', 1710086400000),
(46, 6, 46, 1757.00, 'Card', 46, '2024-03-20', 1711036800000),
(47, 7, 47, 1248.00, 'Card', 47, '2024-04-08', 1712534400000),
(48, 8, 48, 1484.00, 'COD', 48, '2024-04-18', 1713398400000),
(49, 9, 49, 1388.00, 'Card', 49, '2024-05-12', 1715472000000),
(50, 10, 50, 428.00, 'Card', 50, '2024-05-22', 1716345600000),
(51, 11, 51, 3097.00, 'COD', 51, '2024-06-08', 1717939200000),
(52, 12, 52, 2448.00, 'Card', 52, '2024-06-18', 1718808000000),
(53, 13, 53, 3408.00, 'Card', 53, '2024-07-15', 1721001600000),
(54, 14, 54, 1918.00, 'COD', 54, '2024-07-25', 1721865600000),
(55, 15, 55, 527.00, 'Card', 55, '2024-08-10', 1723248000000),
(56, 16, 56, 1488.00, 'Card', 56, '2024-08-20', 1724112000000),
(57, 17, 57, 187.00, 'COD', 57, '2024-09-08', 1725811200000),
(58, 18, 58, 1288.00, 'Card', 58, '2024-09-18', 1726680000000),
(59, 19, 59, 1548.00, 'Card', 59, '2024-10-12', 1728691200000),
(60, 20, 60, 1298.00, 'COD', 60, '2024-10-22', 1729555200000),
(61, 1, 61, 1797.00, 'Card', 61, '2024-11-10', 1731206400000),
(62, 2, 62, 2698.00, 'Card', 62, '2024-11-20', 1732070400000),
(63, 3, 63, 1817.00, 'COD', 63, '2024-12-08', 1733587200000),
(64, 4, 64, 2158.00, 'Card', 64, '2024-12-18', 1734451200000),
(65, 5, 65, 1248.00, 'Card', 65, '2024-01-28', 1706428800000),
(66, 6, 66, 2128.00, 'COD', 66, '2024-02-28', 1709020800000),
(67, 7, 67, 1568.00, 'Card', 67, '2024-03-30', 1711814400000),
(68, 8, 68, 1648.00, 'Card', 68, '2024-04-28', 1714320000000),
(69, 9, 69, 1288.00, 'COD', 69, '2024-05-28', 1716825600000),
(70, 10, 70, 168.00, 'Card', 70, '2024-06-28', 1719417600000),
(71, 11, 71, 3098.00, 'Card', 71, '2024-07-28', 1722009600000),
(72, 12, 72, 2548.00, 'COD', 72, '2024-08-28', 1724601600000),
(73, 13, 73, 3098.00, 'Card', 73, '2024-09-25', 1727026080000),
(74, 14, 74, 3817.00, 'Card', 74, '2024-10-28', 1729814400000),
(75, 15, 75, 518.00, 'COD', 75, '2024-11-20', 1732070400000),
(76, 16, 76, 1938.00, 'Card', 76, '2024-12-15', 1734374400000),
(77, 17, 77, 228.00, 'Card', 77, '2024-02-05', 1707158400000),
(78, 18, 78, 618.00, 'COD', 78, '2024-03-08', 1709860800000),
(79, 19, 79, 1358.00, 'Card', 79, '2024-04-10', 1712707200000),
(80, 20, 80, 1378.00, 'Card', 80, '2024-05-12', 1715472000000),

-- 2025 Orders (81-120)
(81, 1, 81, 1598.00, 'Card', 81, '2025-01-15', 1736899200000),
(82, 2, 82, 2698.00, 'COD', 82, '2025-01-28', 1737936000000),
(83, 3, 83, 1708.00, 'Card', 83, '2025-02-12', 1738723200000),
(84, 4, 84, 2158.00, 'Card', 84, '2025-02-22', 1739587200000),
(85, 5, 85, 1248.00, 'COD', 85, '2025-03-12', 1741564800000),
(86, 6, 86, 2128.00, 'Card', 86, '2025-03-25', 1742774400000),
(87, 7, 87, 1548.00, 'Card', 87, '2025-04-10', 1744329600000),
(88, 8, 88, 1657.00, 'COD', 88, '2025-04-22', 1745452800000),
(89, 9, 89, 1234.00, 'Card', 89, '2025-05-15', 1747190400000),
(90, 10, 90, 168.00, 'Card', 90, '2025-05-25', 1748054400000),
(91, 11, 91, 3098.00, 'COD', 91, '2025-06-12', 1749734400000),
(92, 12, 92, 2548.00, 'Card', 92, '2025-06-22', 1750598400000),
(93, 13, 93, 3098.00, 'Card', 93, '2025-07-15', 1752633600000),
(94, 14, 94, 3817.00, 'COD', 94, '2025-07-28', 1753756800000),
(95, 15, 95, 518.00, 'Card', 95, '2025-08-15', 1755456000000),
(96, 16, 96, 1938.00, 'Card', 96, '2025-08-25', 1756320000000),
(97, 17, 97, 228.00, 'COD', 97, '2025-09-10', 1757875200000),
(98, 18, 98, 618.00, 'Card', 98, '2025-09-22', 1758998400000),
(99, 19, 99, 1358.00, 'Card', 99, '2025-10-15', 1760736000000),
(100, 20, 100, 1378.00, 'COD', 100, '2025-10-25', 1761600000000),
(101, 1, 101, 1598.00, 'Card', 101, '2025-11-12', 1762204800000),
(102, 2, 102, 2698.00, 'Card', 102, '2025-11-22', 1763068800000),
(103, 3, 103, 1708.00, 'COD', 103, '2025-12-10', 1764585600000),
(104, 4, 104, 2158.00, 'Card', 104, '2025-12-20', 1765449600000),
(105, 5, 105, 1248.00, 'Card', 105, '2025-01-25', 1737849600000),
(106, 6, 106, 2128.00, 'COD', 106, '2025-02-28', 1740355200000),
(107, 7, 107, 1568.00, 'Card', 107, '2025-03-28', 1743078400000),
(108, 8, 108, 1648.00, 'Card', 108, '2025-04-30', 1745584000000),
(109, 9, 109, 1288.00, 'COD', 109, '2025-05-28', 1748089600000),
(110, 10, 110, 168.00, 'Card', 110, '2025-06-30', 1750681600000),
(111, 11, 111, 3098.00, 'Card', 111, '2025-07-30', 1753273600000),
(112, 12, 112, 2548.00, 'COD', 112, '2025-08-28', 1755952800000),
(113, 13, 113, 3098.00, 'Card', 113, '2025-09-22', 1759184400000),
(114, 14, 114, 3817.00, 'Card', 114, '2025-10-30', 1761962400000),
(115, 15, 115, 518.00, 'COD', 115, '2025-11-18', 1763548800000),
(116, 16, 116, 1938.00, 'Card', 116, '2025-12-12', 1763635200000),
(117, 17, 117, 228.00, 'Card', 117, '2025-02-08', 1738972800000),
(118, 18, 118, 618.00, 'COD', 118, '2025-03-10', 1741564800000),
(119, 19, 119, 1358.00, 'Card', 119, '2025-04-12', 1744326400000),
(120, 20, 120, 1378.00, 'Card', 120, '2025-05-15', 1747190400000);