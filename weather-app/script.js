// 要素の取得
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const currentLocBtn = document.getElementById('current-loc-btn'); // ★追加
const updateBtn = document.getElementById('get-weather-btn');
const cityNameDisplay = document.getElementById('city-name'); // H1タグ

const currentWeatherDiv = document.getElementById('current-weather');
const hourlyForecastDiv = document.getElementById('hourly-forecast');
const dailyForecastDiv  = document.getElementById('daily-forecast');

// ★デフォルト設定 (最初は東京)
let currentLat = 35.6895;
let currentLon = 139.6917;
let currentCityName = "東京";

// 天気コード変換辞書
function getWeatherInfo(code) {
    if (code === 0) return { icon: '☀️', text: '快晴' };
    if (code <= 3)  return { icon: '⛅', text: '晴れ' };
    if (code <= 48) return { icon: '🌫️', text: '霧' };
    if (code <= 57) return { icon: '🌧️', text: '小雨' };
    if (code <= 67) return { icon: '☔', text: '雨' };
    if (code <= 77) return { icon: '🌨️', text: '雪' };
    if (code <= 82) return { icon: '☔', text: '大雨' };
    if (code <= 99) return { icon: '⛈️', text: '雷雨' };
    return { icon: '❓', text: '不明' };
}


// ===============================================
// 機能1: 地名から座標を探す (Geocoding)
// ===============================================
async function searchCity() {
    const city = cityInput.value;
    if (!city) {
        alert("都市名を入力してください");
        return;
    }

    // Geocoding APIのエンドポイント
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=ja&format=json`;

    try {
        const response = await fetch(geoUrl);
        const data = await response.json();

        // 検索結果がない場合
        if (!data.results) {
            alert("都市が見つかりませんでした。\n英語名や、より大きな都市名で試してみてください。");
            return;
        }

        // 一番上の候補を採用
        const result = data.results[0];
        
        // グローバル変数を更新
        currentLat = result.latitude;
        currentLon = result.longitude;

        // ★変更: 詳細な住所情報（県・市・地名）を組み立てる
        // APIの仕様上、admin1(県)などはローマ字で返ることが多いですが、場所の特定には役立ちます。
        const addressParts = [];

        // 1. 都道府県 (admin1)
        if (result.admin1) addressParts.push(result.admin1);
        
        // 2. 市区町村 (admin2)
        if (result.admin2) addressParts.push(result.admin2);
        
        // 3. 地名 (name) 
        // ※「東京」で検索した場合など、admin1とnameが重複することがあるのでチェックします
        if (result.name !== result.admin1 && result.name !== result.admin2) {
            addressParts.push(result.name);
        } else if (addressParts.length === 0) {
            // 万が一admin情報がなく地名しかない場合
            addressParts.push(result.name);
        }

        // 配列をスペース区切りで結合 (例: "Kanagawa Fujisawa 辻堂")
        currentCityName = addressParts.join(' '); 

        // 入力欄をクリア
        cityInput.value = '';

        // 天気を取得しに行く
        getWeather();

    } catch (error) {
        console.error("検索エラー:", error);
        alert("検索中にエラーが発生しました");
    }
}

// ===============================================
// 機能2: 座標から天気を取得する (Main Logic)
// ===============================================
async function getWeather() {
    // 画面のタイトルを更新
    cityNameDisplay.textContent = `${currentCityName}の天気`;
    
    // 読み込み中表示
    currentWeatherDiv.innerHTML = '<div class="loading">データを取得中...</div>';

    // ★URLを動的に生成 (currentLat, currentLon を使用)
    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${currentLat}&longitude=${currentLon}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max&hourly=temperature_2m,weathercode,precipitation_probability&timezone=auto&forecast_days=14`;
    // ※ timezone=auto にすることで、ロンドンならロンドン時間で取得されます

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        // --- 1. 現在の天気 ---
        const current = data.current_weather;
        const weatherInfo = getWeatherInfo(current.weathercode);
        
        // APIから返ってきた時刻はISO形式なのでDateオブジェクトに変換
        const now = new Date();
        const nowString = now.toLocaleString('ja-JP', {
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            weekday: 'short'
        });

        currentWeatherDiv.innerHTML = `
            <div>現在の天気</div>
            <div class="current-date-time">${nowString}</div>
            <div class="weather-icon">${weatherInfo.icon}</div>
            <div class="current-temp">${current.temperature}℃</div>
            <div>${weatherInfo.text}</div>
        `;

        // --- 2. 24時間予報 ---
        hourlyForecastDiv.innerHTML = '';
        const hourly = data.hourly;
        
        // ※注意: APIのtimezone=autoにすると、現地時間の配列が返ってきます。
        // 現在時刻に一番近い時間を探す必要がありますが、簡易的に
        // 「PCの現在時刻の時(hour)」を基準にします。
        const currentHour = new Date().getHours();
        
        // データ取得位置の補正（APIは0時から始まるため）
        // 海外都市の場合、時差があるため正確なマッチングは複雑ですが、
        // 今回は「APIが返した配列の、今の時間以降」を表示する簡易ロジックにします。
        // 厳密には data.hourly.time の中身をパースして現在時刻と比較するのがベストですが、
        // 学習用コードとして「PC時間のインデックス」を使います。
        
        for (let i = currentHour; i < currentHour + 24; i++) {
            // 配列の範囲外チェック
            if (i >= hourly.time.length) break;

            const timeStr = hourly.time[i];
            const temp = hourly.temperature_2m[i];
            const prob = hourly.precipitation_probability[i];
            const code = hourly.weathercode[i];
            const info = getWeatherInfo(code);

            const dateObj = new Date(timeStr);
            const dateLabel = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
            const timeLabel = `${dateObj.getHours()}:00`;

            const div = document.createElement('div');
            div.className = 'hourly-item';
            div.innerHTML = `
                <div class="hourly-time">
                    <span class="hourly-date">${dateLabel}</span>
                    ${timeLabel}
                </div>
                <div class="hourly-icon">${info.icon}</div>
                <div class="hourly-temp">${temp}℃</div>
                <div class="hourly-rain">💧${prob}%</div>
            `;
            hourlyForecastDiv.appendChild(div);
        }

        // --- 3. 14日間予報 ---
        dailyForecastDiv.innerHTML = '';
        const daily = data.daily;

        for (let i = 0; i < daily.time.length; i++) {
            const dateStr = daily.time[i];
            const maxTemp = daily.temperature_2m_max[i];
            const minTemp = daily.temperature_2m_min[i];
            const probMax = daily.precipitation_probability_max[i];
            const code = daily.weathercode[i];
            const info = getWeatherInfo(code);

            const dateObj = new Date(dateStr);
            const dateLabel = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
            const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][dateObj.getDay()];

            const isToday = (i === 0);
            const dateStyle = isToday ? 'color:blue; text-decoration:underline;' : '';
            const dayText = isToday ? '(今日)' : `(${dayOfWeek})`;

            const div = document.createElement('div');
            div.className = 'daily-row';
            
            div.innerHTML = `
                <div class="daily-date" style="${dateStyle}">
                    ${dateLabel} <span style="font-size:0.8em; color:#666;">${dayText}</span>
                </div>
                <div class="daily-icon">${info.icon}</div>
                <div class="daily-rain">💧${probMax}%</div>
                <div class="daily-temp">
                    <span class="max-temp">${maxTemp}℃</span> / 
                    <span class="min-temp">${minTemp}℃</span>
                </div>
            `;
            dailyForecastDiv.appendChild(div);
        }

    } catch (error) {
        console.error(error);
        currentWeatherDiv.innerHTML = 'データの取得に失敗しました。';
    }
}

