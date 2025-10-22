/**
 * Quick Action Prompts for AI Chat
 *
 * Configurable quick actions based on search type.
 * Users can click these to quickly send common prompts to the AI.
 * Deleted actions are permanently hidden from the UI.
 */

import type { SerperSearchType } from './serper-types'

export interface QuickAction {
  label: string
  prompt: string
  icon?: string
  description?: string
  id: string // Unique identifier for deletion tracking
}

/**
 * Default quick actions for each search type (EXPANDED LIBRARY)
 */
export const DEFAULT_QUICK_ACTIONS: Record<SerperSearchType, QuickAction[]> = {
  // Web Search Quick Actions (20 actions)
  search: [
    {
      id: 'search-summarize-top3',
      label: '📝 Summarize Top 3',
      prompt: 'Summarize the top 3 search results in a concise, bullet-point format. Include the source URL for each.',
      description: 'Get a quick summary of the most relevant results',
    },
    {
      id: 'search-extract-points',
      label: '🔍 Extract Key Points',
      prompt: 'Extract the key points and insights from all search results. Organize them by topic.',
      description: 'Pull out the most important information',
    },
    {
      id: 'search-compare',
      label: '⚖️ Compare & Contrast',
      prompt: 'Compare and contrast the different perspectives or approaches found in the search results.',
      description: 'Identify similarities and differences',
    },
    {
      id: 'search-action-items',
      label: '🎯 Action Items',
      prompt: 'Based on these search results, create a list of actionable next steps I should take.',
      description: 'Get practical recommendations',
    },
    {
      id: 'search-table',
      label: '📊 Create Table',
      prompt: 'Create a comparison table of the search results with columns for: Title, Key Info, Source, and Relevance.',
      description: 'Organize results in a structured table',
    },
    {
      id: 'search-prompt',
      label: '💡 Generate Prompt',
      prompt: 'Help me create a detailed prompt I can use to further explore this topic with AI tools.',
      description: 'Build a better follow-up prompt',
    },
    {
      id: 'search-pros-cons',
      label: '✅ Pros & Cons',
      prompt: 'Create a comprehensive pros and cons list based on all the information in these search results.',
      description: 'Analyze advantages and disadvantages',
    },
    {
      id: 'search-eli5',
      label: '👶 ELI5 Explain',
      prompt: 'Explain the main topic from these search results as if I\'m 5 years old. Keep it simple!',
      description: 'Simple explanation for beginners',
    },
    {
      id: 'search-expert',
      label: '🎓 Expert Analysis',
      prompt: 'Provide an expert-level analysis of this topic based on the search results. Go deep!',
      description: 'Advanced technical breakdown',
    },
    {
      id: 'search-tldr',
      label: '⚡ TL;DR',
      prompt: 'Give me a TL;DR (too long; didn\'t read) summary in 3 sentences or less.',
      description: 'Ultra-concise summary',
    },
    {
      id: 'search-questions',
      label: '❓ Follow-up Questions',
      prompt: 'Based on these results, what are 5 important follow-up questions I should research?',
      description: 'Identify knowledge gaps',
    },
    {
      id: 'search-controversy',
      label: '⚠️ Controversies',
      prompt: 'Are there any controversies, debates, or conflicting information in these results? Explain.',
      description: 'Identify contentious points',
    },
    {
      id: 'search-credibility',
      label: '🔒 Credibility Check',
      prompt: 'Assess the credibility and authority of the sources in these search results.',
      description: 'Evaluate source trustworthiness',
    },
    {
      id: 'search-timeline',
      label: '📅 Create Timeline',
      prompt: 'Create a timeline or chronological sequence of events mentioned in these results.',
      description: 'Organize by date/sequence',
    },
    {
      id: 'search-related',
      label: '🔗 Related Topics',
      prompt: 'What related topics or subtopics should I explore based on these results?',
      description: 'Expand research scope',
    },
    {
      id: 'search-resources',
      label: '📚 Resource List',
      prompt: 'Extract all useful resources (tools, websites, books, courses) mentioned in these results.',
      description: 'Gather referenced materials',
    },
    {
      id: 'search-experts',
      label: '👤 Key People',
      prompt: 'Who are the key people, authors, or experts mentioned in these search results?',
      description: 'Identify authorities',
    },
    {
      id: 'search-cost',
      label: '💵 Cost Analysis',
      prompt: 'What costs, pricing, or budget information is mentioned in these results?',
      description: 'Extract financial details',
    },
    {
      id: 'search-risks',
      label: '⚠️ Risks & Challenges',
      prompt: 'What risks, challenges, or potential problems are mentioned in these results?',
      description: 'Identify potential issues',
    },
    {
      id: 'search-trends',
      label: '📈 Trends & Patterns',
      prompt: 'What trends, patterns, or emerging themes do you notice across these search results?',
      description: 'Spot broader patterns',
    },
  ],

  // Image Search Quick Actions (18 actions)
  images: [
    {
      id: 'images-describe',
      label: '🖼️ Describe Images',
      prompt: 'Describe the types of images found in these results. What visual themes or styles are common?',
      description: 'Analyze image patterns',
    },
    {
      id: 'images-sources',
      label: '📋 List Sources',
      prompt: 'Create a numbered list of all image sources with their titles and URLs.',
      description: 'Extract image source information',
    },
    {
      id: 'images-use-cases',
      label: '🎨 Use Cases',
      prompt: 'Suggest creative use cases for these images (presentations, design inspiration, etc.).',
      description: 'Find practical applications',
    },
    {
      id: 'images-quality',
      label: '🔗 Best Quality',
      prompt: 'Which images appear to be the highest quality or resolution based on the metadata?',
      description: 'Identify best image options',
    },
    {
      id: 'images-alt-text',
      label: '📝 Alt Text Ideas',
      prompt: 'Generate descriptive alt text suggestions for the top 5 images.',
      description: 'Create accessibility descriptions',
    },
    {
      id: 'images-color-palette',
      label: '🎨 Color Palette',
      prompt: 'Based on the image titles and context, what color palettes seem dominant?',
      description: 'Analyze color themes',
    },
    {
      id: 'images-styles',
      label: '🖌️ Art Styles',
      prompt: 'Categorize these images by art style (photography, illustration, 3D, minimalist, etc.).',
      description: 'Classify visual styles',
    },
    {
      id: 'images-composition',
      label: '📐 Composition Analysis',
      prompt: 'Analyze the composition patterns (portrait, landscape, square, etc.) in these images.',
      description: 'Study layout types',
    },
    {
      id: 'images-licensing',
      label: '⚖️ License Info',
      prompt: 'What can you infer about licensing and usage rights from the image sources?',
      description: 'Check usage permissions',
    },
    {
      id: 'images-context',
      label: '🔍 Context Analysis',
      prompt: 'What context or story do these images tell when viewed together?',
      description: 'Find narrative themes',
    },
    {
      id: 'images-mood',
      label: '😊 Mood & Tone',
      prompt: 'Describe the mood, tone, and emotional qualities of these images.',
      description: 'Analyze emotional impact',
    },
    {
      id: 'images-brands',
      label: '🏢 Brand Usage',
      prompt: 'Which images would work well for branding, marketing, or commercial purposes?',
      description: 'Identify commercial potential',
    },
    {
      id: 'images-social',
      label: '📱 Social Media Ready',
      prompt: 'Which images are best suited for different social media platforms (Instagram, Twitter, LinkedIn)?',
      description: 'Platform-specific recommendations',
    },
    {
      id: 'images-keywords',
      label: '🔤 SEO Keywords',
      prompt: 'Generate SEO-friendly keywords and tags for the top images.',
      description: 'Create searchable metadata',
    },
    {
      id: 'images-similar',
      label: '🔄 Find Similar',
      prompt: 'What search terms would help me find more images similar to these?',
      description: 'Suggest related searches',
    },
    {
      id: 'images-technical',
      label: '⚙️ Technical Specs',
      prompt: 'What technical information (dimensions, file types, etc.) is available about these images?',
      description: 'Extract metadata',
    },
    {
      id: 'images-trends',
      label: '📊 Current Trends',
      prompt: 'Do these images reflect current visual design trends? Explain.',
      description: 'Trend analysis',
    },
    {
      id: 'images-combinations',
      label: '🎭 Best Combinations',
      prompt: 'Which images work well together? Suggest pairings or groupings.',
      description: 'Create visual sets',
    },
  ],

  // Video Search Quick Actions (20 actions)
  videos: [
    {
      id: 'videos-summarize',
      label: '🎬 Summarize Videos',
      prompt: 'Summarize what each video is about based on the titles and descriptions provided.',
      description: 'Quick overview of video content',
    },
    {
      id: 'videos-creators',
      label: '👤 List Creators',
      prompt: 'List all the video creators/channels with their video titles.',
      description: 'See who created what',
    },
    {
      id: 'videos-duration',
      label: '⏱️ Time Analysis',
      prompt: 'Analyze the video durations. Which are short-form vs long-form content?',
      description: 'Duration breakdown',
    },
    {
      id: 'videos-playlist',
      label: '📚 Create Playlist',
      prompt: 'Suggest an order to watch these videos for optimal learning, with brief reasoning.',
      description: 'Organize viewing order',
    },
    {
      id: 'videos-topics',
      label: '🔑 Key Topics',
      prompt: 'Extract the main topics covered across all these videos.',
      description: 'Identify common themes',
    },
    {
      id: 'videos-timestamps',
      label: '⏰ Key Timestamps',
      prompt: 'Based on the descriptions, what key moments or chapters should I look for in these videos?',
      description: 'Find important sections',
    },
    {
      id: 'videos-skill-level',
      label: '📊 Skill Level',
      prompt: 'Categorize these videos by skill level: beginner, intermediate, or advanced.',
      description: 'Assess difficulty',
    },
    {
      id: 'videos-channels',
      label: '📺 Channel Analysis',
      prompt: 'Analyze the channels. Which creators are most authoritative on this topic?',
      description: 'Evaluate channel credibility',
    },
    {
      id: 'videos-watch-next',
      label: '▶️ Watch First',
      prompt: 'If I can only watch one video, which should I choose and why?',
      description: 'Single best recommendation',
    },
    {
      id: 'videos-recency',
      label: '🆕 Most Recent',
      prompt: 'Which videos are the most recent? Is the information likely up-to-date?',
      description: 'Check freshness',
    },
    {
      id: 'videos-comprehensive',
      label: '📖 Most Comprehensive',
      prompt: 'Which video appears to be the most comprehensive or in-depth?',
      description: 'Find detailed content',
    },
    {
      id: 'videos-quick-learn',
      label: '⚡ Quick Learning',
      prompt: 'Which short videos can teach me the basics quickly?',
      description: 'Fast overview options',
    },
    {
      id: 'videos-series',
      label: '🔢 Video Series',
      prompt: 'Are any of these videos part of a series? Help me identify the sequence.',
      description: 'Find related video sets',
    },
    {
      id: 'videos-tutorials',
      label: '🎯 Best Tutorials',
      prompt: 'Which videos are practical tutorials vs theoretical explanations?',
      description: 'Separate how-to from theory',
    },
    {
      id: 'videos-audience',
      label: '👥 Target Audience',
      prompt: 'Who is the target audience for each video? (beginners, professionals, general public, etc.)',
      description: 'Identify intended viewers',
    },
    {
      id: 'videos-prerequisites',
      label: '📚 Prerequisites',
      prompt: 'What background knowledge or prerequisites do I need before watching these videos?',
      description: 'Identify required knowledge',
    },
    {
      id: 'videos-practical',
      label: '💼 Practical Value',
      prompt: 'Which videos have the most practical, actionable advice vs theory?',
      description: 'Find hands-on content',
    },
    {
      id: 'videos-entertainment',
      label: '😄 Entertainment Value',
      prompt: 'Which videos are more entertaining vs purely educational?',
      description: 'Balance education and fun',
    },
    {
      id: 'videos-quality',
      label: '🎥 Production Quality',
      prompt: 'Based on the descriptions and channels, which videos likely have the best production quality?',
      description: 'Assess video quality',
    },
    {
      id: 'videos-subtitles',
      label: '📝 Subtitle Availability',
      prompt: 'Based on the channels, which videos are likely to have good captions/subtitles?',
      description: 'Check accessibility features',
    },
  ],

  // Places Search Quick Actions (18 actions)
  places: [
    {
      id: 'places-best-rated',
      label: '⭐ Best Rated',
      prompt: 'Which places have the highest ratings? List them with their rating and review count.',
      description: 'Sort by rating quality',
    },
    {
      id: 'places-directions',
      label: '📍 Get Directions Prompt',
      prompt: 'Create a formatted list of addresses I can copy-paste into Google Maps.',
      description: 'Extract addresses for navigation',
    },
    {
      id: 'places-open-now',
      label: '🕒 Open Now',
      prompt: 'Which places are currently open? Include their hours.',
      description: 'Filter by current availability',
    },
    {
      id: 'places-reviews',
      label: '💬 Review Summary',
      prompt: 'Summarize the common themes in the reviews (positive and negative).',
      description: 'Analyze customer feedback',
    },
    {
      id: 'places-table',
      label: '📊 Compare Table',
      prompt: 'Create a comparison table with: Name, Rating, Price Level, and Key Features.',
      description: 'Side-by-side comparison',
    },
    {
      id: 'places-nearest',
      label: '📏 Nearest Options',
      prompt: 'If I\'m at the first location, which other places are closest to visit next?',
      description: 'Proximity-based suggestions',
    },
    {
      id: 'places-price-range',
      label: '💰 By Budget',
      prompt: 'Organize these places by price level from budget-friendly to expensive.',
      description: 'Sort by affordability',
    },
    {
      id: 'places-atmosphere',
      label: '🎭 Atmosphere',
      prompt: 'Based on reviews and descriptions, describe the atmosphere/vibe of each place.',
      description: 'Understand ambiance',
    },
    {
      id: 'places-specialties',
      label: '🌟 Specialties',
      prompt: 'What is each place known for? List their specialties or unique features.',
      description: 'Identify standout features',
    },
    {
      id: 'places-busy-times',
      label: '⏰ Best Times',
      prompt: 'When are these places typically least crowded? Suggest best times to visit.',
      description: 'Avoid peak hours',
    },
    {
      id: 'places-families',
      label: '👨‍👩‍👧 Family Friendly',
      prompt: 'Which places are most suitable for families with children?',
      description: 'Find kid-friendly options',
    },
    {
      id: 'places-accessibility',
      label: '♿ Accessibility',
      prompt: 'What accessibility features are mentioned in the reviews or descriptions?',
      description: 'Check accommodations',
    },
    {
      id: 'places-parking',
      label: '🅿️ Parking Info',
      prompt: 'What parking information is available for these places?',
      description: 'Find parking details',
    },
    {
      id: 'places-reservations',
      label: '📞 Reservation Tips',
      prompt: 'Which places require or recommend reservations? Extract booking information.',
      description: 'Plan ahead',
    },
    {
      id: 'places-locals',
      label: '🗺️ Local Favorites',
      prompt: 'Which places do locals seem to prefer based on review patterns?',
      description: 'Find hidden gems',
    },
    {
      id: 'places-groups',
      label: '👥 Group Friendly',
      prompt: 'Which places are best for large groups or gatherings?',
      description: 'Group accommodation',
    },
    {
      id: 'places-season',
      label: '🌤️ Seasonal Tips',
      prompt: 'Are there any seasonal considerations for visiting these places?',
      description: 'Weather and season info',
    },
    {
      id: 'places-hidden-costs',
      label: '💸 Hidden Costs',
      prompt: 'Are there any hidden fees, cover charges, or additional costs mentioned?',
      description: 'Identify extra expenses',
    },
  ],

  // Maps Search Quick Actions (16 actions)
  maps: [
    {
      id: 'maps-route',
      label: '📍 Route Planning',
      prompt: 'Help me plan an efficient route to visit these locations in order.',
      description: 'Optimize travel path',
    },
    {
      id: 'maps-top-picks',
      label: '⭐ Top Picks',
      prompt: 'Recommend the top 3 locations based on ratings and proximity.',
      description: 'Best options by location',
    },
    {
      id: 'maps-area',
      label: '🗺️ Area Overview',
      prompt: 'Describe the general area these locations are in (neighborhood, district, etc.).',
      description: 'Geographic context',
    },
    {
      id: 'maps-contact',
      label: '📞 Contact Info',
      prompt: 'Extract all phone numbers and addresses in a clean list format.',
      description: 'Get contact details',
    },
    {
      id: 'maps-budget',
      label: '💰 Budget Analysis',
      prompt: 'Analyze the price levels. Which options are budget-friendly vs premium?',
      description: 'Compare pricing tiers',
    },
    {
      id: 'maps-walking',
      label: '🚶 Walking Tour',
      prompt: 'Create a walking tour itinerary visiting these locations in the most logical order.',
      description: 'Pedestrian-friendly route',
    },
    {
      id: 'maps-driving',
      label: '🚗 Driving Route',
      prompt: 'Suggest a driving route that minimizes backtracking and includes all locations.',
      description: 'Car-friendly planning',
    },
    {
      id: 'maps-public-transit',
      label: '🚌 Public Transport',
      prompt: 'How can I visit these locations using public transportation?',
      description: 'Transit options',
    },
    {
      id: 'maps-day-trip',
      label: '☀️ Day Trip Plan',
      prompt: 'Create a full-day itinerary visiting these locations with suggested timing.',
      description: 'Schedule a complete day',
    },
    {
      id: 'maps-clusters',
      label: '📍 Location Clusters',
      prompt: 'Group these locations into clusters based on proximity.',
      description: 'Organize by area',
    },
    {
      id: 'maps-landmarks',
      label: '🏛️ Nearby Landmarks',
      prompt: 'What notable landmarks or attractions are near these locations?',
      description: 'Find points of interest',
    },
    {
      id: 'maps-time-estimate',
      label: '⏱️ Time Estimates',
      prompt: 'Estimate how much time I should spend at each location.',
      description: 'Duration planning',
    },
    {
      id: 'maps-photo-ops',
      label: '📸 Photo Opportunities',
      prompt: 'Which locations are best for photography or scenic views?',
      description: 'Find Instagram spots',
    },
    {
      id: 'maps-amenities',
      label: '🏪 Nearby Amenities',
      prompt: 'What restaurants, shops, or facilities are near these locations?',
      description: 'Find support services',
    },
    {
      id: 'maps-avoid',
      label: '⚠️ What to Avoid',
      prompt: 'Based on reviews, are there any locations I should skip or be cautious about?',
      description: 'Identify problematic spots',
    },
    {
      id: 'maps-best-time-day',
      label: '🌅 Best Time of Day',
      prompt: 'What time of day is best to visit each location?',
      description: 'Optimize for timing',
    },
  ],

  // News Search Quick Actions (20 actions)
  news: [
    {
      id: 'news-summarize',
      label: '📰 Summarize Stories',
      prompt: 'Summarize each news article in 1-2 sentences with the publication date.',
      description: 'Quick news overview',
    },
    {
      id: 'news-timeline',
      label: '🕐 Timeline View',
      prompt: 'Create a timeline of events based on these news articles (oldest to newest).',
      description: 'Chronological organization',
    },
    {
      id: 'news-sources',
      label: '📊 Source Analysis',
      prompt: 'Which news sources are represented? Categorize them by type (mainstream, specialty, etc.).',
      description: 'Analyze news sources',
    },
    {
      id: 'news-facts',
      label: '🔍 Key Facts',
      prompt: 'Extract the key facts and figures mentioned across all articles.',
      description: 'Pull out important data',
    },
    {
      id: 'news-perspectives',
      label: '🌍 Perspectives',
      prompt: 'What different perspectives or angles do these articles take on the topic?',
      description: 'Compare viewpoints',
    },
    {
      id: 'news-report',
      label: '📝 Brief Report',
      prompt: 'Write a brief report synthesizing information from all these news articles.',
      description: 'Comprehensive summary',
    },
    {
      id: 'news-bias',
      label: '⚖️ Bias Detection',
      prompt: 'Analyze these articles for potential bias or editorial slant.',
      description: 'Assess objectivity',
    },
    {
      id: 'news-breaking',
      label: '🚨 Breaking News',
      prompt: 'Which articles cover breaking or developing stories?',
      description: 'Identify urgent news',
    },
    {
      id: 'news-impact',
      label: '💥 Impact Analysis',
      prompt: 'What is the potential impact or significance of these news stories?',
      description: 'Assess importance',
    },
    {
      id: 'news-background',
      label: '📚 Background Info',
      prompt: 'What background context do I need to understand these news stories?',
      description: 'Get necessary context',
    },
    {
      id: 'news-quotes',
      label: '💬 Key Quotes',
      prompt: 'Extract important quotes from officials, experts, or witnesses in these articles.',
      description: 'Pull direct quotes',
    },
    {
      id: 'news-followup',
      label: '🔔 Follow-up Topics',
      prompt: 'What related stories or follow-up articles should I look for?',
      description: 'Track developing stories',
    },
    {
      id: 'news-local-global',
      label: '🌐 Local vs Global',
      prompt: 'Which stories have local vs global significance?',
      description: 'Assess scope',
    },
    {
      id: 'news-verified',
      label: '✅ Fact Check',
      prompt: 'Are there any claims in these articles that need fact-checking?',
      description: 'Verify information',
    },
    {
      id: 'news-reactions',
      label: '💭 Public Reaction',
      prompt: 'What public or expert reactions to this news are mentioned?',
      description: 'Gauge response',
    },
    {
      id: 'news-headlines',
      label: '📰 Compare Headlines',
      prompt: 'Compare the headlines. How does each source frame the story?',
      description: 'Analyze framing',
    },
    {
      id: 'news-visuals',
      label: '📷 Visual Coverage',
      prompt: 'What images, videos, or visual elements accompany these stories?',
      description: 'Assess multimedia',
    },
    {
      id: 'news-opinion',
      label: '📝 Opinion Pieces',
      prompt: 'Which articles are news reporting vs opinion/commentary?',
      description: 'Separate facts from opinions',
    },
    {
      id: 'news-international',
      label: '🌍 International Angle',
      prompt: 'Are there international dimensions or implications to these stories?',
      description: 'Global perspective',
    },
    {
      id: 'news-trends',
      label: '📈 News Trends',
      prompt: 'What broader trends or patterns do these news stories reveal?',
      description: 'Identify bigger picture',
    },
  ],

  // Scholar Search Quick Actions (20 actions)
  scholar: [
    {
      id: 'scholar-citations-apa',
      label: '📚 APA Citations',
      prompt: 'Format the top 5 papers in APA citation style.',
      description: 'Generate APA citations',
    },
    {
      id: 'scholar-citations-mla',
      label: '📖 MLA Citations',
      prompt: 'Format the top 5 papers in MLA citation style.',
      description: 'Generate MLA citations',
    },
    {
      id: 'scholar-citations-chicago',
      label: '📝 Chicago Citations',
      prompt: 'Format the top 5 papers in Chicago citation style.',
      description: 'Generate Chicago citations',
    },
    {
      id: 'scholar-summary',
      label: '🔬 Research Summary',
      prompt: 'Summarize the research focus of each paper based on the titles and snippets.',
      description: 'Academic overview',
    },
    {
      id: 'scholar-findings',
      label: '💡 Key Findings',
      prompt: 'What appear to be the key findings or contributions from these papers?',
      description: 'Extract main insights',
    },
    {
      id: 'scholar-authors',
      label: '👥 Author Analysis',
      prompt: 'List the authors and identify any who appear multiple times.',
      description: 'Identify key researchers',
    },
    {
      id: 'scholar-timeline',
      label: '📅 Publication Timeline',
      prompt: 'Organize these papers by publication year. What trends do you notice?',
      description: 'Track research evolution',
    },
    {
      id: 'scholar-reading-order',
      label: '🎓 Reading Order',
      prompt: 'Suggest an order to read these papers for someone new to the topic.',
      description: 'Learning path recommendation',
    },
    {
      id: 'scholar-methodology',
      label: '🔬 Methodologies',
      prompt: 'What research methodologies are used in these papers?',
      description: 'Identify research methods',
    },
    {
      id: 'scholar-seminal',
      label: '⭐ Seminal Papers',
      prompt: 'Which papers appear to be seminal or highly influential works?',
      description: 'Find foundational research',
    },
    {
      id: 'scholar-recent',
      label: '🆕 Most Recent',
      prompt: 'Which papers are most recent? What new developments do they introduce?',
      description: 'Track latest research',
    },
    {
      id: 'scholar-gaps',
      label: '❓ Research Gaps',
      prompt: 'What research gaps or future directions are mentioned in these papers?',
      description: 'Identify missing research',
    },
    {
      id: 'scholar-consensus',
      label: '🤝 Consensus Points',
      prompt: 'What points of consensus exist across these papers?',
      description: 'Find agreement',
    },
    {
      id: 'scholar-debate',
      label: '⚔️ Debates',
      prompt: 'What debates or disagreements exist between these papers?',
      description: 'Identify conflicts',
    },
    {
      id: 'scholar-applications',
      label: '💼 Practical Applications',
      prompt: 'What practical applications or real-world implications do these papers discuss?',
      description: 'Find real-world use',
    },
    {
      id: 'scholar-related-fields',
      label: '🔗 Related Fields',
      prompt: 'What related academic fields or disciplines intersect with this research?',
      description: 'Cross-discipline connections',
    },
    {
      id: 'scholar-limitations',
      label: '⚠️ Study Limitations',
      prompt: 'What limitations are mentioned in these research papers?',
      description: 'Understand constraints',
    },
    {
      id: 'scholar-data-sources',
      label: '📊 Data Sources',
      prompt: 'What data sources and datasets are used in this research?',
      description: 'Identify research data',
    },
    {
      id: 'scholar-keywords',
      label: '🔤 Keywords',
      prompt: 'Extract the key terminology and academic keywords from these papers.',
      description: 'Build vocabulary',
    },
    {
      id: 'scholar-literature-review',
      label: '📚 Literature Review',
      prompt: 'Help me start a literature review using these papers as a foundation.',
      description: 'Begin comprehensive review',
    },
  ],

  // Shopping Search Quick Actions (20 actions)
  shopping: [
    {
      id: 'shopping-price-compare',
      label: '💰 Price Comparison',
      prompt: 'Create a price comparison table sorted from lowest to highest.',
      description: 'Compare product prices',
    },
    {
      id: 'shopping-best-value',
      label: '🏆 Best Value',
      prompt: 'Which product offers the best value considering price, rating, and features?',
      description: 'Find optimal choice',
    },
    {
      id: 'shopping-specs',
      label: '📋 Product Specs',
      prompt: 'Extract and compare the key specifications of each product.',
      description: 'Technical comparison',
    },
    {
      id: 'shopping-top-rated',
      label: '⭐ Top Rated',
      prompt: 'List products sorted by rating. Include the number of reviews for context.',
      description: 'Sort by customer satisfaction',
    },
    {
      id: 'shopping-checklist',
      label: '🛒 Shopping List',
      prompt: 'Create a shopping checklist I can use to compare these products in person.',
      description: 'In-store comparison guide',
    },
    {
      id: 'shopping-recommendation',
      label: '💡 AI Recommendation',
      prompt: 'Based on the search results, which product would you recommend and why?',
      description: 'Get AI recommendation',
    },
    {
      id: 'shopping-pros-cons',
      label: '✅ Pros & Cons',
      prompt: 'Create a pros and cons list for each product.',
      description: 'Balanced product analysis',
    },
    {
      id: 'shopping-budget',
      label: '💵 Budget Options',
      prompt: 'Which products are most budget-friendly while still maintaining quality?',
      description: 'Find affordable choices',
    },
    {
      id: 'shopping-premium',
      label: '👑 Premium Options',
      prompt: 'Which products are premium/high-end options? What extra features justify the cost?',
      description: 'Luxury product analysis',
    },
    {
      id: 'shopping-shipping',
      label: '📦 Shipping Info',
      prompt: 'What shipping costs and delivery times are mentioned for these products?',
      description: 'Compare delivery options',
    },
    {
      id: 'shopping-availability',
      label: '🟢 In Stock',
      prompt: 'Which products are currently in stock vs out of stock or backordered?',
      description: 'Check inventory status',
    },
    {
      id: 'shopping-deals',
      label: '🎉 Deals & Discounts',
      prompt: 'Are there any sales, discounts, or special offers mentioned?',
      description: 'Find savings opportunities',
    },
    {
      id: 'shopping-warranty',
      label: '🛡️ Warranty & Returns',
      prompt: 'What warranty or return policy information is available for these products?',
      description: 'Understand guarantees',
    },
    {
      id: 'shopping-alternatives',
      label: '🔄 Alternatives',
      prompt: 'What alternative products or brands should I consider?',
      description: 'Expand options',
    },
    {
      id: 'shopping-reviews-summary',
      label: '💬 Review Summary',
      prompt: 'Summarize the common themes in customer reviews (both positive and negative).',
      description: 'Understand customer experience',
    },
    {
      id: 'shopping-features',
      label: '🌟 Must-Have Features',
      prompt: 'What key features should I prioritize when choosing between these products?',
      description: 'Identify important specs',
    },
    {
      id: 'shopping-brands',
      label: '🏢 Brand Comparison',
      prompt: 'Compare the brands behind these products. Which are most reputable?',
      description: 'Assess brand quality',
    },
    {
      id: 'shopping-use-case',
      label: '🎯 Best For My Needs',
      prompt: 'Help me identify which product is best for [describe your specific needs].',
      description: 'Personalized recommendation',
    },
    {
      id: 'shopping-long-term',
      label: '📅 Long-Term Value',
      prompt: 'Which products offer the best long-term value and durability?',
      description: 'Consider longevity',
    },
    {
      id: 'shopping-sellers',
      label: '🏪 Seller Comparison',
      prompt: 'Compare the sellers/retailers offering these products. Which are most reliable?',
      description: 'Evaluate seller trustworthiness',
    },
  ],

  // Playground Quick Actions (20 AI-focused actions)
  playground: [
    {
      id: 'playground-brainstorm',
      label: '💡 Brainstorm Ideas',
      prompt: 'Let\'s brainstorm creative ideas together. What topic should we explore?',
      description: 'Generate creative concepts',
    },
    {
      id: 'playground-explain',
      label: '📚 Explain Concept',
      prompt: 'Explain this concept to me in simple terms with examples.',
      description: 'Break down complex topics',
    },
    {
      id: 'playground-code-review',
      label: '👨‍💻 Code Review',
      prompt: 'Review my code for best practices, bugs, and improvements.',
      description: 'Get code feedback',
    },
    {
      id: 'playground-debug',
      label: '🐛 Debug Help',
      prompt: 'Help me debug this error. What could be causing it and how can I fix it?',
      description: 'Troubleshoot issues',
    },
    {
      id: 'playground-optimize',
      label: '⚡ Optimize Code',
      prompt: 'How can I optimize this code for better performance?',
      description: 'Improve efficiency',
    },
    {
      id: 'playground-design-pattern',
      label: '🏗️ Design Pattern',
      prompt: 'Suggest appropriate design patterns for this problem.',
      description: 'Architecture guidance',
    },
    {
      id: 'playground-test-cases',
      label: '🧪 Test Cases',
      prompt: 'Generate comprehensive test cases for this functionality.',
      description: 'Create test scenarios',
    },
    {
      id: 'playground-refactor',
      label: '♻️ Refactor Code',
      prompt: 'Refactor this code to be more readable and maintainable.',
      description: 'Improve code quality',
    },
    {
      id: 'playground-api-design',
      label: '🔌 API Design',
      prompt: 'Help me design a RESTful API for this use case.',
      description: 'Design endpoints',
    },
    {
      id: 'playground-prompt-engineer',
      label: '✨ Prompt Engineering',
      prompt: 'Help me improve this AI prompt to get better results.',
      description: 'Optimize prompts',
    },
    {
      id: 'playground-reasoning',
      label: '🤔 Step-by-Step Reasoning',
      prompt: 'Walk me through your reasoning step-by-step.',
      description: 'Show thought process',
    },
    {
      id: 'playground-analogies',
      label: '🔄 Create Analogies',
      prompt: 'Explain this using creative analogies and metaphors.',
      description: 'Make it relatable',
    },
    {
      id: 'playground-pros-cons',
      label: '⚖️ Pros & Cons',
      prompt: 'List the pros and cons of this approach.',
      description: 'Balanced analysis',
    },
    {
      id: 'playground-alternatives',
      label: '🔀 Alternatives',
      prompt: 'What are alternative approaches to solving this problem?',
      description: 'Explore options',
    },
    {
      id: 'playground-eli5',
      label: '👶 ELI5',
      prompt: 'Explain this like I\'m 5 years old.',
      description: 'Simplify concepts',
    },
    {
      id: 'playground-technical-deep-dive',
      label: '🔬 Technical Deep Dive',
      prompt: 'Give me an expert-level technical explanation.',
      description: 'Advanced details',
    },
    {
      id: 'playground-best-practices',
      label: '✅ Best Practices',
      prompt: 'What are the industry best practices for this?',
      description: 'Professional standards',
    },
    {
      id: 'playground-compare-models',
      label: '🤖 Compare AI Models',
      prompt: 'Compare different AI models for this task. Which would be best?',
      description: 'Model selection guidance',
    },
    {
      id: 'playground-creative-writing',
      label: '✍️ Creative Writing',
      prompt: 'Help me write a creative story/poem/script about this topic.',
      description: 'Generate creative content',
    },
    {
      id: 'playground-meta-thinking',
      label: '🧠 Meta-Thinking',
      prompt: 'Think about how you\'re thinking about this problem. What assumptions are you making?',
      description: 'Analyze thought patterns',
    },
  ],
}

