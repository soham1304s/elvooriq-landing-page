import React from 'react';
import { motion } from 'framer-motion';
import { fadeIn } from '../utils/animations';
import { Link } from 'react-router-dom';
import { useCreatorRoster } from '../hooks/useCreatorRoster';
import './CreatorsMarquee.css';

const getObjectPosition = (image = '') => {
  const src = image.toLowerCase();
  if (src.includes('creator_4') || src.includes('creator 4')) return 'center 10%';
  if (src.includes('creator_6') || src.includes('creator 6')) return 'center 8%';
  if (src.includes('creator_1') || src.includes('creator 1')) return 'center 14%';
  if (src.includes('creator_2') || src.includes('creator 2')) return 'center 22%';
  if (src.includes('creator_3') || src.includes('creator 3')) return 'center 16%';
  if (src.includes('creator_5') || src.includes('creator 5')) return 'center 18%';
  if (src.includes('creator_7') || src.includes('creator 7')) return 'center 16%';
  if (src.includes('komal')) return 'center 14%';
  if (src.includes('mrunal')) return 'center 10%';
  if (src.includes('malvika')) return 'center 14%';
  if (src.includes('aashika')) return 'center 14%';
  if (src.includes('sejal')) return 'center 18%';
  if (src.includes('shruti')) return 'center 18%';
  if (src.includes('jhanvi')) return 'center 18%';
  if (src.includes('somya')) return 'center 15%';
  if (src.includes('kritika')) return 'center 18%';
  return 'center 18%';
};

const getCategoryBadgeClass = (category = '') => {
  const cat = category.toLowerCase();
  if (cat.includes('beauty') || cat.includes('glam')) return 'badge-beauty';
  if (cat.includes('fashion') || cat.includes('style') || cat.includes('couture')) return 'badge-fashion';
  if (cat.includes('travel') || cat.includes('culture')) return 'badge-travel';
  if (cat.includes('dance') || cat.includes('entertainment') || cat.includes('acting') || cat.includes('comedy')) return 'badge-entertainment';
  if (cat.includes('wellness') || cat.includes('living')) return 'badge-wellness';
  return 'badge-general';
};

const CreatorCard = ({ creator }) => {
  const imageSrc = creator.imageUrl || creator.image;
  const objectPosition = getObjectPosition(imageSrc);
  const badgeClass = getCategoryBadgeClass(creator.category || '');

  return (
    <div className="creator-card">
      <div className="creator-image-wrap">
        <img
          src={imageSrc}
          alt={creator.name}
          className="creator-image"
          style={{ objectPosition }}
          loading="lazy"
        />
        <div className="creator-ambient-glow" />
      </div>

      {creator.category && (
        <div className={`creator-category-badge ${badgeClass}`}>
          <span>{creator.category}</span>
        </div>
      )}

      <div className="creator-overlay">
        <div className="creator-info-left">
          <div className="creator-name-row">
            <h4 className="creator-name">{creator.name}</h4>
            <span className="creator-verified-badge" title="Verified Creator">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          </div>
          <p className="creator-stats">
            <span className="creator-platform">{creator.handle}</span>
            <span className="creator-dot">·</span>
            <span className="creator-followers">{creator.followers}</span>
          </p>
        </div>

        <div className="creator-action-btn" title="View Portfolio">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <line x1="7" y1="17" x2="17" y2="7" />
            <polyline points="7 7 17 7 17 17" />
          </svg>
        </div>
      </div>
    </div>
  );
};

const CreatorsMarquee = () => {
  const { creators } = useCreatorRoster();

  if (!creators || creators.length === 0) {
    return null;
  }

  // Divide into two alternating balanced rows
  const row1Base = creators.filter((_, i) => i % 2 === 0);
  const row2Base = creators.filter((_, i) => i % 2 !== 0);

  // Duplicate arrays for smooth infinite scrolling
  const row1 = [...row1Base, ...row1Base];
  const row2 = [...row2Base, ...row2Base];

  return (
    <section className="creators-marquee-section">
      <div className="marquee-header-bar">
        <div className="marquee-header-left">
          <span className="marquee-eyebrow">
            <span className="eyebrow-pulse-dot" />
            VERIFIED TALENT ROSTER
          </span>
          <h2 className="marquee-section-heading">Top Managed Creators</h2>
        </div>
        <div className="marquee-header-right">
          <Link to="/admin" className="add-creator-btn-small">
            <span className="btn-plus-icon">+</span>
            <span>Manage Creators</span>
          </Link>
        </div>
      </div>

      <motion.div
        className="marquee-container"
        variants={fadeIn}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        {/* Row 1 - scrolling left */}
        <div className="marquee-row marquee-left">
          <div className="marquee-track">
            {row1.map((creator, index) => (
              <CreatorCard key={`row1-${creator.id || creator.handle}-${index}`} creator={creator} />
            ))}
          </div>
        </div>

        {/* Row 2 - scrolling right */}
        <div className="marquee-row marquee-right">
          <div className="marquee-track-reverse">
            {row2.map((creator, index) => (
              <CreatorCard key={`row2-${creator.id || creator.handle}-${index}`} creator={creator} />
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default CreatorsMarquee;
