'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { getTemples, updateTemple } from '@/lib/api';
import type { Temple } from '@/types';

// ── Helpers ──
function statusBadge(status: string): string {
  switch (status) {
    case 'completed':
    case 'active':
    case 'verified':
    case 'approved':
    case 'runner_ready':
      return 'badge-green';
    case 'in_progress':
    case 'in_review':
    case 'probation':
    case 'researching':
    case 'pending':
    case 'sop_drafted':
      return 'badge-orange';
    case 'disputed':
    case 'suspended':
    case 'banned':
    case 'rejected':
      return 'badge-red';
    default:
      return 'badge-gray';
  }
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: 'var(--space-2) var(--space-3)',
  border: '1px solid var(--stone-300)',
  borderRadius: 'var(--radius-md)',
  fontSize: 'var(--text-sm)',
  background: 'var(--stone-50)',
  color: 'var(--color-text)',
  outline: 'none',
  boxSizing: 'border-box' as const,
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  minHeight: 80,
  resize: 'vertical' as const,
  fontFamily: 'inherit',
};

// ── Tag Input Component ──
function TagInput({
  tags,
  onChange,
  placeholder,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}) {
  const [inputValue, setInputValue] = useState('');

  const addTag = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInputValue('');
  };

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
    if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  return (
    <div
      style={{
        border: '1px solid var(--stone-300)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-2)',
        background: 'var(--stone-50)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--space-1)',
        alignItems: 'center',
        minHeight: 40,
      }}
    >
      {tags.map((tag, i) => (
        <span
          key={i}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            background: 'var(--amber-100)',
            color: 'var(--amber-800)',
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)',
            fontSize: 'var(--text-sm)',
            fontWeight: 500,
          }}
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(i)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              fontSize: 14,
              color: 'var(--amber-700)',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </span>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addTag}
        placeholder={tags.length === 0 ? placeholder : 'Add more...'}
        style={{
          flex: 1,
          minWidth: 100,
          border: 'none',
          outline: 'none',
          background: 'transparent',
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text)',
          padding: '2px 4px',
        }}
      />
    </div>
  );
}

