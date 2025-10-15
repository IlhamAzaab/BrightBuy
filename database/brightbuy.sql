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
  `Delivery_Status` ENUM('Delivered', 'Pending') default NULL,
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

-- Add image URLs to variants
UPDATE brightbuy.variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106569/dfqpkjvh8/oltkqyv4b2fyndyvi6tc.webp' WHERE (Variant_ID = '50');
UPDATE brightbuy.variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106582/dfqpkjvh8/o9c55qshxpm5kmgeixhi.jpg' WHERE (Variant_ID = '49');
UPDATE brightbuy.variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106583/dfqpkjvh8/uvmsedjynyw99hykk4k2.jpg' WHERE (Variant_ID = '48');
UPDATE brightbuy.variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106551/dfqpkjvh8/rneahqssp8qdkxp4dmcj.webp' WHERE (Variant_ID = '47');
UPDATE brightbuy.variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106578/dfqpkjvh8/rjqnou7lc4yldsivcrux.webp' WHERE (Variant_ID = '46');
UPDATE brightbuy.variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106554/dfqpkjvh8/xsfn8yicrw3lthu2lryy.jpg' WHERE (Variant_ID = '45');
UPDATE brightbuy.variant SET Colour = 'Black', Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106580/dfqpkjvh8/ljuxtochd2wozogbendv.jpg' WHERE (Variant_ID = '44');
UPDATE brightbuy.variant SET Colour = 'White', Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106549/dfqpkjvh8/mhjrvav9lftv28vnf00r.png' WHERE (Variant_ID = '43');
UPDATE brightbuy.variant SET Colour = 'Black', Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106526/dfqpkjvh8/sev8nlq8mfsyhdoaep0o.jpg' WHERE (Variant_ID = '42');
UPDATE brightbuy.variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106523/dfqpkjvh8/coms2xptzjfkmbwfm5uq.webp' WHERE (Variant_ID = '41');
UPDATE brightbuy.variant SET Colour = 'White', Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106565/dfqpkjvh8/sb3algkpn82zygwhzkcx.webp' WHERE (Variant_ID = '40');
UPDATE brightbuy.variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106536/dfqpkjvh8/oqpbta0mu0ylixfcl5o0.jpg' WHERE (Variant_ID = '2');
UPDATE brightbuy.variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106539/dfqpkjvh8/zj1rak94ub2jtxlu39zt.jpg' WHERE (Variant_ID = '1');

