document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('api-key');
  const saveButton = document.getElementById('save-key');
  const resultDiv = document.getElementById('result');

  // Load saved API key
  chrome.storage.local.get('authToken', (data) => {
    if (data.authToken) {
      apiKeyInput.value = data.authToken;
    }
  });

  // Save API key
  saveButton.addEventListener('click', () => {
    const token = apiKeyInput.value;
    chrome.storage.local.set({ authToken: token }, () => {
      alert('API key saved!');
    });
  });

  // Listen for analysis results
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'analysisResult') {
      displayResult(message.data);
    }
  });

  function displayResult(result) {
    resultDiv.innerHTML = `
      <h2>Analysis Result</h2>
      <p>AI Score: ${result.ai_detection.confidence_score}%</p>
      <p>Verdict: ${result.ai_detection.is_ai_generated ? 'AI Generated' : 'Human Written'}</p>
    `;
  }
}); 