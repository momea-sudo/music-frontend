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
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);

  
  useEffect(() => {
    if (window.location.pathname === '/admin' || window.location.pathname === '/login') {
      setView('login');
    } else {
      fetch(`${API_BASE_URL}/tracks`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setTracksData(data);
            if (data.length > 0) setCurrentTrack(data[0]);
          }
        })
        .catch(err => console.error("Error tracks:", err));

      fetch(`${API_BASE_URL}/videos`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setVideosData(data);
        })
        .catch(err => console.error("Error videos:", err));
    }
  }, []); 

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (window.location.pathname === '/admin' || window.location.pathname === '/login') {
      if (token) {
        setView('admin'); 
      } else {
        setView('login'); 
      }
    }
  }, []);

  useEffect(() => {
    const moveCursor = (e) => setCursorPos({ x: e.clientX, y: e.clientY });
    const handleMouseOver = (e) => {
      if (!e.target) return;
      try {
        const targetElement = e.target;
        if (targetElement.tagName === 'BUTTON' || targetElement.tagName === 'A' || (targetElement.closest && (targetElement.closest('.track-card-horizontal') || targetElement.closest('.video-card') || targetElement.closest('.hero-social-icon')))) {
          setIsHovered(true);
        } else {
          setIsHovered(false);
        }
      } catch (err) { setIsHovered(false); }
    };
    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleMouseOver);
    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('revealed');
        else entry.target.classList.remove('revealed');
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.scroll-reveal').forEach((el) => observer.observe(el));
    return () => document.querySelectorAll('.scroll-reveal').forEach((el) => observer.unobserve(el));
  }, [view, tracksData, videosData]);

  useEffect(() => {
    if (!currentTrack) return;
    if (!audioRef.current) audioRef.current = new Audio(currentTrack.url);
    else audioRef.current.src = currentTrack.url;

    const audio = audioRef.current;
    const setAudioData = () => setDuration(audio.duration);
    const setAudioTime = () => setCurrentTime(audio.currentTime);

    audio.addEventListener('loadeddata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);

    if (isPlaying) audio.play().catch(err => console.log(err));

    return () => {
      audio.pause();
      audio.removeEventListener('loadeddata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
    };
  }, [currentTrack]);

  const togglePlay = () => {
    if (!currentTrack) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play().catch(err => console.log(err));
    setIsPlaying(!isPlaying);
  };

  const handleProgressClick = (e) => {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const newTime = ((e.clientX - rect.left) / rect.width) * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "00:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;


  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const response = await fetch(`${API_BASE_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput, password: passwordInput })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        localStorage.setItem('adminToken', data.token);
        setView('admin');
        
        
        fetch(`${API_BASE_URL}/tracks`).then(res=>res.json()).then(d => setTracksData(d));
        fetch(`${API_BASE_URL}/videos`).then(res=>res.json()).then(d => setVideosData(d));
      } else {
        setLoginError(data.message || 'البيانات غير صحيحة');
      }
    } catch (err) {
      alert('فشل الاتصال بالباكيند، تأكد أنه يعمل على بورت 5000');
    }
  };

  
 const handleAddTrack = (e) => {
  e.preventDefault();
  fetch(`${API_BASE_URL}/tracks`, {
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
    alert('تم حفظ التراك بنجاح!');
  })
  .catch(() => alert('السيرفر لم يقم بحفظ التراك بشكل صحيح'));
};
  
  const handleDeleteTrack = (id) => {
    if (!confirm("عايز تمسح التراك ده؟")) return;
    fetch(`${API_BASE_URL}/tracks/${id}`, { method: 'DELETE' })
    .then(res => {
      if (res.ok) {
        setTracksData(tracksData.filter(t => t._id !== id));
        alert('تم مسح التراك!');
      }
    })
    .catch(() => alert('حدثت مشكلة أثناء الحذف'));
  };

  
  const handleAddVideo = (e) => {
  e.preventDefault();
  fetch(`${API_BASE_URL}/videos`, {
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
    alert('تم حفظ الفيديو بنجاح!');
  })
  .catch(() => alert('السيرفر لم يقم بحفظ الفيديو بشكل صحيح'));
};

 
  const handleDeleteVideo = (id) => {
    if (!confirm("عايز تمسح الفيديو ده؟")) return;
    fetch(`${API_BASE_URL}/videos/${id}`, { method: 'DELETE' })
    .then(res => {
      if (res.ok) {
        setVideosData(videosData.filter(v => v._id !== id));
        alert('تم مسح الفيديو!');
      }
    })
    .catch(() => alert('حدثت مشكلة أثناء الحذف'));
  };

  if (view === 'login') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#050507', padding: '20px' }}>
        <div style={{ background: '#111113', padding: '40px', borderRadius: '12px', border: '1px solid rgba(0,255,204,0.1)', width: '100%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 0 40px rgba(0,0,0,0.8)' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '950', marginBottom: '10px' }}>SECURE <span className="text-neon">GATEWAY</span></h2>
          <p style={{ color: '#71717a', fontSize: '13px', marginBottom: '25px' }}>منطقة محمية لإدارة محتوى محمد بيكو</p>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input type="email" placeholder="البريد الإلكتروني للـ Admin" value={emailInput} onChange={e => setEmailInput(e.target.value)} style={{ padding: '14px', background: '#050507', border: '1px solid #27272a', borderRadius: '6px', color: '#fff', textAlign: 'right' }} required />
            <input type="password" placeholder="كلمة المرور السرية" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} style={{ padding: '14px', background: '#050507', border: '1px solid #27272a', borderRadius: '6px', color: '#fff', textAlign: 'right' }} required />
            {loginError && <p style={{ color: '#ff3366', fontSize: '13px', fontWeight: '700', marginTop: '5px' }}>{loginError}</p>}
            <button type="submit" className="btn-filled" style={{ width: '100%', marginTop: '10px' }}>تأكيد الدخول</button>
          </form>
          <button style={{ background: 'transparent', border: 'none', color: '#a1a1aa', marginTop: '20px', cursor: 'pointer', fontSize: '13px' }} onClick={() => { window.history.pushState({}, '', '/'); setView('site'); }}>← عودة للموقع الرئيسي</button>
        </div>
      </div>
    );
  }

  if (view === 'admin') {
    return (
      <div className="admin-dashboard-layout" style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', borderBottom: '1px solid #27272a', paddingBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '950' }}>M.BIKO <span className="text-neon">DASHBOARD</span></h1>
            <p style={{ color: '#71717a', marginTop: '5px' }}>مرحباً بك يا فنان - البيانات تحفظ الآن في قاعدة البيانات سحابياً 🌐</p>
          </div>
          <button className="btn-dark" style={{ borderColor: '#ff3366', color: '#ff3366' }} onClick={() => { localStorage.removeItem('adminToken'); setEmailInput(''); setPasswordInput(''); window.history.pushState({}, '', '/'); setView('site'); }}>تسجيل الخروج 🚪</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
          <div style={{ background: '#111113', padding: '30px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '20px', color: '#00ffcc' }}>🎛️ إدارة التراكات الصوتية</h2>
            <form onSubmit={handleAddTrack} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
              <input type="text" placeholder="اسم تراك محمد بيكو الجديد" value={newTrackTitle} onChange={e => setNewTrackTitle(e.target.value)} style={{ padding: '12px', background: '#050507', border: '1px solid #27272a', borderRadius: '6px', color: '#fff' }} />
              <input type="text" placeholder="رابط ملف الـ MP3" value={newTrackUrl} onChange={e => setNewTrackUrl(e.target.value)} style={{ padding: '12px', background: '#050507', border: '1px solid #27272a', borderRadius: '6px', color: '#fff' }} />
              <button type="submit" className="btn-filled" style={{ width: '100%' }}>+ إضافة التراك للموقع</button>
            </form>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {tracksData.map((track, i) => (
                <div key={track._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#18181b', padding: '12px 15px', borderRadius: '6px' }}>
                  <span style={{ fontWeight: '600', fontSize: '14px' }}>{i+1}. {track.title}</span>
                  <button onClick={() => handleDeleteTrack(track._id)} style={{ background: '#ff3366', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>حذف</button>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: '#111113', padding: '30px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '20px', color: '#00ffcc' }}>🎬 إدارة كليبات اليوتيوب</h2>
            <form onSubmit={handleAddVideo} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
              <input type="text" placeholder="عنوان الكليب الجديد" value={newVideoTitle} onChange={e => setNewVideoTitle(e.target.value)} style={{ padding: '12px', background: '#050507', border: '1px solid #27272a', borderRadius: '6px', color: '#fff' }} />
              <input type="text" placeholder="كود الفيديو (ID) من يوتيوب" value={newVideoId} onChange={e => setNewVideoId(e.target.value)} style={{ padding: '12px', background: '#050507', border: '1px solid #27272a', borderRadius: '6px', color: '#fff' }} />
              <button type="submit" className="btn-filled" style={{ width: '100%', background: '#7000ff', color: '#fff' }}>+ إضافة الفيديو للموقع</button>
            </form>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {videosData.map((video, i) => (
                <div key={video._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#18181b', padding: '12px 15px', borderRadius: '6px' }}>
                  <span style={{ fontWeight: '600', fontSize: '14px' }}>{i+1}. {video.title}</span>
                  <button onClick={() => handleDeleteVideo(video._id)} style={{ background: '#ff3366', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>حذف</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh', width: '100%', overflowX: 'hidden' }} className={isHovered ? 'cursor-hover-active' : ''}>
      <div className="custom-cyber-cursor" style={{ left: `${cursorPos.x}px`, top: `${cursorPos.y}px` }}></div>
      <div className="custom-cursor-follower" style={{ left: `${cursorPos.x}px`, top: `${cursorPos.y}px` }}></div>
      <div className="matrix-bg-lines"></div>
      <div className="glow-1"></div>
      <div className="glow-2"></div>

      <nav className="navbar">
        <div className="logo" style={{ fontSize: '22px', fontWeight: '950', letterSpacing: '2px' }}>M.BIKO<span className="text-neon">OFFICIAL</span></div>
        <div className="nav-links">
          <a href="#home" className="active">HOME</a>
          <a href="#tracks">TRACKS</a>
          <a href="#videos">VIDEOS</a>
        </div>
      </nav>

      <header className="hero-container" id="home">
        <div className="hero-grid">
          <div className="hero-content">
            <span style={{ fontSize: '12px', fontWeight: '900', letterSpacing: '4px', color: '#00ffcc', marginBottom: '10px' }}>OFFICIAL ARTIST</span>
            <h1>MOHAMED <br /><span className="text-gradient">BIKO</span></h1>
            <p dir="rtl" style={{ color: '#a1a1aa', fontSize: '18px', lineHeight: '1.8', marginBottom: '35px', maxWidth: '540px', textAlign: 'left' }}>
              بصمة صوتية حادة تشرح <span className="text-neon" style={{ fontWeight: '700' }}>واقع الشارع</span> بدون تزييف. <br />
              إيقاعات ثقيلة، كلمات تضرب في العصب، وهندسة صوتية تعيد رسم مشهد الـ Underground العربي.
            </p>
            <div className="hero-buttons" style={{ display: 'flex', gap: '20px', marginBottom: '25px' }}>
              <a href="#tracks"><button className="btn-filled">🔥 PLAY TRACKS</button></a>
              <a href="https://www.youtube.com/@mohamedbiko11" target="_blank" rel="noreferrer"><button className="btn-dark">SUBSCRIBE ON YT</button></a>
            </div>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <a href="https://www.youtube.com/@mohamedbiko11" target="_blank" rel="noreferrer" className="hero-social-icon yt-icon"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 0 0-2.11 2.113C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.508 9.388.508 9.388.508s7.518 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></a>
              <a href="https://www.instagram.com/mohamed_biko1" target="_blank" rel="noreferrer" className="hero-social-icon ig-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg></a>
            </div>
          </div>

          <div className="image-wrapper" style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
            <div className="biko-neon-card cyber-float">
              <div className="glow-layer cyan-glow"></div>
              <div className="glow-layer magenta-glow"></div>
              <div className="scratch-texture-overlay"></div>
              <img src={bikoImg} alt="Mohamed Biko" className="biko-hero-img" />
              <div className="biko-card-bottom-shadow"></div>
            </div>
          </div>
        </div>
      </header> 

      <section className="tracks-section scroll-reveal" id="tracks">
        <h2 className="section-title">LATEST <span className="text-neon">TRACKS</span></h2>
        <div className="modern-tracks-layout" style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          <div className="main-player-card scroll-reveal" style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '30px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <div className={`player-cover-art ${isPlaying ? 'spinning' : ''}`}>💿</div>
              <div style={{ flex: '1', minWidth: '250px', textAlign: 'left' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '900', marginBottom: '6px', color: '#fff' }}>{currentTrack ? currentTrack.title : "No Track Selected"}</h3>
                <p style={{ color: '#00ffcc', fontSize: '14px', fontWeight: '700', marginBottom: '15px' }}>MOHAMED BIKO</p>
                <div className="progress-container" onClick={handleProgressClick}><div className="progress-bar" style={{ width: `${progressPercent}%` }}></div></div>
                <div className="time-stamps"><span>{formatTime(currentTime)}</span><span>{formatTime(duration)}</span></div>
              </div>
              <div className="player-controls">
                <button className="control-btn" onClick={() => { if(audioRef.current) audioRef.current.currentTime = 0; }}>⏮</button>
                <button className="control-btn play-toggle" onClick={togglePlay}>{isPlaying ? '⏸' : '▶'}</button>
                <button className="control-btn">⏭</button>
              </div>
            </div>
          </div>

          <div className="tracks-horizontal-container" style={{ display: 'flex', gap: '20px', overflowX: 'auto', padding: '10px 5px 20px 5px' }}>
            {tracksData.map((track, index) => (
              <div key={track._id} className={`track-card-horizontal ${currentTrack && currentTrack._id === track._id ? 'active' : ''}`} onClick={() => { setCurrentTrack(track); setIsPlaying(true); }}>
                <div className="track-card-top">
                  <span className="track-number-badge">{index + 1 < 10 ? `0${index + 1}` : index + 1}</span>
                  <div>🎵</div>
                </div>
                <div className="track-card-body"><span className="track-card-title-text">{track.title}</span></div>
                <div className="track-card-footer"><span className="play-hint">CLICK TO PLAY</span></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="videos-section scroll-reveal" id="videos">
        <h2 className="section-title">VIDEO <span className="text-neon">VAULT</span></h2>
        <div className="videos-grid">
          {videosData.map((video) => (
            <div key={video._id} className="video-card scroll-reveal" onClick={() => { setActiveVideoId(video.youtubeId); if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); } }}>
              <div className="video-thumbnail-wrapper">
                <img src={video.thumbnail} alt={video.title} className="video-thumbnail" />
                <div className="video-play-overlay"><span className="play-icon-mesh">▶</span></div>
              </div>
              <h3 className="video-card-title">{video.title}</h3>
            </div>
          ))}
        </div>
      </section>

      <footer className="main-footer">
        <div className="footer-content">
          <div className="footer-logo">M.BIKO<span className="text-neon">OFFICIAL</span></div>
          <p className="footer-text">© 2026 ALL RIGHTS RESERVED. DESIGNED BY MoMea | Developer.</p>
          <div className="footer-socials">
            <a href="https://www.youtube.com/@mohamedbiko11" target="_blank" rel="noreferrer" className="social-link">YOUTUBE</a>
            <a href="https://www.instagram.com/mohamed_biko1" target="_blank" rel="noreferrer" className="social-link">INSTAGRAM</a>
          </div>
        </div>
      </footer>

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