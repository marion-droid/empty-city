(function () {
  // Find blocks anywhere (donâ€™t rely on page id; Cargo sometimes changes wrappers)
  const blocks = document.querySelectorAll('.p3-block');
  if (!blocks.length) return;

  const fmt = (t) => {
    if (!isFinite(t)) return "00:00";
    t = Math.max(0, Math.floor(t));
    const m = String(Math.floor(t / 60)).padStart(2, '0');
    const s = String(t % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  blocks.forEach(block => {
    const media = block.querySelector('[data-p3-video]');
    const playBtn = block.querySelector('.p3-play');
    const muteBtn = block.querySelector('.p3-mute');
    const fsBtn = block.querySelector('.p3-fullscreen');
    const timeEl = block.querySelector('.p3-time');

    if (!media || !timeEl) return;

    let tries = 0;
    const findVideo = () => media.querySelector('video');

    const bind = (v) => {
      v.setAttribute('playsinline', '');
      v.setAttribute('webkit-playsinline', '');

      const updateTime = () => {
        timeEl.textContent = `${fmt(v.currentTime)}/${fmt(v.duration)}`;
      };

      const updateLabels = () => {
        if (playBtn) playBtn.textContent = v.paused ? 'Play' : 'Pause';
        if (muteBtn) muteBtn.textContent = v.muted ? 'Unmute' : 'Mute';
      };

      v.addEventListener('loadedmetadata', () => { updateTime(); updateLabels(); });
      v.addEventListener('timeupdate', updateTime);
      v.addEventListener('play', updateLabels);
      v.addEventListener('pause', updateLabels);
      v.addEventListener('volumechange', updateLabels);

      media.addEventListener('click', (e) => {
        if (e.target.closest('button')) return;
        if (v.paused) v.play();
        else v.pause();
      });

      playBtn && playBtn.addEventListener('click', () => (v.paused ? v.play() : v.pause()));
      muteBtn && muteBtn.addEventListener('click', () => { v.muted = !v.muted; });

      fsBtn && fsBtn.addEventListener('click', async () => {
        const el = media;
        try {
          if (document.fullscreenElement) await document.exitFullscreen();
          else if (el.requestFullscreen) await el.requestFullscreen();
          else if (v.requestFullscreen) await v.requestFullscreen();
        } catch (_) {}
      });

      updateTime();
      updateLabels();
    };

    const timer = setInterval(() => {
      const v = findVideo();
      tries += 1;
      if (v) { clearInterval(timer); bind(v); }
      if (tries > 120) clearInterval(timer); // give it ~12s
    }, 100);
  });
})();
