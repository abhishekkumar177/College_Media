export function getBotReply(message) {
  const text = message.toLowerCase();

  if (text.includes("features"))
    return "✨ ProjectX helps you build, deploy, and scale digital products effortlessly.";

  if (text.includes("pricing"))
    return "💜 We offer a free tier with powerful features to get you started.";

  if (text.includes("demo"))
    return "🚀 You can explore the demo by clicking the 'View Demo' button on the homepage.";

  return "🤖 I'm here to help! Try asking about features, pricing, or getting started.";
}
