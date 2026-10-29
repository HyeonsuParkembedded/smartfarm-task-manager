const express = require('express');
const db = require('../db');

const router = express.Router();

// 수정 가능한 컬럼 (화이트리스트) — 요청 body 의 다른 키는 무시
const FIELDS = ['house_id', 'title', 'description', 'status', 'priority',
    'start_time', 'end_time', 'assigned_date', 'created_by', 'assigned_to'];

const pick = (body) => Object.fromEntries(
    FIELDS.filter((f) => body[f] !== undefined).map((f) => [f, body[f] === '' ? null : body[f]]),
);

// GET /task/house/:houseId  작업 목록 조회
router.get('/house/:houseId', async (req, res, next) => {
    try {
        const [rows] = await db.query(
            `SELECT * FROM task WHERE house_id = ?
             ORDER BY assigned_date DESC, start_time ASC`,
            [req.params.houseId],
        );
        res.json(rows);
    } catch (err) { next(err); }
});

// GET /task/:taskId  작업 상세 조회
router.get('/:taskId', async (req, res, next) => {
    try {
        const [rows] = await db.query('SELECT * FROM task WHERE task_id = ?', [req.params.taskId]);
        if (rows.length === 0) return res.status(404).json({ message: '작업을 찾을 수 없습니다.' });
        res.json(rows[0]);
    } catch (err) { next(err); }
});

// POST /task  작업 생성
router.post('/', async (req, res, next) => {
    try {
        const data = pick(req.body);
        if (!data.house_id || !data.title) {
            return res.status(400).json({ message: 'house_id 와 title 은 필수입니다.' });
        }
        const [result] = await db.query('INSERT INTO task SET ?', [data]);
        const [rows] = await db.query('SELECT * FROM task WHERE task_id = ?', [result.insertId]);
        res.status(201).json(rows[0]);
    } catch (err) { next(err); }
});

// PUT /task/:taskId  작업 수정 (보낸 필드만 변경)
router.put('/:taskId', async (req, res, next) => {
    try {
        const data = pick(req.body);
        if (Object.keys(data).length === 0) {
            return res.status(400).json({ message: '수정할 값이 없습니다.' });
        }
        // 완료 상태로 바뀌면 완료 시각 기록, 다른 상태면 비움
        if (data.status) data.completed_at = data.status === 'completed' ? new Date() : null;

        const [result] = await db.query('UPDATE task SET ? WHERE task_id = ?', [data, req.params.taskId]);
        if (result.affectedRows === 0) return res.status(404).json({ message: '작업을 찾을 수 없습니다.' });
        const [rows] = await db.query('SELECT * FROM task WHERE task_id = ?', [req.params.taskId]);
        res.json(rows[0]);
    } catch (err) { next(err); }
});

// DELETE /task/:taskId  작업 삭제
router.delete('/:taskId', async (req, res, next) => {
    try {
        const [result] = await db.query('DELETE FROM task WHERE task_id = ?', [req.params.taskId]);
        if (result.affectedRows === 0) return res.status(404).json({ message: '작업을 찾을 수 없습니다.' });
        res.json({ message: `${req.params.taskId}번 작업이 삭제되었습니다.` });
    } catch (err) { next(err); }
});

module.exports = router;
