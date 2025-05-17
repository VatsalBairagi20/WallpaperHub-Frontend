import React, { useEffect, useState } from "react";
import "./HomePage.css";

const HomePage = () => {
  const [tab, setTab] = useState("pc");
  const [wallpapers, setWallpapers] = useState([]);
  const [selectedWallpaper, setSelectedWallpaper] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`https://wallpaperhub-backend.onrender.com/api/wallpapers?device=${tab}`)
      .then((res) => res.json())
      .then((data) => {
        setWallpapers(data);
        setLoading(false);
      });
  }, [tab]);

  return (
    <div className="home-wrapper">
      <header className="home-header glassy">
        <h1 className="typewriter">Discover Epic Wallpapers</h1>
        <div className="tab-buttons">
          <button className={tab === "pc" ? "active" : ""} onClick={() => setTab("pc")}>PC</button>
          <button className={tab === "mobile" ? "active" : ""} onClick={() => setTab("mobile")}>Mobile</button>
        </div>
      </header>

      {loading ? (
        <div className="skeleton-grid">
          {[...Array(8)].map((_, i) => (
            <div className="skeleton-card" key={i}></div>
          ))}
        </div>
      ) : (
        <div className="wallpaper-grid fade-in">
          {wallpapers.map((wallpaper, index) => (
            <div
              className="wallpaper-card"
              key={index}
              onClick={() => setSelectedWallpaper(wallpaper)}
            >
              <img src={wallpaper.imageUrl} alt="Wallpaper preview" loading="lazy" />
              <div className="overlay-info">{wallpaper.category}</div>
            </div>
          ))}
        </div>
      )}

      {selectedWallpaper && (
        <div className="modal glassy" onClick={() => setSelectedWallpaper(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={selectedWallpaper.imageUrl} alt="Selected wallpaper" />
            <a href={selectedWallpaper.imageUrl} download className="download-btn">
              Download
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
