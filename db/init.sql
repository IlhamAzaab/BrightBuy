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
  `Status` enum('Active','CheckedOut') DEFAULT 'Active',
  PRIMARY KEY (`Cart_ID`),
  KEY `fk_cart_user` (`User_ID`),
  CONSTRAINT `fk_cart_user` FOREIGN KEY (`User_ID`) REFERENCES `user` (`User_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=123 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart`
--

LOCK TABLES `cart` WRITE;
/*!40000 ALTER TABLE `cart` DISABLE KEYS */;
INSERT INTO `cart` VALUES (1,1,'CheckedOut'),(2,2,'CheckedOut'),(3,3,'CheckedOut'),(4,4,'CheckedOut'),(5,5,'CheckedOut'),(6,6,'CheckedOut'),(7,7,'CheckedOut'),(8,8,'CheckedOut'),(9,9,'CheckedOut'),(10,10,'CheckedOut'),(11,11,'CheckedOut'),(12,12,'CheckedOut'),(13,13,'CheckedOut'),(14,14,'CheckedOut'),(15,15,'CheckedOut'),(16,16,'CheckedOut'),(17,17,'CheckedOut'),(18,18,'CheckedOut'),(19,19,'CheckedOut'),(20,20,'CheckedOut'),(21,1,'CheckedOut'),(22,2,'CheckedOut'),(23,3,'CheckedOut'),(24,4,'CheckedOut'),(25,5,'CheckedOut'),(26,6,'CheckedOut'),(27,7,'CheckedOut'),(28,8,'CheckedOut'),(29,9,'CheckedOut'),(30,10,'CheckedOut'),(31,11,'CheckedOut'),(32,12,'CheckedOut'),(33,13,'CheckedOut'),(34,14,'CheckedOut'),(35,15,'CheckedOut'),(36,16,'CheckedOut'),(37,17,'CheckedOut'),(38,18,'CheckedOut'),(39,19,'CheckedOut'),(40,20,'CheckedOut'),(41,1,'CheckedOut'),(42,2,'CheckedOut'),(43,3,'CheckedOut'),(44,4,'CheckedOut'),(45,5,'CheckedOut'),(46,6,'CheckedOut'),(47,7,'CheckedOut'),(48,8,'CheckedOut'),(49,9,'CheckedOut'),(50,10,'CheckedOut'),(51,11,'CheckedOut'),(52,12,'CheckedOut'),(53,13,'CheckedOut'),(54,14,'CheckedOut'),(55,15,'CheckedOut'),(56,16,'CheckedOut'),(57,17,'CheckedOut'),(58,18,'CheckedOut'),(59,19,'CheckedOut'),(60,20,'CheckedOut'),(61,1,'CheckedOut'),(62,2,'CheckedOut'),(63,3,'CheckedOut'),(64,4,'CheckedOut'),(65,5,'CheckedOut'),(66,6,'CheckedOut'),(67,7,'CheckedOut'),(68,8,'CheckedOut'),(69,9,'CheckedOut'),(70,10,'CheckedOut'),(71,11,'CheckedOut'),(72,12,'CheckedOut'),(73,13,'CheckedOut'),(74,14,'CheckedOut'),(75,15,'CheckedOut'),(76,16,'CheckedOut'),(77,17,'CheckedOut'),(78,18,'CheckedOut'),(79,19,'CheckedOut'),(80,20,'CheckedOut'),(81,1,'CheckedOut'),(82,2,'CheckedOut'),(83,3,'CheckedOut'),(84,4,'CheckedOut'),(85,5,'CheckedOut'),(86,6,'CheckedOut'),(87,7,'CheckedOut'),(88,8,'CheckedOut'),(89,9,'CheckedOut'),(90,10,'CheckedOut'),(91,11,'CheckedOut'),(92,12,'CheckedOut'),(93,13,'CheckedOut'),(94,14,'CheckedOut'),(95,15,'CheckedOut'),(96,16,'CheckedOut'),(97,17,'CheckedOut'),(98,18,'CheckedOut'),(99,19,'CheckedOut'),(100,20,'CheckedOut'),(101,1,'CheckedOut'),(102,2,'CheckedOut'),(103,3,'CheckedOut'),(104,4,'Active'),(105,5,'CheckedOut'),(106,6,'CheckedOut'),(107,7,'CheckedOut'),(108,8,'CheckedOut'),(109,9,'CheckedOut'),(110,10,'CheckedOut'),(111,11,'CheckedOut'),(112,12,'CheckedOut'),(113,13,'Active'),(114,14,'CheckedOut'),(115,15,'CheckedOut'),(116,16,'CheckedOut'),(117,17,'CheckedOut'),(118,18,'Active'),(119,19,'Active'),(120,20,'Active'),(121,22,'Active'),(122,23,'CheckedOut');
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
) ENGINE=InnoDB AUTO_INCREMENT=243 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_item`
--

LOCK TABLES `cart_item` WRITE;
/*!40000 ALTER TABLE `cart_item` DISABLE KEYS */;
INSERT INTO `cart_item` VALUES (1,1,1,1,1,1299.00),(2,1,9,9,2,118.00),(3,2,5,9,1,1399.00),(4,2,13,17,1,249.00),(5,3,2,3,1,1599.00),(6,3,21,41,2,998.00),(7,4,6,11,1,1699.00),(8,4,33,65,1,179.00),(9,5,3,5,1,999.00),(10,5,14,19,1,399.00),(11,6,7,13,1,1499.00),(12,6,38,71,1,129.00),(13,7,4,7,2,1798.00),(14,7,15,21,1,349.00),(15,8,10,15,1,79.00),(16,8,22,43,2,898.00),(17,9,11,17,1,89.00),(18,9,29,57,1,1299.00),(19,10,12,19,2,198.00),(20,10,34,67,1,159.00),(21,11,17,25,1,2499.00),(22,11,24,47,2,598.00),(23,12,18,29,1,2199.00),(24,12,39,75,1,249.00),(25,13,19,33,1,1499.00),(26,13,41,81,2,258.00),(27,14,20,37,1,1699.00),(28,14,37,69,1,1599.00),(29,15,25,45,1,249.00),(30,15,42,83,1,139.00),(31,16,26,49,2,458.00),(32,16,35,69,1,149.00),(33,17,27,53,1,59.00),(34,17,43,85,1,259.00),(35,18,28,55,1,139.00),(36,18,30,59,1,1099.00),(37,19,31,61,1,1399.00),(38,19,36,71,2,278.00),(39,20,32,63,1,999.00),(40,20,40,77,1,199.00),(41,21,1,2,1,1399.00),(42,21,16,25,1,199.00),(43,22,2,4,1,1799.00),(44,22,23,45,1,899.00),(45,23,5,10,1,1599.00),(46,23,44,87,1,109.00),(47,24,6,12,1,1899.00),(48,24,13,18,1,259.00),(49,25,3,6,1,1099.00),(50,25,28,56,2,298.00),(51,26,7,14,1,1699.00),(52,26,14,20,1,429.00),(53,27,4,8,1,999.00),(54,27,21,42,1,549.00),(55,28,10,16,1,85.00),(56,28,29,58,1,1399.00),(57,29,11,18,1,95.00),(58,29,38,72,1,139.00),(59,30,12,20,1,109.00),(60,30,27,54,2,118.00),(61,31,17,26,1,2699.00),(62,31,39,76,1,259.00),(63,32,18,30,1,2399.00),(64,32,41,82,1,149.00),(65,33,19,34,1,1599.00),(66,33,31,62,1,1499.00),(67,34,20,38,1,1799.00),(68,34,40,78,1,219.00),(69,35,25,46,1,269.00),(70,35,34,68,1,169.00),(71,36,26,50,1,239.00),(72,36,37,70,1,1699.00),(73,37,27,54,1,69.00),(74,37,42,84,1,159.00),(75,38,28,56,1,149.00),(76,38,22,44,1,469.00),(77,39,30,60,1,1199.00),(78,39,35,70,1,159.00),(79,40,32,64,1,1099.00),(80,40,43,86,1,279.00),(81,41,1,1,2,2598.00),(82,41,9,10,1,64.00),(83,42,5,9,1,1399.00),(84,42,13,17,2,498.00),(85,43,2,3,1,1599.00),(86,43,21,41,1,499.00),(87,44,6,11,1,1699.00),(88,44,33,65,2,358.00),(89,45,3,5,1,999.00),(90,45,14,19,1,399.00),(91,46,7,13,1,1499.00),(92,46,38,71,2,258.00),(93,47,4,7,1,899.00),(94,47,15,21,1,349.00),(95,48,10,15,2,158.00),(96,48,22,43,1,449.00),(97,49,11,17,1,89.00),(98,49,29,57,1,1299.00),(99,50,12,20,2,218.00),(100,50,34,67,1,169.00),(101,51,17,25,1,2499.00),(102,51,24,47,1,299.00),(103,52,18,29,1,2199.00),(104,52,39,75,1,249.00),(105,53,19,33,2,2998.00),(106,53,41,81,1,129.00),(107,54,20,37,1,1699.00),(108,54,37,69,1,1599.00),(109,55,25,45,1,249.00),(110,55,42,83,2,278.00),(111,56,26,49,1,229.00),(112,56,35,69,1,149.00),(113,57,27,53,2,118.00),(114,57,43,85,1,259.00),(115,58,28,55,1,139.00),(116,58,30,59,1,1099.00),(117,59,31,61,1,1399.00),(118,59,36,71,1,139.00),(119,60,32,63,2,1998.00),(120,60,40,77,1,199.00),(121,61,1,2,1,1399.00),(122,61,16,25,2,398.00),(123,62,2,4,1,1799.00),(124,62,23,45,1,899.00),(125,63,5,10,1,1599.00),(126,63,44,87,2,218.00),(127,64,6,12,1,1899.00),(128,64,13,18,1,259.00),(129,65,3,6,1,1099.00),(130,65,28,56,1,149.00),(131,66,7,14,1,1699.00),(132,66,14,20,1,429.00),(133,67,4,8,1,999.00),(134,67,21,42,1,549.00),(135,68,10,16,1,85.00),(136,68,29,58,1,1399.00),(137,69,11,18,2,190.00),(138,69,38,72,1,139.00),(139,70,12,20,1,109.00),(140,70,27,54,1,59.00),(141,71,17,26,1,2699.00),(142,71,39,76,1,259.00),(143,72,18,30,1,2399.00),(144,72,41,82,1,149.00),(145,73,19,34,1,1599.00),(146,73,31,62,1,1499.00),(147,74,20,38,2,3598.00),(148,74,40,78,1,219.00),(149,75,25,46,1,269.00),(150,75,34,68,1,169.00),(151,76,26,50,1,239.00),(152,76,37,70,1,1699.00),(153,77,27,54,1,69.00),(154,77,42,84,1,159.00),(155,78,28,56,1,149.00),(156,78,22,44,1,469.00),(157,79,30,60,1,1199.00),(158,79,35,70,1,159.00),(159,80,32,64,1,1099.00),(160,80,43,86,1,279.00),(161,81,1,1,1,1299.00),(162,81,9,9,1,59.00),(163,82,5,9,1,1399.00),(164,82,13,17,1,249.00),(165,83,2,3,2,3198.00),(166,83,21,41,1,499.00),(167,84,6,11,1,1699.00),(168,84,33,65,1,179.00),(169,85,3,5,1,999.00),(170,85,14,19,1,399.00),(171,86,7,13,1,1499.00),(172,86,38,71,1,129.00),(173,87,4,7,1,899.00),(174,87,15,21,2,698.00),(175,88,10,15,1,79.00),(176,88,22,43,1,449.00),(177,89,11,17,1,89.00),(178,89,29,57,1,1299.00),(179,90,12,20,1,109.00),(180,90,34,67,1,169.00),(181,91,17,25,1,2499.00),(182,91,24,47,1,299.00),(183,92,18,29,1,2199.00),(184,92,39,75,2,498.00),(185,93,19,33,1,1499.00),(186,93,41,81,1,129.00),(187,94,20,37,1,1699.00),(188,94,37,69,1,1599.00),(189,95,25,45,1,249.00),(190,95,42,83,1,139.00),(191,96,26,49,1,229.00),(192,96,35,69,1,149.00),(193,97,27,53,1,59.00),(194,97,43,85,1,259.00),(195,98,28,55,1,139.00),(196,98,30,59,1,1099.00),(197,99,31,61,1,1399.00),(198,99,36,71,1,139.00),(199,100,32,63,1,999.00),(200,100,40,77,1,199.00),(201,101,1,2,1,1399.00),(202,101,16,25,1,199.00),(203,102,2,4,1,1799.00),(204,102,23,45,1,899.00),(205,103,5,10,1,1599.00),(206,103,44,87,1,109.00),(207,104,6,12,1,1899.00),(208,104,13,18,1,259.00),(209,105,3,6,1,1099.00),(210,105,28,56,1,149.00),(211,106,7,14,1,1699.00),(212,106,14,20,1,429.00),(213,107,4,8,1,999.00),(214,107,21,42,1,549.00),(215,108,10,16,2,158.00),(216,108,29,58,1,1399.00),(217,109,11,18,1,95.00),(218,109,38,72,1,139.00),(219,110,12,20,1,109.00),(220,110,27,54,1,59.00),(221,111,17,26,1,2699.00),(222,111,39,76,1,259.00),(223,112,18,30,1,2399.00),(224,112,41,82,1,149.00),(225,113,19,34,1,1599.00),(226,113,31,62,1,1499.00),(227,114,20,38,1,1799.00),(228,114,40,78,1,219.00),(229,115,25,46,1,269.00),(230,115,34,68,1,169.00),(231,116,26,50,1,239.00),(232,116,37,70,1,1699.00),(233,117,27,54,1,69.00),(234,117,42,84,1,159.00),(235,118,28,56,1,149.00),(236,118,22,44,1,469.00),(237,119,30,60,1,1199.00),(238,119,35,70,1,159.00),(239,120,32,64,1,1099.00),(240,120,43,86,1,279.00),(241,122,2,4,1,1799.00),(242,122,11,21,1,89.00);
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
INSERT INTO `category` VALUES (1,'Mobile Phones'),(2,'Laptops'),(3,'Chargers'),(4,'Headsets'),(5,'Camera'),(6,'Watch'),(7,'Electronic Device'),(8,'Tablets'),(9,'Shoes'),(10,'Bags'),(11,'Storage Devices');
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
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `city`
--

LOCK TABLES `city` WRITE;
/*!40000 ALTER TABLE `city` DISABLE KEYS */;
INSERT INTO `city` VALUES (1,'New York',1),(2,'Los Angeles',1),(3,'Chicago',1),(4,'Houston',1),(5,'Phoenix',1),(6,'Philadelphia',1),(7,'San Antonio',0),(8,'San Diego',0),(9,'Dallas',0),(10,'San Jose',0),(11,'Moraruwa',0);
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
) ENGINE=InnoDB AUTO_INCREMENT=122 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `delivery`
--

LOCK TABLES `delivery` WRITE;
/*!40000 ALTER TABLE `delivery` DISABLE KEYS */;
INSERT INTO `delivery` VALUES (1,'Standard Delivery','123 Main St, New York','Delivered','2023-01-15'),(2,'Store Pickup','456 Oak Ave, Los Angeles','Delivered','2023-01-20'),(3,'Standard Delivery','789 Pine Rd, Chicago','Delivered','2023-02-10'),(4,'Store Pickup','321 Elm St, Houston','Delivered','2023-02-18'),(5,'Standard Delivery','654 Maple Dr, Phoenix','Delivered','2023-03-05'),(6,'Standard Delivery','987 Cedar Ln, Philadelphia','Delivered','2023-03-15'),(7,'Standard Delivery','111 Birch St, San Antonio','Delivered','2023-04-12'),(8,'Store Pickup','222 Spruce Ave, San Diego','Delivered','2023-04-22'),(9,'Standard Delivery','333 Ash Rd, Dallas','Delivered','2023-05-08'),(10,'Standard Delivery','444 Willow Dr, San Jose','Delivered','2023-05-18'),(11,'Standard Delivery','555 Poplar Ln, New York','Delivered','2023-06-10'),(12,'Store Pickup','666 Laurel St, Los Angeles','Delivered','2023-06-20'),(13,'Standard Delivery','777 Oak St, Chicago','Delivered','2023-07-12'),(14,'Store Pickup','888 Pine Ave, Houston','Delivered','2023-07-25'),(15,'Standard Delivery','999 Elm Rd, Phoenix','Delivered','2023-08-08'),(16,'Standard Delivery','1010 Maple St, Philadelphia','Delivered','2023-08-18'),(17,'Standard Delivery','1111 Cedar Ave, San Antonio','Delivered','2023-09-05'),(18,'Store Pickup','1212 Birch Rd, San Diego','Delivered','2023-09-15'),(19,'Standard Delivery','1313 Spruce St, Dallas','Delivered','2023-10-10'),(20,'Standard Delivery','1414 Ash Ave, San Jose','Delivered','2023-10-20'),(21,'Standard Delivery','123 Main St, New York','Delivered','2023-11-08'),(22,'Store Pickup','456 Oak Ave, Los Angeles','Delivered','2023-11-18'),(23,'Standard Delivery','789 Pine Rd, Chicago','Delivered','2023-12-05'),(24,'Standard Delivery','321 Elm St, Houston','Delivered','2023-12-15'),(25,'Standard Delivery','654 Maple Dr, Phoenix','Delivered','2023-01-25'),(26,'Store Pickup','987 Cedar Ln, Philadelphia','Delivered','2023-02-28'),(27,'Standard Delivery','111 Birch St, San Antonio','Delivered','2023-03-28'),(28,'Standard Delivery','222 Spruce Ave, San Diego','Delivered','2023-04-30'),(29,'Standard Delivery','333 Ash Rd, Dallas','Delivered','2023-05-25'),(30,'Store Pickup','444 Willow Dr, San Jose','Delivered','2023-06-28'),(31,'Standard Delivery','555 Poplar Ln, New York','Delivered','2023-07-30'),(32,'Standard Delivery','666 Laurel St, Los Angeles','Delivered','2023-08-25'),(33,'Standard Delivery','777 Oak St, Chicago','Delivered','2023-09-20'),(34,'Store Pickup','888 Pine Ave, Houston','Delivered','2023-10-28'),(35,'Standard Delivery','999 Elm Rd, Phoenix','Delivered','2023-11-15'),(36,'Standard Delivery','1010 Maple St, Philadelphia','Delivered','2023-12-10'),(37,'Standard Delivery','1111 Cedar Ave, San Antonio','Delivered','2023-01-30'),(38,'Store Pickup','1212 Birch Rd, San Diego','Delivered','2023-02-20'),(39,'Standard Delivery','1313 Spruce St, Dallas','Delivered','2023-03-22'),(40,'Standard Delivery','1414 Ash Ave, San Jose','Delivered','2023-04-25'),(41,'Standard Delivery','123 Main St, New York','Delivered','2024-01-15'),(42,'Store Pickup','456 Oak Ave, Los Angeles','Delivered','2024-01-25'),(43,'Standard Delivery','789 Pine Rd, Chicago','Delivered','2024-02-12'),(44,'Standard Delivery','321 Elm St, Houston','Delivered','2024-02-22'),(45,'Standard Delivery','654 Maple Dr, Phoenix','Delivered','2024-03-10'),(46,'Store Pickup','987 Cedar Ln, Philadelphia','Delivered','2024-03-20'),(47,'Standard Delivery','111 Birch St, San Antonio','Delivered','2024-04-08'),(48,'Standard Delivery','222 Spruce Ave, San Diego','Delivered','2024-04-18'),(49,'Standard Delivery','333 Ash Rd, Dallas','Delivered','2024-05-12'),(50,'Store Pickup','444 Willow Dr, San Jose','Delivered','2024-05-22'),(51,'Standard Delivery','555 Poplar Ln, New York','Delivered','2024-06-08'),(52,'Standard Delivery','666 Laurel St, Los Angeles','Delivered','2024-06-18'),(53,'Standard Delivery','777 Oak St, Chicago','Pending','2024-07-15'),(54,'Store Pickup','888 Pine Ave, Houston','Delivered','2024-07-25'),(55,'Standard Delivery','999 Elm Rd, Phoenix','Delivered','2024-08-10'),(56,'Standard Delivery','1010 Maple St, Philadelphia','Pending','2024-08-20'),(57,'Standard Delivery','1111 Cedar Ave, San Antonio','Delivered','2024-09-08'),(58,'Store Pickup','1212 Birch Rd, San Diego','Delivered','2024-09-18'),(59,'Standard Delivery','1313 Spruce St, Dallas','Pending','2024-10-12'),(60,'Standard Delivery','1414 Ash Ave, San Jose','Delivered','2024-10-22'),(61,'Standard Delivery','123 Main St, New York','Delivered','2024-11-10'),(62,'Store Pickup','456 Oak Ave, Los Angeles','Pending','2024-11-20'),(63,'Standard Delivery','789 Pine Rd, Chicago','Delivered','2024-12-08'),(64,'Standard Delivery','321 Elm St, Houston','Delivered','2024-12-18'),(65,'Standard Delivery','654 Maple Dr, Phoenix','Delivered','2024-01-28'),(66,'Store Pickup','987 Cedar Ln, Philadelphia','Delivered','2024-02-28'),(67,'Standard Delivery','111 Birch St, San Antonio','Pending','2024-03-30'),(68,'Standard Delivery','222 Spruce Ave, San Diego','Delivered','2024-04-28'),(69,'Standard Delivery','333 Ash Rd, Dallas','Delivered','2024-05-28'),(70,'Store Pickup','444 Willow Dr, San Jose','Pending','2024-06-28'),(71,'Standard Delivery','555 Poplar Ln, New York','Delivered','2024-07-28'),(72,'Standard Delivery','666 Laurel St, Los Angeles','Delivered','2024-08-28'),(73,'Standard Delivery','777 Oak St, Chicago','Delivered','2024-09-25'),(74,'Store Pickup','888 Pine Ave, Houston','Pending','2024-10-28'),(75,'Standard Delivery','999 Elm Rd, Phoenix','Delivered','2024-11-20'),(76,'Standard Delivery','1010 Maple St, Philadelphia','Delivered','2024-12-15'),(77,'Standard Delivery','1111 Cedar Ave, San Antonio','Delivered','2024-02-05'),(78,'Store Pickup','1212 Birch Rd, San Diego','Delivered','2024-03-08'),(79,'Standard Delivery','1313 Spruce St, Dallas','Pending','2024-04-10'),(80,'Standard Delivery','1414 Ash Ave, San Jose','Delivered','2024-05-12'),(81,'Standard Delivery','123 Main St, New York','Pending','2025-01-20'),(82,'Store Pickup','456 Oak Ave, Los Angeles','Pending','2025-01-28'),(83,'Standard Delivery','789 Pine Rd, Chicago','Pending','2025-02-15'),(84,'Standard Delivery','321 Elm St, Houston','Pending','2025-02-25'),(85,'Standard Delivery','654 Maple Dr, Phoenix','Pending','2025-03-15'),(86,'Store Pickup','987 Cedar Ln, Philadelphia','Pending','2025-03-25'),(87,'Standard Delivery','111 Birch St, San Antonio','Pending','2025-04-12'),(88,'Standard Delivery','222 Spruce Ave, San Diego','Pending','2025-04-22'),(89,'Standard Delivery','333 Ash Rd, Dallas','Pending','2025-05-15'),(90,'Store Pickup','444 Willow Dr, San Jose','Pending','2025-05-25'),(91,'Standard Delivery','555 Poplar Ln, New York','Pending','2025-06-12'),(92,'Standard Delivery','666 Laurel St, Los Angeles','Pending','2025-06-22'),(93,'Standard Delivery','777 Oak St, Chicago','Pending','2025-07-18'),(94,'Store Pickup','888 Pine Ave, Houston','Pending','2025-07-28'),(95,'Standard Delivery','999 Elm Rd, Phoenix','Pending','2025-08-15'),(96,'Standard Delivery','1010 Maple St, Philadelphia','Pending','2025-08-25'),(97,'Standard Delivery','1111 Cedar Ave, San Antonio','Pending','2025-09-12'),(98,'Store Pickup','1212 Birch Rd, San Diego','Pending','2025-09-22'),(99,'Standard Delivery','1313 Spruce St, Dallas','Pending','2025-10-15'),(100,'Standard Delivery','1414 Ash Ave, San Jose','Pending','2025-10-25'),(101,'Standard Delivery','123 Main St, New York','Pending','2025-11-12'),(102,'Store Pickup','456 Oak Ave, Los Angeles','Pending','2025-11-22'),(103,'Standard Delivery','789 Pine Rd, Chicago','Pending','2025-12-10'),(104,'Standard Delivery','321 Elm St, Houston','Pending','2025-12-20'),(105,'Standard Delivery','654 Maple Dr, Phoenix','Pending','2025-01-25'),(106,'Store Pickup','987 Cedar Ln, Philadelphia','Pending','2025-02-28'),(107,'Standard Delivery','111 Birch St, San Antonio','Pending','2025-03-28'),(108,'Standard Delivery','222 Spruce Ave, San Diego','Pending','2025-04-30'),(109,'Standard Delivery','333 Ash Rd, Dallas','Pending','2025-05-28'),(110,'Store Pickup','444 Willow Dr, San Jose','Pending','2025-06-30'),(111,'Standard Delivery','555 Poplar Ln, New York','Pending','2025-07-30'),(112,'Standard Delivery','666 Laurel St, Los Angeles','Pending','2025-08-28'),(113,'Standard Delivery','777 Oak St, Chicago','Pending','2025-09-22'),(114,'Store Pickup','888 Pine Ave, Houston','Pending','2025-10-30'),(115,'Standard Delivery','999 Elm Rd, Phoenix','Pending','2025-11-18'),(116,'Standard Delivery','1010 Maple St, Philadelphia','Pending','2025-12-12'),(117,'Standard Delivery','1111 Cedar Ave, San Antonio','Pending','2025-02-08'),(118,'Store Pickup','1212 Birch Rd, San Diego','Pending','2025-03-10'),(119,'Standard Delivery','1313 Spruce St, Dallas','Pending','2025-04-12'),(120,'Standard Delivery','1414 Ash Ave, San Jose','Pending','2025-05-15'),(121,'Standard Delivery','molpe road','Pending','2025-10-27');
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
  `User_ID` int DEFAULT NULL,
  `Cart_ID` int DEFAULT NULL,
  `Total_Amount` decimal(9,2) DEFAULT NULL,
  `Payment_method` varchar(25) DEFAULT NULL,
  `Delivery_ID` int DEFAULT NULL,
  `Order_Date` date DEFAULT NULL,
  `Order_Number` bigint NOT NULL,
  PRIMARY KEY (`Order_Number`),
  KEY `User_ID` (`User_ID`),
  KEY `fk_order_delivery` (`Delivery_ID`),
  KEY `fk_order_cart` (`Cart_ID`),
  CONSTRAINT `fk_order_cart` FOREIGN KEY (`Cart_ID`) REFERENCES `cart` (`Cart_ID`),
  CONSTRAINT `fk_order_delivery` FOREIGN KEY (`Delivery_ID`) REFERENCES `delivery` (`Delivery_ID`),
  CONSTRAINT `order_ibfk_1` FOREIGN KEY (`User_ID`) REFERENCES `user` (`User_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order`
--

LOCK TABLES `order` WRITE;
/*!40000 ALTER TABLE `order` DISABLE KEYS */;
INSERT INTO `order` VALUES (1,1,1417.00,'Online Payment',1,'2023-01-10',1673299200001),(2,2,1648.00,'Cash on Delivery',2,'2023-01-15',1673558400002),(5,25,2198.00,'Online Payment',25,'2023-01-25',1674662400025),(3,3,2597.00,'Online Payment',3,'2023-02-05',1675728000003),(17,37,1518.00,'Online Payment',37,'2023-01-30',1675900800037),(4,4,1878.00,'Online Payment',4,'2023-02-12',1676332800004),(18,38,1288.00,'Cash on Delivery',38,'2023-02-20',1676851200038),(6,26,2128.00,'Cash on Delivery',26,'2023-02-28',1677052800026),(5,5,1398.00,'Cash on Delivery',5,'2023-03-01',1677628800005),(6,6,1628.00,'Online Payment',6,'2023-03-10',1678464000006),(19,39,1437.00,'Online Payment',39,'2023-03-22',1679510400039),(7,27,1898.00,'Online Payment',27,'2023-03-28',1679875200027),(7,7,2147.00,'Online Payment',7,'2023-04-05',1680633600007),(8,8,1218.00,'Cash on Delivery',8,'2023-04-15',1681516800008),(20,40,1318.00,'Online Payment',40,'2023-04-25',1682380800040),(8,28,1688.00,'Online Payment',28,'2023-04-30',1682908800028),(9,9,1388.00,'Online Payment',9,'2023-05-08',1683302400009),(10,10,357.00,'Online Payment',10,'2023-05-18',1684416000010),(9,29,1178.00,'Cash on Delivery',29,'2023-05-25',1685030400029),(11,11,3097.00,'Cash on Delivery',11,'2023-06-10',1686355200011),(12,12,2448.00,'Online Payment',12,'2023-06-20',1687180800012),(10,30,1178.00,'Online Payment',30,'2023-06-28',1687891200030),(13,13,1757.00,'Online Payment',13,'2023-07-12',1689206400013),(14,14,3398.00,'Cash on Delivery',14,'2023-07-22',1690022400014),(11,31,3097.00,'Online Payment',31,'2023-07-30',1690281600031),(15,15,518.00,'Online Payment',15,'2023-08-08',1691510400015),(16,16,1587.00,'Online Payment',16,'2023-08-18',1692374400016),(12,32,2428.00,'Cash on Delivery',32,'2023-08-25',1692864000032),(17,17,318.00,'Cash on Delivery',17,'2023-09-05',1694275200017),(18,18,1188.00,'Online Payment',18,'2023-09-15',1695052800018),(13,33,2998.00,'Online Payment',33,'2023-09-20',1695254400033),(19,19,1677.00,'Online Payment',19,'2023-10-10',1697155200019),(20,20,1198.00,'Cash on Delivery',20,'2023-10-20',1697932800020),(14,34,3318.00,'Online Payment',34,'2023-10-28',1698412800034),(1,21,1648.00,'Online Payment',21,'2023-11-08',1699468800021),(15,35,1518.00,'Cash on Delivery',35,'2023-11-15',1700083200035),(2,22,2698.00,'Online Payment',22,'2023-11-18',1700332800022),(3,23,1608.00,'Cash on Delivery',23,'2023-12-05',1701734400023),(16,36,1958.00,'Online Payment',36,'2023-12-10',1702224000036),(4,24,3598.00,'Online Payment',24,'2023-12-15',1702598400024),(1,41,2662.00,'Online Payment',41,'2024-01-10',1704902400041),(2,42,1897.00,'Cash on Delivery',42,'2024-01-25',1705939200042),(5,65,1248.00,'Online Payment',65,'2024-01-28',1706428800065),(17,77,228.00,'Online Payment',77,'2024-02-05',1707158400077),(3,43,1817.00,'Online Payment',43,'2024-02-12',1707686400043),(4,44,2158.00,'Online Payment',44,'2024-02-22',1708636800044),(6,66,2128.00,'Cash on Delivery',66,'2024-02-28',1709020800066),(18,78,618.00,'Cash on Delivery',78,'2024-03-08',1709860800078),(5,45,1398.00,'Cash on Delivery',45,'2024-03-10',1710086400045),(6,46,1757.00,'Online Payment',46,'2024-03-20',1711036800046),(7,67,1568.00,'Online Payment',67,'2024-03-30',1711814400067),(7,47,1248.00,'Online Payment',47,'2024-04-08',1712534400047),(19,79,1358.00,'Online Payment',79,'2024-04-10',1712707200079),(8,48,1484.00,'Cash on Delivery',48,'2024-04-18',1713398400048),(8,68,1648.00,'Online Payment',68,'2024-04-28',1714320000068),(9,49,1388.00,'Online Payment',49,'2024-05-12',1715472000049),(20,80,1378.00,'Online Payment',80,'2024-05-12',1715472000080),(10,50,428.00,'Online Payment',50,'2024-05-22',1716345600050),(9,69,1288.00,'Cash on Delivery',69,'2024-05-28',1716825600069),(11,51,3097.00,'Cash on Delivery',51,'2024-06-08',1717939200051),(12,52,2448.00,'Online Payment',52,'2024-06-18',1718808000052),(10,70,168.00,'Online Payment',70,'2024-06-28',1719417600070),(13,53,3408.00,'Online Payment',53,'2024-07-15',1721001600053),(14,54,1918.00,'Cash on Delivery',54,'2024-07-25',1721865600054),(11,71,3098.00,'Online Payment',71,'2024-07-28',1722009600071),(15,55,527.00,'Online Payment',55,'2024-08-10',1723248000055),(16,56,1488.00,'Online Payment',56,'2024-08-20',1724112000056),(12,72,2548.00,'Cash on Delivery',72,'2024-08-28',1724601600072),(17,57,187.00,'Cash on Delivery',57,'2024-09-08',1725811200057),(18,58,1288.00,'Online Payment',58,'2024-09-18',1726680000058),(13,73,3098.00,'Online Payment',73,'2024-09-25',1727026080073),(19,59,1548.00,'Online Payment',59,'2024-10-12',1728691200059),(20,60,1298.00,'Cash on Delivery',60,'2024-10-22',1729555200060),(14,74,3817.00,'Online Payment',74,'2024-10-28',1729814400074),(1,61,1797.00,'Online Payment',61,'2024-11-10',1731206400061),(2,62,2698.00,'Online Payment',62,'2024-11-20',1732070400062),(15,75,518.00,'Cash on Delivery',75,'2024-11-20',1732070400075),(3,63,1817.00,'Cash on Delivery',63,'2024-12-08',1733587200063),(16,76,1938.00,'Online Payment',76,'2024-12-15',1734374400076),(4,64,2158.00,'Online Payment',64,'2024-12-18',1734451200064),(1,81,1598.00,'Online Payment',81,'2025-01-15',1736899200081),(5,105,1248.00,'Online Payment',105,'2025-01-25',1737849600105),(2,82,2698.00,'Cash on Delivery',82,'2025-01-28',1737936000082),(3,83,1708.00,'Online Payment',83,'2025-02-12',1738723200083),(17,117,228.00,'Online Payment',117,'2025-02-08',1738972800117),(4,84,2158.00,'Online Payment',84,'2025-02-22',1739587200084),(6,106,2128.00,'Cash on Delivery',106,'2025-02-28',1740355200106),(5,85,1248.00,'Cash on Delivery',85,'2025-03-12',1741564800085),(18,118,618.00,'Cash on Delivery',118,'2025-03-10',1741564800118),(6,86,2128.00,'Online Payment',86,'2025-03-25',1742774400086),(7,107,1568.00,'Online Payment',107,'2025-03-28',1743078400107),(19,119,1358.00,'Online Payment',119,'2025-04-12',1744326400119),(7,87,1548.00,'Online Payment',87,'2025-04-10',1744329600087),(8,88,1657.00,'Cash on Delivery',88,'2025-04-22',1745452800088),(8,108,1648.00,'Online Payment',108,'2025-04-30',1745584000108),(9,89,1234.00,'Online Payment',89,'2025-05-15',1747190400089),(20,120,1378.00,'Online Payment',120,'2025-05-15',1747190400120),(10,90,168.00,'Online Payment',90,'2025-05-25',1748054400090),(9,109,1288.00,'Cash on Delivery',109,'2025-05-28',1748089600109),(11,91,3098.00,'Cash on Delivery',91,'2025-06-12',1749734400091),(12,92,2548.00,'Online Payment',92,'2025-06-22',1750598400092),(10,110,168.00,'Online Payment',110,'2025-06-30',1750681600110),(13,93,3098.00,'Online Payment',93,'2025-07-15',1752633600093),(11,111,3098.00,'Online Payment',111,'2025-07-30',1753273600111),(14,94,3817.00,'Cash on Delivery',94,'2025-07-28',1753756800094),(15,95,518.00,'Online Payment',95,'2025-08-15',1755456000095),(12,112,2548.00,'Cash on Delivery',112,'2025-08-28',1755952800112),(16,96,1938.00,'Online Payment',96,'2025-08-25',1756320000096),(17,97,228.00,'Cash on Delivery',97,'2025-09-10',1757875200097),(18,98,618.00,'Online Payment',98,'2025-09-22',1758998400098),(13,113,3098.00,'Online Payment',113,'2025-09-22',1759184400113),(19,99,1358.00,'Online Payment',99,'2025-10-15',1760736000099),(23,122,1888.00,'Online Payment',121,'2025-10-20',1760968458409),(20,100,1378.00,'Cash on Delivery',100,'2025-10-25',1761600000100),(14,114,3817.00,'Online Payment',114,'2025-10-30',1761962400114),(1,101,1598.00,'Online Payment',101,'2025-11-12',1762204800101),(2,102,2698.00,'Online Payment',102,'2025-11-22',1763068800102),(15,115,518.00,'Cash on Delivery',115,'2025-11-18',1763548800115),(16,116,1938.00,'Online Payment',116,'2025-12-12',1763635200116),(3,103,1708.00,'Cash on Delivery',103,'2025-12-10',1764585600103),(4,104,2158.00,'Online Payment',104,'2025-12-20',1765449600104);
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
  KEY `idx_product_name` (`Product_Name`),
  KEY `idx_product_brand` (`Brand`),
  KEY `idx_product_desc` (`Description`(255)),
  KEY `idx_product_id` (`Product_ID`),
  CONSTRAINT `fk_product_category` FOREIGN KEY (`Category_ID`) REFERENCES `category` (`Category_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product`
--

LOCK TABLES `product` WRITE;
/*!40000 ALTER TABLE `product` DISABLE KEYS */;
INSERT INTO `product` VALUES (1,1,'Galaxy S25 Ultra','Samsung','SAMSUNG_GALAXY_S25_ULTRA','Flagship model from Samsung'),(2,1,'iPhone 16 Pro Max','Apple','APPLE_IPHONE_16_PRO_MAX','Latest Pro Max version of iPhone'),(3,1,'Google Pixel 10','Google','GOOGLE_PIXEL_10','Pixel flagship with advanced AI camera'),(4,1,'OnePlus 13','OnePlus','ONEPLUS_ONEPLUS_13','High performance Android phone'),(5,2,'MacBook Air M4','Apple','APPLE_MACBOOK_AIR_M4','Lightweight laptop with Apple Silicon M4'),(6,2,'Dell XPS 15 2025','Dell','DELL_XPS_15_2025','Dell flagship 15-inch XPS'),(7,2,'ThinkPad X1 Carbon','Lenovo','LENOVO_THINKPAD_X1_CARBON','Durable business ultrabook'),(8,2,'ROG Strix G17','ASUS','ASUS_ROG_STRIX_G17','Gaming laptop with RTX GPU'),(9,3,'USB-C 65W GaN Charger','Anker','ANKER_USB_C_65W_GAN_CHARGER','Compact gallium nitride charger 65W'),(10,3,'MagSafe Fast Charger','Apple','APPLE_MAGSAFE_FAST_CHARGER','MagSafe wireless fast charger'),(11,3,'PowerPort III 108W','Anker','ANKER_POWERPORT_III_108W','GaN charger with 2 USB-C ports'),(12,3,'HyperJuice 100W Charging Station','Hyper','HYPER_HYPERJUICE_100W_CHARGING_STATION','Multi-port USB-C charging station'),(13,4,'AirPods Pro 3','Apple','APPLE_AIRPODS_PRO_3','Latest Apple noise cancelling earbuds'),(14,4,'WH-1000XM6','Sony','SONY_WH_1000XM6','Flagship Sony noise cancelling over-ear'),(15,4,'QuietComfort Ultra','Bose','BOSE_QUIETCOMFORT_ULTRA','Ultra noise cancelling headset'),(16,4,'Elite 10','Jabra','JABRA_ELITE_10','True wireless earbuds with ANC'),(17,5,'EOS R8','Canon','CANON_EOS_R8','Mirrorless full-frame camera'),(18,5,'A7 IV','Sony','SONY_A7_IV','Sony’s full-frame mirrorless camera'),(19,5,'Z5 II','Nikon','NIKON_Z5_II','Entry-level full-frame mirrorless camera'),(20,5,'X-T5','Fujifilm','FUJIFILM_X_T5','APS-C mirrorless camera'),(21,6,'Apple Watch Series 11','Apple','APPLE_APPLE_WATCH_SERIES_11','Latest Apple smartwatch'),(22,6,'Galaxy Watch 7','Samsung','SAMSUNG_GALAXY_WATCH_7','Samsung flagship smartwatch'),(23,6,'Fenix 8','Garmin','GARMIN_FENIX_8','High end multisport GPS watch'),(24,6,'Charge 7 Pro','Fitbit','FITBIT_CHARGE_7_PRO','Fitness tracker and smartwatch hybrid'),(25,7,'Echo Show 15','Amazon','AMAZON_ECHO_SHOW_15','Smart display with Alexa'),(26,7,'Nest Hub Max','Google','GOOGLE_NEST_HUB_MAX','Google smart home hub display'),(27,7,'Streaming Stick Plus','Roku','ROKU_STREAMING_STICK_PLUS','4K streaming stick device'),(28,7,'Fire TV Cube 3rd Gen','Amazon','AMAZON_FIRE_TV_CUBE_3RD_GEN','Streaming device plus Alexa hub'),(29,8,'iPad Pro 13','Apple','APPLE_IPAD_PRO_13','Latest iPad Pro large model'),(30,8,'Galaxy Tab S10','Samsung','SAMSUNG_GALAXY_TAB_S10','Flagship Android tablet'),(31,8,'Surface Pro 11','Microsoft','MICROSOFT_SURFACE_PRO_11','Hybrid 2-in-1 tablet PC'),(32,8,'Tab P12','Lenovo','LENOVO_TAB_P12','High performance Android tablet'),(33,9,'Air Jordan 1 High','Nike','NIKE_AIR_JORDAN_1_HIGH','Classic high-top basketball shoe'),(34,9,'UltraBoost 24','Adidas','ADIDAS_ULTRABOOST_24','Running shoe with Boost midsole'),(35,9,'RS-X3','Puma','PUMA_RS_X3','Lifestyle chunky sneaker'),(36,9,'550','New Balance','NEW_BALANCE_550','Retro basketball style shoe'),(37,10,'Neverfull MM','Louis Vuitton','LOUIS_VUITTON_NEVERFULL_MM','Luxury tote bag'),(38,10,'Little America Backpack','Herschel','HERSCHEL_LITTLE_AMERICA_BACKPACK','Classic backpack style'),(39,10,'Alpha Bravo Sling','Tumi','TUMI_ALPHA_BRAVO_SLING','Crossbody sling bag'),(40,10,'Winfield 3','Samsonite','SAMSONITE_WINFIELD_3','Hard shell carry-on suitcase'),(41,11,'T7 Shield 1TB','Samsung','SAMSUNG_T7_SHIELD_1TB','Portable SSD with rugged design'),(42,11,'Extreme Pro 1TB','SanDisk','SANDISK_EXTREME_PRO_1TB','High speed portable SSD'),(43,11,'MyBook 10TB','Western Digital','WESTERN_DIGITAL_MYBOOK_10TB','Desktop external HDD'),(44,11,'Barracuda 4TB','Seagate','SEAGATE_BARRACUDA_4TB','Internal HDD 3.5 inch model');
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
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'John Smith','$2b$10$Vh8O4vV3eACDm4z9yqFZ7u4Q8klGPGi5zX5tKZy6x7Zxu6hM9k7hW','123 Main St',1,'john@email.com','customer',NULL),(2,'Sarah Johnson','$2b$10$Vh8O4vV3eACDm4z9yqFZ7u4Q8klGPGi5zX5tKZy6x7Zxu6hM9k7hW','456 Oak Ave',2,'sarah@email.com','customer',NULL),(3,'Michael Brown','$2b$10$Vh8O4vV3eACDm4z9yqFZ7u4Q8klGPGi5zX5tKZy6x7Zxu6hM9k7hW','789 Pine Rd',3,'michael@email.com','customer',NULL),(4,'Emily Davis','$2b$10$Vh8O4vV3eACDm4z9yqFZ7u4Q8klGPGi5zX5tKZy6x7Zxu6hM9k7hW','321 Elm St',4,'emily@email.com','customer',NULL),(5,'David Wilson','$2b$10$Vh8O4vV3eACDm4z9yqFZ7u4Q8klGPGi5zX5tKZy6x7Zxu6hM9k7hW','654 Maple Dr',5,'david@email.com','customer',NULL),(6,'Jessica Miller','$2b$10$Vh8O4vV3eACDm4z9yqFZ7u4Q8klGPGi5zX5tKZy6x7Zxu6hM9k7hW','987 Cedar Ln',6,'jessica@email.com','customer',NULL),(7,'Chris Taylor','$2b$10$Vh8O4vV3eACDm4z9yqFZ7u4Q8klGPGi5zX5tKZy6x7Zxu6hM9k7hW','111 Birch St',7,'chris@email.com','customer',NULL),(8,'Amanda Anderson','$2b$10$Vh8O4vV3eACDm4z9yqFZ7u4Q8klGPGi5zX5tKZy6x7Zxu6hM9k7hW','222 Spruce Ave',8,'amanda@email.com','customer',NULL),(9,'Robert Thomas','$2b$10$Vh8O4vV3eACDm4z9yqFZ7u4Q8klGPGi5zX5tKZy6x7Zxu6hM9k7hW','333 Ash Rd',9,'robert@email.com','customer',NULL),(10,'Lisa Jackson','$2b$10$Vh8O4vV3eACDm4z9yqFZ7u4Q8klGPGi5zX5tKZy6x7Zxu6hM9k7hW','444 Willow Dr',10,'lisa@email.com','customer',NULL),(11,'James White','$2b$10$Vh8O4vV3eACDm4z9yqFZ7u4Q8klGPGi5zX5tKZy6x7Zxu6hM9k7hW','555 Poplar Ln',1,'james@email.com','customer',NULL),(12,'Michelle Harris','$2b$10$Vh8O4vV3eACDm4z9yqFZ7u4Q8klGPGi5zX5tKZy6x7Zxu6hM9k7hW','666 Laurel St',2,'michelle@email.com','customer',NULL),(13,'Daniel Martin','$2b$10$Vh8O4vV3eACDm4z9yqFZ7u4Q8klGPGi5zX5tKZy6x7Zxu6hM9k7hW','777 Oak St',3,'daniel@email.com','customer',NULL),(14,'Karen Lee','$2b$10$Vh8O4vV3eACDm4z9yqFZ7u4Q8klGPGi5zX5tKZy6x7Zxu6hM9k7hW','888 Pine Ave',4,'karen@email.com','customer',NULL),(15,'Matthew Perez','$2b$10$Vh8O4vV3eACDm4z9yqFZ7u4Q8klGPGi5zX5tKZy6x7Zxu6hM9k7hW','999 Elm Rd',5,'matthew@email.com','customer',NULL),(16,'Jennifer Garcia','$2b$10$Vh8O4vV3eACDm4z9yqFZ7u4Q8klGPGi5zX5tKZy6x7Zxu6hM9k7hW','1010 Maple St',6,'jennifer@email.com','customer',NULL),(17,'Mark Rodriguez','$2b$10$Vh8O4vV3eACDm4z9yqFZ7u4Q8klGPGi5zX5tKZy6x7Zxu6hM9k7hW','1111 Cedar Ave',7,'mark@email.com','customer',NULL),(18,'Patricia Lewis','$2b$10$Vh8O4vV3eACDm4z9yqFZ7u4Q8klGPGi5zX5tKZy6x7Zxu6hM9k7hW','1212 Birch Rd',8,'patricia@email.com','customer',NULL),(19,'Steven Walker','$2b$10$Vh8O4vV3eACDm4z9yqFZ7u4Q8klGPGi5zX5tKZy6x7Zxu6hM9k7hW','1313 Spruce St',9,'steven@email.com','customer',NULL),(20,'Nancy Hall','$2b$10$Vh8O4vV3eACDm4z9yqFZ7u4Q8klGPGi5zX5tKZy6x7Zxu6hM9k7hW','1414 Ash Ave',10,'nancy@email.com','customer',NULL),(21,'Admin','$2b$10$FMtxpGM3MQqDvpG014l5bOPEjIk4JI1ZHu7ilN6K95iehw9YKq98y',NULL,NULL,'Admin1@example.com','admin',NULL),(22,'Harshana','$2b$10$Baipaui3Qk6jkcHlkJ0NwORtIvt5i5F94kcmpGKL9RhDO8B4wKgj.',NULL,NULL,'hag@gmail.com','admin',NULL),(23,'Harshana Gunawardena','$2b$10$vsC0ed80aqfk1lzAczJZIur9tRamwKYxzE2jCvpOt0p0FzfJS8UlC','molpe road',11,'har@gmail.com','customer','/uploads/1760968792703-Dark Knight Rises HD Wallpaper And Desktop Background.jpg');
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
  KEY `idx_variant_pid` (`Product_ID`),
  KEY `idx_variant_colour` (`Colour`),
  KEY `idx_variant_size` (`Size`),
  KEY `idx_variant_pid_image` (`Product_ID`,`Image_URL`(255)),
  CONSTRAINT `variant_ibfk_1` FOREIGN KEY (`Product_ID`) REFERENCES `product` (`Product_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=89 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `variant`
