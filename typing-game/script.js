// --- 1. 準備: 要素の取得 ---
const word = document.getElementById('word');
const text = document.getElementById('text');
const scoreEl = document.getElementById('score');
const timeEl = document.getElementById('time');
const endGameEl = document.getElementById('end-game-container');
const finalScoreEl = document.getElementById('final-score');
const highScoreEl = document.getElementById('high-score');
const highScoreDateEl = document.getElementById('high-score-date');

// ★単語リストの拡張（難易度別に少し増やしました）
const words = [
    // Web Basics
    'html', 'css', 'javascript', 'react', 'node',
    // Programming Terms
    'variable', 'function', 'constant', 'array', 'object',
    'loop', 'condition', 'argument', 'parameter', 'return',
    // Hardware & Environment
    'monitor', 'keyboard', 'mouse', 'processor', 'memory',
    'graphics', 'network', 'server', 'database', 'cloud',
    'windows', 'linux', 'python', 'terminal', 'command',
    // Action
    'compile', 'execute', 'debug', 'deploy', 'version',
    'commit', 'push', 'pull', 'merge', 'branch'
];

let score = 0;
let time = 60;
let timeInterval;

// --- 2. 初期化: ハイスコアの読み込み ---
// ローカルストレージからデータを取得。なければ初期値を作成。
let highScoreData = JSON.parse(localStorage.getItem('typingGameHighScore')) || { score: 0, date: '---' };

// 画面にハイスコアを表示
highScoreEl.innerText = highScoreData.score;
highScoreDateEl.innerText = `(${highScoreData.date})`;

// --- 3. 機能: オーディオ（効果音）の生成 ---
// Web Audio APIを使って、ブラウザ内で音を作ります（外部ファイル不要！）
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    const oscillator = audioCtx.createOscillator(); // 音の波を作る装置
    const gainNode = audioCtx.createGain(); // 音量を調整する装置

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    if (type === 'correct') {
        // 正解音: 高い音（Sine波）を短く
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, audioCtx.currentTime); // 800Hz
        oscillator.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1);
    } else if (type === 'wrong') {
        // 不正解音: 低い音（Sawtooth波）でブブッ
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(150, audioCtx.currentTime); // 150Hz
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.2);
    }
}

// --- 4. ゲームロジック ---

function addWordToDOM() {
    const randomWord = words[Math.floor(Math.random() * words.length)];
    word.innerText = randomWord;
}

function updateScore() {
    score++;
    scoreEl.innerText = score;
}

function updateTime() {
    time--;
    timeEl.innerText = time;

    if (time === 0) {
        clearInterval(timeInterval);
        gameOver();
    }
}

function gameOver() {
    endGameEl.classList.remove('hidden');
    finalScoreEl.innerText = score;

    // ★ハイスコア更新判定
    if (score > highScoreData.score) {
        const today = new Date().toLocaleDateString('ja-JP'); // 今日の日付
        highScoreData = { score: score, date: today };
        
        // ローカルストレージに保存（文字列にして保存する必要がある）
        localStorage.setItem('typingGameHighScore', JSON.stringify(highScoreData));
        
        // 画面更新
        highScoreEl.innerText = highScoreData.score;
        highScoreDateEl.innerText = `(${highScoreData.date})`;
        
        alert(`New High Score! 🎉\nScore: ${score}`);
    }
}

// --- 5. イベントリスナー（変更点） ---

// ★変更: 'input'ではなく'keydown'を使う
text.addEventListener('keydown', (e) => {
    // Enterキーが押された時だけ判定する
    if (e.key === 'Enter') {
        const insertedText = e.target.value;

        if (insertedText === word.innerText) {
            // 正解
            playSound('correct'); // ピロン♪
            addWordToDOM();
            updateScore();
            e.target.value = '';
        } else {
            // 不正解（オプション：間違えたら入力欄をクリアせず、音だけ鳴らす）
            playSound('wrong'); // ブブー
            // e.target.value = ''; // 難易度を上げたい場合は、ここを有効にして入力を消す
        }
    }
});

// ゲーム開始
addWordToDOM();
timeInterval = setInterval(updateTime, 1000);
text.focus();

// ブラウザの仕様上、ユーザーが何か操作しないと音が出ない場合があるため、
// 最初の入力フォーカス時にAudioContextを再開するおまじない
text.addEventListener('focus', () => {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
});