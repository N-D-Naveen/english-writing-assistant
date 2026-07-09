import { useState } from 'react'
import { fetchReport } from '../api/client'

const CATEGORIES = [
  { label: 'All',                value: 'all' },
  { label: 'Grammar',            value: 'grammar' },
  { label: 'Vocabulary',         value: 'vocabulary' },
  { label: 'Sentence Structure', value: 'sentence_structure' },
  { label: 'Spelling',           value: 'spelling' },
]

function getScoreLevel(score) {
  if (score > 10) return 'high'
  if (score > 5)  return 'medium'
  return 'low'
}

function WeaknessCard({ weakness }) {
  const [expanded, setExpanded] = useState(false)
  const scoreLevel = getScoreLevel(weakness.score)

  return (
    <div className="weakness-card">
      <div
        className={`weakness-card__header ${expanded ? 'weakness-card__header--open' : ''}`}
        onClick={() => setExpanded(!expanded)}
      >
        <div>
          <span className="weakness-card__name">
            {weakness.type.replace(/_/g, ' ')}
          </span>
          <span className="weakness-card__category">
            {weakness.category.replace(/_/g, ' ')}
          </span>
        </div>
        <div className="weakness-card__right">
          <span className={`weakness-card__score weakness-card__score--${scoreLevel}`}>
            {weakness.score}
          </span>
          <span className="weakness-card__chevron">
            {expanded ? '▲' : '▼'}
          </span>
        </div>
      </div>

      {expanded && (
        <div className="weakness-card__body">
          {weakness.examples.length === 0 ? (
            <p className="report-meta">No examples yet.</p>
          ) : (
            weakness.examples.map((ex, i) => (
              <div key={i} className={`example-item example-item--${ex.severity}`}>
                <span className={`example-item__severity example-item__severity--${ex.severity}`}>
                  {ex.severity}
                </span>

                <div className="example-item__diff">
                  <span className="diff__wrong">{ex.wrongPart}</span>
                  <span className="diff__arrow">→</span>
                  <span className="diff__correct">{ex.correctPart}</span>
                </div>

                <p className="example-item__reason">
                  💡 <strong>Why:</strong> {ex.simpleReason}
                </p>

                {/* AI-generated example sentences */}
                {ex.examples && ex.examples.length > 0 && (
                  <div className="example-item__examples">
                    <p className="example-item__examples-label">📖 Examples:</p>
                    <ul className="example-item__examples-list">
                      {ex.examples.map((sentence, j) => (
                        <li key={j}>{sentence}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {ex.practiceTip && (
                  <p className="example-item__tip">📝 {ex.practiceTip}</p>
                )}

                {ex.originalText && (
                  <p className="example-item__original">
                    From your writing: "{ex.originalText.substring(0, 120)}{ex.originalText.length > 120 ? '...' : ''}"
                  </p>
                )}
              </div>
            ))
          )}

          {weakness.practiceTip && (
            <div className="practice-tip-box">
              🎯 <strong>Practice tip:</strong> {weakness.practiceTip}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function TeacherPage() {
  const [category, setCategory] = useState('all')
  const [loading, setLoading]   = useState(false)
  const [report, setReport]     = useState(null)
  const [error, setError]       = useState('')

  async function handleCheckProgress() {
    setError('')
    setLoading(true)
    try {
      const data = await fetchReport(category)
      setReport(data)
    } catch (err) {
      setError(err.message || 'Failed to load report. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <h2 className="page__title">My Progress</h2>
      <p className="page__subtitle">
        See your top recurring mistakes and how to fix them.
      </p>

      {/* Category tabs */}
      <div className="category-tabs">
        {CATEGORIES.map(cat => (
          <button
            key={cat.value}
            className={`category-tab ${category === cat.value ? 'category-tab--active' : ''}`}
            onClick={() => setCategory(cat.value)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Check progress button */}
      <button
        className="btn--report"
        onClick={handleCheckProgress}
        disabled={loading}
      >
        {loading ? 'Loading...' : '📊 Check my progress'}
      </button>

      {error && <div className="alert--info">{error}</div>}

      {/* Report */}
      {report && (
        <div>
          {report.weaknesses.length === 0 ? (
            <div className="empty-state">
              <p className="empty-state__icon">📝</p>
              <p className="empty-state__title">
                {report.message || 'No data yet.'}
              </p>
              <p className="empty-state__text">
                Make a few submissions and click Copy to start tracking your progress.
              </p>
            </div>
          ) : (
            <>
              <p className="report-meta">
                Showing top {report.weaknesses.length} weakness{report.weaknesses.length !== 1 ? 'es' : ''}
                {category !== 'all' ? ` in ${category.replace(/_/g, ' ')}` : ''}.
                Click a card to see examples.
              </p>
              {report.weaknesses.map((w, i) => (
                <WeaknessCard key={i} weakness={w} />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}
