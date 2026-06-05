'use client';

import { useState } from 'react';
import { Building2, Heart, Home, Trash2 } from 'lucide-react';
import type { CommunityPost } from '@/lib/types';
import { formatRelative } from '@/lib/fmt';
import Card from '@/components/shared/Card';
import Avatar from '@/components/shared/Avatar';

interface Props {
  post: CommunityPost;
  currentUserId: string;
  currentUnitId?: string;
  currentEstateId?: string;
  canDelete?: boolean;
  onLike: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function CommunityPostCard({
  post, currentUserId, currentUnitId, currentEstateId, canDelete, onLike, onDelete,
}: Props) {
  const isOwn = post.authorId === currentUserId;
  const liked = post.likedBy.includes(currentUserId);
  const showDelete = canDelete ?? isOwn;
  const isMentioned = post.mentions?.some(m =>
    (m.type === 'unit' && m.id === currentUnitId) ||
    (m.type === 'estate' && m.id === currentEstateId)
  ) ?? false;

  const [lightbox, setLightbox] = useState<string | null>(null);

  return (
    <Card>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        {post.isAnonymous
          ? <div style={{
              width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
              background: 'rgba(120,120,128,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, color: 'var(--color-ash)',
            }}>?</div>
          : <Avatar name={post.authorName} size={38} />
        }
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, fontSize: 14, color: post.isAnonymous ? 'var(--color-ash)' : 'var(--color-midnight-ink)', fontStyle: post.isAnonymous ? 'italic' : 'normal' }}>
              {post.authorName}
            </span>
            {!post.isAnonymous && (
            <span style={{
              fontSize: 11, fontWeight: 600, color: 'var(--color-electric-violet)',
              background: 'var(--color-violet-tint)', borderRadius: 'var(--radius-pill)', padding: '2px 8px',
            }}>
              {post.unitNumber}
            </span>
            )}
            {isMentioned && (
              <span style={{
                fontSize: 11, fontWeight: 600, color: '#fff',
                background: 'var(--color-cta)', borderRadius: 'var(--radius-pill)', padding: '2px 8px',
              }}>
                Jūs paminėtas
              </span>
            )}
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-ash)', marginTop: 1 }}>
            {formatRelative(post.createdAt)}
          </div>
        </div>
        {showDelete && (
          <button
            onClick={() => onDelete(post.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--color-ash)', borderRadius: 8, display: 'flex' }}
            title="Ištrinti"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Body */}
      <p style={{ fontSize: 14, color: 'var(--color-midnight-ink)', lineHeight: 1.6, margin: 0, marginBottom: 12 }}>
        {post.body}
      </p>

      {/* Images */}
      {post.imageUrls && post.imageUrls.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: post.imageUrls.length === 1 ? '1fr' : 'repeat(2, 1fr)',
          gap: 6, marginBottom: 12,
        }}>
          {post.imageUrls.map((url, i) => (
            <img
              key={i}
              src={url}
              alt=""
              onClick={() => setLightbox(url)}
              style={{
                width: '100%', aspectRatio: post.imageUrls!.length === 1 ? '16/9' : '1',
                objectFit: 'cover', cursor: 'zoom-in', borderRadius: 10,
              }}
            />
          ))}
        </div>
      )}

      {/* Mentions */}
      {post.mentions && post.mentions.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
          {post.mentions.map(m => (
            <span key={m.id} style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              fontSize: 11, fontWeight: 500, color: 'var(--color-electric-violet)',
              background: 'var(--color-violet-tint)', borderRadius: 'var(--radius-pill)', padding: '2px 8px',
            }}>
              {m.type === 'estate' ? <Building2 size={10} /> : <Home size={10} />}
              @{m.label}
            </span>
          ))}
        </div>
      )}

      {/* Like footer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button
          onClick={() => onLike(post.id)}
          style={{
            display: 'flex', alignItems: 'center', gap: 5, border: 'none',
            cursor: 'pointer', padding: '4px 10px', borderRadius: 'var(--radius-pill)',
            fontSize: 13, fontWeight: 500,
            color: liked ? '#e53e3e' : 'var(--color-ash)',
            background: liked ? 'rgba(229, 62, 62, 0.08)' : 'transparent',
            transition: 'all 0.15s',
          }}
        >
          <Heart size={15} fill={liked ? 'currentColor' : 'none'} strokeWidth={2} />
          {post.likedBy.length > 0 && <span>{post.likedBy.length}</span>}
        </button>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out',
          }}
        >
          <img src={lightbox} alt="" style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 12, objectFit: 'contain' }} />
        </div>
      )}
    </Card>
  );
}
