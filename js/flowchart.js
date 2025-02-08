

(function () {
    "use strict";
    window.onload = function () {
      init();
    };
  })();
  
  function init() {
    // event listener for the 'Send' button
    var sendButton = document.querySelector(".button");
    sendButton.addEventListener("click", sendMessage);
    // alert("Send button clicked");
  
    // Event listener for the Enter key in the input field
    var userInputField = document.querySelector("#user-input");
    userInputField.addEventListener("keypress", function (event) {
      // Check if the key pressed is the Enter key
      if (event.key === "Enter") {
        sendMessage();
        // alert("Enter key pressed");
      }
    });
  }
  
  function sendMessage() {
    var userInputField = document.querySelector("#user-input");
    var userMessage = userInputField.value.trim();
    var messageThread = document.querySelector("#message-thread");
  
    if (userMessage) {
      // Append the user's message to the message thread
      appendMessage(userMessage, "user-message", messageThread);
      userInputField.value = ""; // Clear the input field
  
      // Now call the function to process the chat completion
      chatCompletion(userMessage, messageThread);
    }
  }
  
  function sendDebugMessage(userInput, code) {
  
    var messageThread = document.querySelector("#message-thread");
  
      debugCode(userInput, code, messageThread);
    }
  
  // import { assistantCompletion } from "/js/assistant.js";
  
  // let persistentThreadId;
  
  function chatCompletion(userInput, messageThread) {
      const codeContainer = createEmptyCodeBlock(messageThread);
      codeContainer.classList.add('loading');
    const data = JSON.stringify({
      model: "gpt-4-0125-preview",
      messages: [
        {
          role: "system",
          content:
            "YOU ONLY RESPOND IN CODE. YOU ALWAYS PLACE TRIPLE BACKTICKS AROUND YOUR ENTIRE MESSAGE AND COMMENT OUT NON-CODE. You are an After Effects Scripting assistant whose job is to strictly respond with code that can be executed as a script to accomplish whatever the user requests. If the user tells you to create or modify something in After Effects then you should provide a script that achieves what the user requested. For example, if the user asked you to say hello world, you would respond with code that alerts hello world. You do not provide pseudocode ever.",
        },
        {
          role: "user",
          content: userInput, // Ensure you're sending the user's input
        },
      ],
      temperature: 0.2,
    });
  
    fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Bearer APIKEY", // Replace with your API key
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
        if (response.choices && response.choices.length > 0) {
          const responseText = response.choices[0].message.content;
          const sections = responseText.split("```");
  
          sections.forEach((section, index) => {
            if (index % 2 === 0 && section.trim() !== "") {
              appendMessage(section, "response-message", messageThread);
            } else if (section.trim() !== "") {
              section = processCodeSection(section);
                populateCodeBlock(section, codeContainer, userInput);
                codeContainer.classList.remove('loading');
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
          codeContainer.classList.remove('loading');
      });
  }
  
  function debugCode(userInput, code, messageThread) {
    const message = `This was the original task: ${userInput}. This was the code you provided: '''${code}'''. The provided code did not work. Please try again with a different approach.`;
      const codeContainer = createEmptyCodeBlock(messageThread);
      codeContainer.classList.add('loading');
    const data = JSON.stringify({
      model: "gpt-4-0125-preview",
      messages: [
        {
          role: "system",
          content:
            "YOU ONLY RESPOND IN CODE. YOU ALWAYS PLACE TRIPLE BACKTICKS AROUND YOUR ENTIRE MESSAGE AND COMMENT OUT NON-CODE. You are an After Effects Scripting assistant whose job is to strictly respond with code that can be executed as a script to accomplish whatever the user requests. If the user tells you to create or modify something in After Effects then you should provide a script that achieves what the user requested. For example, if the user asked you to say hello world, you would respond with code that alerts hello world. You do not provide pseudocode ever. If the user asks you to try again, you should provide new code that attempts to accomplish the original task in a different way than the code provided by the user.",
        },
        {
          role: "user",
          content: message,
        },
      ],
      temperature: 0.2,
    });
  
    fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Bearer APIKEY", // Replace with your API key
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
        if (response.choices && response.choices.length > 0) {
          const responseText = response.choices[0].message.content;
          const sections = responseText.split("```");
  
          sections.forEach((section, index) => {
            if (index % 2 === 0 && section.trim() !== "") {
              appendMessage(section, "response-message", messageThread);
            } else if (section.trim() !== "") {
              section = processCodeSection(section);
                populateCodeBlock(section, codeContainer, userInput);
                codeContainer.classList.remove('loading');
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
          codeContainer.classList.remove('loading');
      });
  }
  
  // function chatCompletion(userInput, messageThread) {
  //   const codeContainer = createEmptyCodeBlock(messageThread);
  
  //   // Pass persistentThreadId to assistantCompletion
  //   assistantCompletion(userInput, persistentThreadId)
  //     .then(({ response, threadId }) => {
  //       // Update the persistentThreadId with the new threadId from assistantCompletion
  //       if (threadId) {
  //         persistentThreadId = threadId;
  //         alert(persistentThreadId);
  //       }
  
  //       if (response) {
  //         alert(response);
  //         const sections = response.split("```");
  
  //         sections.forEach((section, index) => {
  //           if (index % 2 === 0 && section.trim() !== "") {
  //             appendMessage(section, "response-message", messageThread);
  //           } else if (section.trim() !== "") {
  //             section = processCodeSection(section);
  //             populateCodeBlock(section, codeContainer);
  //           }
  //         });
  //       } else {
  //         console.error("Unexpected response format:", response);
  //         alert("Received an unexpected response format.");
  //       }
  //     })
  //     .catch((error) => {
  //       console.error("Error:", error);
  //       alert("Error: " + error.message);
  //     });
  // }
  
  
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
    const debugButton = document.createElement("button");
    debugButton.innerText = "Debug";
    debugButton.className = "debug-button";
    debugButton.addEventListener("click", function () {
      sendDebugMessage(userInput, code);
    });
    container.appendChild(debugButton);
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
  
  function createSaveButton(code, container) {
    const saveButton = document.createElement("button");
    saveButton.innerText = "Save";
    saveButton.className = "save-button";
    saveButton.addEventListener("click", function () {
      // Implement saving functionality here
      const fs = require("fs");
      const path = require("path");
      const directory = path.join(__dirname, "/script-gens");
      const filename = getNextFilename(directory);
      const filePath = path.join(directory, filename);
      fs.writeFile(filePath, code, (err) => {
        if (err) {
          console.error("Error writing file:", err);
        } else {
          console.log(`${filename} has been saved.`);
        }
      });
    });
    container.appendChild(saveButton);
  }
  
  // The processCodeSection function should be defined outside of chatCompletion
  function processCodeSection(section) {
    let lines = section.trim().split("\n");
    if (lines[0].match(/^\w+$/)) {
      lines = lines.slice(1);
    }
    var codeContent = lines.join("\n");
    return codeContent;
  }
  
  function appendMessage(message, className, container) {
    var messageBlock = document.createElement("div");
    messageBlock.className = "message " + className;
    messageBlock.textContent = message;
    container.appendChild(messageBlock);
    container.scrollTop = container.scrollHeight; // Scroll to the latest message
  }
  
  req.write(data);
  req.end();
  