import { useState, useEffect } from 'react';
import io from 'socket.io-client';

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');
const socket = io(API_BASE);

const DEFAULT_CREATORS = [
  {
    id: 'default-1',
    name: 'Komal Pandey',
    handle: '@komalpandeyofficial',
    followers: '1.9M',
    category: 'Fashion & Styling',
    image: '/creators/komal_pandey.webp',
    imageUrl: '/creators/komal_pandey.webp'
  },
  {
    id: 'default-2',
    name: 'Kritika Khurana',
    handle: '@thatbohogirl',
    followers: '1.8M',
    category: 'Fashion & Travel',
    image: '/creators/kritika_khurana_festive.webp',
    imageUrl: '/creators/kritika_khurana_festive.webp'
  },
  {
    id: 'default-3',
    name: 'Aashika Bhatia',
    handle: '@aashikabhatia',
    followers: '5.7M',
    category: 'Lifestyle & Acting',
    image: '/creators/aashika_bhatia.webp',
    imageUrl: '/creators/aashika_bhatia.webp'
  },
  {
    id: 'default-4',
    name: 'Mrunal Panchal',
    handle: '@mrunu',
    followers: '4.8M',
    category: 'Beauty & Creative Art',
    image: '/creators/mrunal_panchal.webp',
    imageUrl: '/creators/mrunal_panchal.webp'
  },
  {
    id: 'default-5',
    name: 'Shruti Arjun Anand',
    handle: '@shrutiarjunanand',
    followers: '2.3M',
    category: 'Entertainment & Comedy',
    image: '/creators/shruti_arjun_anand.webp',
    imageUrl: '/creators/shruti_arjun_anand.webp'
  },
  {
    id: 'default-6',
    name: 'Jhanvi Bhatia',
    handle: '@jhanvibhatia',
    followers: '1.4M',
    category: 'Dance & Lifestyle',
    image: '/creators/jhanvi_bhatia.webp',
    imageUrl: '/creators/jhanvi_bhatia.webp'
  },
  {
    id: 'default-7',
    name: 'Malvika Sitlani',
    handle: '@malvikasitlaniofficial',
    followers: '1.2M',
    category: 'Beauty & Wellness',
    image: '/creators/malvika_sitlani.webp',
    imageUrl: '/creators/malvika_sitlani.webp'
  },
  {
    id: 'default-8',
    name: 'Sejal Kumar',
    handle: '@sejalkumar1195',
    followers: '1.1M',
    category: 'Music & Vlogging',
    image: '/creators/sejal_kumar.webp',
    imageUrl: '/creators/sejal_kumar.webp'
  },
  {
    id: 'default-9',
    name: 'Somya Gupta',
    handle: '@thesastheory',
    followers: '950K',
    category: 'Aesthetic Fashion',
    image: '/creators/somya_gupta.webp',
    imageUrl: '/creators/somya_gupta.webp'
  },
  {
    id: 'default-10',
    name: 'Riya Sharma',
    handle: '@riyasharma.live',
    followers: '1.6M',
    category: 'Glamour & Lifestyle',
    image: '/creators/creator_1.webp',
    imageUrl: '/creators/creator_1.webp'
  },
  {
    id: 'default-11',
    name: 'Radhika Seth',
    handle: '@radhikasethh',
    followers: '1.5M',
    category: 'Luxury & Couture',
    image: '/creators/creator_2.webp',
    imageUrl: '/creators/creator_2.webp'
  },
  {
    id: 'default-12',
    name: 'Tanya Khanijow',
    handle: '@tanyakhanijow',
    followers: '1.3M',
    category: 'Travel & Culture',
    image: '/creators/creator_3.webp',
    imageUrl: '/creators/creator_3.webp'
  },
  {
    id: 'default-13',
    name: 'Shreya Jain',
    handle: '@shreyajain26',
    followers: '1.1M',
    category: 'Heritage & Style',
    image: '/creators/creator_4.webp',
    imageUrl: '/creators/creator_4.webp'
  },
  {
    id: 'default-14',
    name: 'Meghna Kaur',
    handle: '@shetroublemaker',
    followers: '1.4M',
    category: 'Urban Fashion',
    image: '/creators/creator_5.webp',
    imageUrl: '/creators/creator_5.webp'
  },
  {
    id: 'default-15',
    name: 'Roshni Chopra',
    handle: '@roshnichopra',
    followers: '920K',
    category: 'Wellness & Living',
    image: '/creators/creator_6.webp',
    imageUrl: '/creators/creator_6.webp'
  },
  {
    id: 'default-16',
    name: 'Diipa Khosla',
    handle: '@diipakhosla',
    followers: '2.1M',
    category: 'Global Fashion',
    image: '/creators/creator_7.webp',
    imageUrl: '/creators/creator_7.webp'
  },
  {
    id: 'default-17',
    name: 'Ananya Roy',
    handle: '@ananyaroy.official',
    followers: '880K',
    category: 'Bridal & Couture',
    image: '/creators/kritika_khurana.webp',
    imageUrl: '/creators/kritika_khurana.webp'
  }
];

export function useCreatorRoster() {
  const [creators, setCreators] = useState(DEFAULT_CREATORS);
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
