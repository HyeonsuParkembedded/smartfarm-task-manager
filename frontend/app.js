const STATUS = { pending: '대기', in_progress: '진행중', completed: '완료', cancelled: '취소' };
const PRIORITY = { low: '낮음', medium: '보통', high: '높음', urgent: '긴급' };

let currentHouse = 11;
let editingId = null;   // null 이면 생성, 숫자면 수정
let deletingId = null;

const $ = (id) => document.getElementById(id);
const form = $('taskForm');

async function api(method, url, body) {
    const res = await fetch(url, {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : {},
        body: body && JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
}

function toast(msg, isError = false) {
    const t = $('toast');
    t.textContent = msg;
    t.className = `toast show ${isError ? 'error' : ''}`;
    setTimeout(() => (t.className = 'toast'), 2000);
}

const cell = (text, cls) => {
    const td = document.createElement('td');
    td.textContent = text ?? '';
    if (cls) td.className = cls;
    return td;
};

// ---------- Read: 하우스별 작업 목록 ----------
async function loadTasks() {
    const tasks = await api('GET', `/task/house/${currentHouse}`);
    const body = $('taskBody');
    body.innerHTML = '';
    $('empty').classList.toggle('hidden', tasks.length > 0);

    tasks.forEach((t) => {
        const tr = document.createElement('tr');
        const titleTd = cell('');
        titleTd.innerHTML = '<b></b><small></small>';
        titleTd.querySelector('b').textContent = t.title;
        titleTd.querySelector('small').textContent = t.description ?? '';

        const status = cell(STATUS[t.status]);
        status.innerHTML = `<span class="badge ${t.status}">${STATUS[t.status]}</span>`;
        const priority = cell('');
        priority.innerHTML = `<span class="pri ${t.priority}">${PRIORITY[t.priority]}</span>`;

        const time = [t.start_time, t.end_time].filter(Boolean).map((s) => s.slice(0, 5)).join(' ~ ');
        const actions = cell('', 'btns');
        actions.innerHTML = '<button class="edit">수정</button><button class="del">삭제</button>';
        actions.querySelector('.edit').onclick = () => openForm(t.task_id);
        actions.querySelector('.del').onclick = () => openDelete(t);

        tr.append(cell(t.task_id), titleTd, status, priority, cell(time), cell(t.assigned_date), actions);
        body.appendChild(tr);
    });
}

// ---------- Create / Update: 모달 폼 ----------
async function openForm(taskId = null) {
    editingId = taskId;
    form.reset();
    $('formTitle').textContent = taskId ? `${taskId}번 작업 수정` : '새 작업 등록';
    if (taskId) {
        const t = await api('GET', `/task/${taskId}`);   // 상세 조회로 기존 값 채우기
        for (const el of form.elements) {
            if (el.name && t[el.name] != null) el.value = el.name.endsWith('_time') ? t[el.name].slice(0, 5) : t[el.name];
        }
    }
    $('formModal').classList.remove('hidden');
    form.elements.title.focus();
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    try {
        if (editingId) {
            await api('PUT', `/task/${editingId}`, data);
            toast('작업이 수정되었습니다.');
        } else {
            await api('POST', '/task', { ...data, house_id: currentHouse, created_by: 1, assigned_to: 1 });
            toast('새 작업이 등록되었습니다.');
        }
        closeModals();
        loadTasks();
    } catch (err) {
        toast(err.message, true);
    }
});

// ---------- Delete: 확인 후 삭제 ----------
function openDelete(task) {
    deletingId = task.task_id;
    $('deleteText').textContent = `"${task.title}" 작업을 삭제할까요? 삭제한 작업은 되돌릴 수 없습니다.`;
    $('deleteModal').classList.remove('hidden');
}

$('confirmDelete').addEventListener('click', async () => {
    try {
        await api('DELETE', `/task/${deletingId}`);
        toast('작업이 삭제되었습니다.');
        closeModals();
        loadTasks();
    } catch (err) {
        toast(err.message, true);
    }
});

function closeModals() {
    document.querySelectorAll('.modal').forEach((m) => m.classList.add('hidden'));
}
document.querySelectorAll('.cancel').forEach((b) => (b.onclick = closeModals));

$('newBtn').onclick = () => openForm();
document.querySelectorAll('#houseTabs button').forEach((b) => {
    b.onclick = () => {
        currentHouse = Number(b.dataset.house);
        document.querySelectorAll('#houseTabs button').forEach((x) => x.classList.toggle('active', x === b));
        loadTasks();
    };
});

loadTasks().catch((err) => toast(`목록을 불러오지 못했습니다: ${err.message}`, true));
