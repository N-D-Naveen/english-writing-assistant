import { useState, useRef } from 'react'
import { rephraseText, saveData } from '../api/client'

const TONE_STYLES   = ['Professional', 'Friendly', 'Simple']
const TONE_PURPOSES = ['None', 'Team Leadership', 'Public Speaking', 'Negotiation', 'Polite Request']

function countWords(text) {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length
}

function getScoreClass(score) {
  if (score >= 80) return 'score-badge--high'
  if (score >= 60) return 'score-badge--medium'
  return 'score-badge--low'
}

export default function MainPage() {
  const [inputText, setInputText]         = useState('')
  const [toneStyle, setToneStyle]         = useState('Professional')
  const [tonePurpose, setTonePurpose]     = useState('None')
  const [loading, setLoading]             = useState(false)
  const [correctedText, setCorrectedText] = useState('')
  const [score, setScore]                 = useState(null)
  const [toast, setToast]                 = useState(null)
  const [error, setError]                 = useState('')
  const [saving, setSaving]               = useState(false)

  // Held in a ref so it doesn't trigger re-renders
  const pendingData = useRef(null)

  const wordCount = countWords(inputText)
  const overLimit = wordCount > 1000

  function showToast(message, isError = false) {
    setToast({ message, isError })
    setTimeout(() => setToast(null), 3000)
  }

  async function handleRephrase() {
    if (inputText.trim() === '') {
      setError('Please enter some text before rephrasing.')
      return
    }
    if (overLimit) {
      setError('Text exceeds 1,000 words. Please shorten it.')
      return
    }
    setError('')
    setLoading(true)
    pendingData.current = null

    try {
      const result = await rephraseText({
        originalText: inputText,
        toneStyle: toneStyle.toLowerCase(),
        tonePurpose: tonePurpose === 'None' ? null : tonePurpose.toLowerCase().replace(/ /g, '_'),
      })
      setCorrectedText(result.correctedText)
      setScore(result.mistakePercentage)
      pendingData.current = result.pendingMistakeData
    } catch (err) {
      if (err.message.includes('401')) {
        setError('Your session expired. Please refresh the page and sign in again.')
      } else if (err.message.includes('502')) {
        setError('The AI service returned an unexpected response. Please try again.')
      } else if (err.message.includes('504')) {
        setError('The AI service took too long. Please try again.')
      } else if (err.message.includes('Network')) {
        setError('Network error. Please check your connection and try again.')
      } else {
        setError(err.message || 'Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleCopy() {
    if (!correctedText) return

    try {
      await navigator.clipboard.writeText(correctedText)
    } catch {
      showToast('Could not copy to clipboard.', true)
      return
    }

    if (pendingData.current) {
      setSaving(true)
      try {
        await saveData(pendingData.current)
        showToast('Saved to your learning history ✓')
      } catch {
        showToast("Couldn't save to your history. Your text was still copied.", true)
      } finally {
        setSaving(false)
      }
      pendingData.current = null
    } else {
      showToast('Copied!')
    }
  }

  return (
    <div className="page">
      <h2 className="page__title">Rephrase your writing</h2>
      <p className="page__subtitle">
        Paste your text, choose a tone, and get an improved version instantly.
      </p>

      {/* Tone selectors */}
      <div className="tone-selectors">
        <div>
          <label className="tone-selector__label">
            Style <span style={{color:'#ef4444'}}>*</span>
          </label>
          <select
            className="form-select"
            value={toneStyle}
            onChange={e => setToneStyle(e.target.value)}
          >
            {TONE_STYLES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="tone-selector__label">
            Purpose <span>(optional)</span>
          </label>
          <select
            className="form-select"
            value={tonePurpose}
            onChange={e => setTonePurpose(e.target.value)}
          >
            {TONE_PURPOSES.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {/* Textboxes side by side */}
      <div className="textbox-row">
        {/* Input area */}
        <div className="input-wrapper">
          <label className="textbox-label">Your Text</label>
          <textarea
            className={`input-textarea ${overLimit || error ? 'input-textarea--error' : ''} ${loading ? 'input-textarea--disabled' : ''}`}
            value={inputText}
            onChange={e => { setInputText(e.target.value); setError('') }}
            disabled={loading}
            placeholder="Paste or type your text here..."
            rows={8}
          />
          <span className={`word-counter ${overLimit ? 'word-counter--over' : ''}`}>
            {wordCount} / 1,000 words
          </span>
        </div>

        {/* Output area */}
        <div className="output-wrapper">
          <label className="textbox-label">Corrected Version</label>
          <textarea
            className="output-textarea"
            onselectstart="return false"
            oncopy="return false"
            oncut="return false"
            value={correctedText}
            disabled
            readOnly
            placeholder="Your corrected text will appear here..."
            rows={8}
          />
          <div className="output-footer">
            {score !== null && (
              <span className={`score-badge ${getScoreClass(score)}`}>
                {score}%
              </span>
            )}
            {saving && (
              <span className="saving-indicator">
                <span className="spinner spinner--small" />
                Saving...
              </span>
            )}
            {correctedText && (
              <button className="btn--copy" onClick={handleCopy} disabled={saving}>
                {saving ? '📋 Copying...' : '📋 Copy'}
              </button>
            )}
          </div>
        </div>
      </div>

      {error && <p className="validation-error">{error}</p>}

      {/* Rephrase button */}
      <button
        className="btn--rephrase"
        onClick={handleRephrase}
        disabled={loading || inputText.trim() === '' || overLimit}
      >
        {loading ? (
          <><span className="spinner" /> Rephrasing...</>
        ) : '✨ Rephrase'}
      </button>

      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.isError ? 'toast--error' : 'toast--success'}`}>
          {toast.message}
        </div>
      )}
    </div>
  )
}
