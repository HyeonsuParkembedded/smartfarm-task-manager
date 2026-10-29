// 과제 문서의 예시 요청을 그대로 보내 CRUD 동작 확인   실행: node api-test.js (서버 실행 중일 때)
const assert = require('assert');
const BASE = process.env.BASE_URL || 'http://localhost:3000';

async function req(method, path, body) {
    const res = await fetch(BASE + path, {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : {},
        body: body && JSON.stringify(body),
    });
    const data = await res.json();
    const short = Array.isArray(data) ? `[${data.length}건] ` + data.map((t) => `#${t.task_id} ${t.title}`).join(', ')
        : data.task_id ? `#${data.task_id} ${data.title} / ${data.status} / ${data.description}` : JSON.stringify(data);
    console.log(`▶ ${method} ${path}${body ? '  ' + JSON.stringify(body) : ''}`);
    console.log(`  ← ${res.status}  ${short}\n`);
    return { status: res.status, data };
}

(async () => {
    let r = await req('POST', '/task', {
        house_id: 11, title: '새로운 작업', description: '작업 설명',
        status: 'pending', priority: 'medium', created_by: 1, assigned_to: 1,
    });
    assert.strictEqual(r.status, 201);
    const id = r.data.task_id;

    r = await req('GET', '/task/house/11');
    assert.ok(r.data.some((t) => t.task_id === id));

    r = await req('GET', `/task/${id}`);
    assert.strictEqual(r.data.title, '새로운 작업');

    r = await req('PUT', `/task/${id}`, { title: '수정된 작업 제목', status: 'completed', description: '수정된 설명' });
    assert.strictEqual(r.data.status, 'completed');
    assert.ok(r.data.completed_at, 'completed_at 기록');

    r = await req('POST', '/task', { house_id: 99, title: '없는 하우스' });
    assert.strictEqual(r.status, 400);

    r = await req('DELETE', `/task/${id}`);
    assert.strictEqual(r.status, 200);

    r = await req('GET', `/task/${id}`);
    assert.strictEqual(r.status, 404);

    console.log('✔ CRUD API 테스트 통과 (생성 / 목록 / 상세 / 수정 / 삭제 / 400 / 404)');
})();
