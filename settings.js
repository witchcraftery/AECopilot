// settings.js
document.addEventListener("DOMContentLoaded", function() {
    const apiKeyInput = document.getElementById("apiKeyInput");
    const saveButton = document.getElementById("saveApiKey");
    const status = document.getElementById("status");
  
    // Load any previously saved API key
    const storedKey = localStorage.getItem("openai_api_key");
    if (storedKey) {
      apiKeyInput.value = storedKey;
    }
  
    saveButton.addEventListener("click", function() {
      const apiKey = apiKeyInput.value.trim();
      if (apiKey) {
        localStorage.setItem("openai_api_key", apiKey);
        status.textContent = "API Key saved successfully.";
      } else {
        status.textContent = "Please enter a valid API Key.";
      }
    });
  });
  