const taskInput = document.getElementById('task-input');
const addBtn    = document.getElementById('add-btn');
const taskList  = document.getElementById('task-list');

/* =========================================
   1. 画面の初期化 (読み込み処理)
   ========================================= */
document.addEventListener('DOMContentLoaded', showTask);

function showTask() {
    const savedTasks = localStorage.getItem('tasks');

    if (savedTasks) {
        // ここで保存された「オブジェクトのリスト」を復元します
        const tasksArray = JSON.parse(savedTasks);

        // 旧データ(ただの文字列配列)が残っている場合のエラー回避
        // (学習中にデータ構造を変えたため、念の為のチェックです)
        if (tasksArray.length > 0 && typeof tasksArray[0] === 'string') {
            console.log("古いデータ形式を検知しました。一度クリアします。");
            localStorage.removeItem('tasks');
            return;
        }

        tasksArray.forEach(function(taskObj) {
            // taskObj は { text: "...", date: "...", completed: true/false }
            createListElement(taskObj);
        });
    }
}

/* =========================================
   2. データ保存処理 (オブジェクトとして保存)
   ========================================= */
function saveData() {
    const tasks = [];
    const listItems = taskList.querySelectorAll('li');

    // 画面のリストを1つずつ見て、情報をオブジェクトにまとめ直す
    listItems.forEach(function(li) {
        const text = li.querySelector('.task-text').textContent;
        const date = li.querySelector('.date-span').textContent;
        // classList.contains は Pythonの "completed" in list と同じ
        const isCompleted = li.querySelector('.task-text').classList.contains('completed');

        // オブジェクト(辞書)を作成
        const taskObj = {
            text: text,
            date: date,
            completed: isCompleted
        };

        tasks.push(taskObj);
    });

    localStorage.setItem('tasks', JSON.stringify(tasks));
}

/* =========================================
   3. 共通: リスト要素を作る関数
   ========================================= */
// 引数 taskObj を受け取るように変更
function createListElement(taskObj) {
    const li = document.createElement('li');

    // 1. タスクの文字
    const span = document.createElement('span');
    span.textContent = taskObj.text;
    span.classList.add('task-text'); // 識別用のクラス
    
    // もし完了状態(true)なら、最初から線を引くクラスをつけておく
    if (taskObj.completed) {
        span.classList.add('completed');
    }

    // ★重要: 文字をクリックしたら完了/未完了を切り替える
    span.addEventListener('click', function() {
        // toggle: クラスがあれば消す、なければ付ける
        span.classList.toggle('completed');
        saveData(); // 状態が変わったので保存
    });

    // 2. 日付表示
    const dateSpan = document.createElement('span');
    dateSpan.textContent = taskObj.date;
    dateSpan.classList.add('date-span');

    // 3. 削除ボタン
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '削除';
    deleteBtn.classList.add('delete-btn');
    deleteBtn.addEventListener('click', function() {
        li.remove();
        saveData();
    });

    // 合体 (順番: 文字 -> 日付 -> ボタン)
    li.appendChild(span);
    li.appendChild(dateSpan);
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

    // 現在時刻を取得してフォーマット (例: 2023/12/28 18:30)
    const now = new Date();
    const dateString = now.toLocaleString('ja-JP', {
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
    });

    // 新しいタスクのオブジェクトを作成
    const newTaskObj = {
        text: taskText,
        date: dateString,
        completed: false // 最初は未完了
    };

    createListElement(newTaskObj);
    saveData();
    taskInput.value = '';
}

// イベントリスナー
addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') addTask();
});