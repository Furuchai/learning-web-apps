/* =========================================
   1. HTMLの要素を取得する (Pythonの変数定義に近い)
   ========================================= */
// document.getElementById('ID名')
// → HTMLの中から特定のIDを持つ要素を探して、変数に入れます。
const taskInput = document.getElementById('task-input'); // 入力欄
const addBtn    = document.getElementById('add-btn');    // 追加ボタン
const taskList  = document.getElementById('task-list');  // リストの親要素(<ul>)

/* =========================================
   2. 関数を定義する (Pythonの def に相当)
   ========================================= */
function addTask() {
    const taskText = taskInput.value;

    if (taskText === '') {
        alert('タスクを入力してください！');
        return;
    }

    // 1. liタグ（外枠）を作成
    const li = document.createElement('li');

    // 2. タスクの文字を入れる spanタグ を作成
    // (直接 li.textContent に文字を入れると、後でボタンを入れた時に管理しにくくなるため)
    const span = document.createElement('span');
    span.textContent = taskText;
    
    // 3. 削除ボタンを作成
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '削除';
    deleteBtn.classList.add('delete-btn'); // CSSでデザインするためのクラス

    // ★ここがポイント：削除ボタンに「クリックされたら親(li)を消す」機能をつける
    deleteBtn.addEventListener('click', function() {
        // Pythonでいう "del list[i]" や "list.remove(item)"
        // このボタン(deleteBtn)が所属している親要素(li)ごと削除します
        li.remove();
    });

    // 4. liの中に、spanとボタンを入れる（合体）
    li.appendChild(span);
    li.appendChild(deleteBtn);

    // 5. リスト全体(ul)に、完成したliを追加
    taskList.appendChild(li);

    taskInput.value = '';
}

/* =========================================
   3. イベントリスナーを設定する
   ========================================= */
// ボタンが 'click' されたら、addTask関数を実行する
// 注意: addTask() ではなく addTask と書きます（()をつけると即実行されてしまうため）
addBtn.addEventListener('click', addTask);

/* =========================================
   4. Enterキーでの追加機能
   ========================================= */
// 入力欄でキーボードが押されたタイミングを監視します
taskInput.addEventListener('keydown', function(event) {
    // 押されたキーが 'Enter' かどうかをチェック
    if (event.key === 'Enter') {
        addTask();
    }
});