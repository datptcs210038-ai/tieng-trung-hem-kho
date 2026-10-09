(function () {
  'use strict';
  const app = window.TTHK;
  if (!app) return;
  const STORAGE_VOICE = 'tthk_voice_v3';
  const STORAGE_SPEED = 'tthk_speech_speed_v3';
  const ss = window.speechSynthesis;
  let candidates = [];
  let selected = localStorage.getItem(STORAGE_VOICE) || '';
  let speed = Number(localStorage.getItem(STORAGE_SPEED)) || 0.9;
  let status = null;

  function isMandarin(voice) {
    const lang = (voice.lang || '').toLowerCase().replace(/_/g, '-');
    return lang === 'zh-cn' || lang === 'zh-hans' || lang.startsWith('zh-hans-') || lang === 'cmn' || lang.startsWith('cmn-');
  }
  function rank(voice) {
    const name = (voice.name || '').toLowerCase();
    let score = 0;
    if (/natural|neural|premium|enhanced|online/.test(name)) score += 110;
    if (/xiaoxiao|xiaohan|xiaoyi|ting.?ting|google.*(普通话|mandarin|chinese)/.test(name)) score += 60;
    if (/yuxi|yunxi|yunjian|li.?mu/.test(name)) score += 25;
    if (/microsoft|google|apple/.test(name)) score += 8;
    if (/female|woman|nữ/.test(name)) score += 3;
    return score;
  }
  function refreshVoices() {
    candidates = ss ? ss.getVoices().filter(isMandarin).sort((a, b) => rank(b) - rank(a) || a.name.localeCompare(b.name)) : [];
    const select = document.getElementById('speechVoice');
    if (!select) return;
    const previous = selected;
    select.replaceChildren();
    const automatic = new Option('✨ Tự chọn giọng rõ nhất', 'auto');
    select.add(automatic);
    for (const voice of candidates) select.add(new Option(voice.name + ' · ' + voice.lang, voice.voiceURI));
    select.value = previous && candidates.some(v => v.voiceURI === previous) ? previous : 'auto';
    if (status) status.textContent = candidates.length
      ? 'Có ' + candidates.length + ' giọng Quan thoại trên trình duyệt này. Giọng tự nhiên phụ thuộc thiết bị.'
      : 'Trình duyệt chưa cung cấp giọng Quan thoại riêng. Hệ thống sẽ yêu cầu giọng zh-CN mặc định.';
  }
  function currentVoice() {
    return candidates.find(v => v.voiceURI === selected) || candidates[0] || null;
  }
  app.speak = function (text) {
    if (!ss || !window.SpeechSynthesisUtterance) {
      if (status) status.textContent = 'Thiết bị không hỗ trợ phát âm trực tiếp.';
      return;
    }
    const chinese = String(text || '').trim().slice(0, 180);
    if (!chinese) return;
    ss.cancel();
    const utterance = new SpeechSynthesisUtterance(chinese);
    utterance.lang = 'zh-CN';
    utterance.rate = speed;
    utterance.pitch = 1;
    utterance.volume = 1;
    const voice = currentVoice();
    if (voice) utterance.voice = voice;
    utterance.onerror = e => {
      if (e.error !== 'interrupted' && e.error !== 'canceled' && status)
        status.textContent = 'Chưa phát được giọng đọc. Bạn hãy đổi giọng hoặc thử trình duyệt khác.';
    };
    ss.speak(utterance);
  };
  function setup() {
    const section = document.getElementById('vocab');
    if (!section) return;
    const panel = document.createElement('div');
    panel.className = 'box';
    panel.id = 'speechPanel';
    panel.style.marginBottom = '16px';
    panel.innerHTML = '<h3 style="margin:0 0 8px">🎙️ Giọng đọc tiếng Trung</h3>'
      + '<p class="muted" style="margin:0 0 10px">Chọn giọng Quan thoại tự nhiên và tốc độ phù hợp để luyện nghe.</p>'
      + '<div class="row"><label for="speechVoice">Giọng đọc</label><select id="speechVoice" style="max-width:100%;min-width:220px"></select>'
      + '<label for="speechSpeed">Tốc độ</label><select id="speechSpeed"><option value="0.75">Chậm · 0.75×</option><option value="0.9">Vừa · 0.9×</option><option value="1">Bình thường · 1×</option></select>'
      + '<button type="button" class="btn soft" id="speechTest">🔊 Nghe thử 你好</button></div>'
      + '<p class="muted" id="speechStatus" style="font-size:12px;margin-bottom:0" role="status"></p>';
    const grid = document.getElementById('wordGrid');
    if (grid) section.insertBefore(panel, grid);
    else section.appendChild(panel);
    status = document.getElementById('speechStatus');
    const v = document.getElementById('speechVoice');
    const rateSelect = document.getElementById('speechSpeed');
    rateSelect.value = String([.75,.9,1].includes(speed) ? speed : .9);
    rateSelect.onchange = () => {
      speed = Number(rateSelect.value);
      localStorage.setItem(STORAGE_SPEED, String(speed));
    };
    v.onchange = () => {
      selected = v.value === 'auto' ? '' : v.value;
      if (selected) localStorage.setItem(STORAGE_VOICE, selected);
      else localStorage.removeItem(STORAGE_VOICE);
    };
    document.getElementById('speechTest').onclick = () => app.speak('你好');
    refreshVoices();
    if (ss && typeof ss.addEventListener === 'function') ss.addEventListener('voiceschanged', refreshVoices);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup, { once: true });
  else setup();
}());