UPDATE brightbuy.variant SET Colour = 'Purple', Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760247910/dfqpkjvh8/wm0i2mgnpltqy1t0yk4j.jpg' WHERE (Variant_ID = '39');
UPDATE brightbuy.variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106520/dfqpkjvh8/iv3sasd35vmybf1ombrh.webp' WHERE (Variant_ID = '38');
UPDATE brightbuy.variant SET Colour = 'Blue', Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106522/dfqpkjvh8/rq2ofeijp6whnixbuaew.webp' WHERE (Variant_ID = '37');
UPDATE brightbuy.variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106552/dfqpkjvh8/jrjb9ktrzff2hceybbwu.jpg' WHERE (Variant_ID = '36');
UPDATE brightbuy.variant SET Colour = 'Black', Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106587/dfqpkjvh8/rbxts3an7nopde4aewf3.jpg' WHERE (Variant_ID = '35');
UPDATE brightbuy.variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106575/dfqpkjvh8/quwuir8fpnu1mebzzl1y.webp' WHERE (Variant_ID = '34');
UPDATE brightbuy.variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106577/dfqpkjvh8/nhnpi6ly4qsspqgwv2na.jpg' WHERE (Variant_ID = '33');
UPDATE brightbuy.variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106529/dfqpkjvh8/xytqzmdvgw4jwiz8o0gx.png' WHERE (Variant_ID = '32');
UPDATE brightbuy.variant SET Colour = 'Black', Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106533/dfqpkjvh8/rrsbucas3wooqiwwrm3y.jpg' WHERE (Variant_ID = '31');
UPDATE brightbuy.variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106588/dfqpkjvh8/th07jk1tlntjuqtolnht.png' WHERE (Variant_ID = '30');
UPDATE brightbuy.variant SET Colour = 'Black', Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106556/dfqpkjvh8/nzjqqoru1s7ibr6a1elw.webp' WHERE (Variant_ID = '29');
UPDATE brightbuy.variant SET Colour = 'Black', Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106557/dfqpkjvh8/ezuf0itfvm5czbnf06pu.webp' WHERE (Variant_ID = '28');
UPDATE brightbuy.variant SET Colour = 'Green', Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106555/dfqpkjvh8/bjdzn41uyhjkhyzpdeqg.png' WHERE (Variant_ID = '27');
UPDATE brightbuy.variant SET Colour = 'Purple', Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106571/dfqpkjvh8/qrkwplwrebdlfyy4qhkm.png' WHERE (Variant_ID = '26');
UPDATE brightbuy.variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106571/dfqpkjvh8/qrkwplwrebdlfyy4qhkm.png' WHERE (Variant_ID = '25');
UPDATE brightbuy.variant SET Colour = 'Green', Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106560/dfqpkjvh8/whue1zhtlen59innvc6t.jpg' WHERE (Variant_ID = '24');
UPDATE brightbuy.variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106559/dfqpkjvh8/bjajvdkwc2q07xzeq1be.png' WHERE (Variant_ID = '23');
UPDATE brightbuy.variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106558/dfqpkjvh8/nslwyc5nm1xkcbcrvxtu.webp' WHERE (Variant_ID = '22');
UPDATE brightbuy.variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106562/dfqpkjvh8/p7ekjm2pxjgxjv38gwn5.png' WHERE (Variant_ID = '21');
UPDATE brightbuy.variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106564/dfqpkjvh8/romtr0mck7lggahk2mjj.avif' WHERE (Variant_ID = '19');
UPDATE brightbuy.variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106519/dfqpkjvh8/lz6xd5ntzunpbji3p8fv.jpg' WHERE (Variant_ID = '20');
UPDATE brightbuy.variant SET Colour = 'White', Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106572/dfqpkjvh8/wb0x0jwzifxizeqliqbd.webp' WHERE (Variant_ID = '18');
UPDATE brightbuy.variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106576/dfqpkjvh8/soc7fa9y4b7wnzc2cul1.webp' WHERE (Variant_ID = '16');
UPDATE brightbuy.variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106516/dfqpkjvh8/czcrnkhjk7xmv3rruzyy.jpg' WHERE (Variant_ID = '17');
UPDATE brightbuy.variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106543/dfqpkjvh8/zbdru69e2tafcax2xrtb.webp' WHERE (Variant_ID = '15');
UPDATE brightbuy.variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106546/dfqpkjvh8/h8hkgnhnym1kdgby4weh.avif' WHERE (Variant_ID = '14');
UPDATE brightbuy.variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106540/dfqpkjvh8/uw4lhvy5chjmncj3m8zs.webp' WHERE (Variant_ID = '12');
UPDATE brightbuy.variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106525/dfqpkjvh8/wowfcblcgxjvczikicn0.png' WHERE (Variant_ID = '13');
UPDATE brightbuy.variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106534/dfqpkjvh8/w5zvgtq4suhvlhx4ybs2.png' WHERE (Variant_ID = '10');
UPDATE brightbuy.variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106538/dfqpkjvh8/qpgun6ioljn4ptqfkrbv.jpg' WHERE (Variant_ID = '11');
UPDATE brightbuy.variant SET Colour = 'Black', Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106524/dfqpkjvh8/yvakdeuqp3xecqpbqbqo.jpg' WHERE (Variant_ID = '9');
UPDATE brightbuy.variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106531/dfqpkjvh8/kfpv2oxhknfu3b6uhlpf.jpg' WHERE (Variant_ID = '8');
UPDATE brightbuy.variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106528/dfqpkjvh8/f9kd3lk8atkxjjz2sge0.avif' WHERE (Variant_ID = '7');
UPDATE brightbuy.variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106514/dfqpkjvh8/x1ynh57etupksqfscecr.jpg' WHERE (Variant_ID = '6');
UPDATE brightbuy.variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106518/dfqpkjvh8/p5h3hr6g7cvpinuwjyr1.jpg' WHERE (Variant_ID = '5');
UPDATE brightbuy.variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106513/dfqpkjvh8/bnl0jvuw3myjy3ooqvk9.jpg' WHERE (Variant_ID = '4');
UPDATE brightbuy.variant SET Image_URL = 'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106563/dfqpkjvh8/yjl79thhm1wsen8wakvl.jpg' WHERE (Variant_ID = '3');

-- Insert User data (6 users: 4 customers, 2 admins)
INSERT INTO `user` 
(user_id, name, password, address, city_ID, email, role)
VALUES
(1, 'John Smith', '$2b$10$5uQp7jO9Z1h7b3qM3LmqL.2x/Uf0GeykW6v36LgTzptE5ZmZkMo2y', '123 Broadway Ave', NULL, 'john.smith@email.com', 'customer'),
(2, 'Maria Garcia', '$2b$10$1HnHZY0gk1aIqqoxmOfpUe8Z9UBHq5OJwITCwM3cjsCF14Cb0Lzj6', '456 Sunset Blvd', NULL, 'maria.garcia@email.com', 'customer'),
(3, 'Admin User', '$2b$10$3P8Wq90x9dR.4ysYWj9pIuaQb0iVik4aS8PKotcJqSb5kKFXs4fQ6', '789 Michigan Ave', NULL, 'admin@brightbuy.com', 'admin'),
(4, 'David Johnson', '$2b$10$0nM9Hx3QnFUkzqD95v7eReN2/NnQ5LbYfY8zjYl4V7PmVvN49hw5u', '321 Main Street', NULL, 'david.johnson@email.com', 'customer'),
(5, 'Sarah Wilson', '$2b$10$gW3ap0LJGyjWJpVk6k6GeOlDq5Uu0g7qB4zF6wA5p1pCBP.jkW5Rm', '654 Central Ave', NULL, 'sarah.wilson@email.com', 'customer'),
(6, 'admin2 User', '$2b$10$ns35RoYdRZMFctzh8Up3Lu7gK9fIu9XiM/CeRajGqI9PRByim5jEy', NULL, NULL, 'Admin2@example.com', 'admin');

