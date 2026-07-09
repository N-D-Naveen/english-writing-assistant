import { fetchAuthSession } from 'aws-amplify/auth'
import { API_URL } from '../aws-config'

// Gets the Cognito JWT token from the current session
// This token is attached to every API request so API Gateway
// knows the user is authenticated
async function getAuthToken() {
  const session = await fetchAuthSession()
  return session.tokens?.idToken?.toString()
}

// POST /rephrase — sends text to Bedrock via Lambda, returns corrected text
export async function rephraseText({ originalText, toneStyle, tonePurpose }) {
  const token = await getAuthToken()
  const response = await fetch(`${API_URL}/rephrase`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ originalText, toneStyle, tonePurpose }),
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.message || `Request failed with status ${response.status}`)
  }
  return response.json()
}

// POST /save — saves PendingMistakeData to DynamoDB when user clicks Copy
export async function saveData(pendingMistakeData) {
  const token = await getAuthToken()
  const response = await fetch(`${API_URL}/save`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(pendingMistakeData),
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.message || `Save failed with status ${response.status}`)
  }
  return response.json()
}

// GET /report — fetches teacher report from Analyze Lambda
export async function fetchReport(category = 'all') {
  const token = await getAuthToken()
  const url = `${API_URL}/report${category !== 'all' ? `?category=${category}` : ''}`
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.message || `Report failed with status ${response.status}`)
  }
  return response.json()
}
