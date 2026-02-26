-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Feb 24, 2026 at 02:35 PM
-- Server version: 8.0.44
-- PHP Version: 8.2.13

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `master_maths`
--

-- --------------------------------------------------------

--
-- Table structure for table `past_papers`
--

DROP TABLE IF EXISTS `past_papers`;
CREATE TABLE IF NOT EXISTS `past_papers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `class_type` varchar(100) NOT NULL,
  `year` int NOT NULL,
  `month` varchar(20) NOT NULL,
  `week` int NOT NULL,
  `file_location` varchar(500) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `past_papers`
--

INSERT INTO `past_papers` (`id`, `title`, `class_type`, `year`, `month`, `week`, `file_location`, `created_at`) VALUES
(1, 'Algebra Past Paper', 'Theory', 2024, 'January', 1, 'uploads/papers/algebra_w1.pdf', '2026-02-17 04:05:14'),
(2, 'Algebra Past Paper', 'Theory', 2024, 'January', 2, 'uploads/papers/algebra_w2.pdf', '2026-02-17 04:05:14'),
(3, 'Geometry Revision Paper', 'Revision', 2024, 'February', 1, 'uploads/papers/geometry_rev1.pdf', '2026-02-17 04:05:14'),
(4, 'Trigonometry Model Paper', 'Model', 2023, 'March', 3, 'uploads/papers/trigo_model_w3.pdf', '2026-02-17 04:05:14'),
(5, 'Calculus Tute', 'Tute', 2025, 'April', 2, 'uploads/papers/calculus_tute_w2.pdf', '2026-02-17 04:05:14'),
(6, 'Statistics Past Paper', 'Theory', 2023, 'May', 4, 'uploads/papers/statistics_w4.pdf', '2026-02-17 04:05:14'),
(7, 'Probability Paper', 'Paper', 2024, 'June', 1, 'uploads/papers/probability_w1.pdf', '2026-02-17 04:05:14'),
(8, 'Matrices Practice', 'Practice', 2025, 'July', 2, 'uploads/papers/matrices_w2.pdf', '2026-02-17 04:05:14');

-- --------------------------------------------------------

--
-- Table structure for table `student_video_access`
--

DROP TABLE IF EXISTS `student_video_access`;
CREATE TABLE IF NOT EXISTS `student_video_access` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `video_id` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tasks`
--

DROP TABLE IF EXISTS `tasks`;
CREATE TABLE IF NOT EXISTS `tasks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `due_date` date DEFAULT NULL,
  `is_completed` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_tasks_user_id` (`user_id`),
  KEY `idx_tasks_is_completed` (`is_completed`),
  CONSTRAINT `fk_tasks_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tutes`
--

DROP TABLE IF EXISTS `tutes`;
CREATE TABLE IF NOT EXISTS `tutes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `description` text,
  `file_url` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `district` varchar(100) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `year` int NOT NULL DEFAULT '0',
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expiry` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `mobile`, `district`, `password`, `created_at`, `year`, `reset_token`, `reset_token_expiry`) VALUES
(1, 'Test User', 'testuser1@gmail.com', '0771234567', 'Colombo', '$2b$10$Tbdc/J59EMxRmfWAKzRp3untPWPrXRCUkg1FjnHzXhWk9Yl8S6bBu', '2026-02-12 09:57:49', NULL, NULL, NULL),
(2, 'Maths Student 1', 'maths1@example.com', '0771112233', 'Galle', '$2b$10$dTLITrxOz0iynnPZz24DteqyBbQe4.J9y9Y7VtmFUNSrsp1xDq06S', '2026-02-16 14:00:56', 2026, '9ea02886e8fc8379f76fa792accde9f4398ee7b13ab18a4393b33ce9327447b3', '2026-02-16 21:38:18'),
(3, 'Test User', 'test1@example.com', '0712345678', 'Colombo', '$2b$10$dHaNpo8x7o72376H6cwjzuQv1j82ytp4DF8NVr6l685QbtDws.Ka.', '2026-02-16 15:57:14', NULL, '19d45178397a5331faf0c1dc14e2a61c0e334b6fd49734d63867dc6894b1e79e', '2026-02-16 22:28:22'),
(4, 'Gothami', 'gothami@gmail.com', '0771234567', 'Colombo', '$2b$10$8CACsxr1w0o.mbSzl/Ff1eAtfongQhu4fL42timNOe7XjD5A7MvJ.', '2026-02-24 14:19:05', 2026, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `videos`
--

DROP TABLE IF EXISTS `videos`;
CREATE TABLE IF NOT EXISTS `videos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `duration` varchar(50) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `video_url` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

