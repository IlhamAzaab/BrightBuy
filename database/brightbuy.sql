create database brightbuy;

use brightbuy;

CREATE TABLE `Product` (
  `Product_ID` Int not null,
  `Category_ID` Int,
  `Product_Name` Varchar(225),
  `Brand` Varchar(225),
  `SKU` Varchar(255),
  `Description` TEXT,
  `Image_URL` Varchar(2500),
  PRIMARY KEY (`Product_ID`)
);

CREATE TABLE `Cart` (
  `Cart_ID` Int AUTO_INCREMENT,
  `User_ID` Int,
  PRIMARY KEY (`Cart_ID`)
);

CREATE TABLE `Variant` (
  `Variant_ID` Int not null,
  `Product_ID` Int,
  `Price` decimal(10,2),
  `Stock_quantity` int,
  `Colour` varchar(25),
  `Size` Int,
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
  `Main_City` BOOL,
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
  `Total Amount` Numeric(9,2),
  `Payment_method` Varchar(25),
  `Delivery_ID` Int,
  `Order_Date` DATE,
  `Order_Number` Int,
  PRIMARY KEY (`Order_ID`),
  FOREIGN KEY (`User_ID`)
      REFERENCES `User`(`User_ID`)
);

CREATE TABLE `Delivery` (
  `Delivery_ID` Int AUTO_INCREMENT,
  `Delivery_Method` Varchar(25),
  `Delivery_Address` Varchar(50),
  `Delivery_Status` Varchar(25),
  `Estimated_delivery_Date` DATE,
  PRIMARY KEY (`Delivery_ID`)
);

