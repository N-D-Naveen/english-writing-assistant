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
                {/* Header with severity badge */}
                <div className="example-item__header">
                  <span className={`example-item__severity example-item__severity--${ex.severity}`}>
                    {ex.severity}
                  </span>
                  {ex.originalText && (
                    <span className="example-item__source">From your writing</span>
                  )}
                </div>

                {/* Main correction - most important for learning */}
                <div className="example-item__correction">
                  <div className="correction__wrong">
                    <span className="correction__label">Incorrect</span>
                    <span className="correction__text">{ex.wrongPart}</span>
                  </div>
                  <div className="correction__arrow">→</div>
                  <div className="correction__correct">
                    <span className="correction__label">Correct</span>
                    <span className="correction__text">{ex.correctPart}</span>
                  </div>
                </div>

                {/* Original context if available */}
                {ex.originalText && (
                  <div className="example-item__context">
                    <span className="context__label">Original sentence:</span>
                    <p className="context__text">"{ex.originalText}"</p>
                  </div>
                )}

                {/* Why it matters - explanation section */}
                <div className="example-item__explanation">
                  <div className="explanation__icon">💡</div>
                  <div className="explanation__content">
                    <strong className="explanation__title">Why this matters:</strong>
                    <p className="explanation__text">{ex.simpleReason}</p>
                  </div>
                </div>

                {/* Grammar rule if available */}
                {ex.rule && (
                  <div className="example-item__rule">
                    <span className="rule__icon">📝</span>
                    <strong className="rule__title">Rule:</strong>
                    <span className="rule__text">{ex.rule}</span>
                  </div>
                )}

                {/* More examples section */}
                {ex.examples && ex.examples.length > 0 && (
                  <div className="example-item__more-examples">
                    <div className="more-examples__header">
                      <span className="more-examples__icon">📖</span>
                      <strong className="more-examples__title">More Examples</strong>
                    </div>
                    <div className="more-examples__list">
                      {ex.examples.map((sentence, j) => (
                        <div key={j} className="more-examples__item">
                          <div className="more-examples__pair">
                            <span className="more-examples__wrong">{sentence.wrong}</span>
                            <span className="more-examples__separator">→</span>
                            <span className="more-examples__correct">{sentence.correct}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Practice tip - actionable advice */}
                {ex.practiceTip && (
                  <div className="example-item__practice">
                    <span className="practice__icon">🎯</span>
                    <strong className="practice__title">Practice Tip:</strong>
                    <span className="practice__text">{ex.practiceTip}</span>
                  </div>
                )}
              </div>
            ))
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
