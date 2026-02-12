-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Feb 12, 2026 at 10:08 AM
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
-- Database: `master_it`
--

-- --------------------------------------------------------

--
-- Table structure for table `past_papers`
--

DROP TABLE IF EXISTS `past_papers`;
CREATE TABLE IF NOT EXISTS `past_papers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `year` int NOT NULL,
  `subject` varchar(100) DEFAULT NULL,
  `file_url` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `past_papers`
--

INSERT INTO `past_papers` (`id`, `title`, `year`, `subject`, `file_url`, `created_at`) VALUES
(2, '2024 Maths Paper', 2024, 'Mathematics', 'uploads/papers/maths2024.pdf', '2026-02-09 10:55:08'),
(3, 'Physics Model Paper', 2025, 'Physics', 'uploads/papers/physics_model.pdf', '2026-02-09 10:55:08'),
(4, '2023 ICT Past Paper', 2023, 'ICT', 'uploads/papers/ict2023.pdf', '2026-02-09 11:28:40');

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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `tutes`
--

INSERT INTO `tutes` (`id`, `title`, `category`, `description`, `file_url`, `created_at`) VALUES
(2, 'NodeJS Guide', 'Backend', 'API development notes', 'uploads/tutes/node.pdf', '2026-02-09 10:55:22');

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
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `mobile`, `district`, `password`, `created_at`) VALUES
(1, 'Gothami', 'gothami@gmail.com', NULL, NULL, '$2b$10$O1yVPVrb/qe7deo4mOCWye7xEkkdgkwUEeFBH.nMx9w0iE5XtFsbu', '2026-02-09 03:58:31'),
(2, 'Test User', 'test@gmail.com', '0771234567', 'Colombo', '$2b$10$JrZGRRUkEvIm7omlCFHRq.nxkoU0mWqxMftN.RIpYpnqHy53QyyuG', '2026-02-09 04:15:04'),
(3, 'Test User2', 'test2@gmail.com', '077456123', 'Colombo', '$2b$10$bfgmq0kw4haRNogBPuYB8en2TQiX44lbn1DQpBpfI0GGXnBhLWCB2', '2026-02-09 07:29:45'),
(4, 'Gothami Abewardana', 'maduabewardana98@gmail.com', '071637232', 'Matara', '$2b$10$gvRFRd0OFAbUCboxUYg.s.hYDJSgreguIkHKqHjZmBzPelJ5suUJS', '2026-02-09 08:20:28'),
(5, 'IT User', 'ituser1@gmail.com', '0712345678', 'Kandy', '$2b$10$MxeNY4QEqI.etB15hH5CPOlTCjL2avs86GnIUkFGpu2LQyHwpj2ce', '2026-02-12 10:03:04');

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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `videos`
--

INSERT INTO `videos` (`id`, `title`, `duration`, `category`, `video_url`, `created_at`) VALUES
(2, 'React Hooks', '20:00', 'Frontend', 'uploads/videos/hooks.mp4', '2026-02-09 10:55:35');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