// ===============================================
// イベント設定
// ===============================================

// 1. ページ読み込み時に、デフォルト(東京)の天気を取得
document.addEventListener('DOMContentLoaded', getWeather);

// 2. 検索ボタンクリック時
searchBtn.addEventListener('click', searchCity);

// 3. 更新ボタンクリック時
updateBtn.addEventListener('click', getWeather);

// 4. 入力欄でEnterキーを押した時にも検索実行
cityInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        searchCity();
    }
});
// 5. 現在地ボタンクリック時
currentLocBtn.addEventListener('click', function() {
    // ブラウザがGeolocation APIに対応しているかチェック
    if (!navigator.geolocation) {
        alert("お使いのブラウザは位置情報に対応していません。");
        return;
    }

    // ロード中表示
    currentCityName = "現在地";
    cityNameDisplay.textContent = "現在地を取得中...";
    currentWeatherDiv.innerHTML = '<div class="loading">GPS測位中...</div>';

    // 位置情報の取得を実行
    navigator.geolocation.getCurrentPosition(
        // 成功時の処理
        (position) => {
            currentLat = position.coords.latitude;
            currentLon = position.coords.longitude;
            
            // 天気を更新
            getWeather();
        },
        // エラー時の処理
        (error) => {
            console.error("GPSエラー:", error);
            alert("現在地を取得できませんでした。\nブラウザの位置情報許可を確認してください。");
            // エラー時は表示を戻すなどの処理を入れても良いですが、今回は簡易的にアラートのみ
            cityNameDisplay.textContent = "位置情報の取得失敗";
            currentWeatherDiv.innerHTML = "";
        }
    );
});