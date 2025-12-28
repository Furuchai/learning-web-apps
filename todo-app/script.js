const taskInput = document.getElementById('task-input');
const addBtn    = document.getElementById('add-btn');
const taskList  = document.getElementById('task-list');

/* =========================================
   1. 画面の初期化 (読み込み処理)
   ========================================= */
// ページが開かれた瞬間に実行されます
document.addEventListener('DOMContentLoaded', showTask);

function showTask() {
    // LocalStorageから 'tasks' というキーでデータを取得
    // Pythonの json.loads() に相当するのが JSON.parse() です
    const savedTasks = localStorage.getItem('tasks');

    if (savedTasks) {
        // 保存されたJSON文字列を配列(リスト)に戻す
        const tasksArray = JSON.parse(savedTasks);
        
        // 保存されていたタスクの数だけループして表示
        tasksArray.forEach(function(text) {
            createListElement(text);
        });
    }
}

/* =========================================
   2. データ保存処理
   ========================================= */
function saveData() {
    const tasks = [];
    // 現在画面にあるすべての <li> の中の <span> (タスク文字) を探す
    const spans = taskList.querySelectorAll('span');

    // ループして文字だけを配列に格納
    spans.forEach(function(span) {
        tasks.push(span.textContent);
    });

    // 配列をJSON文字列に変換してLocalStorageに保存
    // Pythonの json.dumps() に相当するのが JSON.stringify() です
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

/* =========================================
   3. 共通: リスト要素を作る関数 (リファクタリング)
   ========================================= */
// 「タスク追加時」と「データ読み込み時」の両方で使うため、処理を切り出しました
function createListElement(text) {
    const li = document.createElement('li');

    const span = document.createElement('span');
    span.textContent = text;
    
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '削除';
    deleteBtn.classList.add('delete-btn');

    deleteBtn.addEventListener('click', function() {
        li.remove();
        // ★重要: 削除した後にも保存して、最新状態を維持する
        saveData();
    });

    li.appendChild(span);
    li.appendChild(deleteBtn);
    taskList.appendChild(li);
}

/* =========================================
   4. ユーザー操作 (入力・追加)
   ========================================= */
function addTask() {
    const taskText = taskInput.value;

    if (taskText === '') {
        alert('タスクを入力してください！');
        return;
    }

    // 画面への要素追加は専用関数にお任せ
    createListElement(taskText);

    // ★重要: 追加した後すぐに保存する
    saveData();

    taskInput.value = '';
}

// イベントリスナー
addBtn.addEventListener('click', addTask);

taskInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        addTask();
    }
});