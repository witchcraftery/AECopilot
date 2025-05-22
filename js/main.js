document.addEventListener('DOMContentLoaded', init);

function init() {
  // Event listener for the 'Send' button
  const sendButton = document.querySelector(".button");
  if (sendButton) {
    sendButton.addEventListener("click", sendMessage);
  }

  // Event listener for the Enter key in the input field
  const userInputField = document.querySelector("#user-input");
  if (userInputField) {
    userInputField.addEventListener("keypress", function (event) {
      // Check if the key pressed is the Enter key
      if (event.key === "Enter") {
        sendMessage();
      }
    });
  }
}

// --- Custom Context Menu Logic ---
// Disable the default context menu
window.oncontextmenu = function (e) {
  e.preventDefault();
  const menu = document.getElementById("custom-context-menu");
  menu.style.top = e.pageY + "px";
  menu.style.left = e.pageX + "px";
  menu.style.display = "block";
  return false;
};

// Hide the custom context menu on any left-click
document.addEventListener("click", function () {
  const menu = document.getElementById("custom-context-menu");
  menu.style.display = "none";
});

// Open settings modal when "Settings" is clicked in the custom context menu
const contextSettings = document.getElementById("context-settings");
if (contextSettings) {
  contextSettings.addEventListener("click", function (e) {
    e.stopPropagation();
    document.getElementById("settingsModal").style.display = "block";
  });
}

// Close the settings modal when the close button is clicked
const closeModal = document.getElementById("closeModal");
if (closeModal) {
  closeModal.addEventListener("click", function () {
    document.getElementById("settingsModal").style.display = "none";
  });
}

// Optionally, close the modal when clicking outside of modal-content
window.addEventListener("click", function (event) {
  const modal = document.getElementById("settingsModal");
  if (event.target === modal) {
    modal.style.display = "none";
  }
});

function sendMessage() {
  const userInputField = document.querySelector("#user-input");
  const userMessage = userInputField.value.trim();
  const messageThread = document.querySelector("#message-thread");

  if (userMessage) {
    // Append the user's message to the message thread
    appendMessage(userMessage, "user-message", messageThread);
    userInputField.value = ""; // Clear the input field

    // Now call the function to process the chat completion
    chatCompletion(userMessage, messageThread);
  }
}

function sendDebugMessage(userInput, code) {
  const messageThread = document.querySelector("#message-thread");
  debugCode(userInput, code, messageThread);
}

function chatCompletion(userInput, messageThread) {
  const codeContainer = createEmptyCodeBlock(messageThread);
  codeContainer.classList.add('loading-dots');
  codeContainer.innerHTML =
    '<div class="loading-dots-container">' +
    '<div class="dot"></div>' +
    '<div class="dot"></div>' +
    '<div class="dot"></div>' +
    '</div>';

  // Get API key from environment variable (set in .env file)
  const apiKey = process.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    alert("OpenAI API Key not found. Ensure it is set in your .env file and the project is built.");
    codeContainer.classList.remove('loading-dots');
    codeContainer.innerHTML = "";
    return;
  }

  const data = JSON.stringify({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content:
          "YOU ONLY RESPOND IN CODE. YOU ALWAYS PLACE TRIPLE BACKTICKS AROUND YOUR ENTIRE MESSAGE AND COMMENT OUT NON-CODE. You are an After Effects Scripting assistant whose job is to strictly respond with code that can be executed as a script to accomplish whatever the user requests. If the user tells you to create or modify something in After Effects then you should provide a script that achieves what the user requested. For example, if the user asked you to say hello world, you would respond with code that alerts hello world. You do not provide pseudocode ever. CRUCIALLY, you MUST wrap the core logic of your script within `safeUndo('AI Action', function() { /* your code here */ });` to ensure the user can undo the operation.",
      },
      {
        role: "user",
        content: userInput,
      },
    ],
    temperature: 0.2,
  });

  fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + apiKey,
    },
    body: data,
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Network response was not ok " + res.statusText);
      }
      return res.json();
    })
    .then((response) => {
      codeContainer.classList.remove('loading-dots');
      codeContainer.innerHTML = "";

      if (response.choices && response.choices.length > 0) {
        const responseText = response.choices[0].message.content;
        const sections = responseText.split("```");

        sections.forEach((section, index) => {
          if (index % 2 === 0 && section.trim() !== "") {
            appendMessage(section, "response-message", messageThread);
          } else if (section.trim() !== "") {
            section = processCodeSection(section);
            populateCodeBlock(section, codeContainer, userInput);
          }
        });
      } else {
        console.error("Unexpected response format:", response);
        alert("Received an unexpected response format.");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Error: " + error.message);
      codeContainer.classList.remove('loading-dots');
      codeContainer.innerHTML = "";
    });
}



