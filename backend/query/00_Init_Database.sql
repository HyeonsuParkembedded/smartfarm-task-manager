-- task 테이블이 참조하는 house / user 테이블 준비 (Create_Task_Table.sql 보다 먼저 실행)
CREATE DATABASE IF NOT EXISTS smartfarm DEFAULT CHARACTER SET utf8mb4;
USE smartfarm;

CREATE TABLE IF NOT EXISTS user (
    user_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '사용자 ID',
    name VARCHAR(50) NOT NULL COMMENT '이름',
    email VARCHAR(100) UNIQUE COMMENT '이메일'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='사용자';

CREATE TABLE IF NOT EXISTS house (
    house_id INT PRIMARY KEY COMMENT '하우스 ID',
    name VARCHAR(100) NOT NULL COMMENT '하우스 이름',
    crop VARCHAR(50) COMMENT '재배 작물'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='온실 하우스';

INSERT IGNORE INTO user (user_id, name, email) VALUES (1, '관리자', 'admin@smartfarm.kr');
INSERT IGNORE INTO house (house_id, name, crop) VALUES
    (11, '1번 하우스', '토마토'),
    (12, '2번 하우스', '딸기'),
    (13, '3번 하우스', '상추');
