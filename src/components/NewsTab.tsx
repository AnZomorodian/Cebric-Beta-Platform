import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Newspaper, Search, Flame, Clock, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';

interface NewsArticle {
  title: string;
  url: string;
  description: string;
  date: string;
  imageUrl: string;
  source: string;
}

export default function NewsTab() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  async function loadNews() {
    setIsLoading(true);
    setErrorStatus(null);
    try {
      const response = await fetch('/api/news');
      if (!response.ok) {
        throw new Error(`Failed to load news: ${response.statusText}`);
      }
      const data = await response.json();
      setArticles(data);
    } catch (err: any) {
      console.error('Error fetching F1 paddock news:', err);
      setErrorStatus(err.message || 'Failed to fetch F1 news');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadNews();
  }, []);

  const filteredArticles = articles.filter(article => {
    const query = searchQuery.toLowerCase();
    const matchText = `${article.title} ${article.description} ${article.source}`.toLowerCase();
    
    // Category filtering mockup (by keywords in text matching certain F1 terms)
    if (activeCategory === 'teams' && !matchText.includes('team') && !matchText.includes('ferrari') && !matchText.includes('mercedes') && !matchText.includes('mclaren') && !matchText.includes('red bull')) {
      return false;
    }
    if (activeCategory === 'tech' && !matchText.includes('upgrade') && !matchText.includes('tech') && !matchText.includes('engine') && !matchText.includes('aerodynamic') && !matchText.includes('regulation') && !matchText.includes('floor')) {
      return false;
    }

    return query ? matchText.includes(query) : true;
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3 }}
      id="news-tab-view"
      className="space-y-8"
    >
      {/* Header section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold tracking-widest text-[#EF1A2D] font-mono uppercase flex items-center gap-1.5">
            <Flame size={12} className="animate-pulse" /> F1 WORLD FEED
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-black flex items-center gap-2">
            Paddock News & Updates
          </h1>
          <p className="text-sm text-gray-500 max-w-xl">
            Real-time global headlines directly from the Formula 1 community, teams, and technical hubs.
          </p>
        </div>

        <button
          onClick={loadNews}
          id="refresh-news-btn"
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold font-mono transition-all duration-200 outline-none select-none shrink-0 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          {isLoading ? 'REFRESHING FEED...' : 'REFRESH NEWS'}
        </button>
      </header>

      {/* category quick chips and search field bar */}
      <div 
        id="news-utility-panel"
        className="bg-white border border-gray-150 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm"
      >
        {/* Quick filter Category chips */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all duration-150 cursor-pointer outline-none ${
              activeCategory === 'all'
                ? 'bg-black text-white'
                : 'text-gray-500 hover:text-black hover:bg-gray-100'
            }`}
          >
            ALL STORIES
          </button>
          <button
            onClick={() => setActiveCategory('teams')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all duration-150 cursor-pointer outline-none ${
              activeCategory === 'teams'
                ? 'bg-black text-white'
                : 'text-gray-500 hover:text-black hover:bg-gray-100'
            }`}
          >
            TEAMS & STANDINGS
          </button>
          <button
            onClick={() => setActiveCategory('tech')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all duration-150 cursor-pointer outline-none ${
              activeCategory === 'tech'
                ? 'bg-black text-white'
                : 'text-gray-500 hover:text-black hover:bg-gray-100'
            }`}
          >
            TECH & REGS
          </button>
        </div>

        {/* Searching bar */}
        <div className="relative w-full sm:max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Filter words inside paddock stories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 text-xs font-semibold text-black placeholder-gray-400 outline-none border border-gray-200 focus:border-black rounded-lg transition-colors"
          />
        </div>
      </div>

      {isLoading ? (
        <div id="news-loading-screen" className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="w-10 h-10 border-4 border-[#EF1A2D] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-gray-400 font-mono tracking-widest">CONNECTING TO RACING FEED...</p>
        </div>
      ) : errorStatus && filteredArticles.length === 0 ? (
        <div id="news-error-card" className="border border-red-200 bg-red-50/50 p-6 rounded-2xl text-center max-w-lg mx-auto space-y-4">
          <div className="flex justify-center text-[#EF1A2D]">
            <AlertCircle size={40} />
          </div>
          <h3 className="text-lg font-bold text-black">Paddock Feed Offline</h3>
          <p className="text-xs text-gray-500 font-medium">
            We are currently experiencing difficulty loading live motorsport data. Falling back to the latest recorded Formula 1 announcements.
          </p>
          <button
            onClick={loadNews}
            className="px-4 py-2 bg-[#EF1A2D] hover:bg-[#c91222] text-white text-xs font-bold font-mono rounded-lg shadow transition-colors outline-none cursor-pointer"
          >
            RETRY CONNECTION
          </button>
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="py-24 text-center text-gray-400 border border-dashed border-gray-150 rounded-2xl bg-gray-50/20 select-none">
          No matching F1 stories were found inside your search category. Try adjusting keywords.
        </div>
      ) : (
        <motion.div 
          id="news-grid-lane"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          animate="show"
          variants={{
            show: {
              transition: {
                staggerChildren: 0.08
              }
            }
          }}
        >
          {filteredArticles.map((article, index) => (
            <motion.div
              key={`${article.title}-${index}`}
              variants={{
                hidden: { opacity: 0, y: 15 },
                show: { opacity: 1, y: 0 }
              }}
              id={`news-card-${index}`}
              className="bg-white border border-gray-150 rounded-2xl hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col justify-between group"
            >
              <div className="space-y-4">
                {/* Image panel */}
                <div className="h-44 w-full bg-gray-100 relative overflow-hidden shrink-0">
                  <img
                    src={article.imageUrl || `https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=400`}
                    alt={article.title}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      // Fallback image source on load fail
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=400';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span 
                      className="px-2 py-1 bg-black/80 text-white rounded text-[9px] font-bold font-mono tracking-widest uppercase shadow"
                    >
                      {article.source}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/80 text-white text-[9px] font-bold font-mono px-2 py-0.5 rounded shadow">
                    <Clock size={10} />
                    <span>{article.date}</span>
                  </div>
                </div>

                {/* Text attributes */}
                <div className="px-5 space-y-2">
                  <h3 className="text-md font-extrabold text-[#111] leading-snug group-hover:text-[#EF1A2D] transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed font-medium line-clamp-3">
                    {article.description}
                  </p>
                </div>
              </div>

              {/* Action area footer */}
              <div className="p-5 pt-3 border-t border-gray-100 flex items-center justify-between mt-4">
                <span className="text-[10px] text-gray-450 font-mono tracking-wider">CEBRIC F1 REPORT</span>
                <a
                  href={article.url}
                  target="_blank"
                  referrerPolicy="no-referrer"
                  rel="noreferrer noopener"
                  className="flex items-center gap-1 text-xs font-bold font-mono text-black group-hover:text-[#EF1A2D] transition-colors outline-none"
                  id={`article-outlink-${index}`}
                >
                  READ STORY <ExternalLink size={11} className="stroke-[2.5px]" />
                </a>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
