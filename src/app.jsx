import React, { useState, useEffect, useRef } from 'react';
import bikoImg from './assets/biko.jpg'; 

function App() {
  const YOUTUBE_URL = "https://www.youtube.com/@mohamedbiko11";
  const INSTAGRAM_URL = "https://www.instagram.com/mohamed_biko1";
  
  
  const API_BASE_URL = "https://bikoofficial-154277842591.europe-west1.run.app"; 

  const [view, setView] = useState('site');
  const [tracksData, setTracksData] = useState([]);
  const [videosData, setVideosData] = useState([]);

  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeVideoId, setActiveVideoId] = useState(null);

  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [newTrackTitle, setNewTrackTitle] = useState('');
  const [newTrackUrl, setNewTrackUrl] = useState('');
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoId, setNewVideoId] = useState('');

  const audioRef = useRef(null);

  
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/tracks`)
      .then(res => res.json())
      .then(data => setTracksData(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));

    fetch(`${API_BASE_URL}/api/videos`)
      .then(res => res.json())
      .then(data => setVideosData(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  }, []);

  
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const formatTime = (time) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSeek = (e) => {
    const seekTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const handleTrackSelect = (track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    fetch(`${API_BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailInput, password: passwordInput })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setView('admin');
        setLoginError('');
      } else {
        setLoginError(data.message || 'خطأ في البيانات');
      }
    })
    .catch(() => setLoginError('فشل الاتصال بالسيرفر'));
  };

  const handleAddTrack = (e) => {
    e.preventDefault();
    fetch(`${API_BASE_URL}/api/tracks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTrackTitle, url: newTrackUrl })
    })
    .then(res => {
      if (!res.ok) throw new Error();
      return res.json();
    })
    .then(data => {
      setTracksData([...tracksData, data]);
      setNewTrackTitle('');
      setNewTrackUrl('');
      alert('تم إضافة التراك بنجاح!');
    })
    .catch(() => alert('حدث خطأ أثناء إضافة التراك'));
  };

  const handleAddVideo = (e) => {
    e.preventDefault();
    fetch(`${API_BASE_URL}/api/videos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newVideoTitle, videoId: newVideoId })
    })
    .then(res => {
      if (!res.ok) throw new Error();
      return res.json();
    })
    .then(data => {
      setVideosData([...videosData, data]);
      setNewVideoTitle('');
      setNewVideoId('');
      alert('تم إضافة الفيديو بنجاح!');
    })
    .catch(() => alert('حدث خطأ أثناء إضافة الفيديو'));
  };

  const handleDeleteTrack = (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا التراك؟')) return;
    fetch(`${API_BASE_URL}/api/tracks/${id}`, { method: 'DELETE' })
      .then(res => {
        if (!res.ok) throw new Error();
        setTracksData(tracksData.filter(t => t._id !== id));
        alert('تم الحذف بنجاح');
      })
      .catch(() => alert('فشل الحذف'));
  };

  const handleDeleteVideo = (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الفيديو؟')) return;
    fetch(`${API_BASE_URL}/api/videos/${id}`, { method: 'DELETE' })
      .then(res => {
        if (!res.ok) throw new Error();
        setVideosData(videosData.filter(v => v._id !== id));
        alert('تم الحذف بنجاح');
      })
      .catch(() => alert('فشل الحذف'));
  };

  return (
    <div className="app-container">
      <header className="main-header">
        <div className="logo" onClick={() => setView('site')}>M.BIKO<span className="text-neon">OFFICIAL</span></div>
        <button className="admin-btn" onClick={() => setView(view === 'login' || view === 'admin' ? 'site' : 'login')}>
          {view === 'admin' ? 'لوحة التحكم' : view === 'login' ? 'الموقع العام' : 'دخول الأدمن'}
        </button>
      </header>

      {view === 'site' && (
        <>
          <section className="hero-section">
            <div className="hero-img-container">
              <img src={bikoImg} alt="Mohamed Biko" className="hero-img" />
            </div>
            <h1 className="hero-title">MOHAMED BIKO</h1>
            <p className="hero-subtitle">MUSIC PRODUCER & SOUND ENGINEER</p>
          </section>

          <section className="tracks-section">
            <h2 className="section-title">AUDIO TRACKS</h2>
            <div className="tracks-list">
              {tracksData.map((track) => (
                <div key={track._id} className={`track-row ${currentTrack?._id === track._id ? 'active' : ''}`} onClick={() => handleTrackSelect(track)}>
                  <span className="track-play-icon">{currentTrack?._id === track._id && isPlaying ? '⏸' : '▶'}</span>
                  <span className="track-name">{track.title}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="videos-section">
            <h2 className="section-title">LATEST VIDEOS</h2>
            <div className="videos-grid">
              {videosData.map((video) => (
                <div key={video._id} className="video-card" onClick={() => setActiveVideoId(video.youtubeId)}>
                  <div className="video-thumbnail-wrapper">
                    <img src={video.thumbnail || `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`} alt={video.title} className="video-thumbnail" />
                    <div className="play-overlay">▶</div>
                  </div>
                  <h3 className="video-card-title">{video.title}</h3>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {view === 'login' && (
        <section className="login-section">
          <form className="login-form" onSubmit={handleLogin}>
            <h2>تسجيل الدخول للأدمن</h2>
            {loginError && <p className="error-text">{loginError}</p>}
            <input type="email" placeholder="البريد الإلكتروني" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} required />
            <input type="password" placeholder="كلمة المرور" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} required />
            <button type="submit" className="submit-btn">دخول</button>
          </form>
        </section>
      )}

      {view === 'admin' && (
        <section className="admin-dashboard">
          <h2 className="section-title">لوحة التحكم لإدارة المحتوى</h2>
          
          <div className="admin-grid">
            <div className="admin-box">
              <h3>إضافة تراك صوتي جديد</h3>
              <form onSubmit={handleAddTrack}>
                <input type="text" placeholder="اسم التراك" value={newTrackTitle} onChange={(e) => setNewTrackTitle(e.target.value)} required />
                <input type="url" placeholder="رابط الـ MP3 المباشر" value={newTrackUrl} onChange={(e) => setNewTrackUrl(e.target.value)} required />
                <button type="submit" className="add-btn">إضافة التراك</button>
              </form>
              <div className="admin-items-list">
                {tracksData.map(t => (
                  <div key={t._id} className="admin-item">
                    <span>{t.title}</span>
                    <button className="del-btn" onClick={() => handleDeleteTrack(t._id)}>حذف</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="admin-box">
              <h3>إضافة فيديو يوتيوب جديد</h3>
              <form onSubmit={handleAddVideo}>
                <input type="text" placeholder="عنوان الفيديو" value={newVideoTitle} onChange={(e) => setNewVideoTitle(e.target.value)} required />
                <input type="text" placeholder="رابط فيديو اليوتيوب الكامل" value={newVideoId} onChange={(e) => setNewVideoId(e.target.value)} required />
                <button type="submit" className="add-btn">إضافة الفيديو</button>
              </form>
              <div className="admin-items-list">
                {videosData.map(v => (
                  <div key={v._id} className="admin-item">
                    <span>{v.title}</span>
                    <button className="del-btn" onClick={() => handleDeleteVideo(v._id)}>حذف</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <footer className="main-footer">
        <div className="footer-content">
          <div className="footer-logo">M.BIKO<span className="text-neon">OFFICIAL</span></div>
          <p className="footer-text">© 2026 ALL RIGHTS RESERVED. DESIGNED BY MoMea | Developer.</p>
          <div className="footer-socials">
            <a href={YOUTUBE_URL} target="_blank" rel="noreferrer" className="social-link">YOUTUBE</a>
            <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="social-link">INSTAGRAM</a>
          </div>
        </div>
      </footer>

      {currentTrack && (
        <audio ref={audioRef} src={currentTrack.url} onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleLoadedMetadata} onEnded={() => setIsPlaying(false)} />
      )}

      {currentTrack && (
        <div className="player-bar">
          <div className="player-info">
            <div className="player-title">{currentTrack.title}</div>
          </div>
          <div className="player-controls">
            <button className="play-pause-btn" onClick={() => setIsPlaying(!isPlaying)}>{isPlaying ? '⏸' : '▶'}</button>
            <div className="progress-container">
              <span>{formatTime(currentTime)}</span>
              <input type="range" min="0" max={duration || 0} value={currentTime} onChange={handleSeek} className="progress-bar" />
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>
      )}

      {activeVideoId && (
        <div className="lightbox-overlay" onClick={() => setActiveVideoId(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setActiveVideoId(null)}>×</button>
            <div className="video-responsive-container">
              <iframe src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=1`} title="Video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;