CREATE TABLE `Report` (
  `Report_ID` Int AUTO_INCREMENT,
  `Report_Type` Varchar(25),
  `Report_Name` Varchar(25),
  `Time_Period` Varchar(25),
  PRIMARY KEY (`Report_ID`)
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

INSERT INTO category (Category_ID, Category_Name) VALUES
(1,'Mobilephones'),
(2,'Tablets'),
(3,'Accessories');

INSERT INTO product (Product_ID, Category_ID, Product_Name, Brand, SKU, Description) VALUES
-- 1–5: your originals (with descriptions)
(1, 1, 'iPhone 15',        'Apple',    'Apple iPhone 15',
 'iPhone with bright OLED display, 48MP main camera, USB-C, and long battery life—great everyday iOS performance.'),
(2, 1, 'Pixel 8',          'Google',   'Google Pixel 8',
 'Clean Android with Google’s AI features and a class-leading camera—compact, smooth, and reliable.'),
(3, 1, 'Galaxy S23',       'Samsung',  'Samsung Galaxy S23',
 'Compact Galaxy with vibrant AMOLED screen, fast performance, and a versatile triple-camera setup.'),
(4, 2, 'iPad Air (M2)',    'Apple',    'Apple iPad Air (M2)',
 'Slim and powerful tablet with the M2 chip, great for study, note-taking, and creative apps with Apple Pencil support.'),
(5, 3, 'USB-C Charger',    'Anker',    'Anker USB-C Charger',
 'Compact USB-C wall charger for phones, tablets, and accessories—fast, travel-friendly, and dependable.'),

-- 6–20: Smartphones
(6,  1, 'iPhone 15 Pro',         'Apple',     'Apple iPhone 15 Pro',
 'Apple’s pro-grade phone with A17 chip, great cameras, and a premium titanium build. Ideal for performance and photography.'),
(7,  1, 'iPhone 14',             'Apple',     'Apple iPhone 14',
 'Reliable iPhone with excellent battery life and a bright OLED display. Perfect everyday iOS experience.'),
(8,  1, 'iPhone SE (3rd Gen)',   'Apple',     'Apple iPhone SE (3rd Gen)',
 'Compact iPhone with Touch ID and fast A15 performance. Great value for iOS lovers.'),
(9,  1, 'Galaxy S23 Ultra',      'Samsung',   'Samsung Galaxy S23 Ultra',
 'Flagship with S Pen support and a superb quad-camera system. Built for power users.'),
(10, 1, 'Galaxy A55',            'Samsung',   'Samsung Galaxy A55',
 'Mid-range Galaxy with AMOLED screen and long battery life. Solid everyday Android choice.'),
(11, 1, 'Pixel 8 Pro',           'Google',    'Google Pixel 8 Pro',
 'Google’s top Pixel with Tensor G3 and best-in-class AI camera features. Clean Android.'),
(12, 1, 'Pixel 7a',              'Google',    'Google Pixel 7a',
 'Affordable Pixel with excellent photos and smooth software—great value.'),
(13, 1, 'OnePlus 12',            'OnePlus',   'OnePlus OnePlus 12',
 'Fast and fluid flagship with rapid charging and a bright LTPO display.'),
(14, 1, 'OnePlus Nord CE 4',     'OnePlus',   'OnePlus OnePlus Nord CE 4',
 'Slim mid-ranger with clean OxygenOS and dependable performance.'),
(15, 1, 'Xiaomi 13T Pro',        'Xiaomi',    'Xiaomi Xiaomi 13T Pro',
 'Leica-tuned cameras and fast charging make this a strong flagship value.'),
(16, 1, 'Redmi Note 13 Pro',     'Xiaomi',    'Xiaomi Redmi Note 13 Pro',
 'Great AMOLED display and big battery—budget friendly with premium touches.'),
(17, 1, 'Motorola Edge 40',      'Motorola',  'Motorola Motorola Edge 40',
 'Curved display, light design, and clean Android experience.'),
(18, 1, 'Nothing Phone (2a)',    'Nothing',   'Nothing Nothing Phone (2a)',
 'Unique Glyph interface with smooth performance and minimalist design.'),
(19, 1, 'Nokia G42',             'Nokia',     'Nokia Nokia G42',
 'Repair-friendly design with long battery life and clean software.'),
(20, 1, 'Sony Xperia 10 V',      'Sony',      'Sony Sony Xperia 10 V',
 'Tall 21:9 OLED display and stereo speakers—great for media on the go.'),

-- 21–27: Tablets
(21, 2, 'iPad Pro 11" (M4)',     'Apple',     'Apple iPad Pro 11" (M4)',
 'Ultra-thin tablet with M4 performance and ProMotion display—made for creators.'),
(22, 2, 'iPad (10th Gen)',       'Apple',     'Apple iPad (10th Gen)',
 'All-round iPad for study and entertainment with USB-C and a vivid screen.'),
(23, 2, 'Galaxy Tab S9',         'Samsung',   'Samsung Galaxy Tab S9',
 'Premium AMOLED tablet with S Pen in the box and desktop-like DeX mode.'),
(24, 2, 'Galaxy Tab A9',         'Samsung',   'Samsung Galaxy Tab A9',
 'Lightweight family tablet for streaming, notes, and casual gaming.'),
(25, 2, 'Xiaomi Pad 6',          'Xiaomi',    'Xiaomi Xiaomi Pad 6',
 'Sharp 144Hz display and snappy performance—great value work-and-play slate.'),
(26, 2, 'Lenovo Tab P12',        'Lenovo',    'Lenovo Lenovo Tab P12',
 'Large screen tablet with quad speakers—ideal for movies and multitasking.'),
(27, 2, 'Fire HD 10',            'Amazon',    'Amazon Fire HD 10',
 'Affordable tablet for reading, streaming, and Alexa—excellent battery life.'),

-- 28–40: Accessories
(28, 3, 'AirPods Pro (2nd Gen)',        'Apple',     'Apple AirPods Pro (2nd Gen)',
 'Active noise cancellation with Spatial Audio—seamless with Apple devices.'),
(29, 3, 'Galaxy Buds2 Pro',             'Samsung',   'Samsung Galaxy Buds2 Pro',
 'Comfortable earbuds with rich sound and 24-bit hi-fi on supported devices.'),
(30, 3, 'Pixel Buds Pro',               'Google',    'Google Pixel Buds Pro',
 'ANC earbuds with deep integration to Pixel phones and clear call quality.'),
(31, 3, 'PowerCore 20K',                'Anker',     'Anker PowerCore 20K',
 'High-capacity power bank with fast charging for phones and tablets.'),
(32, 3, '3-in-1 MagSafe Stand',         'Belkin',    'Belkin 3-in-1 MagSafe Stand',
 'Charge iPhone, AirPods, and Apple Watch together—clean desk setup.'),
(33, 3, 'Tune 510BT',                   'JBL',       'JBL Tune 510BT',
 'Lightweight Bluetooth headphones with punchy bass and long battery life.'),
(34, 3, 'WH-CH520',                     'Sony',      'Sony WH-CH520',
 'Everyday wireless headphones—clear sound and multi-point connection.'),
(35, 3, 'MX Master 3S',                 'Logitech',  'Logitech MX Master 3S',
 'Ergonomic mouse with precise scrolling—great for productivity and creators.'),
(36, 3, 'Ultra microSD 128GB',          'SanDisk',   'SanDisk Ultra microSD 128GB',
 'Expand storage for phones, cameras, and handheld consoles—A1 app performance.'),
(37, 3, 'DataTraveler 64GB',            'Kingston',  'Kingston DataTraveler 64GB',
 'Compact USB flash drive—reliable file transfer and backup on the go.'),
(38, 3, 'USB-C to HDMI Adapter',        'UGREEN',    'UGREEN USB-C to HDMI Adapter',
 'Connect laptops/phones to 4K displays—plug-and-play adapter.'),
(39, 3, 'Mag Armor Case (iPhone 15)',   'Spigen',    'Spigen Mag Armor Case (iPhone 15)',
 'Protective MagSafe-compatible case with slim design and strong grip.'),
(40, 3, 'Kishi V2',                      'Razer',     'Razer Kishi V2',
 'Mobile game controller with low-latency USB-C—console feel on your phone.');

INSERT INTO variant (Variant_ID, Product_ID, Price, Stock_quantity, Colour, Size) VALUES
(1, 1, 799.00, 20, 'Black',     128),
(2, 1, 899.00, 15, 'Blue',      256),
(3, 2, 699.00, 25, 'Porcelain', 128),
(4, 2, 799.00, 18, 'Obsidian',  256),
(5, 3, 749.00, 30, 'Green',     128),
(6, 3, 849.00, 14, 'Lavender',  256),
(7, 4, 599.00, 12, 'Starlight',  64),
(8, 4, 749.00, 10, 'Blue',256),
(9, 5,  39.99, 50, 'White',65);


INSERT INTO variant (Variant_ID, Product_ID, Colour, Size, Price, Stock_quantity) VALUES
(10, 6,  'Black',   128, 1099.00, 50),
(11, 6,  'Silver',  256, 1299.00, 40),
(12, 7,  'Blue',    128, 799.00, 60),
(13, 7,  'Purple',  256, 899.00, 40),
(14, 8,  'Red',     64,  429.00, 70),
(15, 8,  'White',   128, 479.00, 50),
(16, 9,  'Black',   256, 1199.00, 45),
(17, 9,  'Green',   512, 1399.00, 30),
(18, 10, 'Blue',    128, 499.00, 80),
(19, 11, 'Obsidian',128, 999.00, 50),
(20, 11, 'Porcelain',256,1099.00, 30),
(21, 12, 'Charcoal',128, 499.00, 60),
(22, 13, 'Black',   256, 899.00, 40),
(23, 13, 'Green',   512, 999.00, 25),
(24, 14, 'Gray',    128, 399.00, 70),
(25, 15, 'Blue',    256, 649.00, 50),
(26, 16, 'Black',   128, 299.00, 90),
(27, 17, 'Black',   256, 599.00, 40),
(28, 18, 'White',   128, 449.00, 60),
(29, 19, 'Gray',    128, 299.00, 70),
(30, 20, 'Black',   128, 399.00, 50),
(31, 21, 'Silver',  256, 1099.00, 30),
(32, 22, 'Blue',    64,  449.00, 60),
(33, 23, 'Graphite',256, 899.00, 40),
(34, 24, 'Gray',    64,  229.00, 80),
(35, 25, 'Blue',    128, 399.00, 50),
(36, 26, 'Gray',    128, 429.00, 45),
(37, 27, 'Black',   64,  199.00, 70),
(38, 28, 'White',   NULL, 249.00, 100),
(39, 29, 'Black',   NULL, 229.00, 90),
(40, 30, 'Charcoal',NULL, 199.00, 80),
(41, 31, 'Black',   NULL, 59.00,  120),
(42, 32, 'White',   NULL, 129.00, 40),
(43, 33, 'Black',   NULL, 49.00,  100),
(44, 34, 'Blue',    NULL, 59.00,  90),
(45, 35, 'Black',   NULL, 99.00,  50),
(46, 36, 'Black',   128, 19.00,  200),
(47, 37, 'Black',   64,  15.00,  150),
(48, 38, 'Gray',    NULL, 25.00,  80),
(49, 39, 'Black',   NULL, 29.00,  70),
(50, 40, 'Black',   NULL, 99.00,  40);

UPDATE product SET Image_URL = '/assets/images/Iphone15.jpeg'
WHERE Product_ID = 1;

UPDATE product SET Image_URL = '/assets/images/Pixel8.jpg'
WHERE Product_ID = 2;

UPDATE product SET Image_URL = '/assets/images/Galaxys23.jpg'
WHERE Product_ID = 3;

UPDATE product SET Image_URL = '/assets/images/Ipadair.jpg'
WHERE Product_ID = 4;

UPDATE product SET Image_URL = '/assets/images/AnkerUSBCcharger.jpg'
WHERE Product_ID = 5;

UPDATE product SET Image_URL = '/assets/images/iPhone 15 Pro.webp'
WHERE Product_ID = 6;

UPDATE product SET Image_URL = '/assets/images/iPhone14.webp'
WHERE Product_ID = 7;

UPDATE product SET Image_URL = '/assets/images/iPhoneSE3rdGen.webp'
WHERE Product_ID = 8;

UPDATE product SET Image_URL = '/assets/images/SamsungS23Ultra.webp'
WHERE Product_ID = 9;

UPDATE product SET Image_URL = '/assets/images/SamsungA55.webp'
WHERE Product_ID = 10;

UPDATE product SET Image_URL = '/assets/images/Pixel8Pro.avif'
WHERE Product_ID = 11;

UPDATE product SET Image_URL = '/assets/images/Pixel7a.png'
WHERE Product_ID = 12;

UPDATE product SET Image_URL = '/assets/images/OnePlus12.png'
WHERE Product_ID = 13;

UPDATE product SET Image_URL = '/assets/images/OnePlusNordCE4.jpg'
WHERE Product_ID = 14;

UPDATE product SET Image_URL = '/assets/images/Xiaomi13TPro.png'
WHERE Product_ID = 15;

UPDATE product SET Image_URL = '/assets/images/RedmiNote13Pro.png'
WHERE Product_ID = 16;

UPDATE product SET Image_URL = '/assets/images/MotorolaEdge40.png'
WHERE Product_ID = 17;

UPDATE product SET Image_URL = '/assets/images/NothingPhone2aplus.webp'
WHERE Product_ID = 18;

UPDATE product SET Image_URL = '/assets/images/NokiaG42.webp'
WHERE Product_ID = 19;

UPDATE product SET Image_URL = '/assets/images/Xperia10.png'
WHERE Product_ID = 20;

UPDATE product SET Image_URL = '/assets/images/iPadPro11.jpg'
WHERE Product_ID = 21;

UPDATE product SET Image_URL = '/assets/images/iPad(10thGen).png'
WHERE Product_ID = 22;

UPDATE product SET Image_URL = '/assets/images/SamsungTabS9.jpg'
WHERE Product_ID = 23;

UPDATE product SET Image_URL = '/assets/images/SamsungGalaxyTabA9.webp'
WHERE Product_ID = 24;

UPDATE product SET Image_URL = '/assets/images/XiaomiPad6.jpg'
WHERE Product_ID = 25;

UPDATE product SET Image_URL = '/assets/images/LenovoTabP12.jpg'
WHERE Product_ID = 26;

UPDATE product SET Image_URL = '/assets/images/AmazonFireHD10.webp'
WHERE Product_ID = 27;

UPDATE product SET Image_URL = '/assets/images/airpodspro21.webp'
WHERE Product_ID = 28;

UPDATE product SET Image_URL = '/assets/images/SamsungBuds2Pro.jpg'
WHERE Product_ID = 29;

UPDATE product SET Image_URL = '/assets/images/PixelBudsPro.webp'
WHERE Product_ID = 30;

UPDATE product SET Image_URL = '/assets/images/AnkerPowerCore20K.webp'
WHERE Product_ID = 31;

UPDATE product SET Image_URL = '/assets/images/Belkin3-in-1MagSafeStand.jpg'
WHERE Product_ID = 32;

UPDATE product SET Image_URL = '/assets/images/JBLTune510BT.png'
WHERE Product_ID = 33;

UPDATE product SET Image_URL = '/assets/images/SonyWH-CH520.jpg'
WHERE Product_ID = 34;

UPDATE product SET Image_URL = '/assets/images/LogitechMXMaster3S.jpg'
WHERE Product_ID = 35;

UPDATE product SET Image_URL = '/assets/images/SanDiskUltramicroSD128GB.webp'
WHERE Product_ID = 36;

UPDATE product SET Image_URL = '/assets/images/KingstonDataTraveler64GB.webp'
WHERE Product_ID = 37;

UPDATE product SET Image_URL = '/assets/images/UGREENUSB-CtoHDMIAdapter.jpg'
WHERE Product_ID = 38;

UPDATE product SET Image_URL = '/assets/images/SpigenMagArmorCase(iPhone 15).jpg'
WHERE Product_ID = 39;

UPDATE product SET Image_URL = '/assets/images/RazerKishiV2.webp'
WHERE Product_ID = 40;

INSERT INTO `user` 
(user_id, name, password, address, city_ID, email, role)
VALUES
(1, 'John Smith', '$2b$10$5uQp7jO9Z1h7b3qM3LmqL.2x/Uf0GeykW6v36LgTzptE5ZmZkMo2y', '123 Broadway Ave', NULL, 'john.smith@email.com', 'customer'),
(2, 'Maria Garcia', '$2b$10$1HnHZY0gk1aIqqoxmOfpUe8Z9UBHq5OJwITCwM3cjsCF14Cb0Lzj6', '456 Sunset Blvd', NULL, 'maria.garcia@email.com', 'customer'),
(3, 'Admin User', '$2b$10$3P8Wq90x9dR.4ysYWj9pIuaQb0iVik4aS8PKotcJqSb5kKFXs4fQ6', '789 Michigan Ave', NULL, 'admin@brightbuy.com', 'admin'),
(4, 'David Johnson', '$2b$10$0nM9Hx3QnFUkzqD95v7eReN2/NnQ5LbYfY8zjYl4V7PmVvN49hw5u', '321 Main Street', NULL, 'david.johnson@email.com', 'customer'),
(5, 'Sarah Wilson', '$2b$10$gW3ap0LJGyjWJpVk6k6GeOlDq5Uu0g7qB4zF6wA5p1pCBP.jkW5Rm', '654 Central Ave', NULL, 'sarah.wilson@email.com', 'customer'),
(6, 'admin2 User', '$2b$10$ns35RoYdRZMFctzh8Up3Lu7gK9fIu9XiM/CeRajGqI9PRByim5jEy', NULL, NULL, 'Admin2@example.com', 'admin');



