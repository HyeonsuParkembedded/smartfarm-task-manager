-- 스마트팜 작업 관리 테이블 생성
CREATE TABLE task (
    task_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '작업 고유 식별 ID',
    house_id INT NOT NULL COMMENT '하우스 ID (HOUSE 테이블의 외래키)',
    title VARCHAR(200) NOT NULL COMMENT '작업 제목',
    description TEXT COMMENT '작업 상세 설명',
    status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending' COMMENT '작업 상태',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium' COMMENT '우선순위',
    start_time TIME COMMENT '시작 시간',
    end_time TIME COMMENT '종료 시간',
    assigned_date DATE COMMENT '할당된 날짜',
    completed_at TIMESTAMP NULL COMMENT '완료 시간',
    created_by INT COMMENT '작업 생성자 ID (USER 테이블의 외래키)',
    assigned_to INT COMMENT '작업 담당자 ID (USER 테이블의 외래키)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '작업 생성일',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '작업 수정일',
    FOREIGN KEY (house_id) REFERENCES house(house_id),
    FOREIGN KEY (created_by) REFERENCES user(user_id),
    FOREIGN KEY (assigned_to) REFERENCES user(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='스마트팜 작업 관리 테이블';
