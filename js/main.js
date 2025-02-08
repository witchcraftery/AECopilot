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
  window.oncontextmenu = function(e) {
    e.preventDefault();
    const menu = document.getElementById("custom-context-menu");
    menu.style.top = e.pageY + "px";
    menu.style.left = e.pageX + "px";
    menu.style.display = "block";
    return false;
  };

  // Hide the custom context menu on any left-click
  document.addEventListener("click", function() {
    const menu = document.getElementById("custom-context-menu");
    menu.style.display = "none";
  });

  // Open settings modal when "Settings" is clicked in the custom context menu
  const contextSettings = document.getElementById("context-settings");
  if (contextSettings) {
    contextSettings.addEventListener("click", function(e) {
      e.stopPropagation();
      document.getElementById("settingsModal").style.display = "block";
    });
  }

  // Close the settings modal when the close button is clicked
  const closeModal = document.getElementById("closeModal");
  if (closeModal) {
    closeModal.addEventListener("click", function() {
      document.getElementById("settingsModal").style.display = "none";
    });
  }

  // Optionally, close the modal when clicking outside of modal-content
  window.addEventListener("click", function(event) {
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

  const apiKey = localStorage.getItem("openai_api_key") || "";
  if (!apiKey) {
    alert("Please set your OpenAI API key in the settings page.");
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
          "YOU ONLY RESPOND IN CODE. YOU ALWAYS PLACE TRIPLE BACKTICKS AROUND YOUR ENTIRE MESSAGE AND COMMENT OUT NON-CODE. You are an After Effects Scripting assistant whose job is to strictly respond with code that can be executed as a script to accomplish whatever the user requests. If the user tells you to create or modify something in After Effects then you should provide a script that achieves what the user requested. For example, if the user asked you to say hello world, you would respond with code that alerts hello world. You do not provide pseudocode ever.",
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
    console.log("Execution Result: ", result);
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

function getNextFilename(directory) {
  const fs = require("fs");
  const path = require("path");
  let i = 1;
  while (true) {
    let filename = String(i).padStart(4, "0") + ".jsx";
    let filepath = path.join(directory, filename);
    if (!fs.existsSync(filepath)) {
      // alert(filename);
      return filename;
    }
    i++;
  }
}

// Replace your existing createSaveButton function with this version:
function createSaveButton(code, container) {
  const saveButton = document.createElement("button");
  saveButton.innerText = "Save";
  saveButton.className = "save-button";
  saveButton.addEventListener("click", function () {
    addScriptToKBar(code);
  });
  container.appendChild(saveButton);
}

function addScriptToKBar(code) {
  const fs = require("fs");
  const path = require("path");

  // 1. Save the generated script to a file
  const scriptsDirectory = path.join(__dirname, "script-gens");
  if (!fs.existsSync(scriptsDirectory)) {
    fs.mkdirSync(scriptsDirectory);
  }
  const filename = getNextFilename(scriptsDirectory);
  const scriptFilePath = path.join(scriptsDirectory, filename);

  fs.writeFile(scriptFilePath, code, (err) => {
    if (err) {
      console.error("Error writing script file:", err);
      return;
    }
    console.log(`${filename} has been saved.`);

    // 2. Update the kbar JSON file to add a new button that points to the script
    const kbarJsonPath = "C:\\Users\\jorda\\AppData\\Roaming\\aescripts\\kbar\\toolbars.json";
    fs.readFile(kbarJsonPath, "utf-8", (readErr, data) => {
      if (readErr) {
        console.error("Error reading kbar JSON file:", readErr);
        return;
      }

      let kbarJson;
      try {
        kbarJson = JSON.parse(data);
      } catch (parseErr) {
        console.error("Error parsing kbar JSON file:", parseErr);
        return;
      }

      // Find the toolbar to add the button to (e.g., "Layer")
      let targetToolbar = kbarJson.toolbars.find(toolbar => toolbar.name === "Layer");
      if (!targetToolbar) {
        // Create a new toolbar if it doesn't exist
        targetToolbar = { name: "Layer", buttons: [] };
        kbarJson.toolbars.push(targetToolbar);
      }

      // Create a new button object for the generated script
      const newButton = {
        type: 1, // Script type button
        name: "Generated Script",
        description: "",
        icon: {
          type: 1,         // Use an icon type of 1 (adjust if needed)
          path: "code",    // Default icon name (change as desired)
          color: ""
        },
        modifiers: {
          ctrl: null,
          alt: null,
          shift: null,
          altshift: null,
          ctrlalt: null,
          ctrlshift: null,
          ctrlaltshift: null
        },
        filePath: scriptFilePath,
        argument: "",
        id: generateUUID() // Generate a unique id
      };

      // Add the new button to the toolbar's buttons array
      targetToolbar.buttons.push(newButton);

      // Write the updated JSON back to the kbar file
      fs.writeFile(kbarJsonPath, JSON.stringify(kbarJson, null, 3), (writeErr) => {
        if (writeErr) {
          console.error("Error writing kbar JSON file:", writeErr);
          return;
        }
        console.log("Script added to kbar successfully.");
      });
    });
  });
}

// Utility function to generate a UUID for the new button id
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
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
