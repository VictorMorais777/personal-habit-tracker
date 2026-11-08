import { useState, useEffect } from "react";
import api from "../services/api";

const cache = new Map(); //

function Avatar({ userId, name, photoVersion, size = "w-12 h-12", textSize = "text-lg" }) {
  const key = photoVersion ? `${userId}:${photoVersion}` : null;
  const [src, setSrc] = useState(() => (key ? cache.get(key) || null : null));

  useEffect(() => {
    if (!key) {
      setSrc(null);
      return;
    }
    if (cache.has(key)) {
      setSrc(cache.get(key));
      return;
    }

    let cancelled = false;
    api
      .get(`/users/${userId}/photo`, { params: { v: photoVersion }, responseType: "blob" })
      .then((response) => {
        const url = URL.createObjectURL(response.data);
        cache.set(key, url);
        if (!cancelled) setSrc(url);
      })
      .catch(() => {
        if (!cancelled) setSrc(null);
      });

    return () => {
      cancelled = true;
    };
  }, [key, userId, photoVersion]);

  if (src) {
    return (
      <img
        src={src}
        alt={`Foto de ${name}`}
        className={`${size} rounded-full object-cover border border-zinc-700 shrink-0`}
      />
    );
  }

  const initial = (name || "?").trim().charAt(0).toUpperCase();
  return (
    <div
      aria-hidden="true"
      className={`${size} ${textSize} rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/30 flex items-center justify-center font-bold shrink-0`}
    >
      {initial}
    </div>
  );
}

export default Avatar;