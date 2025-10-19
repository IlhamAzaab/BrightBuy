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
(2, 'Express Delivery', '456 Elm Street, Dallas, TX 75201', 'Delivered', '2024-01-20'),
(3, 'Standard Delivery', '321 Main Street, Austin, TX 73301', 'Pending', '2024-01-25'),
(4, 'Express Delivery', '654 Central Ave, San Antonio, TX 78205', 'Delivered', '2024-01-18'),
(5, 'Standard Delivery', '789 Richmond Ave, Houston, TX 77057', 'Delivered', '2024-01-12'),
(6, 'Express Delivery', '123 Broadway Ave, Houston, TX 77002', 'Pending', '2024-01-22'),
(7, 'Standard Delivery', '456 Commerce St, Dallas, TX 75202', 'Pending', '2024-01-28'),
(8, 'Express Delivery', '321 Congress Ave, Austin, TX 78701', 'Delivered', '2024-01-24'),
(9, 'Standard Delivery', '654 Market St, San Antonio, TX 78205', 'Pending', '2024-01-30'),
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