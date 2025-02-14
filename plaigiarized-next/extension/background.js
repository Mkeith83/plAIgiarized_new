chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "analyzeText",
    title: "Analyze with plAIgiarized",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "analyzeText") {
    const selectedText = info.selectionText;
    analyzeText(selectedText);
  }
});

async function analyzeText(text) {
  try {
    const response = await fetch('http://localhost:8000/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getStoredToken()}`
      },
      body: JSON.stringify({ text })
    });
    
    const result = await response.json();
    
    // Send result to popup
    chrome.runtime.sendMessage({
      type: 'analysisResult',
      data: result
    });
  } catch (error) {
    console.error('Analysis error:', error);
  }
}

async function getStoredToken() {
  const data = await chrome.storage.local.get('authToken');
  return data.authToken;
} 