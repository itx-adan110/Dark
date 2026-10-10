(() => {
  const video = document.getElementById('filmVideo');
  const track = document.getElementById('scrollTrack');
  const intro = document.getElementById('intro');
  const progressBar = document.getElementById('progressBar');
  let duration = 0;
  let targetTime = 0;
  let frameRequested = false;
  let lastSetTime = -1;
  let ready = false;

  // Keep the movie paused: scrolling scrubs its timeline in either direction.
  video.pause();
  video.addEventListener('loadedmetadata', () => {
    duration = Number.isFinite(video.duration) ? video.duration : 0;
    ready = duration > 0;
    syncToScroll(true);
  });
  video.addEventListener('error', () => {
    // If a browser cannot select a source via <source media>, choose one explicitly.
    if (!video.dataset.fallback) {
      video.dataset.fallback = '1';
      const mobile = matchMedia('(max-width: 767px)').matches;
      video.src = mobile ? 'zombies.1920x1080.mp4' : 'zombies.3840x2160.mp4';
      video.load();
    }
  });

  function syncToScroll(force = false) {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const progress = Math.min(1, Math.max(0, scrollY / maxScroll));
    targetTime = duration ? progress * Math.max(0, duration - 0.04) : 0;
    progressBar.style.width = `${progress * 100}%`;
    intro.classList.toggle('is-hidden', progress > 0.015);
    if (force) lastSetTime = -1;
    if (!frameRequested) {
      frameRequested = true;
      requestAnimationFrame(renderFrame);
    }
  }

  function renderFrame() {
    frameRequested = false;
    if (ready && Math.abs(targetTime - lastSetTime) > 0.025) {
      try {
        video.currentTime = targetTime;
        lastSetTime = targetTime;
      } catch (_) { /* Wait until the browser has initialized the media timeline. */ }
    }
  }

  addEventListener('scroll', () => syncToScroll(), { passive: true });
  addEventListener('resize', () => syncToScroll(true), { passive: true });
  addEventListener('pageshow', () => syncToScroll(true));
  // Encourage metadata loading without autoplaying or producing sound.
  video.load();
})();
