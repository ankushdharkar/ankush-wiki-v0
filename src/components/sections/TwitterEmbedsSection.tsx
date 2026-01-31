import RevealAnimation from '../ui/RevealAnimation'
import { useEffect } from 'react'
import { BsTwitter } from 'react-icons/bs'

declare global {
  interface Window {
    twttr: any;
  }
}

interface TwitterEmbedsSectionProps {
  isStandalone?: boolean;
}

type TweetType = {
  type: 'twitter';
  title: string;
  description: string;
  url: string;
  embedId: string;
  icon: any;
  color: string;
}

export default function TwitterEmbedsSection({ isStandalone = false }: TwitterEmbedsSectionProps) {
  const tweetLinks: TweetType[] = [
    {
      type: 'twitter',
      title: 'Featured Tweet #1',
      description: 'Latest updates and insights',
      url: 'https://x.com/ankushdharkar/status/1954534159583420476',
      embedId: '1954534159583420476',
      icon: BsTwitter,
      color: '#1DA1F2'
    },
    {
      type: 'twitter',
      title: 'Featured Tweet #2',
      description: 'Important thoughts and updates',
      url: 'https://x.com/ankushdharkar/status/1911666308778774958',
      embedId: '1911666308778774958',
      icon: BsTwitter,
      color: '#1DA1F2'
    },
    {
      type: 'twitter',
      title: 'Featured Tweet #3',
      description: 'Insights and technical discussions',
      url: 'https://x.com/ankushdharkar/status/1852708946978783592',
      embedId: '1852708946978783592',
      icon: BsTwitter,
      color: '#1DA1F2'
    }
  ];

  const renderTweetEmbed = (link: TweetType) => {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1 min-h-[200px]">
        <blockquote
          className="twitter-tweet"
          data-theme="dark"
          data-conversation="none"
          data-dnt="true"
          data-width="auto"
          data-align="center"
        >
          <p lang="en" dir="ltr">Loading tweet...</p>
          <a href={link.url}>View Tweet</a>
        </blockquote>
      </div>
    )
  }

  const containerClass = isStandalone
    ? "min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white pt-20 pb-8 md:pb-20 transition-colors"
    : "py-20 bg-gray-50 dark:bg-gray-900 transition-colors";

  useEffect(() => {
    // Function to load Twitter widgets
    const loadTwitterWidgets = () => {
      if (window.twttr?.widgets) {
        window.twttr.widgets.load();
      }
    };

    // Check if Twitter script already loaded
    if (window.twttr) {
      setTimeout(loadTwitterWidgets, 100);
      return;
    }

    // Create and load Twitter script
    const script = document.createElement('script');
    script.src = 'https://platform.twitter.com/widgets.js';
    script.async = true;
    script.charset = 'utf-8';

    script.onload = () => {
      // Add delay to ensure widgets can process the DOM
      setTimeout(loadTwitterWidgets, 300);
    };

    // Append to head instead of body
    document.head.appendChild(script);

    // Cleanup
    return () => {
      const existingScript = document.querySelector('script[src="https://platform.twitter.com/widgets.js"]');
      if (existingScript && existingScript.parentNode) {
        existingScript.parentNode.removeChild(existingScript);
      }
    };
  }, []);

  return (
    <section id="twitter-embeds" className={containerClass}>
      <div className="container mx-auto px-6">
        {/* Section Title */}
        <RevealAnimation delay={0.2}>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Twitter Embeds Development</h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              Testing Twitter embeds functionality and auto-height behavior
            </p>
          </div>
        </RevealAnimation>

        {/* Featured Tweets Grid */}
        <div className="mb-16">
          <RevealAnimation delay={0.4}>
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-4 flex items-center justify-center gap-2">
                <BsTwitter className="text-blue-500 dark:text-blue-400" />
                Featured Tweets
              </h3>
            </div>
          </RevealAnimation>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {tweetLinks.map((tweet, index) => (
              <RevealAnimation key={index} delay={0.6 + index * 0.2}>
                <div>
                  <h4 className="text-lg font-bold mb-3 text-center">{tweet.title}</h4>
                  {renderTweetEmbed(tweet)}
                </div>
              </RevealAnimation>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
