import React, { useState } from 'react';
import './App.css';

const BASE_URL = 'https://107ycsonc5.execute-api.us-west-2.amazonaws.com';

function App() {
  const [companyName, setCompanyName] = useState('');
  const [intervieweeEmail, setIntervieweeEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('brief');

  const handleGenerate = async () => {
    if (!companyName.trim()) return;
    setLoading(true);
    setError('');
    setResults(null);

    try {
      // STEP 1 — POST /ingest → get sessionId
      setLoadingStep('📡 Collecting data about ' + companyName + '...');
      const ingestResponse = await fetch(`${BASE_URL}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: companyName.trim(),
          intervieweeEmail: intervieweeEmail.trim()
        })
      });
      const ingestData = await ingestResponse.json();
      const sessionId = ingestData.sessionId;
      if (!sessionId) throw new Error('No sessionId returned from server');

      // STEP 2 — POST /generate → trigger AI brief creation
      setLoadingStep('🤖 Generating interview brief with AI...');
      await fetch(`${BASE_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });

      // STEP 3 — Poll /outputs/{sessionId} every 5s
      setLoadingStep('⏳ Waiting for brief to be ready...');
      let pollCount = 0;

      const pollInterval = setInterval(async () => {
        pollCount++;

        if (pollCount > 24) {
          clearInterval(pollInterval);
          setError('Request timed out after 2 minutes. Please try again.');
          setLoading(false);
          setLoadingStep('');
          return;
        }

        try {
          const outputResponse = await fetch(`${BASE_URL}/outputs/${sessionId}`);
          const outputData = await outputResponse.json();

          if (outputData.status === 'COMPLETE' || outputData.status === 'GENERATED') {
            clearInterval(pollInterval);
            setLoadingStep('📄 Loading documents...');

            let briefText = '';
            let packetText = '';

            if (outputData.interviewerBriefUrl) {
              const briefRes = await fetch(outputData.interviewerBriefUrl);
              briefText = await briefRes.text();
            }
            if (outputData.preInterviewPacketUrl) {
              const packetRes = await fetch(outputData.preInterviewPacketUrl);
              packetText = await packetRes.text();
            }

            setResults({
              sessionId: outputData.sessionId,
              companyName: companyName.trim(),
              intervieweeEmail: intervieweeEmail.trim(),
              briefText,
              packetText
            });
            setLoading(false);
            setLoadingStep('');

          } else if (outputData.status === 'FAILED') {
            clearInterval(pollInterval);
            setError('Brief generation failed on the server. Please try again.');
            setLoading(false);
            setLoadingStep('');
          }

        } catch (pollErr) {
          clearInterval(pollInterval);
          setError(pollErr.message);
          setLoading(false);
          setLoadingStep('');
        }
      }, 5000);

    } catch (err) {
      setError(err.message);
      setLoading(false);
      setLoadingStep('');
    }
  };

  return (
    <div className="app">
      <header>
        <div className="logo">TEXAS A&M UNIVERSITY</div>
        <h1>Interview Intelligence System</h1>
        <p>Generate professional interview briefs in seconds</p>
      </header>
      <main>
        <div className="search-section">
          <input
            type="text"
            placeholder="Enter company name (e.g. GridFlex Energy)"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          />
          <input
            type="email"
            placeholder="Enter interviewee email (e.g. john@gridflex.com)"
            value={intervieweeEmail}
            onChange={(e) => setIntervieweeEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          />
          <button onClick={handleGenerate} disabled={loading || !companyName}>
            {loading ? '⏳ Generating...' : '🚀 Generate Brief'}
          </button>
        </div>

        {loading && (
          <div className="loading">
            <div className="spinner" />
            <p>Researching <strong>{companyName}</strong>...</p>
            <p className="substep">{loadingStep}</p>
          </div>
        )}

        {error && <div className="error">❌ {error}</div>}

        {results && (
          <div className="results">
            <div className="session-info">
              ✅ Session: {results.sessionId} | Company: {results.companyName}
              {results.intervieweeEmail && ` | 📧 ${results.intervieweeEmail}`}
            </div>
            <div className="tabs">
              <button
                className={activeTab === 'brief' ? 'active' : ''}
                onClick={() => setActiveTab('brief')}
              >
                📋 Interviewer Brief
              </button>
              <button
                className={activeTab === 'packet' ? 'active' : ''}
                onClick={() => setActiveTab('packet')}
              >
                📨 Pre-Interview Packet
              </button>
            </div>

            {activeTab === 'brief' && (
              <div className="document">
                <h2>📋 Interviewer Brief — CONFIDENTIAL</h2>
                <pre style={{
                  whiteSpace: 'pre-wrap',
                  lineHeight: '1.8',
                  fontFamily: 'Georgia, serif',
                  fontSize: '0.97rem'
                }}>
                  {results.briefText || 'No content available.'}
                </pre>
              </div>
            )}

            {activeTab === 'packet' && (
              <div className="document packet">
                <h2>📨 Pre-Interview Packet — {results.companyName}</h2>
                <pre style={{
                  whiteSpace: 'pre-wrap',
                  lineHeight: '1.8',
                  fontFamily: 'Georgia, serif',
                  fontSize: '0.97rem'
                }}>
                  {results.packetText || 'No content available.'}
                </pre>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