-- Insert City data (Texas cities)
INSERT INTO City (City_ID, City_Name, Main_City) VALUES
(1, 'Houston', TRUE),
(2, 'Dallas', TRUE),
(3, 'Austin', TRUE),
(4, 'San Antonio', TRUE),
(5, 'Fort Worth', TRUE),
(6, 'El Paso', FALSE),
(7, 'Arlington', FALSE),
(8, 'Corpus Christi', FALSE),
(9, 'Plano', FALSE),
(10, 'Lubbock', FALSE),
(11, 'Garland', FALSE),
(12, 'Irving', FALSE),
(13, 'Laredo', FALSE),
(14, 'Frisco', FALSE),
(15, 'McKinney', FALSE);

-- Update existing users with city information
UPDATE User SET City_ID = 1 WHERE User_ID = 1; -- John Smith in Houston
UPDATE User SET City_ID = 2 WHERE User_ID = 2; -- Maria Garcia in Dallas
UPDATE User SET City_ID = 1 WHERE User_ID = 3; -- Admin User in Houston
UPDATE User SET City_ID = 3 WHERE User_ID = 4; -- David Johnson in Austin
UPDATE User SET City_ID = 4 WHERE User_ID = 5; -- Sarah Wilson in San Antonio
UPDATE User SET City_ID = 1 WHERE User_ID = 6;


-- Insert Delivery data
INSERT INTO Delivery (Delivery_ID, Delivery_Method, Delivery_Address, Delivery_Status, Estimated_delivery_Date) VALUES
(1, 'Standard Delivery', '123 Broadway Ave, Houston, TX 77002', 'Delivered', '2024-01-15'),
(2, 'Express Delivery', '456 Elm Street, Dallas, TX 75201', 'In Transit', '2024-01-20'),
(3, 'Standard Delivery', '321 Main Street, Austin, TX 73301', 'Processing', '2024-01-25'),
(4, 'Express Delivery', '654 Central Ave, San Antonio, TX 78205', 'Delivered', '2024-01-18'),
(5, 'Standard Delivery', '789 Richmond Ave, Houston, TX 77057', 'Delivered', '2024-01-12'),
(6, 'Express Delivery', '123 Broadway Ave, Houston, TX 77002', 'In Transit', '2024-01-22'),
(7, 'Standard Delivery', '456 Commerce St, Dallas, TX 75202', 'Processing', '2024-01-28'),
(8, 'Express Delivery', '321 Congress Ave, Austin, TX 78701', 'Shipped', '2024-01-24'),
(9, 'Standard Delivery', '654 Market St, San Antonio, TX 78205', 'Processing', '2024-01-30'),
(10, 'Express Delivery', '789 Westheimer Rd, Houston, TX 77027', 'Delivered', '2024-01-16');

-- Insert Cart data (one cart per user)
INSERT INTO Cart (Cart_ID, User_ID) VALUES
(1, 1), -- John Smith's cart
(2, 2), -- Maria Garcia's cart
(3, 4), -- David Johnson's cart
(4, 5), -- Sarah Wilson's cart
(5, 1), -- John Smith's second cart (for multiple orders)
(6, 2), -- Maria Garcia's second cart
(7, 4), -- David Johnson's second cart
(8, 5); -- Sarah Wilson's second cart


-- Insert Cart_Item data (items in various carts)
INSERT INTO Cart_Item (Cart_Item_ID, Cart_ID, Product_ID, Variant_ID, Quantity, Total_price) VALUES
-- John Smith's first cart
(1, 1, 1, 1, 1, 799.00),    -- iPhone 15 Black 128GB
(2, 1, 5, 9, 2, 79.98),     -- 2x USB-C Charger
(3, 1, 28, 38, 1, 249.00),  -- AirPods Pro

-- Maria Garcia's first cart
(4, 2, 2, 3, 1, 699.00),    -- Pixel 8 Porcelain 128GB
(5, 2, 31, 41, 1, 59.00),   -- PowerCore 20K

