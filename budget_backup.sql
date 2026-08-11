-- MariaDB dump 10.19  Distrib 10.4.28-MariaDB, for osx10.10 (x86_64)
--
-- Host: localhost    Database: budget_tracking
-- ------------------------------------------------------
-- Server version	10.4.28-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `budget_summary`
--

DROP TABLE IF EXISTS `budget_summary`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `budget_summary` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fiscal_year` varchar(20) DEFAULT NULL,
  `total_budget` float DEFAULT NULL,
  `total_budget_unit` varchar(20) NOT NULL DEFAULT 'crore',
  `total_growth` float DEFAULT NULL,
  `capital_budget` float DEFAULT NULL,
  `capital_percentage` float DEFAULT NULL,
  `own_revenue` float DEFAULT NULL,
  `own_revenue_percentage` float DEFAULT NULL,
  `federal_dependency` float DEFAULT NULL,
  `education` float DEFAULT NULL,
  `health` float DEFAULT NULL,
  `infrastructure` float DEFAULT NULL,
  `agriculture` float DEFAULT NULL,
  `previous_total_budget` float DEFAULT 0,
  `federal_grants` float DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `budget_summary`
--

LOCK TABLES `budget_summary` WRITE;
/*!40000 ALTER TABLE `budget_summary` DISABLE KEYS */;
INSERT INTO `budget_summary` VALUES (1,'2083/2084',60,'Arba',-96.9,30,50,8,13.3,15,1371,1052,1775,801,1942,0),(2,'2081/82',18.42,'Arba',9.6,8.62,47,3.1,17,76,1371,1052,1775,801,0,0);
/*!40000 ALTER TABLE `budget_summary` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `districts`
--

DROP TABLE IF EXISTS `districts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `districts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `district_name` varchar(100) NOT NULL,
  `population` int(11) DEFAULT NULL,
  `allocation` float DEFAULT NULL,
  `per_citizen` float DEFAULT NULL,
  `hdi` float DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `percentage` float DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `districts`
--

LOCK TABLES `districts` WRITE;
/*!40000 ALTER TABLE `districts` DISABLE KEYS */;
INSERT INTO `districts` VALUES (1,'Kailali',890000,245,2753,0.52,'Developing',0),(2,'Kanchanpur',650000,198,3046,0.55,'Developing',0),(3,'Doti',210000,85,4048,0.48,'Backward',0),(4,'Bajhang',195000,72,3692,0.45,'Backward',0),(5,'Bajura',135000,68,5037,0.42,'Backward',0),(6,'Achham',250000,95,3800,0.47,'Backward',0),(7,'Dadeldhura',145000,78,5379,0.5,'Developing',0),(8,'Baitadi',180000,82,4556,0.46,'Backward',0),(9,'Darchula',130000,65,5000,0.49,'Backward',0);
/*!40000 ALTER TABLE `districts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ministries`
--

DROP TABLE IF EXISTS `ministries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ministries` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ministry_name` varchar(100) NOT NULL,
  `nepali_name` varchar(100) DEFAULT NULL,
  `budget_current` float DEFAULT NULL,
  `budget_previous` float DEFAULT NULL,
  `budget_share` float DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ministries`
--

LOCK TABLES `ministries` WRITE;
/*!40000 ALTER TABLE `ministries` DISABLE KEYS */;
INSERT INTO `ministries` VALUES (1,'Infrastructure','भौतिक पूर्वाधार',15,481.62,24.8),(2,'Education','शिक्षा',67,370.92,19.1),(3,'Health','स्वास्थ्य',244,285.47,14.7),(4,'Agriculture','कृषि',198,231.1,11.9),(5,'Social Development','सामाजिक विकास',186,217.5,11.2),(6,'Internal Affairs','गृह',168,196.14,10.1),(7,'Forest & Environment','वन तथा वातावरण',142,165.07,8.5),(8,'Industry & Tourism','उद्योग तथा पर्यटन',98,114.58,5.9),(9,'Law & Parliament','कानुन तथा संसद',76,89.33,4.6);
/*!40000 ALTER TABLE `ministries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ministries_backup`
--

DROP TABLE IF EXISTS `ministries_backup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ministries_backup` (
  `id` int(11) NOT NULL DEFAULT 0,
  `ministry_name` varchar(100) NOT NULL,
  `nepali_name` varchar(100) DEFAULT NULL,
  `budget_2081` float DEFAULT NULL,
  `budget_2080` float DEFAULT NULL,
  `budget_share` float DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ministries_backup`
--

