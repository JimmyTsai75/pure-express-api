CREATE DATABASE IF NOT EXISTS express_api;

USE express_api;

DROP TABLE IF EXISTS `dns_queries`;
CREATE TABLE `dns_queries` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `domain` varchar(500) COLLATE utf8mb4_bin DEFAULT NULL,
  `ipv4_addresses` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