/**
 * LocalStorage key for deleted quick actions
 */
const DELETED_ACTIONS_KEY = 'ai-chat-deleted-quick-actions'

/**
 * Get deleted action IDs from localStorage
 */
export function getDeletedActionIds(): Set<string> {
  if (typeof window === 'undefined') return new Set()

  try {
    const stored = localStorage.getItem(DELETED_ACTIONS_KEY)
    return stored ? new Set(JSON.parse(stored)) : new Set()
  } catch (error) {
    console.error('Failed to load deleted actions:', error)
    return new Set()
  }
}

/**
 * Save deleted action IDs to localStorage
 */
export function saveDeletedActionIds(ids: Set<string>): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(DELETED_ACTIONS_KEY, JSON.stringify(Array.from(ids)))
  } catch (error) {
    console.error('Failed to save deleted actions:', error)
  }
}

/**
 * Delete a quick action permanently
 */
export function deleteQuickAction(actionId: string): void {
  const deleted = getDeletedActionIds()
  deleted.add(actionId)
  saveDeletedActionIds(deleted)
}

/**
 * Restore a deleted quick action
 */
export function restoreQuickAction(actionId: string): void {
  const deleted = getDeletedActionIds()
  deleted.delete(actionId)
  saveDeletedActionIds(deleted)
}

/**
 * Get quick actions for a specific search type (filtered by deletions)
 */
export function getQuickActions(searchType: SerperSearchType): QuickAction[] {
  const allActions = DEFAULT_QUICK_ACTIONS[searchType] || []
  const deletedIds = getDeletedActionIds()

  return allActions.filter((action) => !deletedIds.has(action.id))
}

/**
 * Get quick actions with custom overrides (DEPRECATED - use getQuickActions)
 */
export function getQuickActionsWithCustom(searchType: SerperSearchType): QuickAction[] {
  return getQuickActions(searchType)
}

/**
 * Reset all deleted actions (restore everything)
 */
export function resetAllDeletedActions(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(DELETED_ACTIONS_KEY)
}

/**
 * Get total count of available actions for a search type
 */
export function getTotalActionsCount(searchType: SerperSearchType): number {
  return DEFAULT_QUICK_ACTIONS[searchType]?.length || 0
}

/**
 * Get count of deleted actions for a search type
 */
export function getDeletedActionsCount(searchType: SerperSearchType): number {
  const allActions = DEFAULT_QUICK_ACTIONS[searchType] || []
  const deletedIds = getDeletedActionIds()

  return allActions.filter((action) => deletedIds.has(action.id)).length
}