LOCK TABLES `ministries_backup` WRITE;
/*!40000 ALTER TABLE `ministries_backup` DISABLE KEYS */;
INSERT INTO `ministries_backup` VALUES (1,'Infrastructure','भौतिक पूर्वाधार',15,481.62,24.8),(2,'Education','शिक्षा',67,370.92,19.1),(3,'Health','स्वास्थ्य',244,285.47,14.7),(4,'Agriculture','कृषि',198,231.1,11.9),(5,'Social Development','सामाजिक विकास',186,217.5,11.2),(6,'Internal Affairs','गृह',168,196.14,10.1),(7,'Forest & Environment','वन तथा वातावरण',142,165.07,8.5),(8,'Industry & Tourism','उद्योग तथा पर्यटन',98,114.58,5.9),(9,'Law & Parliament','कानुन तथा संसद',76,89.33,4.6);
/*!40000 ALTER TABLE `ministries_backup` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ministry_budgets`
--

DROP TABLE IF EXISTS `ministry_budgets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ministry_budgets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ministry_id` int(11) NOT NULL,
  `fiscal_year` varchar(20) NOT NULL,
  `budget` float DEFAULT NULL,
  `unit` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ministry_id` (`ministry_id`),
  CONSTRAINT `ministry_budgets_ibfk_1` FOREIGN KEY (`ministry_id`) REFERENCES `ministries` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ministry_budgets`
--

LOCK TABLES `ministry_budgets` WRITE;
/*!40000 ALTER TABLE `ministry_budgets` DISABLE KEYS */;
/*!40000 ALTER TABLE `ministry_budgets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `outcomes`
--

DROP TABLE IF EXISTS `outcomes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `outcomes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `indicator` varchar(150) NOT NULL,
  `province_value` float DEFAULT NULL,
  `national_value` float DEFAULT NULL,
  `target_value` float DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `outcomes`
--

LOCK TABLES `outcomes` WRITE;
/*!40000 ALTER TABLE `outcomes` DISABLE KEYS */;
INSERT INTO `outcomes` VALUES (1,'Literacy ',76.23,77.4,96.19),(2,'Health facility access',71,80.4,85);
/*!40000 ALTER TABLE `outcomes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `projects`
--

DROP TABLE IF EXISTS `projects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `projects` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `project_name` varchar(200) NOT NULL,
  `district` varchar(100) DEFAULT NULL,
  `budget` float DEFAULT NULL,
  `spent` float DEFAULT NULL,
  `progress` int(11) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `percentage` float DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `projects`
--

LOCK TABLES `projects` WRITE;
/*!40000 ALTER TABLE `projects` DISABLE KEYS */;
INSERT INTO `projects` VALUES (1,'Godawari-Dhangadhi Highway Upgradation','Kailali',450,320,71,'On Track',0),(2,'District Hospital Modernization','Kanchanpur',180,95,53,'Delayed',0),(3,'Solar Mini Grid Project','Bajura',65,65,100,'Completed',0),(4,'Smart Classroom Program','Doti',45,30,67,'On Track',0),(5,'earthquake reconstruction','kailali',208,178,80,'Ongoing',0),(6,'baadi pidit','kailali',56,34,67,'Ongoing',0);
/*!40000 ALTER TABLE `projects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `revenue`
--

DROP TABLE IF EXISTS `revenue`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `revenue` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `source` varchar(100) NOT NULL,
  `amount` float DEFAULT NULL,
  `percentage` float DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `revenue`
--

LOCK TABLES `revenue` WRITE;
/*!40000 ALTER TABLE `revenue` DISABLE KEYS */;
INSERT INTO `revenue` VALUES (1,'Federal Grants',9,76),(2,'Own Source Revenue',3.1,17),(3,'Internal Borrowing',1.3,7);
/*!40000 ALTER TABLE `revenue` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sdgs`
--

DROP TABLE IF EXISTS `sdgs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sdgs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `goal_number` int(11) NOT NULL,
  `goal_name` varchar(200) NOT NULL,
  `budget` float NOT NULL,
  `percentage` float DEFAULT NULL,
  `nepali_name` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sdgs`
--

LOCK TABLES `sdgs` WRITE;
/*!40000 ALTER TABLE `sdgs` DISABLE KEYS */;
INSERT INTO `sdgs` VALUES (1,12,'Good Health and Wellbeing',155.36,8,'राम्रो स्वास्थ्य र समृद्धि');
/*!40000 ALTER TABLE `sdgs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) NOT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Roshan Hamal','Roshan Hamal','roshan@gmail.com','scrypt:32768:8:1$AndMWDNPAIVff1pu$f39a2f6787a86812f7b8099b22a134ed02b43bcdd16a51966e3d520c9ee8744519c7d717cb6e1e84ad18f5a58e5eb2e9ed0a532edfa040695adbff0f8dfdc7f5','admin');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-11  9:02:05
