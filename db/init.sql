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
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart`
--

LOCK TABLES `cart` WRITE;
/*!40000 ALTER TABLE `cart` DISABLE KEYS */;
INSERT INTO `cart` VALUES (1,1,'Active'),(2,2,'Active'),(3,4,'Active'),(4,5,'Active'),(5,1,'Active'),(6,2,'Active'),(7,4,'Active'),(8,5,'Active'),(9,7,'Active'),(10,8,'Checked_out');
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
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_item`
--

LOCK TABLES `cart_item` WRITE;
/*!40000 ALTER TABLE `cart_item` DISABLE KEYS */;
INSERT INTO `cart_item` VALUES (1,1,1,1,1,1299.00),(2,1,5,9,2,2798.00),(3,1,28,38,1,1599.00),(4,2,2,3,1,1599.00),(5,2,31,41,1,499.00),(9,4,4,7,1,899.00),(10,4,32,42,1,549.00),(11,5,6,10,1,1599.00),(12,5,35,45,1,899.00),(13,6,11,19,1,79.00),(14,6,30,40,1,1799.00),(15,7,9,16,1,1999.00),(16,7,39,49,1,249.00),(17,8,21,31,1,199.00),(18,8,28,38,1,1599.00),(19,8,36,46,2,1898.00),(20,10,4,7,1,899.00),(21,10,7,14,1,1699.00);
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
INSERT INTO `category` VALUES (1,'Mobile Phones'),(2,'Laptops'),(3,'Chargers'),(4,'Headsets'),(5,'Camera'),(6,'Watch'),(7,'Electronic Device'),(8,'Tablets'),(9,'Shoes'),(10,'Bags'),(11,'Storage Devices');
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
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `city`
--