-- Sarah Wilson's first cart
(9, 4, 4, 7, 1, 599.00),    -- iPad Air Starlight 64GB
(10, 4, 32, 42, 1, 129.00), -- 3-in-1 MagSafe Stand

-- John Smith's second cart (for another order)
(11, 5, 6, 10, 1, 1099.00), -- iPhone 15 Pro Black 128GB
(12, 5, 35, 45, 1, 99.00),  -- MX Master 3S

-- Maria Garcia's second cart
(13, 6, 11, 19, 1, 999.00), -- Pixel 8 Pro Obsidian 128GB
(14, 6, 30, 40, 1, 199.00), -- Pixel Buds Pro

-- David Johnson's second cart
(15, 7, 9, 16, 1, 1199.00), -- Galaxy S23 Ultra Black 256GB
(16, 7, 39, 49, 1, 29.00),  -- Spigen Case

-- Sarah Wilson's second cart
(17, 8, 21, 31, 1, 1099.00), -- iPad Pro 11" Silver 256GB
(18, 8, 28, 38, 1, 249.00),  -- AirPods Pro
(19, 8, 36, 46, 2, 38.00);   -- 2x microSD 128GB

-- Insert Order data
INSERT INTO `Order` (Order_ID, User_ID, Cart_ID, `Total Amount`, Payment_method, Delivery_ID, Order_Date, Order_Number) VALUES
(3, 4, 3, 1877.00, 'Cash on Delivery', 3, '2024-01-14', 1003),
(4, 3, 4, 728.00, 'Cash on Delivery', 4, '2024-01-15', 1004),
(5, 1, 5, 1198.00, 'Online Payment', 5, '2024-01-08', 1005),
(7, 4, 7, 1228.00, 'Cash on Delivery', 7, '2024-01-18', 1007),
(8, 2, 8, 1386.00, 'Online Payment', 8, '2024-01-19', 1008);

-- Add foreign key constraint for Product -> Category (if not already added)
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

-- Modify Main_City column to have default value FALSE and update existing cities accordingly
ALTER TABLE city
CHANGE Main_City Main_City BOOL DEFAULT 0;
UPDATE city SET Main_City=0 WHERE City_ID=5;
UPDATE city SET Main_City=0 WHERE City_ID=6;
UPDATE city SET Main_City=0 WHERE City_ID=7;
UPDATE city SET Main_City=0 WHERE City_ID=8;
UPDATE city SET Main_City=0 WHERE City_ID=9;

-- Create indexes to optimize queries
CREATE INDEX idx_delivery_estimated_date ON delivery (Estimated_delivery_Date);
CREATE INDEX idx_delivery_status ON delivery (Delivery_Status);

-- Create stored procedure to get quarterly sales report
DELIMITER $$
CREATE PROCEDURE GetQuarterlySales(IN selectedYear INT)
BEGIN
  SELECT
    YEAR(Order_Date) AS Year,
    QUARTER(Order_Date) AS Quarter,
    SUM(Total_Amount) AS Total_Sales,
    COUNT(Order_ID) AS Total_Orders,
    AVG(Total_Amount) AS Avg_Order_Value
  FROM brightbuy.`Order`
  WHERE YEAR(Order_Date) = selectedYear
  GROUP BY Year, Quarter
  ORDER BY Quarter;
END $$
DELIMITER ;

-- Create view for monthly top-selling products
CREATE OR REPLACE VIEW MonthlyTopSellingProducts AS
SELECT
    DATE_FORMAT(o.Order_Date, '%Y-%m') AS month, -- Format date as YYYY-MM
    p.Product_ID,
    p.Product_Name,
    p.Brand,
    SUM(ci.Quantity) AS total_quantity_sold,
    SUM(ci.Total_price) AS total_revenue
FROM
    Order o
JOIN
    Cart_Item ci ON o.Cart_ID = ci.Cart_ID
JOIN
    Product p ON ci.Product_ID = p.Product_ID
GROUP BY
    month, p.Product_ID
ORDER BY
    month DESC, total_quantity_sold DESC;

    
ALTER TABLE cart ADD COLUMN Status ENUM('Active', 'CheckedOut') DEFAULT 'Active';


-- Create a view to summarize total orders per category
CREATE VIEW CategoryOrderSummary AS
SELECT 
    c.Category_Name,
    COUNT(DISTINCT o.Order_ID) AS TotalOrders
FROM Category c
LEFT JOIN Product p ON c.Category_ID = p.Category_ID
LEFT JOIN Variant v ON p.Product_ID = v.Product_ID
LEFT JOIN Cart_Item ci ON v.Variant_ID = ci.Variant_ID
LEFT JOIN Order o ON ci.Cart_ID = o.Cart_ID
WHERE o.Order_ID IS NOT NULL
GROUP BY c.Category_ID, c.Category_Name
ORDER BY TotalOrders DESC;