// Bot detection for analytics filtering
'use strict';

const BOT_PATTERN = /bot|crawl|spider|slurp|bingbot|googlebot|yandexbot|baiduspider|duckduckbot|facebookexternalhit|twitterbot|linkedinbot|embedly|quora link|showyoubot|outbrain|pinterest|applebot|semrushbot|ahrefsbot|mj12bot|dotbot|petalbot|bytespider|gptbot|chatgpt|claudebot|anthropic|amazonbot|ccbot|cohere-ai|perplexitybot|serpstatbot|dataforseo|megaindex|blexbot|sogou|exabot|ia_archiver|archive\.org_bot|screaming frog|deepcrawl|sitebulb|headlesschrome|phantomjs|prerender|uptimerobot|pingdom|statuscake|newrelicpinger|synthetics|monitoring|feedfetcher|mediapartners|adsbot|apis-google|google-read-aloud/i;

function isBot(userAgent, acceptLanguage) {
  if (!userAgent) return true;
  if (BOT_PATTERN.test(userAgent)) return true;
  // Missing Accept-Language is a secondary bot signal
  if (!acceptLanguage) return true;
  return false;
}

module.exports = { isBot };