function createEmptyCodeBlock(container) {
  // Create the container for the code block
  const codeContainer = document.createElement("div");
  codeContainer.className = "code-container";

  // Append the code container to the main container
  container.appendChild(codeContainer);

  return codeContainer;
}

function populateCodeBlock(code, codeContainer, userInput) {
  // Create and append the actual code block to the code container
  const codeBlock = document.createElement("pre");
  codeBlock.className = "language-jsx";

  const codeElement = document.createElement("code");
  codeElement.textContent = code;
  codeBlock.appendChild(codeElement);
  codeContainer.appendChild(codeBlock);
  createSaveButton(code, codeContainer);
  createRunButton(code, codeContainer, userInput);
  // createDebugButton(code, codeContainer, userInput);

  // Highlight the code block
  Prism.highlightElement(codeElement);

  executeScript(code);
}

function executeScript(code) {
  // alert(code); // This is correct for debugging
  const csInterface = new CSInterface();
  csInterface.evalScript(code, function (result) {
    try {
      // Parse the JSON result from the JSX side
      const jsonResult = JSON.parse(result);

      if (jsonResult.error) {
        // Display error details
        console.error("Script Error:", jsonResult);
        alert(`Error executing script: ${jsonResult.message}\nLine: ${jsonResult.line}`);
      } else {
        // Log success
        console.log("Execution Result:", jsonResult.result);
      }
    } catch (e) {
      // Handle case where result isn't valid JSON
      console.log("Execution Result (raw):", result);
    }
  });
}

function createRunButton(code, container, userInput) {
  const runButton = document.createElement("button");
  runButton.innerText = "Run";
  runButton.className = "run-button";
  runButton.addEventListener("click", function () {
    executeScript(code);
  });
  container.appendChild(runButton);
  //const debugButton = document.createElement("button");
  // debugButton.innerText = "Debug";
  //debugButton.className = "debug-button";
  //debugButton.addEventListener("click", function () {
  //sendDebugMessage(userInput, code);
  //});
  //container.appendChild(debugButton);
}

function createSaveButton(code, container) {
  const saveButton = document.createElement("button");
  saveButton.innerText = "Save";
  saveButton.className = "save-button";
  saveButton.addEventListener("click", function () {
    // Show saving indicator
    const originalText = saveButton.innerText;
    saveButton.innerText = "Saving...";
    saveButton.disabled = true;

    // Call the JSX function to save the file
    const csInterface = new CSInterface();
    csInterface.evalScript(`saveScriptToFile(${JSON.stringify(code)})`, function (result) {
      try {
        const jsonResult = JSON.parse(result);

        if (jsonResult.success) {
          // Show success message
          saveButton.innerText = "Saved!";
          console.log("Script saved to:", jsonResult.path);

          // Create a status message in the UI
          const statusMsg = document.createElement("div");
          statusMsg.className = "save-status success";
          statusMsg.textContent = `Saved to: ${jsonResult.path}`;
          container.appendChild(statusMsg);

          // Reset button after 2 seconds
          setTimeout(() => {
            saveButton.innerText = originalText;
            saveButton.disabled = false;
          }, 2000);
        } else {
          // Show error
          saveButton.innerText = "Error!";
          console.error("Error saving script:", jsonResult.error);
          alert("Error saving script: " + jsonResult.error);

          // Reset button after 2 seconds
          setTimeout(() => {
            saveButton.innerText = originalText;
            saveButton.disabled = false;
          }, 2000);
        }
      } catch (e) {
        // Handle parsing error
        saveButton.innerText = "Error!";
        console.error("Error parsing save result:", e, result);
        alert("Error saving script. See console for details.");

        // Reset button after 2 seconds
        setTimeout(() => {
          saveButton.innerText = originalText;
          saveButton.disabled = false;
        }, 2000);
      }
    });
  });
  container.appendChild(saveButton);
}


function processCodeSection(section) {
  let lines = section.trim().split("\n");
  if (lines[0].match(/^\w+$/)) {
    lines = lines.slice(1);
  }
  var codeContent = lines.join("\n");
  // alert(codeContent);
  return codeContent;
}

function appendMessage(message, className, container) {
  var messageBlock = document.createElement("div");
  messageBlock.className = "message " + className;
  messageBlock.classList.add("message-entrance"); // Add the entrance class
  messageBlock.textContent = message;
  container.appendChild(messageBlock);
  container.scrollTop = container.scrollHeight; // Scroll to the latest message

  // Remove the animation class after it's done so it doesn't reanimate on reflow
  messageBlock.addEventListener('animationend', () => {
    messageBlock.classList.remove("message-entrance");
  });
}




// Ensure init is called
init();
