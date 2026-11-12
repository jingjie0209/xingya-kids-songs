(() => {
  'use strict';

  const allSongs = window.SONGS || [];
  const AUDIO_BASE = 'https://raw.githubusercontent.com/jingjie0209/xingya-kids-songs/main/';
  const allCategories = window.SONG_CATEGORIES || [];
  const tabs = [
    { id: 'songs', name: '儿歌', icon: 'music' },
    { id: 'animation', name: '动画片熏听', icon: 'globe' },
    { id: 'talk', name: '见物能聊', icon: 'hand' },
    { id: 'library', name: '资料库', icon: 'globe' },
  ];
  const tabCategoryGroups = {
    animation: [
      'wow-yellow', 'wow-blue', 'wow-red', 'wow-green', 'wow-orange',
      'wow-bronze', 'wow-silver', 'wow-gold', 'guli', 'vocab-town',
      'littlefox-1-tire-town', 'littlefox-1-dino-buddies', 'littlefox-1-bat-and-friends',
      'littlefox-1-big-green-forest',
      'littlefox-2-bird-and-kip', 'littlefox-2-wacky-ricky',
      'littlefox-3-wizard-and-cat', 'littlefox-3-cinderella', 'littlefox-3-wind-in-the-willows',
      'peppa-1', 'peppa-2', 'peppa-3', 'peppa-4', 'peppa-5',
    ],
    talk: ['talk'],
  };
  const animationGroups = [
    { id: 'animation-wow', name: 'Wow English', categoryPrefixes: ['wow-'], icon: 'globe', color: '#d98543' },
    { id: 'animation-littlefox', name: 'Little Fox', categoryPrefixes: ['littlefox-'], icon: 'abc', color: '#4f8ccc' },
    { id: 'animation-peppa', name: '小猪佩奇', categoryPrefixes: ['peppa-'], icon: 'hand', color: '#dc7f9b' },
    { id: 'animation-guli', name: '古力小超人', categoryPrefixes: ['guli'], icon: 'globe', color: '#7b88c7' },
    { id: 'animation-vocab-town', name: '词汇妙趣国', categoryPrefixes: ['vocab-town'], icon: 'abc', color: '#57a59a' },
  ];
  const littleFoxSeries = [
    { id: 'littlefox-1-tire-town', level: 'littlefox-1', name: 'Tire Town School', icon: 'bus', color: '#d98543' },
    { id: 'littlefox-1-dino-buddies', level: 'littlefox-1', name: 'Dino Buddies', icon: 'paw', color: '#5d9a72' },
    { id: 'littlefox-1-bat-and-friends', level: 'littlefox-1', name: 'Bat and Friends', icon: 'hand', color: '#7d6bb0' },
    { id: 'littlefox-1-big-green-forest', level: 'littlefox-1', name: 'The Big Green Forest', icon: 'paw', color: '#5d9a72' },
    { id: 'littlefox-2-bird-and-kip', level: 'littlefox-2', name: 'Bird and Kip', icon: 'paw', color: '#5d9a72' },
    { id: 'littlefox-2-wacky-ricky', level: 'littlefox-2', name: 'Wacky Ricky', icon: 'smile', color: '#b575c5' },
    { id: 'littlefox-3-wizard-and-cat', level: 'littlefox-3', name: 'Wizard and Cat', icon: 'puzzle', color: '#7d6bb0' },
    { id: 'littlefox-3-cinderella', level: 'littlefox-3', name: 'Cinderella', icon: 'smile', color: '#dc7f9b' },
    { id: 'littlefox-3-wind-in-the-willows', level: 'littlefox-3', name: 'The Wind in the Willows', icon: 'globe', color: '#5d9a72' },
  ];
  const peppaSeasons = [
    { id: 'peppa-1', season: 'peppa-1', name: '小猪佩奇 第1季', subtitle: '小猪佩奇 · 第1季', icon: 'hand', color: '#dc7f9b' },
    { id: 'peppa-2', season: 'peppa-2', name: '小猪佩奇 第2季', subtitle: '小猪佩奇 · 第2季', icon: 'hand', color: '#e88966' },
    { id: 'peppa-3', season: 'peppa-3', name: '小猪佩奇 第3季', subtitle: '小猪佩奇 · 第3季', icon: 'hand', color: '#e2a74f' },
    { id: 'peppa-4', season: 'peppa-4', name: '小猪佩奇 第4季', subtitle: '小猪佩奇 · 第4季', icon: 'hand', color: '#7a9fca' },
    { id: 'peppa-5', season: 'peppa-5', name: '小猪佩奇 第5季', subtitle: '小猪佩奇 · 第5季', icon: 'hand', color: '#8d83c9' },
  ];
  const collectionTabIds = new Set(['songs', 'animation', 'talk']);
  const resourceLinks = [
    {
      title: 'Susan句型理论',
      note: '核心句型与语法学习笔记',
      icon: 'abc',
      url: 'https://jingjie0209.github.io/susan-grammar-study-notes/index.html?series=B#core-notes',
    },
    {
      title: '动画主题覆盖',
      note: '动画主题与分级覆盖查询',
      icon: 'globe',
      url: 'https://jingjie0209.github.io/yakka-dee-theme-map/?v=1794292843012',
    },
  ];
  let activeTab = 'songs';
  let playerExpanded = false;
  let songs = [];
  let categories = [];
  const songById = new Map(allSongs.map((song) => [song.id, song]));
  const categoryById = new Map(allCategories.map((category) => [category.id, category]));
  const audio = document.getElementById('audio');

  const STORAGE = {
    counts: 'xingya-play-counts-v2',
    daily: 'xingya-daily-stats-v2',
    current: 'xingya-current-song-v2',
    mode: 'xingya-play-mode-v2',
    volume: 'xingya-volume-v2',
    muted: 'xingya-muted-v2',
  };

  const MODES = {
    sequence: { label: '顺序', aria: '顺序播放', icon: 'order' },
    repeat: { label: '单曲', aria: '单曲循环', icon: 'repeat-one' },
    shuffle: { label: '随机', aria: '随机播放', icon: 'shuffle' },
  };
  const MODE_ORDER = ['sequence', 'repeat', 'shuffle'];

  const els = {
    playlistGroups: document.getElementById('playlistGroups'),
    filterRow: document.getElementById('filterRow'),
    libraryHead: document.querySelector('.library-head'),
    heroCover: document.getElementById('heroCover'),
    heroCategoryIcon: document.getElementById('heroCategoryIcon'),
    heroCategoryName: document.getElementById('heroCategoryName'),
    heroSongTitle: document.getElementById('heroSongTitle'),
    heroSongZh: document.getElementById('heroSongZh'),
    heroPlayButton: document.getElementById('heroPlayButton'),
    heroPlayLabel: document.getElementById('heroPlayLabel'),
    playAllButton: document.getElementById('playAllButton'),
    playAllLabel: document.getElementById('playAllLabel'),
    heroTotalDuration: document.getElementById('heroTotalDuration'),
    heroTodayDuration: document.getElementById('heroTodayDuration'),
    headerTodayDuration: document.getElementById('headerTodayDuration'),
    playerDock: document.getElementById('playerDock'),
    miniPlayerButton: document.getElementById('miniPlayerButton'),
    miniPlayerDisc: document.getElementById('miniPlayerDisc'),
    miniPlayerIcon: document.getElementById('miniPlayerIcon'),
    dockCover: document.getElementById('dockCover'),
    dockCategoryIcon: document.getElementById('dockCategoryIcon'),
    dockTitle: document.getElementById('dockTitle'),
    dockSubtitle: document.getElementById('dockSubtitle'),
    dockPlayButton: document.getElementById('dockPlayButton'),
    dockPlayIcon: document.getElementById('dockPlayIcon'),
    prevButton: document.getElementById('prevButton'),
    nextButton: document.getElementById('nextButton'),
    progressSlider: document.getElementById('progressSlider'),
    currentTime: document.getElementById('currentTime'),
    durationTime: document.getElementById('durationTime'),
    modeButton: document.getElementById('modeButton'),
    modeIcon: document.getElementById('modeIcon'),
    modeLabel: document.getElementById('modeLabel'),
    volumeButton: document.getElementById('volumeButton'),
    volumeIcon: document.getElementById('volumeIcon'),
    volumeSlider: document.getElementById('volumeSlider'),
    reportButton: document.getElementById('reportButton'),
    statsDialog: document.getElementById('statsDialog'),
    closeStatsButton: document.getElementById('closeStatsButton'),
    statsDate: document.getElementById('statsDate'),
    todayDurationLarge: document.getElementById('todayDurationLarge'),
    todayDurationDetail: document.getElementById('todayDurationDetail'),
    todayPlayCount: document.getElementById('todayPlayCount'),
    topSongTitle: document.getElementById('topSongTitle'),
    topSongCount: document.getElementById('topSongCount'),
    totalPlayCount: document.getElementById('totalPlayCount'),
    songReportList: document.getElementById('songReportList'),
    resetStatsButton: document.getElementById('resetStatsButton'),
    installDialog: document.getElementById('installDialog'),
    closeInstallButton: document.getElementById('closeInstallButton'),
    installConfirmButton: document.getElementById('installConfirmButton'),
    toast: document.getElementById('toast'),
    tabBar: document.getElementById('tabBar'),
  };

  function readJSON(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      // The player remains usable even when private browsing blocks storage.
    }
  }

  function dayKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function createDailyStats() {
    return {
      date: dayKey(),
      totalMs: 0,
      perSongMs: {},
      playCounts: {},
    };
  }

  function normalizeCounts(value) {
    const counts = {};
    if (!value || typeof value !== 'object') return counts;
    for (const song of allSongs) {
      const count = Number(value[song.id]);
      counts[song.id] = Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;
    }
    return counts;
  }

  function normalizeDaily(value) {
    if (!value || value.date !== dayKey()) return createDailyStats();
    return {
      date: value.date,
      totalMs: Math.max(0, Number(value.totalMs) || 0),
      perSongMs: value.perSongMs && typeof value.perSongMs === 'object' ? value.perSongMs : {},
      playCounts: value.playCounts && typeof value.playCounts === 'object' ? value.playCounts : {},
    };
  }

  // The first release used v1 storage keys. Read them as a fallback so an
  // upgrade to the expanded playlist never erases existing listening history.
  function storedValue(key, legacyKey) {
    const value = localStorage.getItem(key);
    return value !== null ? value : legacyKey ? localStorage.getItem(legacyKey) : null;
  }

  let playCounts = normalizeCounts(readJSON(STORAGE.counts, readJSON('xingya-play-counts-v1', {})));
  let daily = normalizeDaily(readJSON(STORAGE.daily, readJSON('xingya-daily-stats-v1', null)));
  let savedCurrentSong = storedValue(STORAGE.current, 'xingya-current-song-v1');
  let currentSongId = songById.has(savedCurrentSong)
    ? savedCurrentSong
    : songs[0]?.id;
  let savedMode = storedValue(STORAGE.mode, 'xingya-play-mode-v1');
  let mode = MODES[savedMode] ? savedMode : 'sequence';
  let volume = Number(storedValue(STORAGE.volume, 'xingya-volume-v1'));
  let isMuted = storedValue(STORAGE.muted, 'xingya-muted-v1') === 'true';
  let activeFilter = 'all';
  let activeWowLevel = 'wow-yellow';
  let activeLittleFoxLevel = 'littlefox-1';
  let activePeppaSeason = 'peppa-1';
  let sessionCounted = false;
  let lastTickWall = Date.now();
  let lastPersist = 0;
  let statsDirty = false;
  let deferredInstallPrompt = null;
  let toastTimer = null;
  let shuffleQueue = [];
  let shuffleHistory = [];

  if (!Number.isFinite(volume)) volume = 0.85;
  volume = Math.min(1, Math.max(0, volume));
  audio.volume = volume;
  audio.muted = isMuted;

  function currentSong() {
    return songById.get(currentSongId) || songs[0];
  }

  function currentCategory() {
    return categoryById.get(currentSong()?.category) || categories[0];
  }

  function currentIndex() {
    return Math.max(0, songs.findIndex((song) => song.id === currentSongId));
  }

  function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
    const whole = Math.floor(seconds);
    const hours = Math.floor(whole / 3600);
    const minutes = Math.floor((whole % 3600) / 60);
    const secs = whole % 60;
    if (hours > 0) return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    return `${minutes}:${String(secs).padStart(2, '0')}`;
  }

  function formatCompactDuration(ms) {
    const totalSeconds = Math.max(0, Math.round(ms / 1000));
    if (totalSeconds < 60) return `${totalSeconds}秒`;
    const totalMinutes = Math.floor(totalSeconds / 60);
    if (totalMinutes < 60) return `${totalMinutes}分钟`;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return minutes ? `${hours}小时${minutes}分` : `${hours}小时`;
  }

  function formatReadableDuration(ms) {
    const totalSeconds = Math.max(0, Math.round(ms / 1000));
    if (totalSeconds < 60) return `${totalSeconds} 秒`;
    const totalMinutes = Math.floor(totalSeconds / 60);
    if (totalMinutes < 60) return `${totalMinutes} 分钟`;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return minutes ? `${hours} 小时 ${minutes} 分钟` : `${hours} 小时`;
  }

  function setIcon(svgOrUse, iconName) {
    if (!svgOrUse) return;
    const use = svgOrUse.tagName.toLowerCase() === 'use'
      ? svgOrUse
      : svgOrUse.querySelector('use');
    use?.setAttribute('href', `#icon-${iconName}`);
  }

  function showToast(message) {
    window.clearTimeout(toastTimer);
    els.toast.textContent = message;
    els.toast.classList.add('is-visible');
    toastTimer = window.setTimeout(() => els.toast.classList.remove('is-visible'), 2200);
  }

  function ensureToday() {
    if (daily.date !== dayKey()) {
      persistDaily();
      daily = createDailyStats();
      statsDirty = true;
      updateStatsUI();
    }
  }

  function persistCounts() {
    writeJSON(STORAGE.counts, playCounts);
  }

  function persistDaily() {
    writeJSON(STORAGE.daily, daily);
  }

  function addPlaybackTime(startWall, endWall) {
    if (endWall <= startWall || !currentSongId) return;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const clippedStart = Math.max(startWall, todayStart.getTime());
    if (endWall <= clippedStart) return;
    ensureToday();
    const elapsed = endWall - clippedStart;
    daily.totalMs += elapsed;
    daily.perSongMs[currentSongId] = (Number(daily.perSongMs[currentSongId]) || 0) + elapsed;
    statsDirty = true;
  }

  function flushPlayTime() {
    const now = Date.now();
    if (!audio.paused && !audio.ended && audio.readyState >= 1) {
      addPlaybackTime(lastTickWall, now);
    }
    lastTickWall = now;
  }

  function markPlaySession() {
    if (sessionCounted || !currentSongId) return;
    sessionCounted = true;
    ensureToday();
    playCounts[currentSongId] = (Number(playCounts[currentSongId]) || 0) + 1;
    daily.playCounts[currentSongId] = (Number(daily.playCounts[currentSongId]) || 0) + 1;
    statsDirty = true;
    persistCounts();
    persistDaily();
    updateCountsUI();
    if (els.statsDialog.open) renderStats();
  }

  function beginPlaySession() {
    sessionCounted = false;
    lastTickWall = Date.now();
  }

  function resetShuffleQueue(anchorId = currentSongId) {
    shuffleQueue = songs.map((song) => song.id).filter((id) => id !== anchorId);
    for (let index = shuffleQueue.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [shuffleQueue[index], shuffleQueue[swapIndex]] = [shuffleQueue[swapIndex], shuffleQueue[index]];
    }
  }

  function nextShuffleSongId() {
    if (!shuffleQueue.length) resetShuffleQueue(currentSongId);
    return shuffleQueue.shift() || songs.find((song) => song.id !== currentSongId)?.id || currentSongId;
  }

  function updateMediaSession(song) {
    if (!('mediaSession' in navigator) || !song) return;
    const category = categoryById.get(song.category);
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: song.title,
        artist: 'baby专属',
        album: category?.name || '英文启蒙儿歌',
        artwork: [
          { src: new URL('icons/icon-192-v3.png?v=23', window.location.href).href, sizes: '192x192', type: 'image/png' },
          { src: new URL('icons/icon-512-v3.png?v=23', window.location.href).href, sizes: '512x512', type: 'image/png' },
        ],
      });
    } catch (error) {
      // Older browsers may expose Media Session without MediaMetadata.
    }
  }

  function updateMediaPosition() {
    if (!('mediaSession' in navigator) || !navigator.mediaSession.setPositionState) return;
    const duration = Number.isFinite(audio.duration) ? audio.duration : currentSong()?.duration;
    if (!duration || !Number.isFinite(duration) || duration <= 0) return;
    try {
      navigator.mediaSession.setPositionState({
        duration,
        playbackRate: audio.playbackRate || 1,
        position: Math.min(Math.max(audio.currentTime || 0, 0), Math.max(duration - 0.001, 0)),
      });
    } catch (error) {
      // Ignore transient invalid states while switching tracks.
    }
  }

  function setPlayerExpanded(expanded) {
    playerExpanded = expanded;
    els.playerDock.classList.toggle('is-expanded', expanded);
    els.miniPlayerButton.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    els.miniPlayerButton.setAttribute('aria-label', expanded ? '收起播放器' : '展开播放器');
    document.body.classList.toggle('player-expanded', expanded);
  }

  function updatePlaybackButtons() {
    const playing = !audio.paused && !audio.ended;
    setIcon(els.dockPlayIcon, playing ? 'pause' : 'play');
    setIcon(els.heroPlayButton.querySelector('svg'), playing ? 'pause' : 'play');
    els.dockPlayButton.setAttribute('aria-label', playing ? '暂停' : '播放');
    els.dockPlayButton.title = playing ? '暂停' : '播放';
    els.heroPlayLabel.textContent = playing
      ? '暂停播放'
      : audio.currentTime > 0.1
        ? '继续播放'
        : '播放这首';
    els.heroCover.classList.toggle('is-playing', playing);
    els.miniPlayerDisc.classList.toggle('is-playing', playing);
    document.body.classList.toggle('is-playing', playing);
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = playing ? 'playing' : 'paused';
    }
    updateSongRows();
  }

  function updateSongInfo() {
    const song = currentSong();
    const category = currentCategory();
    if (!song || !category) return;

    els.heroCover.dataset.category = song.category;
    els.dockCover.dataset.category = song.category;
    els.miniPlayerDisc.dataset.category = song.category;
    setIcon(els.heroCategoryIcon, category.icon);
    setIcon(els.dockCategoryIcon, category.icon);
    setIcon(els.miniPlayerIcon, category.icon);
    els.heroCategoryName.textContent = category.name;
    els.heroSongTitle.textContent = song.title;
    els.heroSongZh.textContent = song.zh;
    els.dockTitle.textContent = song.title;
    els.dockSubtitle.textContent = `${category.name} · ${song.zh}`;
    els.durationTime.textContent = formatTime(Number.isFinite(audio.duration) ? audio.duration : song.duration);
    document.title = `${song.title} · baby专属`;
    updateMediaSession(song);
    updateSongRows();
  }

  function updateModeUI() {
    const config = MODES[mode];
    els.modeLabel.textContent = config.label;
    els.modeButton.setAttribute('aria-label', `播放模式：${config.aria}，点击切换`);
    els.modeButton.title = `当前：${config.aria}，点击切换`;
    setIcon(els.modeIcon, config.icon);
    els.playAllLabel.textContent = mode === 'repeat'
      ? '循环当前歌曲'
      : mode === 'shuffle'
        ? '随机播放全部'
        : '顺序播放全部';
  }

  function setRangeFill(input, percent) {
    input.style.setProperty('--progress', `${Math.min(100, Math.max(0, percent))}%`);
  }

  function updateProgressUI() {
    const song = currentSong();
    const duration = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : (song?.duration || 0);
    const position = Math.min(Number.isFinite(audio.currentTime) ? audio.currentTime : 0, duration || 0);
    const percent = duration ? (position / duration) * 100 : 0;
    if (document.activeElement !== els.progressSlider) {
      els.progressSlider.value = String(Math.round(percent * 10));
    }
    setRangeFill(els.progressSlider, percent);
    els.currentTime.textContent = formatTime(position);
    els.durationTime.textContent = formatTime(duration);
    updateMediaPosition();
  }

  function updateVolumeUI() {
    const effectiveVolume = audio.muted ? 0 : audio.volume;
    els.volumeSlider.value = String(effectiveVolume);
    setRangeFill(els.volumeSlider, effectiveVolume * 100);
    setIcon(els.volumeIcon, audio.muted || audio.volume === 0 ? 'muted' : 'volume');
    els.volumeButton.setAttribute('aria-label', audio.muted || audio.volume === 0 ? '取消静音' : '静音');
    els.volumeButton.title = audio.muted || audio.volume === 0 ? '取消静音' : '静音';
  }

  function updateActiveCollections() {
    if (!collectionTabIds.has(activeTab)) return;
    if (tabCategoryGroups[activeTab]) {
      const allowed = tabCategoryGroups[activeTab];
      categories = allCategories.filter((category) => allowed.includes(category.id));
      songs = allSongs.filter((song) => allowed.includes(song.category));
    } else {
      const excluded = Object.values(tabCategoryGroups).flat();
      categories = allCategories.filter((category) => !excluded.includes(category.id));
      songs = allSongs.filter((song) => !excluded.includes(song.category));
    }
    if (!songById.has(currentSongId) && songs.length) {
      currentSongId = songs[0].id;
    }
  }

  function groupSongs(categoryId) {
    return songs
      .map((song, index) => ({ song, index }))
      .filter(({ song }) => song.category === categoryId);
  }

  function animationSongs(group) {
    // Prefixes are category prefixes (guli, vocab-town, peppa), not song ids.
    return songs.filter((song) => group.categoryPrefixes.some((prefix) => song.category.startsWith(prefix)));
  }

  function renderFilters() {
    const counts = Object.fromEntries(animationGroups.map((group) => [group.id, animationSongs(group).length]));
    if (activeTab === 'animation') {
      els.filterRow.innerHTML = animationGroups.map((group) =>
        `<button class="filter-chip ${activeFilter === group.id ? 'is-active' : ''}" type="button" data-filter="${group.id}" aria-pressed="${activeFilter === group.id ? 'true' : 'false'}">${group.name}<span class="filter-count">${counts[group.id]}</span></button>`
      ).join('');
      return;
    }
    els.filterRow.innerHTML = [
      `<button class="filter-chip ${activeFilter === 'all' ? 'is-active' : ''}" type="button" data-filter="all" aria-pressed="${activeFilter === 'all' ? 'true' : 'false'}">全部</button>`,
      ...categories.map((category) => {
        const count = allSongs.filter((song) => song.category === category.id).length;
        return `<button class="filter-chip ${activeFilter === category.id ? 'is-active' : ''}" type="button" data-filter="${category.id}" aria-pressed="${activeFilter === category.id ? 'true' : 'false'}">${category.name}<span class="filter-count">${count}</span></button>`;
      }),
    ].join('');
  }

  function renderLittleFoxLevelTabs() {
    return `
      <div class="secondary-tabs" role="tablist" aria-label="Little Fox 分级">
        <button class="secondary-tab ${activeLittleFoxLevel === 'all' ? 'is-active' : ''}" type="button" data-littlefox-level="all">全部</button>
        <button class="secondary-tab ${activeLittleFoxLevel === 'littlefox-1' ? 'is-active' : ''}" type="button" data-littlefox-level="littlefox-1">L1</button>
        <button class="secondary-tab ${activeLittleFoxLevel === 'littlefox-2' ? 'is-active' : ''}" type="button" data-littlefox-level="littlefox-2">L2</button>
        <button class="secondary-tab ${activeLittleFoxLevel === 'littlefox-3' ? 'is-active' : ''}" type="button" data-littlefox-level="littlefox-3">L3</button>
      </div>
    `;
  }

  function renderPeppaSeasonTabs() {
    return `
      <div class="secondary-tabs peppa-season-tabs" role="tablist" aria-label="小猪佩奇分季">
        ${peppaSeasons.map((season) => {
          const count = songs.filter((song) => song.category === season.season).length;
          const label = `第${season.season.split('-')[1]}季`;
          return `<button class="secondary-tab peppa-season-tab ${activePeppaSeason === season.season ? 'is-active' : ''}" type="button" data-peppa-season="${season.season}">${label}<span class="season-count">${count}</span></button>`;
        }).join('')}
      </div>
    `;
  }

  function seriesSongRows(series, hideHeader = false) {
    const entries = songs.filter((song) => song.category === series.id);
    return `
      <section class="song-group" data-group-category="${series.id}">
        ${hideHeader ? '' : `
        <header class="group-head">
          <div class="group-title">
            <span class="group-icon" style="--group-color:${series.color}"><svg><use href="#icon-${series.icon}"></use></svg></span>
            <span class="group-title-text"><strong>${series.name}</strong><span>${series.subtitle || `Little Fox ${(series.level || '').replace('littlefox-', 'L').toUpperCase()}`}</span></span>
          </div>
          <span class="group-count">${entries.length} 首</span>
        </header>`}
        <div class="song-list">${entries.map((song, index) => `
          <button class="song-row" type="button" data-song-id="${song.id}" data-index="${index}" data-category="${song.category}">
            <span class="song-number">${String(index + 1).padStart(2, '0')}</span>
            <span class="song-title-block"><strong>${song.title}</strong><span>${song.zh}</span></span>
            <span class="song-play-count" data-count-id="${song.id}">播放 0 次</span>
            <span class="song-duration">${formatTime(song.duration)}</span>
            <span class="song-play-button" aria-hidden="true"><svg><use href="#icon-play"></use></svg></span>
          </button>`).join('')}</div>
      </section>
    `;
  }

  function renderWowLevelTabs() {
    const levels = categories
      .filter((category) => category.id.startsWith('wow-'))
      .map((category) => ({ id: category.id, name: category.name.replace('Wow! ', ''), note: category.note.replace('分级课程音频', '') }));
    return `
      <div class="secondary-tabs" role="tablist" aria-label="Wow English 分级">
          ${levels.map((level) => `<button class="secondary-tab wow-level-tab ${activeWowLevel === level.id ? 'is-active' : ''}" type="button" data-wow-level="${level.id}">${level.name}<span class="level-note">${level.note}</span></button>`).join('')}
      </div>
    `;
  }

  function renderAnimationPlaylist() {
    els.libraryHead.hidden = false;
    els.filterRow.hidden = false;
    renderFilters();
    const visible = animationGroups.filter((group) =>
      animationSongs(group).length > 0 && activeFilter === group.id
    );
    const wowSelected = visible.some((group) => group.id === 'animation-wow');
    const wowSongs = wowSelected
      ? animationSongs(animationGroups.find((group) => group.id === 'animation-wow'))
          .filter((song) => song.category === activeWowLevel)
      : [];
    const littleFoxSelected = visible.some((group) => group.id === 'animation-littlefox');
    const littleFoxSongs = littleFoxSelected
      ? animationSongs(animationGroups.find((group) => group.id === 'animation-littlefox'))
          .filter((song) => activeLittleFoxLevel === 'all' || song.category.startsWith(activeLittleFoxLevel))
      : [];
    const littleFoxHtml = littleFoxSelected ? `
      <section class="song-group wow-level-group" data-group-category="animation-littlefox">
        ${renderLittleFoxLevelTabs()}
        <div class="song-list">${littleFoxSongs.map((song, index) => `
          <button class="song-row" type="button" data-song-id="${song.id}" data-index="${index}" data-category="${song.category}">
            <span class="song-number">${String(index + 1).padStart(2, '0')}</span>
            <span class="song-title-block"><strong>${song.title}</strong></span>
            <span class="song-play-count" data-count-id="${song.id}">播放 0 次</span>
            <span class="song-duration">${formatTime(song.duration)}</span>
            <span class="song-play-button" aria-hidden="true"><svg><use href="#icon-play"></use></svg></span>
          </button>`).join('')}</div>
      </section>
    ` : '';
    const peppaSelected = visible.some((group) => group.id === 'animation-peppa');
    const peppaSongs = peppaSelected
      ? animationSongs(animationGroups.find((group) => group.id === 'animation-peppa'))
          .filter((song) => activePeppaSeason === 'all' || song.category === activePeppaSeason)
      : [];
    const peppaHtml = peppaSelected ? `
      <section class="song-group wow-level-group" data-group-category="animation-peppa">
        ${renderPeppaSeasonTabs()}
        <div class="song-list">${peppaSongs.map((song, index) => `
          <button class="song-row" type="button" data-song-id="${song.id}" data-index="${index}" data-category="${song.category}">
            <span class="song-number">${String(index + 1).padStart(2, '0')}</span>
            <span class="song-title-block"><strong>${song.title}</strong><span>${song.zh}</span></span>
            <span class="song-play-count" data-count-id="${song.id}">播放 0 次</span>
            <span class="song-duration">${formatTime(song.duration)}</span>
            <span class="song-play-button" aria-hidden="true"><svg><use href="#icon-play"></use></svg></span>
          </button>`).join('')}</div>
      </section>
    ` : '';
    const wowHtml = wowSelected ? `
      <section class="song-group wow-level-group" data-group-category="animation-wow">
        ${renderWowLevelTabs()}
        <div class="song-list">${wowSongs.map((song, index) => `
          <button class="song-row" type="button" data-song-id="${song.id}" data-index="${index}" data-category="${song.category}">
            <span class="song-number">${String(index + 1).padStart(2, '0')}</span>
            <span class="song-title-block"><strong>${song.title}</strong></span>
            <span class="song-play-count" data-count-id="${song.id}">播放 0 次</span>
            <span class="song-duration">${formatTime(song.duration)}</span>
            <span class="song-play-button" aria-hidden="true"><svg><use href="#icon-play"></use></svg></span>
          </button>`).join('')}</div>
      </section>
    ` : '';
    els.playlistGroups.innerHTML = wowHtml + littleFoxHtml + peppaHtml + visible.filter((group) => !['animation-wow', 'animation-littlefox', 'animation-peppa'].includes(group.id)).map((group) => {
      const rows = animationSongs(group).map((song, index) => `
        <button class="song-row" type="button" data-song-id="${song.id}" data-index="${index}" data-category="${song.category}">
          <span class="song-number">${String(index + 1).padStart(2, '0')}</span>
          <span class="song-title-block">
            <strong>${song.title}</strong>
            <span>${song.zh}</span>
          </span>
          <span class="song-play-count" data-count-id="${song.id}">播放 0 次</span>
          <span class="song-duration">${formatTime(song.duration)}</span>
          <span class="song-play-button" aria-hidden="true"><svg><use href="#icon-play"></use></svg></span>
        </button>
      `).join('');
      return `
        <section class="song-group" data-group-category="${group.id}">
          ${rows ? `<div class="song-list">${rows}</div>` : '<div class="group-empty">内容正在准备中</div>'}
        </section>
      `;
    }).join('');
    els.playlistGroups.querySelectorAll('[data-wow-level]').forEach((button) => {
      button.addEventListener('click', () => {
        activeWowLevel = button.dataset.wowLevel;
        renderAnimationPlaylist();
      });
    });
    els.playlistGroups.querySelectorAll('[data-littlefox-level]').forEach((button) => {
      button.addEventListener('click', () => {
        activeLittleFoxLevel = button.dataset.littlefoxLevel;
        renderAnimationPlaylist();
      });
    });
    els.playlistGroups.querySelectorAll('[data-peppa-season]').forEach((button) => {
      button.addEventListener('click', () => {
        activePeppaSeason = button.dataset.peppaSeason;
        renderAnimationPlaylist();
      });
    });
    bindSongRows();
    updateSongRows();
    updateCountsUI();
  }

  function bindSongRows() {
    els.playlistGroups.querySelectorAll('.song-row').forEach((row) => {
      row.addEventListener('click', () => {
        const id = row.dataset.songId;
        setPlayerExpanded(true);
        if (id === currentSongId) togglePlayback();
        else {
          shuffleHistory = [];
          if (mode === 'shuffle') resetShuffleQueue(id);
          loadSong(id, { autoplay: true, resetShuffle: false, restart: id === currentSongId });
        }
      });
    });
  }

  function renderPlaylist() {
    els.libraryHead.hidden = false;
    els.filterRow.hidden = false;
    renderFilters();
    els.playlistGroups.innerHTML = categories.map((category) => {
      const entries = groupSongs(category.id);
      if (!entries.length) return '';
      const rows = entries.map(({ song, index }) => `
        <button class="song-row" type="button" data-song-id="${song.id}" data-index="${index}" data-category="${category.id}">
          <span class="song-number">${String(index + 1).padStart(2, '0')}</span>
          <span class="song-title-block">
            <strong>${song.title}</strong>
            <span>${song.zh}</span>
          </span>
          <span class="song-play-count" data-count-id="${song.id}">播放 0 次</span>
          <span class="song-duration">${formatTime(song.duration)}</span>
          <span class="song-play-button" aria-hidden="true"><svg><use href="#icon-play"></use></svg></span>
        </button>
      `).join('');

      return `
        <section class="song-group" data-group-category="${category.id}">
          <div class="song-list">${rows}</div>
        </section>
      `;
    }).join('');

    bindSongRows();
    updateSongRows();
    updateCountsUI();
    applyFilter();
  }

  function updateSongRows() {
    const playing = !audio.paused && !audio.ended;
    document.querySelectorAll('.song-row').forEach((row) => {
      const isCurrent = row.dataset.songId === currentSongId;
      row.classList.toggle('is-current', isCurrent);
      row.setAttribute('aria-current', isCurrent ? 'true' : 'false');
      const number = row.querySelector('.song-number');
      if (isCurrent) {
        number.innerHTML = `<span class="equalizer" aria-hidden="true"><i></i><i></i><i></i></span>`;
      } else {
        number.textContent = String(Number(row.dataset.index) + 1).padStart(2, '0');
      }
      setIcon(row.querySelector('.song-play-button use'), isCurrent && playing ? 'pause' : 'play');
    });
  }

  function updateCountsUI() {
    document.querySelectorAll('[data-count-id]').forEach((element) => {
      const count = Number(playCounts[element.dataset.countId]) || 0;
      element.textContent = `播放 ${count} 次`;
    });
    const total = allSongs.reduce((sum, song) => sum + (Number(playCounts[song.id]) || 0), 0);
    els.totalPlayCount.textContent = `共 ${total} 次`;
    updateStatsUI();
  }

  function todayPlayCount() {
    return allSongs.reduce((sum, song) => sum + (Number(daily.playCounts[song.id]) || 0), 0);
  }

  function updateStatsUI() {
    els.heroTotalDuration.textContent = String(Math.round(songs.reduce((sum, song) => sum + (Number(song.duration) || 0), 0) / 60));
    const duration = formatCompactDuration(daily.totalMs);
    els.headerTodayDuration.textContent = duration;
    els.heroTodayDuration.textContent = duration;
    els.todayDurationLarge.textContent = formatReadableDuration(daily.totalMs);
    els.todayDurationDetail.textContent = daily.totalMs > 0 ? '仅统计今天正在播放的时间' : '今天还没有开始聆听';
    els.todayPlayCount.textContent = `${todayPlayCount()} 次`;

    const ranked = allSongs
      .map((song) => ({ song, count: Number(playCounts[song.id]) || 0 }))
      .sort((a, b) => b.count - a.count);
    const top = ranked[0];
    if (top?.count > 0) {
      els.topSongTitle.textContent = top.song.title;
      els.topSongCount.textContent = `播放 ${top.count} 次`;
      els.topSongTitle.title = top.song.title;
    } else {
      els.topSongTitle.textContent = '还没有记录';
      els.topSongCount.textContent = '播放 0 次';
      els.topSongTitle.removeAttribute('title');
    }
    renderReportRows(ranked);
  }

  function renderReportRows(ranked) {
    const max = Math.max(1, ...ranked.map(({ count }) => count));
    els.songReportList.innerHTML = ranked.map(({ song, count }) => `
      <div class="report-row">
        <div class="report-song">
          <strong>${song.title}</strong>
          <span>${song.zh} · 今日 ${formatCompactDuration(Number(daily.perSongMs[song.id]) || 0)}</span>
        </div>
        <div class="report-bar" aria-hidden="true"><i style="--bar-width:${(count / max) * 100}%"></i></div>
        <span class="report-count">${count} 次</span>
      </div>
    `).join('');
  }

  function renderStats() {
    ensureToday();
    const date = new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    }).format(new Date());
    els.statsDate.textContent = `${date} · 每天零点自动开启新记录`;
    updateCountsUI();
  }

  function renderEmptyTab() {
    els.libraryHead.hidden = true;
    els.filterRow.hidden = true;
    els.playlistGroups.innerHTML = `
      <div class="empty-tab">
        <svg><use href="#icon-music"></use></svg>
        <strong>${tabs.find((tab) => tab.id === activeTab)?.name || ''}</strong>
        <span>内容正在准备中</span>
      </div>
    `;
  }

  function renderResourceLibrary() {
    els.libraryHead.hidden = true;
    els.filterRow.hidden = true;
    els.playlistGroups.innerHTML = `
      <div class="resource-grid">
        ${resourceLinks.map((item) => `
          <a class="resource-card" href="${item.url}" target="_blank" rel="noopener noreferrer">
            <span class="resource-card-icon"><svg><use href="#icon-${item.icon}"></use></svg></span>
            <span class="resource-card-copy">
              <strong>${item.title}</strong>
              <span>${item.note}</span>
            </span>
          </a>
        `).join('')}
      </div>
    `;
  }

  function renderCurrentTab() {
    if (activeTab === 'library') {
      renderResourceLibrary();
      return;
    }
    updateActiveCollections();
    if (activeTab === 'animation') renderAnimationPlaylist();
    else renderPlaylist();
  }

  function applyFilter() {
    els.filterRow.querySelectorAll('.filter-chip').forEach((chip) => {
      const active = chip.dataset.filter === activeFilter;
      chip.classList.toggle('is-active', active);
      chip.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    if (activeTab === 'animation') {
      renderAnimationPlaylist();
      return;
    }
    els.playlistGroups.querySelectorAll('[data-group-category]').forEach((group) => {
      group.hidden = activeFilter !== 'all' && group.dataset.groupCategory !== activeFilter;
    });
    els.filterRow.querySelectorAll('.filter-chip').forEach((chip) => {
      const active = chip.dataset.filter === activeFilter;
      chip.classList.toggle('is-active', active);
      chip.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function switchTab(tabId) {
    setPlayerExpanded(false);
    activeTab = tabId;
    activeFilter = tabId === 'animation' ? 'animation-wow' : 'all';
    activeWowLevel = 'wow-yellow';
    activeLittleFoxLevel = 'littlefox-1';
    activePeppaSeason = 'peppa-1';
    document.querySelectorAll('.tab-button').forEach((button) => {
      const active = button.dataset.tab === tabId;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    document.body.dataset.tab = tabId;
    renderCurrentTab();
    updatePlaybackButtons();
    updateProgressUI();
    updateStatsUI();
  }

  let loadingSongId = null;
  let loadingToken = 0;

  function prepareAudioSource(song, preservePosition = false) {
    const oldPosition = preservePosition ? audio.currentTime : 0;
    const token = ++loadingToken;
    loadingSongId = song.id;
    // Do not tear down the old element while the user can still hear it.
    // Setting preload=auto lets Safari start buffering immediately; metadata
    // usually arrives before playback is invoked, keeping the click instant.
    audio.src = AUDIO_BASE + song.file;
    audio.load();
    const restore = () => {
      if (token !== loadingToken) return;
      if (preservePosition && Number.isFinite(oldPosition) && oldPosition > 0) {
        audio.currentTime = Math.min(oldPosition, Number.isFinite(audio.duration) ? Math.max(audio.duration - 0.1, 0) : oldPosition);
      }
    };
    audio.addEventListener('loadedmetadata', restore, { once: true });
  }

  function loadSong(id, options = {}) {
    const song = songById.get(id);
    if (!song) return;
    flushPlayTime();
    const changed = id !== currentSongId;
    if (changed) {
      currentSongId = id;
      localStorage.setItem(STORAGE.current, id);
      if (options.resetShuffle !== false && mode === 'shuffle') resetShuffleQueue(id);
      prepareAudioSource(song);
      beginPlaySession();
      updateSongInfo();
      updateProgressUI();
    }
    if (options.restart) {
      audio.currentTime = 0;
      beginPlaySession();
    }
    updatePlaybackButtons();
    if (options.autoplay) {
      audio.play().catch((error) => {
        updatePlaybackButtons();
        if (error?.name !== 'AbortError') showToast('暂时无法播放，请检查网络后重试');
      });
    }
  }

  function togglePlayback() {
    setPlayerExpanded(true);
    if (!currentSongId && songs.length) loadSong(songs[0].id, { autoplay: false });
    if (audio.paused) {
      const duration = Number.isFinite(audio.duration) ? audio.duration : (currentSong()?.duration || 0);
      if (audio.ended || (duration && audio.currentTime >= duration - 0.12)) {
        audio.currentTime = 0;
        beginPlaySession();
      }
      audio.play().catch((error) => {
        if (error?.name !== 'AbortError') showToast('暂时无法播放，请检查网络后重试');
      });
    } else {
      audio.pause();
    }
  }

  function playAll() {
    if (!songs.length) return;
    flushPlayTime();
    if (mode === 'shuffle') {
      const previousId = currentSongId;
      shuffleHistory = [];
      resetShuffleQueue('');
      const firstId = nextShuffleSongId();
      loadSong(firstId, { autoplay: true, resetShuffle: false, restart: firstId === previousId });
      showToast('随机播放全部 · 已经开始');
      return;
    }
    if (mode === 'repeat') {
      loadSong(currentSongId, { autoplay: true, restart: true });
      showToast('单曲循环 · 从这一首开始');
      return;
    }
    shuffleHistory = [];
    loadSong(songs[0].id, { autoplay: true, restart: true });
    showToast('顺序播放全部 · 已经开始');
  }

  function nextTrack(options = {}) {
    if (!songs.length) return;
    flushPlayTime();
    let nextId;
    if (mode === 'shuffle') {
      shuffleHistory.push(currentSongId);
      nextId = nextShuffleSongId();
    } else {
      nextId = songs[(currentIndex() + 1) % songs.length].id;
    }
    loadSong(nextId, { autoplay: true });
    if (!options.silent) showToast(`下一曲 · ${songById.get(nextId)?.zh || ''}`);
  }

  function previousTrack() {
    if (!songs.length) return;
    flushPlayTime();
    let previousId;
    if (mode === 'shuffle' && shuffleHistory.length) {
      previousId = shuffleHistory.pop();
    } else if (mode === 'shuffle') {
      const candidates = songs.filter((song) => song.id !== currentSongId);
      previousId = candidates[Math.floor(Math.random() * candidates.length)]?.id || currentSongId;
    } else {
      previousId = songs[(currentIndex() - 1 + songs.length) % songs.length].id;
    }
    loadSong(previousId, { autoplay: true });
    showToast(`上一曲 · ${songById.get(previousId)?.zh || ''}`);
  }

  function cycleMode() {
    const nextModeIndex = (MODE_ORDER.indexOf(mode) + 1) % MODE_ORDER.length;
    mode = MODE_ORDER[nextModeIndex];
    localStorage.setItem(STORAGE.mode, mode);
    if (mode === 'shuffle') {
      shuffleQueue = [];
      shuffleHistory = [];
      resetShuffleQueue(currentSongId);
    }
    updateModeUI();
    showToast(`已切换为${MODES[mode].aria}`);
  }

  function updateAfterPause() {
    flushPlayTime();
    persistDaily();
    updatePlaybackButtons();
    updateProgressUI();
  }

  audio.addEventListener('loadedmetadata', () => {
    updateSongInfo();
    updateProgressUI();
  });

  audio.addEventListener('durationchange', updateProgressUI);
  audio.addEventListener('timeupdate', updateProgressUI);
  audio.addEventListener('play', () => {
    lastTickWall = Date.now();
    updatePlaybackButtons();
  });
  audio.addEventListener('playing', () => {
    lastTickWall = Date.now();
    updatePlaybackButtons();
  });
  audio.addEventListener('pause', updateAfterPause);
  audio.addEventListener('seeking', () => {
    flushPlayTime();
    updateProgressUI();
  });
  audio.addEventListener('waiting', () => {
    flushPlayTime();
    updateProgressUI();
  });
  audio.addEventListener('stalled', () => {
    flushPlayTime();
    updateProgressUI();
  });

  async function recoverPlayback() {
    if (audio.paused || audio.ended) return;
    const position = audio.currentTime;
    // Initial loading is not a stalled playback. Reloading here resets time to
    // zero and can make every first tap appear to fail.
    if (position < 0.2) {
      showToast('音频正在加载，请稍候…');
      return;
    }
    try {
      audio.currentTime = Math.max(position - 0.08, 0);
      await audio.play();
    } catch (error) {
      showToast('网络有点慢，请再点一次播放按钮');
    }
  }

  let recoverTimer = null;
  function scheduleRecovery() {
    window.clearTimeout(recoverTimer);
    recoverTimer = window.setTimeout(recoverPlayback, 9000);
  }
  audio.addEventListener('waiting', scheduleRecovery);
  audio.addEventListener('stalled', scheduleRecovery);
  ['playing', 'pause', 'ended', 'error', 'canplay', 'canplaythrough', 'loadeddata'].forEach((type) => {
    audio.addEventListener(type, () => window.clearTimeout(recoverTimer));
  });
  audio.addEventListener('error', () => {
    if (audio.error) showToast('这首歌曲暂时无法播放，请检查文件是否完整');
    updatePlaybackButtons();
  });
  audio.addEventListener('ended', () => {
    flushPlayTime();
    persistDaily();
    if (mode === 'repeat') {
      audio.currentTime = 0;
      beginPlaySession();
      audio.play().catch(() => updatePlaybackButtons());
    } else {
      nextTrack({ silent: true });
    }
  });

  els.heroPlayButton.addEventListener('click', togglePlayback);
  els.dockPlayButton.addEventListener('click', togglePlayback);
  els.prevButton.addEventListener('click', previousTrack);
  els.nextButton.addEventListener('click', nextTrack);
  els.playAllButton.addEventListener('click', playAll);
  els.modeButton.addEventListener('click', cycleMode);

  els.tabBar.addEventListener('click', (event) => {
    const button = event.target.closest('.tab-button');
    if (!button || button.dataset.tab === activeTab) return;
    switchTab(button.dataset.tab);
  });

  els.miniPlayerButton.addEventListener('click', () => {
    setPlayerExpanded(!playerExpanded);
  });

  els.filterRow.addEventListener('click', (event) => {
    const chip = event.target.closest('.filter-chip');
    if (!chip) return;
    activeFilter = chip.dataset.filter;
    applyFilter();
  });

  els.progressSlider.addEventListener('input', () => {
    const duration = Number.isFinite(audio.duration) ? audio.duration : (currentSong()?.duration || 0);
    if (!duration) return;
    const percent = Number(els.progressSlider.value) / 10;
    audio.currentTime = (percent / 100) * duration;
    setRangeFill(els.progressSlider, percent);
    els.currentTime.textContent = formatTime(audio.currentTime);
  });

  els.volumeSlider.addEventListener('input', () => {
    volume = Number(els.volumeSlider.value);
    audio.volume = volume;
    audio.muted = volume === 0;
    isMuted = audio.muted;
    localStorage.setItem(STORAGE.volume, String(volume));
    localStorage.setItem(STORAGE.muted, String(isMuted));
    updateVolumeUI();
  });

  els.volumeButton.addEventListener('click', () => {
    if (audio.muted || audio.volume === 0) {
      audio.muted = false;
      if (audio.volume === 0) {
        audio.volume = volume || 0.85;
        els.volumeSlider.value = String(audio.volume);
      }
    } else {
      audio.muted = true;
    }
    isMuted = audio.muted;
    localStorage.setItem(STORAGE.muted, String(isMuted));
    updateVolumeUI();
  });

  els.reportButton.addEventListener('click', () => {
    renderStats();
    els.statsDialog.showModal();
  });
  els.closeStatsButton.addEventListener('click', () => els.statsDialog.close());
  els.resetStatsButton.addEventListener('click', () => {
    if (!window.confirm('确定清空全部歌曲的播放次数和今日聆听时长吗？')) return;
    playCounts = normalizeCounts({});
    daily = createDailyStats();
    sessionCounted = false;
    persistCounts();
    persistDaily();
    updateCountsUI();
    renderStats();
    updateSongRows();
    showToast('统计已清空');
  });

  function openInstallDialog() {
    els.installDialog.showModal();
  }

  async function requestInstall() {
    if (window.matchMedia('(display-mode: standalone)').matches || navigator.standalone) {
      showToast('已经安装到桌面啦');
      return;
    }
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      try {
        await deferredInstallPrompt.userChoice;
      } finally {
        deferredInstallPrompt = null;
      }
      return;
    }
    openInstallDialog();
  }

  const installConfirmButton = document.getElementById('installConfirmButton');
  if (installConfirmButton) installConfirmButton.addEventListener('click', requestInstall);
  els.closeInstallButton.addEventListener('click', () => els.installDialog.close());

  [els.statsDialog, els.installDialog].forEach((dialog) => {
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });
  });

  document.addEventListener('keydown', (event) => {
    const target = event.target;
    const isFormControl = target instanceof HTMLElement && target.closest('input, button, a, textarea, select');
    if (event.code === 'Space' && !isFormControl && !els.statsDialog.open && !els.installDialog.open) {
      event.preventDefault();
      togglePlayback();
    }
    if (event.key === 'ArrowRight' && event.altKey) nextTrack();
    if (event.key === 'ArrowLeft' && event.altKey) previousTrack();
  });

  if ('mediaSession' in navigator) {
    const handlers = {
      play: () => audio.play().catch(() => {}),
      pause: () => audio.pause(),
      previoustrack: previousTrack,
      nexttrack: () => nextTrack({ silent: true }),
      seekbackward: (details) => {
        audio.currentTime = Math.max(0, audio.currentTime - (details.seekOffset || 10));
      },
      seekforward: (details) => {
        const duration = Number.isFinite(audio.duration) ? audio.duration : currentSong()?.duration || 0;
        audio.currentTime = Math.min(duration, audio.currentTime + (details.seekOffset || 10));
      },
      seekto: (details) => {
        if (details.fastSeek && 'fastSeek' in audio) audio.fastSeek(details.seekTime);
        else if (Number.isFinite(details.seekTime)) audio.currentTime = details.seekTime;
      },
    };
    Object.entries(handlers).forEach(([action, handler]) => {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch (error) {
        // Individual actions are optional across browsers.
      }
    });
  }

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    showToast('baby专属已安装');
  });

  window.addEventListener('pagehide', () => {
    flushPlayTime();
    persistDaily();
  });
  window.addEventListener('beforeunload', () => {
    flushPlayTime();
    persistDaily();
  });
  document.addEventListener('visibilitychange', () => {
    flushPlayTime();
    if (document.hidden) persistDaily();
    else updateProgressUI();
  });

  window.setInterval(() => {
    ensureToday();
    if (!audio.paused && audio.readyState >= 1) {
      flushPlayTime();
      if (audio.currentTime >= 1) markPlaySession();
    } else {
      lastTickWall = Date.now();
    }
    updateProgressUI();
    if (statsDirty && Date.now() - lastPersist > 5000) {
      persistDaily();
      lastPersist = Date.now();
      statsDirty = false;
    }
  }, 500);

  setPlayerExpanded(false);
  updateActiveCollections();
  updateModeUI();
  updateVolumeUI();
  if (currentSongId) {
    prepareAudioSource(songById.get(currentSongId));
    updateSongInfo();
  }
  renderPlaylist();
  updatePlaybackButtons();
  updateProgressUI();
  updateStatsUI();

  if (window.matchMedia('(display-mode: standalone)').matches || navigator.standalone) {
  }

  if ('serviceWorker' in navigator && ['http:', 'https:'].includes(window.location.protocol)) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => {
        // Installation and background audio still work when service workers are unavailable.
      });
    });
  }

  if (navigator.storage?.persist) {
    navigator.storage.persist().catch(() => {});
  }
})();
