<script>
(function(){
  const blocks = document.querySelectorAll('.p3-block');
  if(!blocks.length) return;

  const fmt = (t) => {
    if(!isFinite(t)) return "00:00";
    t = Math.max(0, Math.floor(t));
    const m = String(Math.floor(t/60)).padStart(2,'0');
    const s = String(t%60).padStart(2,'0');
    return `${m}:${s}`;
  };

  blocks.forEach(block => {
    const mediaWrap = block.querySelector('[data-p3-video]');
    const playBtn   = block.querySelector('.p3-play');
    const muteBtn   = block.querySelector('.p3-mute');
    const fsBtn     = block.querySelector('.p3-fullscreen');
    const timeEl    = block.querySelector('.p3-time');

    if(!mediaWrap) return;

    // Always: clicking "Play" should behave like clicking the media
    const cargoToggle = () => mediaWrap.click();

    playBtn && playBtn.addEventListener('click', (e) => {
      e.preventDefault();
      cargoToggle();
    });

    // Hover/clickability already handled by CSS cursor:pointer

    // Try to find a real <video> anywhere inside the media-item (sometimes exists later)
    let v = null;
    let tries = 0;

    const tryFindVideo = () => {
      // Try a few likely places Cargo might place it
      v = mediaWrap.querySelector('video') ||
          block.querySelector('video');
      return v;
    };

    const bindVideo = (vid) => {
      // timecode
      const updateTime = () => {
        if(!timeEl) return;
        timeEl.textContent = `${fmt(vid.currentTime)}/${fmt(vid.duration)}`;
      };
      vid.addEventListener('loadedmetadata', updateTime);
      vid.addEventListener('timeupdate', updateTime);

      // play/pause label
      const updatePlayLabel = () => {
        if(playBtn) playBtn.textContent = vid.paused ? 'Play' : 'Pause';
      };
      vid.addEventListener('play', updatePlayLabel);
      vid.addEventListener('pause', updatePlayLabel);
      updatePlayLabel();
      updateTime();

      // mute
      muteBtn && muteBtn.addEventListener('click', (e) => {
        e.preventDefault();
        vid.muted = !vid.muted;
        muteBtn.textContent = vid.muted ? 'Unmute' : 'Mute';
      });

      // fullscreen (best effort)
      fsBtn && fsBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        try{
          const el = mediaWrap;
          if(document.fullscreenElement) await document.exitFullscreen();
          else if(el.requestFullscreen) await el.requestFullscreen();
          else if(vid.requestFullscreen) await vid.requestFullscreen();
        } catch(_) {}
      });
    };

    const timer = setInterval(() => {
      tries++;
      const vid = tryFindVideo();
      if(vid){
        clearInterval(timer);
        bindVideo(vid);
      }
      if(tries > 200) clearInterval(timer); // ~20s
    }, 100);
  });
})();
</script>

