import React, { useState, useEffect, useCallback } from "react";
import "./HomePage.css";

const HomePage = () => {
  const [wallpapers, setWallpapers] = useState([]);
  const [activeTab, setActiveTab] = useState("pc");
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [selectedWallpaper, setSelectedWallpaper] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchWallpapers = useCallback(async () => {
    try {
      setLoading(true);
      const backendRes = await fetch("https://wallpaperhub-backend.onrender.com/api/get-wallpapers");
      const backendData = await backendRes.json();
      setWallpapers(backendData.wallpapers);
    } catch (error) {
      console.error("Error fetching wallpapers:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWallpapers();
    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [fetchWallpapers]);

  const pcWallpapers = wallpapers.filter((wp) => wp.device.toLowerCase() === "pc");
  const mobileWallpapers = wallpapers.filter((wp) => wp.device.toLowerCase() === "mobile");

  const openModal = (wallpaper) => setSelectedWallpaper(wallpaper);
  const closeModal = () => setSelectedWallpaper(null);

  const getImageUrl = (url) => url.startsWith("http") ? url : `https://wallpaperhub-backend.onrender.com${url}`;

  const handleDownload = async (url, name) => {
    setIsDownloading(true);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = name || "wallpaper.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      alert("Download started!");
    } catch (err) {
      console.error(err);
      alert("Failed to download wallpaper.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="homepage-container">
      {/* ... keep rest of the JSX unchanged ... */}
    </div>
  );
};

export default HomePage;
