# 스마트팜 Task 관리 시스템 (CRUD 실습 과제)

Node.js + Express + MySQL 로 만든 스마트팜 작업(Task) 관리 시스템입니다.
하우스별로 작업을 조회하고, 모달 화면에서 등록 / 수정 / 삭제할 수 있습니다.

## 폴더 구조

```
backend/                      백엔드 (Node.js + Express + MySQL)
├─ server.js                  Express 서버 (port 3000), /task API + frontend 폴더 제공
├─ db.js                      MySQL 커넥션 풀 (mysql2/promise), 접속 정보는 .env 에서 읽음
├─ .env.example               DB 접속 정보 양식 (.env 로 복사해서 사용)
├─ routes/task.js             Task CRUD 라우터
├─ api-test.js                API 자동 테스트 (과제 예시 요청 그대로)
└─ query/
   ├─ 00_Init_Database.sql    smartfarm DB + house / user 테이블 (task 의 FK 대상)
   ├─ Create_Task_Table.sql   과제 제공 스크립트
   └─ Create_Task_Data.sql    과제 제공 스크립트

frontend/                     프론트엔드 (HTML / CSS / JavaScript)
├─ index.html                 화면 구조 (작업 목록 표, 생성·수정 모달, 삭제 확인 모달)
├─ app.js                     fetch 로 /task API 호출, 목록 렌더링 및 CRUD 처리
└─ style.css                  스타일
```

백엔드 서버가 `frontend/` 폴더를 정적 파일로 함께 제공하므로, 서버 하나만 실행하면 브라우저에서 바로 사용할 수 있습니다.

## 실행 방법

1. DB 준비 (순서대로 실행)
   ```bash
   mysql -u root -p < backend/query/00_Init_Database.sql
   mysql -u root -p smartfarm < backend/query/Create_Task_Table.sql
   mysql -u root -p smartfarm < backend/query/Create_Task_Data.sql
   ```
2. DB 접속 정보 설정: `backend/.env.example` 을 `backend/.env` 로 복사한 뒤 본인 MySQL 계정을 입력합니다.
   (`.env` 는 `.gitignore` 로 저장소에 올라가지 않습니다.)
   ```
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USER=본인 MySQL 계정
   DB_PASSWORD=본인 MySQL 비밀번호
   DB_NAME=smartfarm
   PORT=3000
   ```
3. 서버 실행
   ```bash
   cd backend
   npm install
   npm start          # http://localhost:3000
   node api-test.js   # (선택) API 동작 확인
   ```

## API

| 메서드 | 엔드포인트 | 설명 |
|---|---|---|
| GET | /task/house/:houseId | 하우스별 작업 목록 |
| GET | /task/:taskId | 작업 상세 |
| POST | /task | 작업 생성 (`house_id`, `title` 필수) |
| PUT | /task/:taskId | 작업 수정 (보낸 필드만 변경, `completed` 로 바꾸면 `completed_at` 기록) |
| DELETE | /task/:taskId | 작업 삭제 |

- 없는 작업 → `404`, 필수값 누락·없는 하우스(FK 위반)·잘못된 ENUM 값 → `400`
- 수정 가능한 컬럼만 화이트리스트로 받고, 모든 쿼리는 `?` 플레이스홀더로 실행합니다.

## 프론트엔드 기능

- 작업 목록: 하우스 탭(11/12/13)별 표 형태 목록, 상태·우선순위 배지
- 작업 생성: `+ 새 작업` → 등록 모달 → 저장
- 작업 수정: `수정` → 상세 조회로 기존 값이 채워진 모달 → 저장
- 작업 삭제: `삭제` → 확인 모달 → 삭제
- 처리 결과는 하단 토스트 메시지로 표시
