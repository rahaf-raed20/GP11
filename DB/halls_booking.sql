-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 23, 2025 at 03:10 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `halls_booking`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `booking`
--

CREATE TABLE `booking` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `halls_id` int(11) DEFAULT NULL,
  `total_hall_price` float DEFAULT NULL,
  `total_companies_price` float DEFAULT NULL,
  `event_date` date DEFAULT NULL,
  `event_start_time` time DEFAULT NULL,
  `event_end_time` time DEFAULT NULL,
  `approval` varchar(255) NOT NULL,
  `created_at` date DEFAULT NULL,
  `updated_at` date DEFAULT NULL,
  `hall_code` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `booking`
--

INSERT INTO `booking` (`id`, `customer_id`, `halls_id`, `total_hall_price`, `total_companies_price`, `event_date`, `event_start_time`, `event_end_time`, `approval`, `created_at`, `updated_at`, `hall_code`) VALUES
(1, 3, 7, 600, NULL, '2025-06-02', '15:00:00', '18:00:00', 'approved', '2025-04-22', '2025-04-26', NULL),
(2, 3, 7, 150, NULL, '2025-05-01', '18:00:00', '19:00:00', 'approved', '2025-04-22', NULL, NULL),
(3, 3, 7, 500, NULL, '2025-05-02', '17:00:00', '19:00:00', 'waiting', '2025-04-22', NULL, NULL),
(4, 3, 7, 500, NULL, '2025-05-20', '17:00:00', '19:00:00', 'waiting', '2025-04-24', NULL, NULL),
(8, 3, 6, 800, NULL, '2025-12-15', '14:00:00', '18:00:00', '', NULL, NULL, NULL),
(9, 3, 6, 800, 400, '2025-12-15', '14:00:00', '18:00:00', 'waiting', NULL, NULL, NULL),
(10, 3, 11, 2800, NULL, '2025-12-15', '14:00:00', '18:00:00', 'approved', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `chat_messages`
--

CREATE TABLE `chat_messages` (
  `id` int(11) NOT NULL,
  `thread_id` int(11) NOT NULL,
  `sender_type` enum('customer','provider') NOT NULL,
  `message` text NOT NULL,
  `sent_at` datetime NOT NULL DEFAULT current_timestamp(),
  `read_at` datetime DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `chat_messages`
--

INSERT INTO `chat_messages` (`id`, `thread_id`, `sender_type`, `message`, `sent_at`, `read_at`, `is_read`) VALUES
(1, 1, 'customer', 'Hello, I have questions about availability', '2025-05-22 03:03:31', NULL, 1),
(2, 1, 'customer', 'What\'s the maximum capacity?', '2025-05-22 03:05:03', NULL, 1),
(3, 1, 'provider', 'Our maximum capacity is 150 people.', '2025-05-23 02:31:03', '2025-05-23 02:33:17', 0),
(4, 2, 'customer', 'Hello this is a new msg for to test TP', '2025-05-23 02:39:27', NULL, 1),
(5, 2, 'customer', 'Test test ttt....', '2025-05-23 02:40:04', NULL, 1),
(6, 2, 'provider', 'Yes, we can accommodate vegetarian, vegan, and gluten-free diets.', '2025-05-23 03:28:11', '2025-05-23 03:45:50', 0),
(7, 3, 'customer', 'Hello this is a new msg for to test hall', '2025-05-23 03:34:50', NULL, 0),
(8, 4, 'customer', 'Hello this is a new msg for to test hall', '2025-05-23 03:37:39', NULL, 0),
(9, 5, 'customer', 'Hello this is a new msg for to test hall', '2025-05-23 03:38:54', NULL, 1),
(10, 5, 'customer', 'Test test hall....', '2025-05-23 03:39:37', NULL, 1),
(11, 6, 'customer', 'Hello this is a new msg for to test TP......', '2025-05-23 03:40:18', NULL, 0),
(12, 6, 'customer', 'Test test TPTTT....', '2025-05-23 03:40:38', NULL, 0),
(13, 2, 'provider', 'Yes, we can accommodate vegetarian, vegan, and gluten-free diets.', '2025-05-23 03:45:03', '2025-05-23 03:45:50', 0);

-- --------------------------------------------------------

--
-- Table structure for table `chat_threads`
--

CREATE TABLE `chat_threads` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `provider_id` int(11) DEFAULT NULL,
  `provider_type` enum('hall_owner','third_party') DEFAULT NULL,
  `recipient_type` enum('hall','third_party') NOT NULL,
  `recipient_id` int(11) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `chat_threads`
--

INSERT INTO `chat_threads` (`id`, `customer_id`, `provider_id`, `provider_type`, `recipient_type`, `recipient_id`, `created_at`, `updated_at`) VALUES
(1, 9, 1, 'hall_owner', 'hall', 7, '2025-05-22 03:03:31', '2025-05-22 04:09:03'),
(2, 9, 1, 'third_party', 'third_party', 1, '2025-05-23 02:39:27', '2025-05-23 03:06:08'),
(5, 9, 1, 'hall_owner', 'hall', 11, '2025-05-23 03:38:54', '2025-05-23 03:38:54'),
(6, 9, 1, 'third_party', 'third_party', 3, '2025-05-23 03:40:18', '2025-05-23 03:40:18');

-- --------------------------------------------------------

--
-- Table structure for table `city`
--

CREATE TABLE `city` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `city`
--

INSERT INTO `city` (`id`, `name`) VALUES
(1, 'Nablus'),
(2, 'Ramallah');

-- --------------------------------------------------------

--
-- Table structure for table `company_booking`
--

CREATE TABLE `company_booking` (
  `id` int(11) NOT NULL,
  `company_id` int(11) DEFAULT NULL,
  `booking_id` int(11) DEFAULT NULL,
  `company_code` int(11) DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `price` float DEFAULT NULL,
  `created_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `company_booking`
--

INSERT INTO `company_booking` (`id`, `company_id`, `booking_id`, `company_code`, `start_time`, `end_time`, `price`, `created_at`) VALUES
(1, 1, 1, NULL, '14:00:00', '18:00:00', 500, NULL),
(2, 2, 1, NULL, '13:00:00', '19:00:00', 300, NULL),
(3, 1, 2, NULL, '18:00:00', '19:00:00', 200, NULL),
(4, 3, 9, NULL, '13:00:00', '19:00:00', 400, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `customer`
--

CREATE TABLE `customer` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customer`
--

INSERT INTO `customer` (`id`, `user_id`) VALUES
(3, 9),
(4, 14);

-- --------------------------------------------------------

--
-- Table structure for table `halls`
--

CREATE TABLE `halls` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `open_day` int(11) DEFAULT NULL,
  `close_day` int(11) DEFAULT NULL,
  `open_time` time DEFAULT NULL,
  `close_time` time DEFAULT NULL,
  `price_per_hour` float DEFAULT NULL,
  `owner_id` int(11) DEFAULT NULL,
  `city_id` int(11) DEFAULT NULL,
  `capacity` int(11) DEFAULT NULL,
  `image_url` varchar(1024) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `halls`
--

INSERT INTO `halls` (`id`, `name`, `open_day`, `close_day`, `open_time`, `close_time`, `price_per_hour`, `owner_id`, `city_id`, `capacity`, `image_url`, `created_at`, `updated_at`) VALUES
(4, 'Updated Hall Name', 2, 5, '09:00:00', '23:00:00', 250, 1, 2, 150, 'https://example.com/new-image.jpg', '2025-04-19 07:49:01', '2025-04-19 14:57:39'),
(5, 'Royal Hall', 1, 3, '09:00:00', '23:00:00', 200, 1, 1, 150, NULL, '2025-04-19 07:50:38', '2025-04-19 07:50:38'),
(6, 'Royal Hall', 1, 4, '09:00:00', '23:00:00', 200, 1, 1, 150, NULL, '2025-04-19 07:53:03', '2025-04-19 07:53:03'),
(7, 'ABCe', 2, 5, '09:00:00', '23:00:00', 250, 1, 2, 150, 'https://example.com/new-image.jpg', '2025-04-19 11:22:42', '2025-04-24 12:46:27'),
(11, 'My hall', 1, NULL, '06:00:00', '23:00:00', 700, 1, 1, 1450, NULL, '2025-04-24 12:51:52', '2025-04-24 12:51:52');

-- --------------------------------------------------------

--
-- Table structure for table `hall_features`
--

CREATE TABLE `hall_features` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hall_features`
--

INSERT INTO `hall_features` (`id`, `name`) VALUES
(1, 'Parking'),
(2, 'Stage'),
(3, 'Sound System'),
(4, 'Projector'),
(5, 'Air Conditioning');

-- --------------------------------------------------------

--
-- Table structure for table `hall_feature_mappings`
--

CREATE TABLE `hall_feature_mappings` (
  `id` int(11) NOT NULL,
  `hall_id` int(11) NOT NULL,
  `feature_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `login_token`
--

CREATE TABLE `login_token` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `value` varchar(1024) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `msg`
--

CREATE TABLE `msg` (
  `id` int(11) NOT NULL,
  `sender_id` int(11) DEFAULT NULL,
  `reciver_id` int(11) DEFAULT NULL,
  `messages` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `owner`
--

CREATE TABLE `owner` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `owner`
--

INSERT INTO `owner` (`id`, `user_id`) VALUES
(1, 10),
(2, 11);

-- --------------------------------------------------------

--
-- Table structure for table `payment_cred`
--

CREATE TABLE `payment_cred` (
  `id` int(11) NOT NULL,
  `card_name` varchar(255) DEFAULT NULL,
  `code` int(11) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `rate`
--

CREATE TABLE `rate` (
  `id` int(11) NOT NULL,
  `value` int(11) DEFAULT NULL,
  `feedback` varchar(255) DEFAULT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `hall_id` int(11) DEFAULT NULL,
  `created_at` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `rate`
--

INSERT INTO `rate` (`id`, `value`, `feedback`, `customer_id`, `hall_id`, `created_at`) VALUES
(1, 4, 'AAA', 3, 7, '2025-04-02'),
(2, 5, 'bbb', 3, 7, '2025-04-26'),
(3, 4, 'Great venue with excellent facilities!', 3, 11, '2025-05-23');

-- --------------------------------------------------------

--
-- Table structure for table `service_categories`
--

CREATE TABLE `service_categories` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `service_categories`
--

INSERT INTO `service_categories` (`id`, `name`, `description`) VALUES
(1, 'Catering', 'Food and beverage services'),
(2, 'Decoration', 'Event decoration services'),
(3, 'Photography', 'Photography and videography'),
(4, 'Entertainment', 'Music and performers'),
(5, 'Cleaning', 'Post-event cleaning services');

-- --------------------------------------------------------

--
-- Table structure for table `third_category`
--

CREATE TABLE `third_category` (
  `id` int(11) NOT NULL,
  `type` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `third_category`
--

INSERT INTO `third_category` (`id`, `type`) VALUES
(1, 'Catering'),
(2, 'Decoration'),
(3, 'Photography'),
(4, 'Cleaning');

-- --------------------------------------------------------

--
-- Table structure for table `third_party`
--

CREATE TABLE `third_party` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `third_party`
--

INSERT INTO `third_party` (`id`, `user_id`) VALUES
(1, 13);

-- --------------------------------------------------------

--
-- Table structure for table `third_party_company`
--

CREATE TABLE `third_party_company` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  `city_id` int(11) DEFAULT NULL,
  `third_party_id` int(11) DEFAULT NULL,
  `price_per_party` float DEFAULT NULL,
  `image_url` varchar(1024) DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `third_party_company`
--

INSERT INTO `third_party_company` (`id`, `name`, `category_id`, `city_id`, `third_party_id`, `price_per_party`, `image_url`, `updated_at`) VALUES
(1, 'Delicious Premium Catering', 2, 2, 1, 600, NULL, '2025-05-15 03:40:46'),
(2, 'Elegant Decor', 2, 1, 1, 300, NULL, NULL),
(3, 'Photo Magic', 3, 2, 1, 400, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `fname` varchar(255) NOT NULL,
  `mname` varchar(255) NOT NULL,
  `lname` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `refresh_token` varchar(1024) DEFAULT NULL,
  `city_id` int(11) NOT NULL,
  `image_url` varchar(1024) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `fname`, `mname`, `lname`, `email`, `password`, `refresh_token`, `city_id`, `image_url`) VALUES
(9, 'Rahaf', 'Test', 'NewLastName', 'Rahaf@gmail.com', '$2b$10$GA1Y6vA5JMXOC3R.AfbL3epkjoil2RapJFu.Nl.l9z.LJ2mJnI0wK', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OSwidHlwZSI6MSwiaWF0IjoxNzQ3OTYyMjc5LCJleHAiOjE3NDg1NjcwNzl9.vP2ASiILud_nGkL-mpC2ECB4ZnMerWzmXRFvVWiYYfU', 1, 'aaaaaaaaa'),
(10, 'Layan55', 'R', 'LLL', 'Layan55@gmail.com', '$2b$10$oo1TEWiwq6gN13HRwcuegeXhugc7dnxE1h4znyx/qu0j60Tomlyda', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAsInR5cGUiOjIsImlhdCI6MTc0Nzk2MDkzMSwiZXhwIjoxNzQ4NTY1NzMxfQ.HAhcu7uPLz9eK4SQddcAZ9ssyXVqHrp4Hv0JoWocV4g', 2, 'bbbbbbbb'),
(11, 'Layan', 'Test', 'B', 'Layan12@gmail.com', '$2b$10$r0ZlTlNRNSxJAKuvslnU.ewAmkXPOWUe25JtiZWs.CuhxHdWKon2K', NULL, 1, NULL),
(12, 'Third', '', 'party', 'services@example.com', '$2b$10$hashedpassword', NULL, 1, NULL),
(13, 'Third', '', 'Party', 'Third@gmail.com', '$2b$10$3EyDtLz/3hM0FtbMwb08Ru0UE0sJE8yiOareSLwB/ejhfG5Gw3Juu', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTMsInR5cGUiOjMsImlhdCI6MTc0Nzk2MTAzNywiZXhwIjoxNzQ4NTY1ODM3fQ.DMnw0RJZylbpKqJ447XX43lyTIrAO3Yy7Tef2h5oWlA', 2, 'https://example.com/new.jpg'),
(14, 'Customer', 'One', 'A', 'Customer@gmail.com', '$2b$10$cktYLhGo1KD/Dubgbgh2Oe1thpt59co9VkwYCmz8RlC/eZaPULvKu', NULL, 1, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `vacation_days`
--

CREATE TABLE `vacation_days` (
  `id` int(11) NOT NULL,
  `date` date DEFAULT NULL,
  `Halls_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `vacation_days`
--

INSERT INTO `vacation_days` (`id`, `date`, `Halls_id`) VALUES
(3, '2025-06-02', 7),
(4, '2025-04-30', 6),
(5, '2025-03-30', 7),
(7, '2025-07-25', 11);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `booking`
--
ALTER TABLE `booking`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `halls_id` (`halls_id`);

--
-- Indexes for table `chat_messages`
--
ALTER TABLE `chat_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `thread_id` (`thread_id`);

--
-- Indexes for table `chat_threads`
--
ALTER TABLE `chat_threads`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customer_id` (`customer_id`);

--
-- Indexes for table `city`
--
ALTER TABLE `city`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`);

--
-- Indexes for table `company_booking`
--
ALTER TABLE `company_booking`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`),
  ADD KEY `company_id` (`company_id`),
  ADD KEY `booking_id` (`booking_id`);

--
-- Indexes for table `customer`
--
ALTER TABLE `customer`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `halls`
--
ALTER TABLE `halls`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`),
  ADD KEY `owner_id` (`owner_id`),
  ADD KEY `city_hall_id` (`city_id`);

--
-- Indexes for table `hall_features`
--
ALTER TABLE `hall_features`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `hall_feature_mappings`
--
ALTER TABLE `hall_feature_mappings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `hall_id` (`hall_id`),
  ADD KEY `feature_id` (`feature_id`);

--
-- Indexes for table `login_token`
--
ALTER TABLE `login_token`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `msg`
--
ALTER TABLE `msg`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`),
  ADD KEY `sender_id` (`sender_id`),
  ADD KEY `reciver_id` (`reciver_id`);

--
-- Indexes for table `owner`
--
ALTER TABLE `owner`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `payment_cred`
--
ALTER TABLE `payment_cred`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `rate`
--
ALTER TABLE `rate`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `hall_id` (`hall_id`);

--
-- Indexes for table `service_categories`
--
ALTER TABLE `service_categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `third_category`
--
ALTER TABLE `third_category`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`);

--
-- Indexes for table `third_party`
--
ALTER TABLE `third_party`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `third_party_company`
--
ALTER TABLE `third_party_company`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`),
  ADD KEY `third_party_id` (`third_party_id`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `third_party_company_ibfk_3` (`city_id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`),
  ADD KEY `city_id` (`city_id`);

--
-- Indexes for table `vacation_days`
--
ALTER TABLE `vacation_days`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`),
  ADD KEY `Halls_id` (`Halls_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `booking`
--
ALTER TABLE `booking`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `chat_messages`
--
ALTER TABLE `chat_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `chat_threads`
--
ALTER TABLE `chat_threads`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `city`
--
ALTER TABLE `city`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `company_booking`
--
ALTER TABLE `company_booking`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `customer`
--
ALTER TABLE `customer`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `halls`
--
ALTER TABLE `halls`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `hall_features`
--
ALTER TABLE `hall_features`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `hall_feature_mappings`
--
ALTER TABLE `hall_feature_mappings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `login_token`
--
ALTER TABLE `login_token`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `msg`
--
ALTER TABLE `msg`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `owner`
--
ALTER TABLE `owner`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `payment_cred`
--
ALTER TABLE `payment_cred`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `rate`
--
ALTER TABLE `rate`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `service_categories`
--
ALTER TABLE `service_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `third_category`
--
ALTER TABLE `third_category`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `third_party`
--
ALTER TABLE `third_party`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `third_party_company`
--
ALTER TABLE `third_party_company`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `vacation_days`
--
ALTER TABLE `vacation_days`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `admin`
--
ALTER TABLE `admin`
  ADD CONSTRAINT `admin_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `booking`
--
ALTER TABLE `booking`
  ADD CONSTRAINT `booking_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `booking_ibfk_2` FOREIGN KEY (`halls_id`) REFERENCES `halls` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `company_booking`
--
ALTER TABLE `company_booking`
  ADD CONSTRAINT `company_booking_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `third_party_company` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `company_booking_ibfk_2` FOREIGN KEY (`booking_id`) REFERENCES `booking` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `customer`
--
ALTER TABLE `customer`
  ADD CONSTRAINT `customer_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `halls`
--
ALTER TABLE `halls`
  ADD CONSTRAINT `city_hall_id` FOREIGN KEY (`city_id`) REFERENCES `city` (`id`),
  ADD CONSTRAINT `halls_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `owner` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `login_token`
--
ALTER TABLE `login_token`
  ADD CONSTRAINT `login_token_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `msg`
--
ALTER TABLE `msg`
  ADD CONSTRAINT `msg_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `msg_ibfk_2` FOREIGN KEY (`reciver_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `owner`
--
ALTER TABLE `owner`
  ADD CONSTRAINT `owner_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `payment_cred`
--
ALTER TABLE `payment_cred`
  ADD CONSTRAINT `payment_cred_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `rate`
--
ALTER TABLE `rate`
  ADD CONSTRAINT `rate_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `rate_ibfk_2` FOREIGN KEY (`hall_id`) REFERENCES `halls` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `third_party`
--
ALTER TABLE `third_party`
  ADD CONSTRAINT `third_party_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `third_party_company`
--
ALTER TABLE `third_party_company`
  ADD CONSTRAINT `third_party_company_ibfk_1` FOREIGN KEY (`third_party_id`) REFERENCES `third_party` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `third_party_company_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `third_category` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `third_party_company_ibfk_3` FOREIGN KEY (`city_id`) REFERENCES `city` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user`
--
ALTER TABLE `user`
  ADD CONSTRAINT `city_id` FOREIGN KEY (`city_id`) REFERENCES `city` (`id`);

--
-- Constraints for table `vacation_days`
--
ALTER TABLE `vacation_days`
  ADD CONSTRAINT `vacation_days_ibfk_1` FOREIGN KEY (`Halls_id`) REFERENCES `halls` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
