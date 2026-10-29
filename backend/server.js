const express = require('express');
const path = require('path');

// backend/.env 의 DB 접속 정보를 환경변수로 로드 (Node 20.12+ 내장 기능)
try {
    process.loadEnvFile(path.join(__dirname, '.env'));
} catch {
    console.warn('.env 파일이 없습니다. .env.example 을 복사해 DB 접속 정보를 입력하세요.');
}

const taskRouter = require('./routes/task');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));   // 프론트엔드 (../frontend)
app.use('/task', taskRouter);                               // 백엔드 CRUD API

// 공통 에러 처리 (FK 위반·잘못된 ENUM 값 등은 400 으로 응답)
app.use((err, req, res, next) => {
    console.error(err.message);
    const badInput = ['ER_NO_REFERENCED_ROW_2', 'WARN_DATA_TRUNCATED', 'ER_TRUNCATED_WRONG_VALUE', 'ER_BAD_NULL_ERROR'];
    res.status(badInput.includes(err.code) ? 400 : 500).json({ message: err.message });
});

app.listen(PORT, () => console.log(`Smartfarm Task server: http://localhost:${PORT}`));
