// --- 1. 準備: HTMLの要素を取得 ---
// document.getElementById は、HTMLの id を使って要素を特定します
const word = document.getElementById('word');
const text = document.getElementById('text');
const scoreEl = document.getElementById('score');
const timeEl = document.getElementById('time');
const endGameEl = document.getElementById('end-game-container');
const finalScoreEl = document.getElementById('final-score');

// 出題する単語のリスト（Pythonのリストと同じです）
const words = [
    'python', 'javascript', 'html', 'css', 'react',
    'angular', 'window', 'monitor', 'keyboard', 'developer',
    'code', 'bug', 'debug', 'stack', 'overflow'
];

// ゲームの状態を管理する変数
let score = 0;
let time = 60; // 制限時間（秒）
let timeInterval; // タイマーのIDを入れる変数（後で止めるために必要）

// --- 2. 機能: ゲームの動作を定義 ---

// ランダムな単語を選んでDOM（画面）に表示する関数
function addWordToDOM() {
    // Math.random() でランダムな数字を作り、リストの長さ掛け算してインデックスを決める
    const randomWord = words[Math.floor(Math.random() * words.length)];
    word.innerText = randomWord; // 画面の文字を書き換える
}

// スコアを更新する関数
function updateScore() {
    score++; // スコアを1増やす
    scoreEl.innerText = score; // 画面のスコア表示を更新
}

// タイマーを動かす関数（1秒ごとに呼ばれる）
function updateTime() {
    time--; // 時間を1減らす
    timeEl.innerText = time; // 画面の時間表示を更新

    if (time === 0) {
        clearInterval(timeInterval); // タイマーを止める
        gameOver(); // ゲーム終了処理へ
    }
}

// ゲームオーバー時の処理
function gameOver() {
    // 終了画面を表示（CSSの 'hidden' クラスを外すことで表示させる）
    endGameEl.classList.remove('hidden');
    
    // 最終スコアを表示
    finalScoreEl.innerText = score;
}

// --- 3. 監視: イベントリスナー ---

// 入力欄に文字が打たれるたびに実行される処理
text.addEventListener('input', (e) => {
    const insertedText = e.target.value; // ユーザーが打った文字

    // 画面の単語と、打った文字が完全に一致したら...
    if (insertedText === word.innerText) {
        addWordToDOM();  // 次の単語を表示
        updateScore();   // スコアを加算
        e.target.value = ''; // 入力欄を空っぽにする
    }
});

// --- ゲーム開始 ---
// 最初に1回、単語を表示する
addWordToDOM();

// 1000ミリ秒（1秒）ごとに updateTime 関数を実行するタイマーをセット
// Pythonでいう schedule や time.sleep ループのようなものです
timeInterval = setInterval(updateTime, 1000);

// 入力欄に最初からカーソルを当てておく（ユーザーがクリックしなくて済むように）
text.focus();