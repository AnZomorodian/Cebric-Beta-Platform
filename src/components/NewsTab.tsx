import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

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

  // Poll state (stored in localStorage)
  const [votedTopic, setVotedTopic] = useState<string | null>(() => {
    return localStorage.getItem('cebric_news_poll_voted');
  });
  const [pollVotes, setPollVotes] = useState<{ [key: string]: number }>(() => {
    const saved = localStorage.getItem('cebric_news_poll_votes');
    return saved ? JSON.parse(saved) : { ferrari: 1420, mclaren: 935, redbull: 1105, mercedes: 672 };
  });

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

  const handleVote = (option: string) => {
    if (votedTopic) return;
    const updatedVotes = {
      ...pollVotes,
      [option]: pollVotes[option] + 1
    };
    setPollVotes(updatedVotes);
    setVotedTopic(option);
    localStorage.setItem('cebric_news_poll_voted', option);
    localStorage.setItem('cebric_news_poll_votes', JSON.stringify(updatedVotes));
  };

  const filteredArticles = articles.filter(article => {
    const query = searchQuery.toLowerCase();
    const matchText = `${article.title} ${article.description} ${article.source}`.toLowerCase();
    
    if (activeCategory === 'teams' && !matchText.includes('team') && !matchText.includes('ferrari') && !matchText.includes('mercedes') && !matchText.includes('mclaren') && !matchText.includes('red bull')) {
      return false;
    }
    if (activeCategory === 'tech' && !matchText.includes('upgrade') && !matchText.includes('tech') && !matchText.includes('engine') && !matchText.includes('aerodynamic') && !matchText.includes('regulation') && !matchText.includes('floor')) {
      return false;
    }
    if (activeCategory === 'rumors' && !matchText.includes('rumor') && !matchText.includes('transfer') && !matchText.includes('contract') && !matchText.includes('market') && !matchText.includes('silly season') && !matchText.includes('seat') && !matchText.includes('future') && !matchText.includes('sign')) {
      return false;
    }

    return query ? matchText.includes(query) : true;
  });

  const totalPollVotes = (Object.values(pollVotes) as number[]).reduce((a, b) => a + b, 0);

  const showHero = filteredArticles.length > 0 && !searchQuery && activeCategory === 'all';
  const heroArticle = showHero ? filteredArticles[0] : null;
  const feedArticles = showHero ? filteredArticles.slice(1) : filteredArticles;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3 }}
      id="news-tab-view"
      className="space-y-8 select-none"
    >
      {/* Header section (strictly zero icons) */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold tracking-widest text-[#EF1A2D] font-mono uppercase">
            F1 Global Paddock Terminal
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-black">
            Paddock News & Updates
          </h1>
          <p className="text-sm text-gray-500 max-w-xl">
            Real-time feed transcripts, technical briefings, and team reports synchronized with active Grand Prix sessions.
          </p>
        </div>

        <button
          onClick={loadNews}
          id="refresh-news-btn"
          disabled={isLoading}
          className="px-4 py-2 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold font-mono transition-all duration-200 outline-none shrink-0 cursor-pointer disabled:opacity-50"
        >
          {isLoading ? 'REFRESHING FEED...' : 'REFRESH NEWS'}
        </button>
      </header>

      {/* category quick chips and search field bar */}
      <div 
        id="news-utility-panel"
        className="bg-white border border-gray-150 rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs"
      >
        {/* Quick filter Category chips - strictly zero emoji icons */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold font-mono transition-all duration-150 cursor-pointer outline-none border-none ${
              activeCategory === 'all'
                ? 'bg-black text-white'
                : 'text-gray-550 hover:text-black hover:bg-gray-100 bg-neutral-50'
            }`}
          >
            ALL STORIES
          </button>
          <button
            onClick={() => setActiveCategory('teams')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold font-mono transition-all duration-150 cursor-pointer outline-none border-none ${
              activeCategory === 'teams'
                ? 'bg-black text-white'
                : 'text-gray-550 hover:text-black hover:bg-gray-100 bg-neutral-50'
            }`}
          >
            TEAMS & DRIVERS
          </button>
          <button
            onClick={() => setActiveCategory('tech')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold font-mono transition-all duration-150 cursor-pointer outline-none border-none ${
              activeCategory === 'tech'
                ? 'bg-black text-white'
                : 'text-gray-550 hover:text-black hover:bg-gray-100 bg-neutral-50'
            }`}
          >
            TECH & UPGRADES
          </button>
          <button
            onClick={() => setActiveCategory('rumors')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold font-mono transition-all duration-150 cursor-pointer outline-none border-none ${
              activeCategory === 'rumors'
                ? 'bg-black text-white'
                : 'text-gray-550 hover:text-black hover:bg-gray-100 bg-neutral-50'
            }`}
          >
            RUMORS & TRANSFERS
          </button>
        </div>

        {/* Searching bar */}
        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            placeholder="Filter words inside stories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 bg-gray-50 text-xs font-semibold text-black placeholder-gray-400 outline-none border border-gray-200 focus:border-black rounded-lg transition-colors font-mono"
          />
        </div>
      </div>

      {isLoading ? (
        <div id="news-loading-screen" className="flex flex-col items-center justify-center py-32 gap-3">
          <span className="w-10 h-10 border-4 border-[#EF1A2D] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-gray-400 font-mono tracking-widest">CONNECTING TO RACING FEED...</p>
        </div>
      ) : errorStatus && filteredArticles.length === 0 ? (
        <div id="news-error-card" className="border border-red-200 bg-red-50/55 p-8 rounded-2xl text-center max-w-lg mx-auto space-y-4">
          <h3 className="text-lg font-black text-black uppercase font-sans tracking-tight">Paddock Feed Offline</h3>
          <p className="text-xs text-gray-500 font-medium leading-relaxed">
            We are currently experiencing difficulty loading live Autosport RSS news. Falling back to Cebric motorsport catalog updates instead.
          </p>
          <button
            onClick={loadNews}
            className="px-4 py-2 bg-[#EF1A2D] hover:bg-[#c91222] text-white text-xs font-bold font-mono rounded-lg shadow-sm transition-colors cursor-pointer border-none"
          >
            RETRY CONNECTION
          </button>
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="py-24 text-center text-gray-450 border border-dashed border-gray-150 rounded-2xl bg-gray-50/20">
          <p className="text-xs font-mono">No matching F1 stories were found inside your category. Try adjusting search words.</p>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* PADDOCK HIGHLIGHT: Featured Editorial Article */}
          {heroArticle && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-neutral-950 text-white rounded-3xl overflow-hidden border border-neutral-850 shadow-xl relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent z-10 md:hidden" />
              
              <div className="grid grid-cols-1 md:grid-cols-12 items-stretch min-h-[380px]">
                {/* Hero textual column */}
                <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between z-20 relative space-y-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-[#EF1A2D] text-white rounded-md text-[10px] font-black font-mono tracking-widest uppercase shadow-md">
                        PADDOCK COVER HIGHLIGHT
                      </span>
                      <span className="px-2.5 py-1 bg-neutral-800 text-neutral-300 rounded-md text-[10px] font-bold font-mono">
                        {heroArticle.source}
                      </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-black uppercase text-white font-sans tracking-tight group-hover:text-red-400 transition-colors leading-tight">
                      {heroArticle.title}
                    </h2>
                    
                    <p className="text-xs text-neutral-350 leading-relaxed max-w-xl font-medium">
                      {heroArticle.description}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-neutral-850">
                    <div className="flex items-center gap-2 text-[10px] text-neutral-450 font-mono">
                      <span>PUBLISHED • {heroArticle.date}</span>
                    </div>

                    <a
                      href={heroArticle.url}
                      target="_blank"
                      referrerPolicy="no-referrer"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-white hover:bg-red-650 text-black hover:text-white rounded-xl text-xs font-mono font-extrabold shadow-sm transition-all duration-200 outline-none border-none cursor-pointer self-start sm:self-auto"
                    >
                      EXPLORE FULL STORY
                    </a>
                  </div>
                </div>

                {/* Hero visual image column */}
                <div className="md:col-span-5 h-[240px] md:h-auto bg-neutral-900 relative overflow-hidden">
                  <img
                    src={heroArticle.imageUrl || `https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=800`}
                    alt={heroArticle.title}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=800';
                    }}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-transparent to-transparent hidden md:block" />
                </div>
              </div>
            </motion.div>
          )}          {/* MAIN BALANCED GALLERY */}
          <div className="space-y-6">
            
            {/* Full Width Grid: Feed Cards */}
            <div className="space-y-6">
              <span className="text-[10px] text-gray-400 font-mono font-black uppercase tracking-wider block">
                Paddock News Wire Stream ({feedArticles.length} stories)
              </span>

              <motion.div 
                id="news-grid-lane"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                initial="hidden"
                animate="show"
                variants={{
                  show: {
                    transition: {
                      staggerChildren: 0.05
                    }
                  }
                }}
              >
                {feedArticles.map((article, index) => (
                  <motion.div
                    key={`${article.title}-${index}`}
                    variants={{
                      hidden: { opacity: 0, y: 15 },
                      show: { opacity: 1, y: 0 }
                    }}
                    id={`news-card-${index}`}
                    className="bg-white border border-gray-150 rounded-2xl hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between group"
                  >
                    <div className="space-y-4">
                      {/* Image panel */}
                      <div className="h-44 w-full bg-gray-100 relative overflow-hidden shrink-0">
                        <img
                          src={article.imageUrl || `https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=400`}
                          alt={article.title}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=400';
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/80 text-white text-[9px] font-bold font-mono px-2 py-0.5 rounded shadow">
                          <span>{article.source}</span>
                        </div>
                        <div className="absolute bottom-3 right-3 flex items-center bg-black/80 text-white text-[9px] font-bold font-mono px-2 py-0.5 rounded shadow">
                          <span>{article.date}</span>
                        </div>
                      </div>

                      {/* Text attributes */}
                      <div className="px-5 space-y-2">
                        <h3 className="text-[13.5px] font-extrabold text-[#111] leading-snug group-hover:text-[#EF1A2D] transition-colors line-clamp-2 uppercase font-sans">
                          {article.title}
                        </h3>
                        <p className="text-xs text-gray-500 leading-relaxed font-medium line-clamp-3">
                          {article.description}
                        </p>
                      </div>
                    </div>

                    {/* Action area footer */}
                    <div className="p-5 pt-3 border-t border-gray-100 flex items-center justify-between mt-4 font-mono">
                      <span className="text-[9px] text-gray-455 font-bold uppercase tracking-wider">CEBRIC ENGINE REPORT</span>
                      <a
                        href={article.url}
                        target="_blank"
                        referrerPolicy="no-referrer"
                        rel="noreferrer noopener"
                        className="flex items-center text-[11px] font-bold text-black group-hover:text-[#EF1A2D] transition-colors outline-none"
                        id={`article-outlink-${index}`}
                      >
                        READ STORY
                      </a>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

          </div>

        </div>
      )}
    </motion.div>
  );
}