// ── Photo URL List Component ──
function PhotoUrlList({
  photos,
  onChange,
}: {
  photos: string[];
  onChange: (photos: string[]) => void;
}) {
  const [newUrl, setNewUrl] = useState('');

  const addPhoto = () => {
    const trimmed = newUrl.trim();
    if (trimmed && !photos.includes(trimmed)) {
      onChange([...photos, trimmed]);
    }
    setNewUrl('');
  };

  const removePhoto = (index: number) => {
    onChange(photos.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addPhoto();
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
        <input
          type="text"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Paste image URL and press Enter"
          style={{ ...inputStyle, flex: 1 }}
        />
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={addPhoto}
          disabled={!newUrl.trim()}
        >
          Add
        </button>
      </div>
      {photos.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
          {photos.map((url, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                padding: 'var(--space-1) var(--space-2)',
                background: 'var(--stone-50)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--stone-200)',
              }}
            >
              {url.match(/\.(jpg|jpeg|png|webp|gif)/i) && (
                <img
                  src={url}
                  alt=""
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 'var(--radius-sm)',
                    objectFit: 'cover',
                    flexShrink: 0,
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
              <span
                style={{
                  flex: 1,
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-secondary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {url}
              </span>
              <button
                type="button"
                onClick={() => removePhoto(i)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 16,
                  color: 'var(--color-text-muted)',
                  padding: 2,
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Form Field Component ──
function FormField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 'var(--space-4)' }}>
      <label
        style={{
          display: 'block',
          fontSize: 'var(--text-sm)',
          fontWeight: 600,
          marginBottom: 'var(--space-1)',
        }}
      >
        {label}
      </label>
      {hint && (
        <p
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
            marginBottom: 'var(--space-2)',
          }}
        >
          {hint}
        </p>
      )}
      {children}
    </div>
  );
}

// ── Content Status Indicator ──
function ContentStatus({ temple }: { temple: Temple }) {
  const fields = [
    { label: 'Description (EN)', filled: !!temple.short_description },
    { label: 'Description (CN)', filled: !!temple.short_description_zh },
    { label: 'Prayer Tags (EN)', filled: !!(temple.prayer_tags && temple.prayer_tags.length > 0) },
    { label: 'Prayer Tags (CN)', filled: !!(temple.prayer_tags_zh && temple.prayer_tags_zh.length > 0) },
    { label: 'Photos', filled: !!(temple.photos && temple.photos.length > 0) },
  ];
  const filledCount = fields.filter((f) => f.filled).length;
  const allFilled = filledCount === fields.length;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
      <div style={{ display: 'flex', gap: 3 }}>
        {fields.map((f, i) => (
          <div
            key={i}
            title={`${f.label}: ${f.filled ? 'Filled' : 'Empty'}`}
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: f.filled ? 'var(--color-success)' : 'var(--stone-300)',
              flexShrink: 0,
            }}
          />
        ))}
      </div>
      <span
        style={{
          fontSize: 'var(--text-xs)',
          color: allFilled ? 'var(--color-success)' : 'var(--color-text-muted)',
          fontWeight: 500,
        }}
      >
        {filledCount}/{fields.length}
      </span>
    </div>
  );
}

// ── Main Page ──
export default function TempleContentPage() {
  const searchParams = useSearchParams();
  const preselectedId = searchParams.get('id') || null;

  const [temples, setTemples] = useState<Temple[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Editor state
  const [editingTemple, setEditingTemple] = useState<Temple | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Form state
  const [shortDesc, setShortDesc] = useState('');
  const [shortDescZh, setShortDescZh] = useState('');
  const [prayerTags, setPrayerTags] = useState<string[]>([]);
  const [prayerTagsZh, setPrayerTagsZh] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);

  // Preview state
  const [showPreview, setShowPreview] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getTemples();
      setTemples(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load temples');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-select temple if id is in query params
  useEffect(() => {
    if (preselectedId && temples.length > 0 && !editingTemple) {
      const temple = temples.find((t) => t.id === preselectedId);
      if (temple) {
        openEditor(temple);
      }
    }
  }, [preselectedId, temples]);

  const openEditor = (temple: Temple) => {
    setEditingTemple(temple);
    setShortDesc(temple.short_description || '');
    setShortDescZh(temple.short_description_zh || '');
    setPrayerTags(temple.prayer_tags || []);
    setPrayerTagsZh(temple.prayer_tags_zh || []);
    setPhotos(temple.photos || []);
    setSaveMessage(null);
    setShowPreview(false);
  };

  const closeEditor = () => {
    setEditingTemple(null);
    setSaveMessage(null);
    setShowPreview(false);
  };

  const handleSave = async () => {
    if (!editingTemple) return;
    try {
      setSaving(true);
      setSaveMessage(null);
      const updates = {
        short_description: shortDesc || undefined,
        short_description_zh: shortDescZh || undefined,
        prayer_tags: prayerTags,
        prayer_tags_zh: prayerTagsZh,
        photos: photos,
      };
      await updateTemple(editingTemple.id, updates);
      await loadData();
      setSaveMessage({ type: 'success', text: 'Content saved successfully!' });
    } catch (err) {
      setSaveMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to save content',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-4)' }}>
            ⏳
          </div>
          <p className="text-muted">Loading temples...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>🚨</span>
        <span>Error loading temples: {error}</span>
      </div>
    );
  }

  return (
    <div>
      {/* Save message toast */}
      {saveMessage && (
        <div
          className={`alert ${saveMessage.type === 'success' ? 'alert-success' : 'alert-error'}`}
          style={{
            marginBottom: 'var(--space-4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span>{saveMessage.type === 'success' ? '✅' : '🚨'}</span>
            <span>{saveMessage.text}</span>
          </div>
          <button
            onClick={() => setSaveMessage(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* ═══════════════════════════════════════════
          TEMPLE LIST (shown when not editing)
          ═══════════════════════════════════════════ */}
      {!editingTemple && (
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 'var(--space-4)',
            }}
          >
            <div>
              <h2 style={{ fontWeight: 600 }}>Temple Content Management</h2>
              <p className="text-sm text-muted">
                Manage descriptions, prayer tags, and photos for each temple
              </p>
            </div>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Temple</th>
                <th>Location</th>
                <th>Status</th>
                <th>Content</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {temples.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      textAlign: 'center',
                      padding: 'var(--space-4)',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    No temples found.
                  </td>
                </tr>
              ) : (
                temples.map((temple) => (
                  <tr key={temple.id}>
                    <td>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-2)',
                        }}
                      >
                        {temple.photos && temple.photos.length > 0 && (
                          <img
                            src={temple.photos[0]}
                            alt={temple.name}
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 'var(--radius-md)',
                              objectFit: 'cover',
                              flexShrink: 0,
                            }}
                          />
                        )}
                        <strong>{temple.name}</strong>
                      </div>
                    </td>
                    <td>
                      {temple.city}, {temple.country}
                    </td>
                    <td>
                      <span
                        className={`badge ${statusBadge(temple.status)}`}
                        style={{ textTransform: 'none' }}
                      >
                        {temple.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <ContentStatus temple={temple} />
                    </td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => openEditor(temple)}
                      >
                        Edit Content
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Legend */}
          <div className="card mt-6">
            <div className="card-body">
              <h4
                style={{
                  fontWeight: 600,
                  marginBottom: 'var(--space-3)',
                }}
              >
                Content Status Legend
              </h4>
              <div
                style={{
                  display: 'flex',
                  gap: 'var(--space-4)',
                  flexWrap: 'wrap',
                  fontSize: 'var(--text-sm)',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: 'var(--color-success)',
                      display: 'inline-block',
                    }}
                  />
                  Field filled
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: 'var(--stone-300)',
                      display: 'inline-block',
                    }}
                  />
                  Field empty
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════
          EDITOR PANEL (shown when editing)
          ═══════════════════════════════════════════ */}
      {editingTemple && (
        <div>
          {/* Editor Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 'var(--space-6)',
            }}
          >
            <div>
              <button
                onClick={closeEditor}
                className="btn btn-secondary btn-sm"
                style={{ marginBottom: 'var(--space-2)' }}
              >
                ← Back to list
              </button>
              <h2 style={{ fontWeight: 600 }}>
                Edit Content: {editingTemple.name}
              </h2>
              <p className="text-sm text-muted">
                {editingTemple.city}, {editingTemple.country}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? '✏️ Edit' : '👁️ Preview'}
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: showPreview ? '1fr 1fr' : '1fr', gap: 'var(--space-6)' }}>
            {/* ── Edit Form ── */}
            <div>
              <div className="card">
                <div
                  className="card-header"
                  style={{
                    padding: 'var(--space-4) var(--space-6)',
                    borderBottom: '1px solid var(--color-border)',
                    background: 'var(--stone-50)',
                  }}
                >
                  <h3
                    style={{
                      fontWeight: 600,
                      fontSize: 'var(--text-base)',
                    }}
                  >
                    Content Fields
                  </h3>
                </div>
                <div className="card-body">
                  <FormField
                    label="Short Description (English)"
                    hint="Brief description shown on the temple detail page"
                  >
                    <textarea
                      style={textareaStyle}
                      value={shortDesc}
                      onChange={(e) => setShortDesc(e.target.value)}
                      placeholder="Enter description in English..."
                    />
                  </FormField>

                  <FormField
                    label="Short Description (Chinese)"
                    hint="Brief description in Chinese (中文)"
                  >
                    <textarea
                      style={textareaStyle}
                      value={shortDescZh}
                      onChange={(e) => setShortDescZh(e.target.value)}
                      placeholder="输入中文描述..."
                    />
                  </FormField>

                  <FormField
                    label="Prayer Tags (English)"
                    hint="Tags for prayer categories. Press Enter to add."
                  >
                    <TagInput
                      tags={prayerTags}
                      onChange={setPrayerTags}
                      placeholder="e.g. Health, Wealth, Love..."
                    />
                  </FormField>

                  <FormField
                    label="Prayer Tags (Chinese)"
                    hint="Prayer tags in Chinese. Press Enter to add."
                  >
                    <TagInput
                      tags={prayerTagsZh}
                      onChange={setPrayerTagsZh}
                      placeholder="例如：健康、财富、爱情..."
                    />
                  </FormField>

                  <FormField
                    label="Photo URLs"
                    hint="Add image URLs for the temple gallery"
                  >
                    <PhotoUrlList photos={photos} onChange={setPhotos} />
                  </FormField>
                </div>
              </div>

              {/* Save Button */}
              <div
                style={{
                  marginTop: 'var(--space-4)',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 'var(--space-2)',
                }}
              >
                <button className="btn btn-secondary" onClick={closeEditor}>
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? '⏳ Saving...' : '💾 Save Content'}
                </button>
              </div>
            </div>

            {/* ── Preview Panel ── */}
            {showPreview && (
              <div>
                <div className="card">
                  <div
                    className="card-header"
                    style={{
                      padding: 'var(--space-4) var(--space-6)',
                      borderBottom: '1px solid var(--color-border)',
                      background: 'var(--stone-50)',
                    }}
                  >
                    <h3
                      style={{
                        fontWeight: 600,
                        fontSize: 'var(--text-base)',
                      }}
                    >
                      Preview — Temple Detail Page
                    </h3>
                  </div>
                  <div className="card-body">
                    {/* Photo Gallery Preview */}
                    {photos.length > 0 && (
                      <div style={{ marginBottom: 'var(--space-4)' }}>
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: `repeat(${Math.min(photos.length, 3)}, 1fr)`,
                            gap: 'var(--space-2)',
                          }}
                        >
                          {photos.map((url, i) => (
                            <div
                              key={i}
                              style={{
                                aspectRatio: '16/10',
                                borderRadius: 'var(--radius-md)',
                                overflow: 'hidden',
                                border: '1px solid var(--color-border)',
                                background: 'var(--stone-100)',
                              }}
                            >
                              <img
                                src={url}
                                alt={`Temple photo ${i + 1}`}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                }}
                                onError={(e) => {
                                  const el = e.target as HTMLImageElement;
                                  el.style.display = 'none';
                                  if (el.parentElement) {
                                    el.parentElement.innerHTML =
                                      '<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:var(--text-xs);color:var(--color-text-muted);">Invalid URL</div>';
                                  }
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Descriptions Preview */}
                    <div style={{ marginBottom: 'var(--space-4)' }}>
                      <h4
                        style={{
                          fontWeight: 600,
                          fontSize: 'var(--text-sm)',
                          marginBottom: 'var(--space-2)',
                        }}
                      >
                        English Description
                      </h4>
                      <p
                        style={{
                          fontSize: 'var(--text-sm)',
                          color: shortDesc
                            ? 'var(--color-text)'
                            : 'var(--color-text-muted)',
                          fontStyle: shortDesc ? 'normal' : 'italic',
                        }}
                      >
                        {shortDesc || 'No description provided'}
                      </p>
                    </div>

                    <div style={{ marginBottom: 'var(--space-4)' }}>
                      <h4
                        style={{
                          fontWeight: 600,
                          fontSize: 'var(--text-sm)',
                          marginBottom: 'var(--space-2)',
                        }}
                      >
                        Chinese Description
                      </h4>
                      <p
                        style={{
                          fontSize: 'var(--text-sm)',
                          color: shortDescZh
                            ? 'var(--color-text)'
                            : 'var(--color-text-muted)',
                          fontStyle: shortDescZh ? 'normal' : 'italic',
                        }}
                      >
                        {shortDescZh || 'No description provided'}
                      </p>
                    </div>

                    {/* Prayer Tags Preview */}
                    {prayerTags.length > 0 && (
                      <div style={{ marginBottom: 'var(--space-3)' }}>
                        <h4
                          style={{
                            fontWeight: 600,
                            fontSize: 'var(--text-sm)',
                            marginBottom: 'var(--space-2)',
                          }}
                        >
                          Prayer Tags (EN)
                        </h4>
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 'var(--space-1)',
                          }}
                        >
                          {prayerTags.map((tag, i) => (
                            <span
                              key={i}
                              className="badge badge-amber"
                              style={{ textTransform: 'none' }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {prayerTagsZh.length > 0 && (
                      <div>
                        <h4
                          style={{
                            fontWeight: 600,
                            fontSize: 'var(--text-sm)',
                            marginBottom: 'var(--space-2)',
                          }}
                        >
                          Prayer Tags (CN)
                        </h4>
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 'var(--space-1)',
                          }}
                        >
                          {prayerTagsZh.map((tag, i) => (
                            <span
                              key={i}
                              className="badge badge-brown"
                              style={{ textTransform: 'none' }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {prayerTags.length === 0 && prayerTagsZh.length === 0 && (
                      <p
                        style={{
                          fontSize: 'var(--text-sm)',
                          color: 'var(--color-text-muted)',
                          fontStyle: 'italic',
                        }}
                      >
                        No prayer tags
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