LOCK TABLES `city` WRITE;
/*!40000 ALTER TABLE `city` DISABLE KEYS */;
INSERT INTO `city` VALUES (1,'Houston',1),(2,'Dallas',1),(3,'Austin',1),(4,'San Antonio',1),(5,'Fort Worth',0),(6,'El Paso',0),(7,'Arlington',0),(8,'Corpus Christi',0),(9,'Plano',0),(10,'Lubbock',0),(11,'Garland',0),(12,'Irving',0),(13,'Laredo',0),(14,'Frisco',0),(15,'McKinney',0);
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
  KEY `idx_delivery_estimated_date` (`Estimated_delivery_Date`),
  KEY `idx_delivery_status` (`Delivery_Status`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `delivery`
--

LOCK TABLES `delivery` WRITE;
/*!40000 ALTER TABLE `delivery` DISABLE KEYS */;
INSERT INTO `delivery` VALUES (1,'Standard Delivery','123 Broadway Ave, Houston, TX 77002','Delivered','2024-01-15'),(2,'Store Pickup','456 Elm Street, Dallas, TX 75201','Pending','2024-01-20'),(3,'Standard Delivery','321 Main Street, Austin, TX 73301','Pending','2024-01-25'),(4,'Store Pickup','654 Central Ave, San Antonio, TX 78205','Delivered','2024-01-18'),(5,'Standard Delivery','789 Richmond Ave, Houston, TX 77057','Delivered','2024-01-12'),(6,'Store Pickup','123 Broadway Ave, Houston, TX 77002','Pending','2024-01-22'),(7,'Standard Delivery','456 Commerce St, Dallas, TX 75202','Pending','2024-01-28'),(8,'Store Pickup','321 Congress Ave, Austin, TX 78701','Pending','2024-01-24'),(9,'Standard Delivery','654 Market St, San Antonio, TX 78205','Pending','2024-01-30'),(10,'Store Pickup','789 Westheimer Rd, Houston, TX 77027','Delivered','2024-01-16'),(11,'Standard Delivery','12 Houston','Pending','2025-10-24');
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
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order`
--

LOCK TABLES `order` WRITE;
/*!40000 ALTER TABLE `order` DISABLE KEYS */;
INSERT INTO `order` VALUES (3,4,3,1877.00,'Cash on Delivery',3,'2024-01-14'),(4,3,4,728.00,'Cash on Delivery',4,'2024-01-15'),(5,1,5,1198.00,'Online Payment',5,'2024-01-08'),(7,4,7,1228.00,'Cash on Delivery',7,'2024-01-18'),(8,2,8,1386.00,'Online Payment',8,'2024-01-19'),(9,8,10,2598.00,'Online Payment',11,'2025-10-19');
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
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product`
--

LOCK TABLES `product` WRITE;
/*!40000 ALTER TABLE `product` DISABLE KEYS */;
INSERT INTO `product` VALUES (1,1,'Galaxy S25 Ultra','Samsung','SAMSUNG_GALAXY_S25_ULTRA','Flagship model from Samsung'),(2,1,'iPhone 16 Pro Max','Apple','APPLE_IPHONE_16_PRO_MAX','Latest Pro Max version of iPhone'),(3,1,'Google Pixel 10','Google','GOOGLE_PIXEL_10','Pixel flagship with advanced AI camera'),(4,1,'OnePlus 13','OnePlus','ONEPLUS_ONEPLUS_13','High performance Android phone'),(5,2,'MacBook Air M4','Apple','APPLE_MACBOOK_AIR_M4','Lightweight laptop with Apple Silicon M4'),(6,2,'Dell XPS 15 2025','Dell','DELL_XPS_15_2025','Dell flagship 15-inch XPS'),(7,2,'ThinkPad X1 Carbon','Lenovo','LENOVO_THINKPAD_X1_CARBON','Durable business ultrabook'),(8,2,'ROG Strix G17','ASUS','ASUS_ROG_STRIX_G17','Gaming laptop with RTX GPU'),(9,3,'USB-C 65W GaN Charger','Anker','ANKER_USB_C_65W_GAN_CHARGER','Compact gallium nitride charger 65W'),(10,3,'MagSafe Fast Charger','Apple','APPLE_MAGSAFE_FAST_CHARGER','MagSafe wireless fast charger'),(11,3,'PowerPort III 108W','Anker','ANKER_POWERPORT_III_108W','GaN charger with 2 USB-C ports'),(12,3,'HyperJuice 100W Charging Station','Hyper','HYPER_HYPERJUICE_100W_CHARGING_STATION','Multi-port USB-C charging station'),(13,4,'AirPods Pro 3','Apple','APPLE_AIRPODS_PRO_3','Latest Apple noise cancelling earbuds'),(14,4,'WH-1000XM6','Sony','SONY_WH_1000XM6','Flagship Sony noise cancelling over-ear'),(15,4,'QuietComfort Ultra','Bose','BOSE_QUIETCOMFORT_ULTRA','Ultra noise cancelling headset'),(16,4,'Elite 10','Jabra','JABRA_ELITE_10','True wireless earbuds with ANC'),(17,5,'EOS R8','Canon','CANON_EOS_R8','Mirrorless full-frame camera'),(18,5,'A7 IV','Sony','SONY_A7_IV','Sony’s full-frame mirrorless camera'),(19,5,'Z5 II','Nikon','NIKON_Z5_II','Entry-level full-frame mirrorless camera'),(20,5,'X-T5','Fujifilm','FUJIFILM_X_T5','APS-C mirrorless camera'),(21,6,'Apple Watch Series 11','Apple','APPLE_APPLE_WATCH_SERIES_11','Latest Apple smartwatch'),(22,6,'Galaxy Watch 7','Samsung','SAMSUNG_GALAXY_WATCH_7','Samsung flagship smartwatch'),(23,6,'Fenix 8','Garmin','GARMIN_FENIX_8','High end multisport GPS watch'),(24,6,'Charge 7 Pro','Fitbit','FITBIT_CHARGE_7_PRO','Fitness tracker and smartwatch hybrid'),(25,7,'Echo Show 15','Amazon','AMAZON_ECHO_SHOW_15','Smart display with Alexa'),(26,7,'Nest Hub Max','Google','GOOGLE_NEST_HUB_MAX','Google smart home hub display'),(27,7,'Streaming Stick Plus','Roku','ROKU_STREAMING_STICK_PLUS','4K streaming stick device'),(28,7,'Fire TV Cube 3rd Gen','Amazon','AMAZON_FIRE_TV_CUBE_3RD_GEN','Streaming device plus Alexa hub'),(29,8,'iPad Pro 13','Apple','APPLE_IPAD_PRO_13','Latest iPad Pro large model'),(30,8,'Galaxy Tab S10','Samsung','SAMSUNG_GALAXY_TAB_S10','Flagship Android tablet'),(31,8,'Surface Pro 11','Microsoft','MICROSOFT_SURFACE_PRO_11','Hybrid 2-in-1 tablet PC'),(32,8,'Tab P12','Lenovo','LENOVO_TAB_P12','High performance Android tablet'),(33,9,'Air Jordan 1 High','Nike','NIKE_AIR_JORDAN_1_HIGH','Classic high-top basketball shoe'),(34,9,'UltraBoost 24','Adidas','ADIDAS_ULTRABOOST_24','Running shoe with Boost midsole'),(35,9,'RS-X3','Puma','PUMA_RS_X3','Lifestyle chunky sneaker'),(36,9,'550','New Balance','NEW_BALANCE_550','Retro basketball style shoe'),(37,10,'Neverfull MM','Louis Vuitton','LOUIS_VUITTON_NEVERFULL_MM','Luxury tote bag'),(38,10,'Little America Backpack','Herschel','HERSCHEL_LITTLE_AMERICA_BACKPACK','Classic backpack style'),(39,10,'Alpha Bravo Sling','Tumi','TUMI_ALPHA_BRAVO_SLING','Crossbody sling bag'),(40,10,'Winfield 3','Samsonite','SAMSONITE_WINFIELD_3','Hard shell carry-on suitcase'),(41,11,'T7 Shield 1TB','Samsung','SAMSUNG_T7_SHIELD_1TB','Portable SSD with rugged design'),(42,11,'Extreme Pro 1TB','SanDisk','SANDISK_EXTREME_PRO_1TB','High speed portable SSD'),(43,11,'MyBook 10TB','Western Digital','WESTERN_DIGITAL_MYBOOK_10TB','Desktop external HDD'),(44,11,'Barracuda 4TB','Seagate','SEAGATE_BARRACUDA_4TB','Internal HDD 3.5 inch model');
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
INSERT INTO `user` VALUES (1,'John Smith','$2b$10$5uQp7jO9Z1h7b3qM3LmqL.2x/Uf0GeykW6v36LgTzptE5ZmZkMo2y','123 Broadway Ave',1,'john.smith@email.com','customer',NULL),(2,'Maria Garcia','$2b$10$1HnHZY0gk1aIqqoxmOfpUe8Z9UBHq5OJwITCwM3cjsCF14Cb0Lzj6','456 Sunset Blvd',2,'maria.garcia@email.com','customer',NULL),(3,'Admin User','$2b$10$3P8Wq90x9dR.4ysYWj9pIuaQb0iVik4aS8PKotcJqSb5kKFXs4fQ6','789 Michigan Ave',1,'admin@brightbuy.com','admin',NULL),(4,'David Johnson','$2b$10$0nM9Hx3QnFUkzqD95v7eReN2/NnQ5LbYfY8zjYl4V7PmVvN49hw5u','321 Main Street',3,'david.johnson@email.com','customer',NULL),(5,'Sarah Wilson','$2b$10$gW3ap0LJGyjWJpVk6k6GeOlDq5Uu0g7qB4zF6wA5p1pCBP.jkW5Rm','654 Central Ave',4,'sarah.wilson@email.com','customer',NULL),(6,'admin2 User','$2b$10$ns35RoYdRZMFctzh8Up3Lu7gK9fIu9XiM/CeRajGqI9PRByim5jEy',NULL,1,'Admin2@example.com','admin',NULL),(7,'Harshana','$2b$10$UP3uiaGCaz6B4c8HLdUNXeTmeaKiDMIz6aHQ/6osSMyknNe3kmx9q',NULL,NULL,'hag@gmail.com','admin',NULL),(8,'Harshana Gunawardena','$2b$10$5KImJALB14GJaY83gh3IGOlvl/uom25B9npSv65xR3ZrYv8Wj0Sa2','12 Houston',1,'har@gmail.com','customer',NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=89 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `variant`
--

LOCK TABLES `variant` WRITE;
/*!40000 ALTER TABLE `variant` DISABLE KEYS */;
INSERT INTO `variant` VALUES (1,1,1299.00,50,'Black',256,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875752/dfqpkjvh8/hgmmrbcaf1aw3p5c8j5m.webp'),(2,1,1399.00,40,'Silver',512,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875755/dfqpkjvh8/vbkvdmjphyrdidlogbds.jpg'),(3,2,1599.00,35,'Gold',256,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875746/dfqpkjvh8/qxycyracr3glvm98gtnv.jpg'),(4,2,1799.00,25,'Blue',512,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875744/dfqpkjvh8/mx3fgkydfjtnzqgx7w9x.avif'),(5,3,999.00,45,'Obsidian',128,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875747/dfqpkjvh8/ngt7yni8yjxsheuxse0s.jpg'),(6,3,1099.00,40,'Snow',256,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875748/dfqpkjvh8/ruiok5qef8xzvr3mud17.webp'),(7,4,899.00,59,'Green',128,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875751/dfqpkjvh8/tugtp1jksszykc2h7u46.png'),(8,4,999.00,50,'Black',256,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875749/dfqpkjvh8/yq1wa4fwux7cdye4hssb.avif'),(9,5,1399.00,30,'Silver',512,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875675/dfqpkjvh8/sxujqrbu2yqyd2pinrlc.jpg'),(10,5,1599.00,25,'Space Gray',1024,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875678/dfqpkjvh8/iquhl88qt6l1dzxkg6q7.jpg'),(11,6,1699.00,20,'Platinum',1024,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875689/dfqpkjvh8/q843i5xgbs31soa19ggw.avif'),(12,6,1899.00,15,'Black',2048,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875690/dfqpkjvh8/xyylqojhherh9bxetdiq.avif'),(13,7,1499.00,30,'Black',512,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875691/dfqpkjvh8/f6nnysmabzioaibejlza.jpg'),(14,7,1699.00,24,'Carbon Fiber',1024,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875693/dfqpkjvh8/nay2pcftrawz5hu7rq6e.avif'),(15,8,1799.00,20,'Black',1024,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875679/dfqpkjvh8/onbuce12axxfpqrnqob4.png'),(16,8,1999.00,15,'Red',2048,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875687/dfqpkjvh8/slwl5pkjhanqqx76zjbc.png'),(17,9,59.00,100,'White',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875562/dfqpkjvh8/dggxprfefokfkhhgd06f.avif'),(18,9,64.00,80,'Black',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875561/dfqpkjvh8/leyalydx1lrmablnyods.avif'),(19,10,79.00,60,'White',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875565/dfqpkjvh8/pymtdn7mcgqrgjbkn3ky.webp'),(20,10,85.00,50,'Midnight',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875564/dfqpkjvh8/xpkabacc1ajd7hfnfw00.jpg'),(21,11,89.00,70,'Black',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875559/dfqpkjvh8/dw9amqc1e4f326iwbtcd.avif'),(22,11,95.00,65,'Silver',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875560/dfqpkjvh8/ccv6n9ztslxckjtzwepw.avif'),(23,12,99.00,40,'Gray',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875566/dfqpkjvh8/f3uem8wjrq0bkyiyjfpy.webp'),(24,12,109.00,35,'White',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875567/dfqpkjvh8/g3pjkoa0zitc8ewr3mnl.jpg'),(25,13,249.00,70,'White',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875642/dfqpkjvh8/rhwyt3diywhzjkiy43iw.jpg'),(26,13,259.00,60,'Black',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875641/dfqpkjvh8/rzcwaie8ccw23x5dfwhq.jpg'),(27,14,399.00,50,'Black',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875648/dfqpkjvh8/q3etbprwda7fkam4lxad.webp'),(28,14,429.00,45,'Silver',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875649/dfqpkjvh8/liitmun8ugytkhbgiuw1.png'),(29,15,349.00,55,'White',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875645/dfqpkjvh8/lwgtimwuvzhzkv0jygkr.jpg'),(30,15,359.00,50,'Blue',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875643/dfqpkjvh8/kqeuuzqwwftedtglih32.jpg'),(31,16,199.00,80,'Gray',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875647/dfqpkjvh8/i5yctpbrzzda6rweu9fx.jpg'),(32,16,209.00,70,'Beige',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875646/dfqpkjvh8/ir6orqfhf18prine6fta.jpg'),(33,17,2499.00,10,'Black',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875509/dfqpkjvh8/ea1kitccmdtzkqyfb01l.jpg'),(34,17,2699.00,5,'Silver',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875510/dfqpkjvh8/rmbrbnlklzimmzzqwjnn.jpg'),(35,18,2199.00,12,'Black',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875515/dfqpkjvh8/xb8j2lj6dzquomojznze.webp'),(36,18,2399.00,6,'Silver',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875516/dfqpkjvh8/jzjgltys6smyoubn6ajy.jpg'),(37,19,1499.00,14,'Black',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875513/dfqpkjvh8/x0xlolmtyxrepkjakbye.jpg'),(38,19,1599.00,7,'Silver',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875514/dfqpkjvh8/mkzklxcfh0zcnwhwf2ut.jpg'),(39,20,1699.00,13,'Black',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875511/dfqpkjvh8/ac3ntqcsrkke0isgqgjb.jpg'),(40,20,1799.00,8,'Silver',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875512/dfqpkjvh8/zxz8isjgkdnm7qcdbyat.jpg'),(41,21,499.00,60,'Midnight',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875916/dfqpkjvh8/wa2udphmsivbhcvndsvf.jpg'),(42,21,549.00,55,'Starlight',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875917/dfqpkjvh8/yuan3lgeidaxzlgmxv9w.jpg'),(43,22,449.00,70,'Graphite',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875923/dfqpkjvh8/k4sg6cmjxeabkqnpr799.webp'),(44,22,469.00,60,'Silver',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875925/dfqpkjvh8/hkekyxoof5dyuth9gcbr.jpg'),(45,23,899.00,40,'Black',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875921/dfqpkjvh8/xygehulttzc4g2kvxzh5.webp'),(46,23,949.00,35,'Blue',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875922/dfqpkjvh8/ww1ce2uqyqa70a8po4jt.webp'),(47,24,299.00,80,'Black',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875918/dfqpkjvh8/poys7acidq8abgdjnkjr.jpg'),(48,24,319.00,70,'White',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875920/dfqpkjvh8/ne3oavdks2lysrmibhxr.webp'),(49,25,249.00,60,'White',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875610/dfqpkjvh8/pxxhf6aiqdixm1t1qhe9.png'),(50,25,269.00,50,'Black',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875606/dfqpkjvh8/bcuzzii4pfwkay34ckqm.avif'),(51,26,229.00,55,'White',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875617/dfqpkjvh8/rnorbiyahyydjl096ei2.jpg'),(52,26,239.00,45,'Gray',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875615/dfqpkjvh8/ylvjqqdjqxzvfyhkquab.avif'),(53,27,59.00,100,'Black',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875618/dfqpkjvh8/sh5aa8urbwl02xzpjo8o.jpg'),(54,27,69.00,90,'Purple',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875619/dfqpkjvh8/vaymolmzc2boqousz053.webp'),(55,28,139.00,50,'Black',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875612/dfqpkjvh8/spm6ydmtb444qqvhwwjm.webp'),(56,28,149.00,40,'Gray',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875614/dfqpkjvh8/wttpi8fgmsvwd3mcjhap.jpg'),(57,29,1299.00,40,'Silver',512,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875881/dfqpkjvh8/taxn5irvmjwokectfwwp.jpg'),(58,29,1399.00,35,'Space Gray',1024,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875882/dfqpkjvh8/uow3il1plwnaxezbqzzn.jpg'),(59,30,1099.00,50,'Graphite',256,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875887/dfqpkjvh8/gg5wruelwpq4hvy6bmx3.jpg'),(60,30,1199.00,40,'Beige',512,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875888/dfqpkjvh8/ydre6excdl4ef85ksnzj.avif'),(61,31,1399.00,35,'Silver',512,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875886/dfqpkjvh8/gl7de8wyuug9b8wzl5rx.jpg'),(62,31,1499.00,30,'Black',1024,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875885/dfqpkjvh8/i6puejt11gop9k3nmrpv.jpg'),(63,32,999.00,50,'Gray',128,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875883/dfqpkjvh8/jsjpzuaqlkioywyisj2d.jpg'),(64,32,1099.00,45,'Blue',256,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875884/dfqpkjvh8/ovkzcho5yxygruadu1dr.jpg'),(65,33,179.00,60,'Black',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875782/dfqpkjvh8/gtmbzkafjjadtzbpkovb.jpg'),(66,33,189.00,50,'White',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875783/dfqpkjvh8/vsu6xcneplkhuo1lzl4s.webp'),(67,34,159.00,70,'Gray',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875778/dfqpkjvh8/nl055nx3fiw7fefxdvvv.webp'),(68,34,169.00,65,'Navy',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875779/dfqpkjvh8/xztcsewzocsuyvqpmhps.jpg'),(69,35,149.00,75,'Red',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875785/dfqpkjvh8/r9kgsvfoingfwuwug94w.webp'),(70,35,159.00,65,'Blue',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875784/dfqpkjvh8/kzzjvyafakg10t4zqalx.avif'),(71,36,139.00,80,'Green',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875780/dfqpkjvh8/labewa8hrq2g1djq1gum.webp'),(72,36,149.00,70,'White',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875781/dfqpkjvh8/dxoxtbe2smx5jiousj8r.jpg'),(73,37,1599.00,20,'Brown',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875006/dfqpkjvh8/gfgc8u5au4ylcv8b5xqm.webp'),(74,37,1699.00,15,'Monogram',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875007/dfqpkjvh8/sdnjh7z7lhrifq0zcolw.webp'),(75,38,129.00,50,'Navy',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875005/dfqpkjvh8/uyvxquinuggrtuuskxou.jpg'),(76,38,139.00,45,'Black',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875004/dfqpkjvh8/oh6ou9ibpuh8otarlsis.jpg'),(77,39,249.00,40,'Gray',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875011/dfqpkjvh8/chi8pr3be7dcvfcxzhlc.jpg'),(78,39,259.00,35,'Black',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875012/dfqpkjvh8/ugmdqrx2jsesqaxdeiuu.jpg'),(79,40,199.00,50,'Silver',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875010/dfqpkjvh8jvh8/image/upload/v1760875010/dfqpkjvh8/dcnki1ly5lmnkljy0vwg.jpg'),(80,40,219.00,45,'Blue',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875008/dfqpkjvh8/qpu86w4gvt9u3m3mjdvw.jpg'),(81,41,129.00,80,'Blue',1000,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875850/dfqpkjvh8/kei9ewampl45ziurhbe1.webp'),(82,41,149.00,70,'Black',2000,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875848/dfqpkjvh8/atdzk5jl7ogdce3ucthz.avif'),(83,42,139.00,75,'Gray',1000,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875851/dfqpkjvh8/ghyuzly7c47uidyxt83l.webp'),(84,42,159.00,65,'Red',2000,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875852/dfqpkjvh8/l0gnlqccch8flwzv97qi.png'),(85,43,259.00,60,'Black',10000,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875855/dfqpkjvh8/darv0dpgsqddknqcew0x.png'),(86,43,279.00,55,'White',10000,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875856/dfqpkjvh8/mg8jqzflooukzxzvqfrx.jpg'),(87,44,109.00,90,'Green',4000,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875854/dfqpkjvh8/enxlyxkcgrsi7nztrpkj.jpg'),(88,44,119.00,85,'Black',6000,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875853/dfqpkjvh8/tdvsrhzoq2xhyxk1hxal.webp');
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
  FROM `order`
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

-- Dump completed on 2025-10-19 19:37:45