--

LOCK TABLES `variant` WRITE;
/*!40000 ALTER TABLE `variant` DISABLE KEYS */;
INSERT INTO `variant` VALUES (1,1,1299.00,50,'Black',256,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875752/dfqpkjvh8/hgmmrbcaf1aw3p5c8j5m.webp'),(2,1,1399.00,40,'Silver',512,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875755/dfqpkjvh8/vbkvdmjphyrdidlogbds.jpg'),(3,2,1599.00,35,'Gold',256,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875746/dfqpkjvh8/qxycyracr3glvm98gtnv.jpg'),(4,2,1799.00,24,'Blue',512,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875744/dfqpkjvh8/mx3fgkydfjtnzqgx7w9x.avif'),(5,3,999.00,45,'Obsidian',128,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875747/dfqpkjvh8/ngt7yni8yjxsheuxse0s.jpg'),(6,3,1099.00,40,'Snow',256,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875748/dfqpkjvh8/ruiok5qef8xzvr3mud17.webp'),(7,4,899.00,60,'Green',128,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875751/dfqpkjvh8/tugtp1jksszykc2h7u46.png'),(8,4,999.00,50,'Black',256,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875749/dfqpkjvh8/yq1wa4fwux7cdye4hssb.avif'),(9,5,1399.00,30,'Silver',512,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875675/dfqpkjvh8/sxujqrbu2yqyd2pinrlc.jpg'),(10,5,1599.00,25,'Space Gray',1024,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875678/dfqpkjvh8/iquhl88qt6l1dzxkg6q7.jpg'),(11,6,1699.00,20,'Platinum',1024,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875689/dfqpkjvh8/q843i5xgbs31soa19ggw.avif'),(12,6,1899.00,15,'Black',2048,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875690/dfqpkjvh8/xyylqojhherh9bxetdiq.avif'),(13,7,1499.00,30,'Black',512,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875691/dfqpkjvh8/f6nnysmabzioaibejlza.jpg'),(14,7,1699.00,25,'Carbon Fiber',1024,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875693/dfqpkjvh8/nay2pcftrawz5hu7rq6e.avif'),(15,8,1799.00,20,'Black',1024,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875679/dfqpkjvh8/onbuce12axxfpqrnqob4.png'),(16,8,1999.00,15,'Red',2048,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875687/dfqpkjvh8/slwl5pkjhanqqx76zjbc.png'),(17,9,59.00,100,'White',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875562/dfqpkjvh8/dggxprfefokfkhhgd06f.avif'),(18,9,64.00,80,'Black',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875561/dfqpkjvh8/leyalydx1lrmablnyods.avif'),(19,10,79.00,60,'White',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875565/dfqpkjvh8/pymtdn7mcgqrgjbkn3ky.webp'),(20,10,85.00,50,'Midnight',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875564/dfqpkjvh8/xpkabacc1ajd7hfnfw00.jpg'),(21,11,89.00,69,'Black',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875559/dfqpkjvh8/dw9amqc1e4f326iwbtcd.avif'),(22,11,95.00,65,'Silver',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875560/dfqpkjvh8/ccv6n9ztslxckjtzwepw.avif'),(23,12,99.00,40,'Gray',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875566/dfqpkjvh8/f3uem8wjrq0bkyiyjfpy.webp'),(24,12,109.00,35,'White',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875567/dfqpkjvh8/g3pjkoa0zitc8ewr3mnl.jpg'),(25,13,249.00,70,'White',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875642/dfqpkjvh8/rhwyt3diywhzjkiy43iw.jpg'),(26,13,259.00,60,'Black',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875641/dfqpkjvh8/rzcwaie8ccw23x5dfwhq.jpg'),(27,14,399.00,50,'Black',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875648/dfqpkjvh8/q3etbprwda7fkam4lxad.webp'),(28,14,429.00,45,'Silver',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875649/dfqpkjvh8/liitmun8ugytkhbgiuw1.png'),(29,15,349.00,55,'White',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875645/dfqpkjvh8/lwgtimwuvzhzkv0jygkr.jpg'),(30,15,359.00,50,'Blue',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875643/dfqpkjvh8/kqeuuzqwwftedtglih32.jpg'),(31,16,199.00,80,'Gray',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875647/dfqpkjvh8/i5yctpbrzzda6rweu9fx.jpg'),(32,16,209.00,70,'Beige',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875646/dfqpkjvh8/ir6orqfhf18prine6fta.jpg'),(33,17,2499.00,10,'Black',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875509/dfqpkjvh8/ea1kitccmdtzkqyfb01l.jpg'),(34,17,2699.00,5,'Silver',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875510/dfqpkjvh8/rmbrbnlklzimmzzqwjnn.jpg'),(35,18,2199.00,12,'Black',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875515/dfqpkjvh8/xb8j2lj6dzquomojznze.webp'),(36,18,2399.00,6,'Silver',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875516/dfqpkjvh8/jzjgltys6smyoubn6ajy.jpg'),(37,19,1499.00,14,'Black',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875513/dfqpkjvh8/x0xlolmtyxrepkjakbye.jpg'),(38,19,1599.00,7,'Silver',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875514/dfqpkjvh8/mkzklxcfh0zcnwhwf2ut.jpg'),(39,20,1699.00,13,'Black',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875511/dfqpkjvh8/ac3ntqcsrkke0isgqgjb.jpg'),(40,20,1799.00,8,'Silver',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875512/dfqpkjvh8/zxz8isjgkdnm7qcdbyat.jpg'),(41,21,499.00,60,'Midnight',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875916/dfqpkjvh8/wa2udphmsivbhcvndsvf.jpg'),(42,21,549.00,55,'Starlight',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875917/dfqpkjvh8/yuan3lgeidaxzlgmxv9w.jpg'),(43,22,449.00,70,'Graphite',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875923/dfqpkjvh8/k4sg6cmjxeabkqnpr799.webp'),(44,22,469.00,60,'Silver',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875925/dfqpkjvh8/hkekyxoof5dyuth9gcbr.jpg'),(45,23,899.00,40,'Black',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875921/dfqpkjvh8/xygehulttzc4g2kvxzh5.webp'),(46,23,949.00,35,'Blue',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875922/dfqpkjvh8/ww1ce2uqyqa70a8po4jt.webp'),(47,24,299.00,80,'Black',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875918/dfqpkjvh8/poys7acidq8abgdjnkjr.jpg'),(48,24,319.00,70,'White',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875920/dfqpkjvh8/ne3oavdks2lysrmibhxr.webp'),(49,25,249.00,60,'White',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875610/dfqpkjvh8/pxxhf6aiqdixm1t1qhe9.png'),(50,25,269.00,50,'Black',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875606/dfqpkjvh8/bcuzzii4pfwkay34ckqm.avif'),(51,26,229.00,55,'White',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875617/dfqpkjvh8/rnorbiyahyydjl096ei2.jpg'),(52,26,239.00,45,'Gray',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875615/dfqpkjvh8/ylvjqqdjqxzvfyhkquab.avif'),(53,27,59.00,100,'Black',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875618/dfqpkjvh8/sh5aa8urbwl02xzpjo8o.jpg'),(54,27,69.00,90,'Purple',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875619/dfqpkjvh8/vaymolmzc2boqousz053.webp'),(55,28,139.00,50,'Black',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875612/dfqpkjvh8/spm6ydmtb444qqvhwwjm.webp'),(56,28,149.00,40,'Gray',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875614/dfqpkjvh8/wttpi8fgmsvwd3mcjhap.jpg'),(57,29,1299.00,40,'Silver',512,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875881/dfqpkjvh8/taxn5irvmjwokectfwwp.jpg'),(58,29,1399.00,35,'Space Gray',1024,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875882/dfqpkjvh8/uow3il1plwnaxezbqzzn.jpg'),(59,30,1099.00,50,'Graphite',256,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875887/dfqpkjvh8/gg5wruelwpq4hvy6bmx3.jpg'),(60,30,1199.00,40,'Beige',512,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875888/dfqpkjvh8/ydre6excdl4ef85ksnzj.avif'),(61,31,1399.00,35,'Silver',512,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875886/dfqpkjvh8/gl7de8wyuug9b8wzl5rx.jpg'),(62,31,1499.00,30,'Black',1024,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875885/dfqpkjvh8/i6puejt11gop9k3nmrpv.jpg'),(63,32,999.00,50,'Gray',128,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875883/dfqpkjvh8/jsjpzuaqlkioywyisj2d.jpg'),(64,32,1099.00,45,'Blue',256,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875884/dfqpkjvh8/ovkzcho5yxygruadu1dr.jpg'),(65,33,179.00,60,'Black',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875782/dfqpkjvh8/gtmbzkafjjadtzbpkovb.jpg'),(66,33,189.00,50,'White',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875783/dfqpkjvh8/vsu6xcneplkhuo1lzl4s.webp'),(67,34,159.00,70,'Gray',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875778/dfqpkjvh8/nl055nx3fiw7fefxdvvv.webp'),(68,34,169.00,65,'Navy',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875779/dfqpkjvh8/xztcsewzocsuyvqpmhps.jpg'),(69,35,149.00,75,'Red',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875785/dfqpkjvh8/r9kgsvfoingfwuwug94w.webp'),(70,35,159.00,65,'Blue',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875784/dfqpkjvh8/kzzjvyafakg10t4zqalx.avif'),(71,36,139.00,80,'Green',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875780/dfqpkjvh8/labewa8hrq2g1djq1gum.webp'),(72,36,149.00,70,'White',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875781/dfqpkjvh8/dxoxtbe2smx5jiousj8r.jpg'),(73,37,1599.00,20,'Brown',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875006/dfqpkjvh8/gfgc8u5au4ylcv8b5xqm.webp'),(74,37,1699.00,15,'Monogram',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875007/dfqpkjvh8/sdnjh7z7lhrifq0zcolw.webp'),(75,38,129.00,50,'Navy',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875005/dfqpkjvh8/uyvxquinuggrtuuskxou.jpg'),(76,38,139.00,45,'Black',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875004/dfqpkjvh8/oh6ou9ibpuh8otarlsis.jpg'),(77,39,249.00,40,'Gray',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875011/dfqpkjvh8/chi8pr3be7dcvfcxzhlc.jpg'),(78,39,259.00,35,'Black',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875012/dfqpkjvh8/ugmdqrx2jsesqaxdeiuu.jpg'),(79,40,199.00,50,'Silver',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875008/dfqpkjvh8/qpu86w4gvt9u3m3mjdvw.jpg'),(80,40,219.00,45,'Blue',NULL,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875008/dfqpkjvh8/qpu86w4gvt9u3m3mjdvw.jpg'),(81,41,129.00,80,'Blue',1000,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875850/dfqpkjvh8/kei9ewampl45ziurhbe1.webp'),(82,41,149.00,70,'Black',2000,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875848/dfqpkjvh8/atdzk5jl7ogdce3ucthz.avif'),(83,42,139.00,75,'Gray',1000,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875851/dfqpkjvh8/ghyuzly7c47uidyxt83l.webp'),(84,42,159.00,65,'Red',2000,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875852/dfqpkjvh8/l0gnlqccch8flwzv97qi.png'),(85,43,259.00,60,'Black',10000,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875855/dfqpkjvh8/darv0dpgsqddknqcew0x.png'),(86,43,279.00,55,'White',10000,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875856/dfqpkjvh8/mg8jqzflooukzxzvqfrx.jpg'),(87,44,109.00,90,'Green',4000,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875854/dfqpkjvh8/enxlyxkcgrsi7nztrpkj.jpg'),(88,44,119.00,85,'Black',6000,'https://res.cloudinary.com/dfqpkjvh8/image/upload/v1760875853/dfqpkjvh8/tdvsrhzoq2xhyxk1hxal.webp');
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
    YEAR(o.Order_Date) AS Year,
    QUARTER(o.Order_Date) AS Quarter,
    SUM(o.Total_Amount) AS Total_Sales,
      COUNT(o.Order_Number) AS Total_Orders,
    AVG(o.Total_Amount) AS Avg_Order_Value
  FROM brightbuy.order o
  WHERE YEAR(o.Order_Date) = selectedYear
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
/*!50001 VIEW `categoryordersummary` AS select `c`.`Category_Name` AS `Category_Name`,count(distinct `o`.`Order_Number`) AS `TotalOrders` from ((((`category` `c` left join `product` `p` on((`c`.`Category_ID` = `p`.`Category_ID`))) left join `variant` `v` on((`p`.`Product_ID` = `v`.`Product_ID`))) left join `cart_item` `ci` on((`v`.`Variant_ID` = `ci`.`Variant_ID`))) left join `order` `o` on((`ci`.`Cart_ID` = `o`.`Cart_ID`))) where (`o`.`Order_Number` is not null) group by `c`.`Category_ID`,`c`.`Category_Name` order by `TotalOrders` desc */;
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
/*!50001 VIEW `monthlytopsellingproducts` AS select date_format(`o`.`Order_Date`,'%Y-%m') AS `month`,`p`.`Product_ID` AS `Product_ID`,`p`.`Product_Name` AS `Product_Name`,`p`.`Brand` AS `Brand`,sum(`ci`.`Quantity`) AS `total_quantity_sold`,sum(`ci`.`Total_price`) AS `total_revenue` from (((`order` `o` join `cart_item` `ci` on((`o`.`Cart_ID` = `ci`.`Cart_ID`))) join `variant` `v` on((`ci`.`Variant_ID` = `v`.`Variant_ID`))) join `product` `p` on((`v`.`Product_ID` = `p`.`Product_ID`))) group by `month`,`p`.`Product_ID` order by `month`,`total_quantity_sold` desc */;
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

-- Dump completed on 2025-10-20 19:58:55
