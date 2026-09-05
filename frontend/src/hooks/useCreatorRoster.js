import { useState, useEffect } from 'react';
import io from 'socket.io-client';

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');
const socket = io(API_BASE);

export function useCreatorRoster() {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial data fetch from REST endpoint
    fetch(`${API_BASE}/api/creators`)
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data) ? data : (data.creators || []);
        setCreators(list.map(c => ({
          ...c,
          image: c.imageUrl || c.image
        })));
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Listen for live update events from the server
    const handleUpdate = (updatedData) => {
      if (Array.isArray(updatedData)) {
        setCreators(updatedData.map(c => ({
          ...c,
          image: c.imageUrl || c.image
        })));
      } else {
        fetch(`${API_BASE}/api/creators`)
          .then(res => res.json())
          .then(data => {
            const list = Array.isArray(data) ? data : (data.creators || []);
            setCreators(list.map(c => ({
              ...c,
              image: c.imageUrl || c.image
            })));
          })
          .catch(() => {});
      }
    };

    socket.on('content:updated', handleUpdate);
    socket.on('content:updated:event', handleUpdate);

    return () => {
      socket.off('content:updated', handleUpdate);
      socket.off('content:updated:event', handleUpdate);
    };
  }, []);

  return { creators, loading };
}
