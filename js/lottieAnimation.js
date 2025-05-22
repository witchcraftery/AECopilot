// lottieAnimation.js
var animation = lottie.loadAnimation({
  container: document.getElementById("lottie"), // the dom element
  renderer: "svg",
  loop: true,
  autoplay: true,
  path: "assets/loading-gif.json", // the path to the animation json
});