CREATE DATABASE  IF NOT EXISTS `brightbuy` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `brightbuy`;
-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: brightbuy
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cart`
--

DROP TABLE IF EXISTS `cart`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart` (
  `Cart_ID` int NOT NULL AUTO_INCREMENT,
  `User_ID` int DEFAULT NULL,
  `Status` enum('Active','Checked_out') DEFAULT 'Active',
  PRIMARY KEY (`Cart_ID`),
  KEY `fk_cart_user` (`User_ID`),
  CONSTRAINT `fk_cart_user` FOREIGN KEY (`User_ID`) REFERENCES `user` (`User_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart`
--

LOCK TABLES `cart` WRITE;
/*!40000 ALTER TABLE `cart` DISABLE KEYS */;
INSERT INTO `cart` VALUES (10,8,'Checked_out'),(11,8,'Checked_out'),(12,8,'Checked_out'),(13,8,'Checked_out'),(14,8,'Active'),(15,7,'Active');
/*!40000 ALTER TABLE `cart` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart_item`
--

DROP TABLE IF EXISTS `cart_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_item` (
  `Cart_Item_ID` int NOT NULL AUTO_INCREMENT,
  `Cart_ID` int DEFAULT NULL,
  `Product_ID` int DEFAULT NULL,
  `Variant_ID` int DEFAULT NULL,
  `Quantity` int NOT NULL DEFAULT '1',
  `Total_price` decimal(9,2) DEFAULT NULL,
  PRIMARY KEY (`Cart_Item_ID`),
  UNIQUE KEY `uq_cart_variant` (`Cart_ID`,`Variant_ID`),
  KEY `fk_ci_variant` (`Variant_ID`),
  KEY `fk_ci_product` (`Product_ID`),
  CONSTRAINT `cart_item_ibfk_1` FOREIGN KEY (`Product_ID`) REFERENCES `product` (`Product_ID`),
  CONSTRAINT `cart_item_ibfk_2` FOREIGN KEY (`Cart_ID`) REFERENCES `cart` (`Cart_ID`),
  CONSTRAINT `cart_item_ibfk_3` FOREIGN KEY (`Variant_ID`) REFERENCES `variant` (`Variant_ID`),
  CONSTRAINT `fk_ci_cart` FOREIGN KEY (`Cart_ID`) REFERENCES `cart` (`Cart_ID`) ON DELETE CASCADE,
  CONSTRAINT `fk_ci_product` FOREIGN KEY (`Product_ID`) REFERENCES `product` (`Product_ID`),
  CONSTRAINT `fk_ci_variant` FOREIGN KEY (`Variant_ID`) REFERENCES `variant` (`Variant_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_item`
--

LOCK TABLES `cart_item` WRITE;
/*!40000 ALTER TABLE `cart_item` DISABLE KEYS */;
INSERT INTO `cart_item` VALUES (41,10,8,15,1,479.00),(42,10,30,40,1,199.00),(43,11,6,10,1,1099.00),(44,11,34,44,1,59.00),(45,12,16,26,1,299.00),(46,13,3,5,1,749.00);
/*!40000 ALTER TABLE `cart_item` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_ci_before_insert` BEFORE INSERT ON `cart_item` FOR EACH ROW BEGIN
  DECLARE v_price DECIMAL(10,2);
  SELECT Price INTO v_price FROM variant WHERE Variant_ID = NEW.Variant_ID;
  IF NEW.Quantity IS NULL OR NEW.Quantity < 1 THEN SET NEW.Quantity = 1; END IF;
  SET NEW.Total_price = v_price * NEW.Quantity;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_ci_before_update` BEFORE UPDATE ON `cart_item` FOR EACH ROW BEGIN
  DECLARE v_price DECIMAL(10,2);
  SELECT Price INTO v_price FROM variant WHERE Variant_ID = NEW.Variant_ID;
  IF NEW.Quantity IS NULL OR NEW.Quantity < 1 THEN SET NEW.Quantity = 1; END IF;
  SET NEW.Total_price = v_price * NEW.Quantity;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `category`
--

DROP TABLE IF EXISTS `category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `category` (
  `Category_ID` int NOT NULL,
  `Category_Name` varchar(25) DEFAULT NULL,
  PRIMARY KEY (`Category_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category`
--

LOCK TABLES `category` WRITE;
/*!40000 ALTER TABLE `category` DISABLE KEYS */;
INSERT INTO `category` VALUES (1,'Mobilephones'),(2,'Tablets'),(3,'Accessories');
/*!40000 ALTER TABLE `category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `categoryordersummary`
--

DROP TABLE IF EXISTS `categoryordersummary`;
/*!50001 DROP VIEW IF EXISTS `categoryordersummary`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `categoryordersummary` AS SELECT 
 1 AS `Category_Name`,
 1 AS `TotalOrders`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `city`
--

DROP TABLE IF EXISTS `city`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `city` (
  `City_ID` int NOT NULL AUTO_INCREMENT,
  `City_Name` varchar(25) DEFAULT NULL,
  `Main_City` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`City_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `city`
--

LOCK TABLES `city` WRITE;
/*!40000 ALTER TABLE `city` DISABLE KEYS */;
INSERT INTO `city` VALUES (1,'Houston',1),(2,'Dallas',1),(3,'Austin',1),(4,'San Antonio',1),(5,'Fort Worth',1),(6,'El Paso',0),(7,'Arlington',0),(8,'Corpus Christi',0),(9,'Plano',0),(10,'Lubbock',0),(11,'Garland',0),(12,'Irving',0),(13,'Laredo',0),(14,'Frisco',0),(15,'McKinney',0),(16,'moratuwa',0),(17,'Houstan',0);
/*!40000 ALTER TABLE `city` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `delivery`
--

DROP TABLE IF EXISTS `delivery`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `delivery` (
  `Delivery_ID` int NOT NULL AUTO_INCREMENT,
  `Delivery_Method` varchar(25) DEFAULT NULL,
  `Delivery_Address` varchar(50) DEFAULT NULL,
  `Delivery_Status` enum('Delivered','Pending') DEFAULT NULL,
  `Estimated_delivery_Date` date DEFAULT NULL,
  PRIMARY KEY (`Delivery_ID`),
  KEY `idx_delivery_estimated_date` (`Estimated_delivery_Date`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `delivery`
--

LOCK TABLES `delivery` WRITE;
/*!40000 ALTER TABLE `delivery` DISABLE KEYS */;
INSERT INTO `delivery` VALUES (23,'Standard Delivery','12 Houston','Delivered','2025-10-18'),(24,'Store Pickup','12 Houston','Pending','2025-10-18'),(25,'Standard Delivery','12 Houston','Pending','2025-10-18'),(26,'Store Pickup','12 Houston','Delivered','2025-10-20');
/*!40000 ALTER TABLE `delivery` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `monthlytopsellingproducts`
--

DROP TABLE IF EXISTS `monthlytopsellingproducts`;
/*!50001 DROP VIEW IF EXISTS `monthlytopsellingproducts`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `monthlytopsellingproducts` AS SELECT 
 1 AS `month`,
 1 AS `Product_ID`,
 1 AS `Product_Name`,
 1 AS `Brand`,
 1 AS `total_quantity_sold`,
 1 AS `total_revenue`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `order`
--

DROP TABLE IF EXISTS `order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order` (
  `Order_ID` int NOT NULL AUTO_INCREMENT,
  `User_ID` int DEFAULT NULL,
  `Cart_ID` int DEFAULT NULL,
  `Total_Amount` decimal(9,2) DEFAULT NULL,
  `Payment_method` varchar(25) DEFAULT NULL,
  `Delivery_ID` int DEFAULT NULL,
  `Order_Date` date DEFAULT NULL,
  PRIMARY KEY (`Order_ID`),
  KEY `User_ID` (`User_ID`),
  KEY `fk_order_delivery` (`Delivery_ID`),
  KEY `fk_order_cart` (`Cart_ID`),
  CONSTRAINT `fk_order_cart` FOREIGN KEY (`Cart_ID`) REFERENCES `cart` (`Cart_ID`),
  CONSTRAINT `fk_order_delivery` FOREIGN KEY (`Delivery_ID`) REFERENCES `delivery` (`Delivery_ID`),
  CONSTRAINT `order_ibfk_1` FOREIGN KEY (`User_ID`) REFERENCES `user` (`User_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order`
--

LOCK TABLES `order` WRITE;
/*!40000 ALTER TABLE `order` DISABLE KEYS */;
INSERT INTO `order` VALUES (18,8,10,678.00,'Cash on Delivery',23,'2025-10-13'),(19,8,11,1158.00,'Cash on Delivery',24,'2025-10-13'),(20,8,12,299.00,'Cash on Delivery',25,'2025-10-13'),(21,8,13,749.00,'Cash on Delivery',26,'2025-10-13');
/*!40000 ALTER TABLE `order` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product`
--

DROP TABLE IF EXISTS `product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product` (
  `Product_ID` int NOT NULL AUTO_INCREMENT,
  `Category_ID` int DEFAULT NULL,
  `Product_Name` varchar(225) DEFAULT NULL,
  `Brand` varchar(225) DEFAULT NULL,
  `SKU` varchar(255) DEFAULT NULL,
  `Description` text,
  PRIMARY KEY (`Product_ID`),
  KEY `fk_product_category` (`Category_ID`),
  CONSTRAINT `fk_product_category` FOREIGN KEY (`Category_ID`) REFERENCES `category` (`Category_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product`
--

LOCK TABLES `product` WRITE;
/*!40000 ALTER TABLE `product` DISABLE KEYS */;
INSERT INTO `product` VALUES (1,1,'iPhone 15','Apple','Apple iPhone 15','iPhone with bright OLED display, 48MP main camera, USB-C, and long battery life—great everyday iOS performance.'),(2,1,'Pixel 8','Google','Google Pixel 8','Clean Android with Google’s AI features and a class-leading camera—compact, smooth, and reliable.'),(3,1,'Galaxy S23','Samsung','Samsung Galaxy S23','Compact Galaxy with vibrant AMOLED screen, fast performance, and a versatile triple-camera setup.'),(4,2,'iPad Air (M2)','Apple','Apple iPad Air (M2)','Slim and powerful tablet with the M2 chip, great for study, note-taking, and creative apps with Apple Pencil support.'),(5,3,'USB-C Charger','Anker','Anker USB-C Charger','Compact USB-C wall charger for phones, tablets, and accessories—fast, travel-friendly, and dependable.'),(6,1,'iPhone 15 Pro','Apple','Apple iPhone 15 Pro','Apple’s pro-grade phone with A17 chip, great cameras, and a premium titanium build. Ideal for performance and photography.'),(7,1,'iPhone 14','Apple','Apple iPhone 14','Reliable iPhone with excellent battery life and a bright OLED display. Perfect everyday iOS experience.'),(8,1,'iPhone SE (3rd Gen)','Apple','Apple iPhone SE (3rd Gen)','Compact iPhone with Touch ID and fast A15 performance. Great value for iOS lovers.'),(9,1,'Galaxy S23 Ultra','Samsung','Samsung Galaxy S23 Ultra','Flagship with S Pen support and a superb quad-camera system. Built for power users.'),(10,1,'Galaxy A55','Samsung','Samsung Galaxy A55','Mid-range Galaxy with AMOLED screen and long battery life. Solid everyday Android choice.'),(11,1,'Pixel 8 Pro','Google','Google Pixel 8 Pro','Google’s top Pixel with Tensor G3 and best-in-class AI camera features. Clean Android.'),(12,1,'Pixel 7a','Google','Google Pixel 7a','Affordable Pixel with excellent photos and smooth software—great value.'),(13,1,'OnePlus 12','OnePlus','OnePlus OnePlus 12','Fast and fluid flagship with rapid charging and a bright LTPO display.'),(14,1,'OnePlus Nord CE 4','OnePlus','OnePlus OnePlus Nord CE 4','Slim mid-ranger with clean OxygenOS and dependable performance.'),(15,1,'Xiaomi 13T Pro','Xiaomi','Xiaomi Xiaomi 13T Pro','Leica-tuned cameras and fast charging make this a strong flagship value.'),(16,1,'Redmi Note 13 Pro','Xiaomi','Xiaomi Redmi Note 13 Pro','Great AMOLED display and big battery—budget friendly with premium touches.'),(17,1,'Motorola Edge 40','Motorola','Motorola Motorola Edge 40','Curved display, light design, and clean Android experience.'),(18,1,'Nothing Phone (2a)','Nothing','Nothing Nothing Phone (2a)','Unique Glyph interface with smooth performance and minimalist design.'),(19,1,'Nokia G42','Nokia','Nokia Nokia G42','Repair-friendly design with long battery life and clean software.'),(20,1,'Sony Xperia 10 V','Sony','Sony Sony Xperia 10 V','Tall 21:9 OLED display and stereo speakers—great for media on the go.'),(21,2,'iPad Pro 11\" (M4)','Apple','Apple iPad Pro 11\" (M4)','Ultra-thin tablet with M4 performance and ProMotion display—made for creators.'),(22,2,'iPad (10th Gen)','Apple','Apple iPad (10th Gen)','All-round iPad for study and entertainment with USB-C and a vivid screen.'),(23,2,'Galaxy Tab S9','Samsung','Samsung Galaxy Tab S9','Premium AMOLED tablet with S Pen in the box and desktop-like DeX mode.'),(24,2,'Galaxy Tab A9','Samsung','Samsung Galaxy Tab A9','Lightweight family tablet for streaming, notes, and casual gaming.'),(25,2,'Xiaomi Pad 6','Xiaomi','Xiaomi Xiaomi Pad 6','Sharp 144Hz display and snappy performance—great value work-and-play slate.'),(26,2,'Lenovo Tab P12','Lenovo','Lenovo Lenovo Tab P12','Large screen tablet with quad speakers—ideal for movies and multitasking.'),(27,2,'Fire HD 10','Amazon','Amazon Fire HD 10','Affordable tablet for reading, streaming, and Alexa—excellent battery life.'),(28,3,'AirPods Pro (2nd Gen)','Apple','Apple AirPods Pro (2nd Gen)','Active noise cancellation with Spatial Audio—seamless with Apple devices.'),(29,3,'Galaxy Buds2 Pro','Samsung','Samsung Galaxy Buds2 Pro','Comfortable earbuds with rich sound and 24-bit hi-fi on supported devices.'),(30,3,'Pixel Buds Pro','Google','Google Pixel Buds Pro','ANC earbuds with deep integration to Pixel phones and clear call quality.'),(31,3,'PowerCore 20K','Anker','Anker PowerCore 20K','High-capacity power bank with fast charging for phones and tablets.'),(32,3,'3-in-1 MagSafe Stand','Belkin','Belkin 3-in-1 MagSafe Stand','Charge iPhone, AirPods, and Apple Watch together—clean desk setup.'),(33,3,'Tune 510BT','JBL','JBL Tune 510BT','Lightweight Bluetooth headphones with punchy bass and long battery life.'),(34,3,'WH-CH520','Sony','Sony WH-CH520','Everyday wireless headphones—clear sound and multi-point connection.'),(35,3,'MX Master 3S','Logitech','Logitech MX Master 3S','Ergonomic mouse with precise scrolling—great for productivity and creators.'),(36,3,'Ultra microSD 128GB','SanDisk','SanDisk Ultra microSD 128GB','Expand storage for phones, cameras, and handheld consoles—A1 app performance.'),(37,3,'DataTraveler 64GB','Kingston','Kingston DataTraveler 64GB','Compact USB flash drive—reliable file transfer and backup on the go.'),(38,3,'USB-C to HDMI Adapter','UGREEN','UGREEN USB-C to HDMI Adapter','Connect laptops/phones to 4K displays—plug-and-play adapter.'),(39,3,'Mag Armor Case (iPhone 15)','Spigen','Spigen Mag Armor Case (iPhone 15)','Protective MagSafe-compatible case with slim design and strong grip.'),(40,3,'Kishi V2','Razer','Razer Kishi V2','Mobile game controller with low-latency USB-C—console feel on your phone.');
/*!40000 ALTER TABLE `product` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `User_ID` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(25) DEFAULT NULL,
  `Password` varchar(100) DEFAULT NULL,
  `Address` varchar(50) DEFAULT NULL,
  `City_ID` int DEFAULT NULL,
  `Email` varchar(25) DEFAULT NULL,
  `Role` varchar(10) DEFAULT NULL,
  `image_URL` varchar(300) DEFAULT NULL,
  PRIMARY KEY (`User_ID`),
  KEY `City_ID` (`City_ID`),
  CONSTRAINT `user_ibfk_1` FOREIGN KEY (`City_ID`) REFERENCES `city` (`City_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'John Smith','$2b$10$5uQp7jO9Z1h7b3qM3LmqL.2x/Uf0GeykW6v36LgTzptE5ZmZkMo2y','123 Broadway Ave',1,'john.smith@email.com','customer',NULL),(2,'Maria Garcia','$2b$10$1HnHZY0gk1aIqqoxmOfpUe8Z9UBHq5OJwITCwM3cjsCF14Cb0Lzj6','456 Sunset Blvd',2,'maria.garcia@email.com','customer',NULL),(3,'Admin User','$2b$10$3P8Wq90x9dR.4ysYWj9pIuaQb0iVik4aS8PKotcJqSb5kKFXs4fQ6','789 Michigan Ave',1,'admin@brightbuy.com','admin',NULL),(4,'David Johnson','$2b$10$0nM9Hx3QnFUkzqD95v7eReN2/NnQ5LbYfY8zjYl4V7PmVvN49hw5u','321 Main Street',3,'david.johnson@email.com','customer',NULL),(5,'Sarah Wilson','$2b$10$gW3ap0LJGyjWJpVk6k6GeOlDq5Uu0g7qB4zF6wA5p1pCBP.jkW5Rm','654 Central Ave',4,'sarah.wilson@email.com','customer',NULL),(6,'admin2 User','$2b$10$ns35RoYdRZMFctzh8Up3Lu7gK9fIu9XiM/CeRajGqI9PRByim5jEy',NULL,1,'Admin2@example.com','admin',NULL),(7,'Harshana','$2b$10$pK2ED6rM2..QUfdVhtPcyuvM32FPSELOGTmzpitp8qc9n1Wi2m6D.',NULL,NULL,'hag@gmail.com','admin',NULL),(8,'Harshana Gunawardena','$2b$10$7fX32bke0RY/ZDFh8LGrZ.P1hdEYRSDhbKsPOFaZ0XjTlqtjMIzZW','12 Houston',16,'har@gmail.com','customer','/uploads/1760278742136-Dark Knight Rises HD Wallpaper And Desktop Background.jpg');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `variant`
--

DROP TABLE IF EXISTS `variant`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `variant` (
  `Variant_ID` int NOT NULL AUTO_INCREMENT,
  `Product_ID` int DEFAULT NULL,
  `Price` decimal(10,2) DEFAULT NULL,
  `Stock_quantity` int DEFAULT NULL,
  `Colour` varchar(25) DEFAULT NULL,
  `Size` int DEFAULT NULL,
  `Image_URL` varchar(2500) DEFAULT NULL,
  PRIMARY KEY (`Variant_ID`),
  KEY `Product_ID` (`Product_ID`),
  CONSTRAINT `variant_ibfk_1` FOREIGN KEY (`Product_ID`) REFERENCES `product` (`Product_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `variant`
--

LOCK TABLES `variant` WRITE;
/*!40000 ALTER TABLE `variant` DISABLE KEYS */;
INSERT INTO `variant` VALUES (1,1,799.00,30,'Black',128,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106539/dfqpkjvh8/zj1rak94ub2jtxlu39zt.jpg'),(2,1,899.00,15,'Blue',256,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106536/dfqpkjvh8/oqpbta0mu0ylixfcl5o0.jpg'),(3,2,699.00,25,'Porcelain',128,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106563/dfqpkjvh8/yjl79thhm1wsen8wakvl.jpg'),(4,2,799.00,18,'Obsidian',256,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106513/dfqpkjvh8/bnl0jvuw3myjy3ooqvk9.jpg'),(5,3,749.00,28,'Green',128,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106518/dfqpkjvh8/p5h3hr6g7cvpinuwjyr1.jpg'),(6,3,849.00,14,'Lavender',256,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106514/dfqpkjvh8/x1ynh57etupksqfscecr.jpg'),(7,4,599.00,12,'Starlight',64,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106528/dfqpkjvh8/f9kd3lk8atkxjjz2sge0.avif'),(8,4,749.00,10,'Blue',256,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106531/dfqpkjvh8/kfpv2oxhknfu3b6uhlpf.jpg'),(9,5,39.99,49,'Black',65,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106524/dfqpkjvh8/yvakdeuqp3xecqpbqbqo.jpg'),(10,6,1099.00,49,'Black',128,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106534/dfqpkjvh8/w5zvgtq4suhvlhx4ybs2.png'),(11,6,1299.00,40,'Silver',256,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106538/dfqpkjvh8/qpgun6ioljn4ptqfkrbv.jpg'),(12,7,799.00,60,'Blue',128,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106540/dfqpkjvh8/uw4lhvy5chjmncj3m8zs.webp'),(13,7,899.00,40,'Purple',256,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106525/dfqpkjvh8/wowfcblcgxjvczikicn0.png'),(14,8,429.00,70,'Red',64,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106546/dfqpkjvh8/h8hkgnhnym1kdgby4weh.avif'),(15,8,479.00,49,'White',128,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106543/dfqpkjvh8/zbdru69e2tafcax2xrtb.webp'),(16,9,1199.00,45,'Black',256,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106576/dfqpkjvh8/soc7fa9y4b7wnzc2cul1.webp'),(17,9,1399.00,30,'Green',512,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106516/dfqpkjvh8/czcrnkhjk7xmv3rruzyy.jpg'),(18,10,499.00,79,'White',128,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106572/dfqpkjvh8/wb0x0jwzifxizeqliqbd.webp'),(19,11,999.00,50,'Obsidian',128,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106564/dfqpkjvh8/romtr0mck7lggahk2mjj.avif'),(20,11,1099.00,30,'Porcelain',256,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106519/dfqpkjvh8/lz6xd5ntzunpbji3p8fv.jpg'),(21,12,499.00,60,'Charcoal',128,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106562/dfqpkjvh8/p7ekjm2pxjgxjv38gwn5.png'),(22,13,899.00,40,'Black',256,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106558/dfqpkjvh8/nslwyc5nm1xkcbcrvxtu.webp'),(23,13,999.00,25,'Green',512,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106559/dfqpkjvh8/bjajvdkwc2q07xzeq1be.png'),(24,14,399.00,70,'Green',128,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106560/dfqpkjvh8/whue1zhtlen59innvc6t.jpg'),(25,15,649.00,50,'Blue',256,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106571/dfqpkjvh8/qrkwplwrebdlfyy4qhkm.png'),(26,16,299.00,89,'Purple',128,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106571/dfqpkjvh8/qrkwplwrebdlfyy4qhkm.png'),(27,17,599.00,40,'Green',256,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106555/dfqpkjvh8/bjdzn41uyhjkhyzpdeqg.png'),(28,18,449.00,58,'Black',128,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106557/dfqpkjvh8/ezuf0itfvm5czbnf06pu.webp'),(29,19,299.00,70,'Black',128,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106556/dfqpkjvh8/nzjqqoru1s7ibr6a1elw.webp'),(30,20,399.00,50,'Black',128,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106588/dfqpkjvh8/th07jk1tlntjuqtolnht.png'),(31,21,1099.00,30,'Black',256,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106533/dfqpkjvh8/rrsbucas3wooqiwwrm3y.jpg'),(32,22,449.00,60,'Blue',64,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106529/dfqpkjvh8/xytqzmdvgw4jwiz8o0gx.png'),(33,23,899.00,60,'Graphite',256,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106577/dfqpkjvh8/nhnpi6ly4qsspqgwv2na.jpg'),(34,24,229.00,80,'Gray',64,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106575/dfqpkjvh8/quwuir8fpnu1mebzzl1y.webp'),(35,25,399.00,50,'Black',128,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106587/dfqpkjvh8/rbxts3an7nopde4aewf3.jpg'),(36,26,429.00,42,'Gray',128,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106552/dfqpkjvh8/jrjb9ktrzff2hceybbwu.jpg'),(37,27,199.00,70,'Blue',64,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106522/dfqpkjvh8/rq2ofeijp6whnixbuaew.webp'),(38,28,249.00,100,'White',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106520/dfqpkjvh8/iv3sasd35vmybf1ombrh.webp'),(39,29,229.00,90,'Purple',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760247910/dfqpkjvh8/wm0i2mgnpltqy1t0yk4j.jpg'),(40,30,199.00,79,'White',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106565/dfqpkjvh8/sb3algkpn82zygwhzkcx.webp'),(41,31,59.00,120,'Black',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106523/dfqpkjvh8/coms2xptzjfkmbwfm5uq.webp'),(42,32,129.00,40,'Black',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106526/dfqpkjvh8/sev8nlq8mfsyhdoaep0o.jpg'),(43,33,49.00,100,'White',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106549/dfqpkjvh8/mhjrvav9lftv28vnf00r.png'),(44,34,59.00,88,'Black',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106580/dfqpkjvh8/ljuxtochd2wozogbendv.jpg'),(45,35,99.00,50,'Black',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106554/dfqpkjvh8/xsfn8yicrw3lthu2lryy.jpg'),(46,36,19.00,200,'Black',128,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106578/dfqpkjvh8/rjqnou7lc4yldsivcrux.webp'),(47,37,15.00,150,'Black',64,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106551/dfqpkjvh8/rneahqssp8qdkxp4dmcj.webp'),(48,38,25.00,80,'Gray',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106583/dfqpkjvh8/uvmsedjynyw99hykk4k2.jpg'),(49,39,29.00,69,'Black',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106582/dfqpkjvh8/o9c55qshxpm5kmgeixhi.jpg'),(50,40,99.00,30,'Black',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760106569/dfqpkjvh8/oltkqyv4b2fyndyvi6tc.webp');
/*!40000 ALTER TABLE `variant` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'brightbuy'
--

--
-- Dumping routines for database 'brightbuy'
--
/*!50003 DROP PROCEDURE IF EXISTS `GetQuarterlySales` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `GetQuarterlySales`(IN selectedYear INT)
BEGIN
  SELECT
    YEAR(Order_Date) AS Year,
    QUARTER(Order_Date) AS Quarter,
    SUM(Total_Amount) AS Total_Sales,
    COUNT(Order_ID) AS Total_Orders,
    AVG(Total_Amount) AS Avg_Order_Value
  FROM `Order`
  WHERE YEAR(Order_Date) = selectedYear
  GROUP BY Year, Quarter
  ORDER BY Quarter;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Final view structure for view `categoryordersummary`
--

/*!50001 DROP VIEW IF EXISTS `categoryordersummary`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `categoryordersummary` AS select `c`.`Category_Name` AS `Category_Name`,count(distinct `o`.`Order_ID`) AS `TotalOrders` from ((((`category` `c` left join `product` `p` on((`c`.`Category_ID` = `p`.`Category_ID`))) left join `variant` `v` on((`p`.`Product_ID` = `v`.`Product_ID`))) left join `cart_item` `ci` on((`v`.`Variant_ID` = `ci`.`Variant_ID`))) left join `order` `o` on((`ci`.`Cart_ID` = `o`.`Cart_ID`))) where (`o`.`Order_ID` is not null) group by `c`.`Category_ID`,`c`.`Category_Name` order by `TotalOrders` desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `monthlytopsellingproducts`
--

/*!50001 DROP VIEW IF EXISTS `monthlytopsellingproducts`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `monthlytopsellingproducts` AS select date_format(`o`.`Order_Date`,'%Y-%m') AS `month`,`p`.`Product_ID` AS `Product_ID`,`p`.`Product_Name` AS `Product_Name`,`p`.`Brand` AS `Brand`,sum(`ci`.`Quantity`) AS `total_quantity_sold`,sum(`ci`.`Total_price`) AS `total_revenue` from ((`order` `o` join `cart_item` `ci` on((`o`.`Cart_ID` = `ci`.`Cart_ID`))) join `product` `p` on((`ci`.`Product_ID` = `p`.`Product_ID`))) group by `month`,`p`.`Product_ID` order by `month` desc,`total_quantity_sold` desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-17  0:06:14
