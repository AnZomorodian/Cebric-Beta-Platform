import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Vote, Plus, Trash2, CheckCircle2, Lock, Unlock, BarChart3, Users, HelpCircle, RefreshCw, AlertTriangle, UserCheck, Megaphone, Clock, ShieldAlert } from 'lucide-react';

interface Poll {
  id: string;
  question: string;
  options: string[];
  votes: Record<string, number>;
  votedUsers: string[];
  createdAt: string;
  createdBy: string;
  active: boolean;
  category?: string;
  expiresAt?: string | null;
}

export default function PollsTab() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  // Current user from localStorage
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Admin Simulation Override State (enabled by default so users can always test live)
  const [simulateAdmin, setSimulateAdmin] = useState<boolean>(true);

  // Announcement States
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loadingAnn, setLoadingAnn] = useState<boolean>(true);
  const [newAnnTitle, setNewAnnTitle] = useState<string>('');
  const [newAnnContent, setNewAnnContent] = useState<string>('');
  const [newAnnCategory, setNewAnnCategory] = useState<string>('REGULATIONS');
  const [releasingAnn, setReleasingAnn] = useState<boolean>(false);

  // Admin Form States
  const [newQuestion, setNewQuestion] = useState<string>('');
  const [newOptions, setNewOptions] = useState<string[]>(['', '']);
  const [newCategory, setNewCategory] = useState<string>('REGULATIONS');
  const [newDuration, setNewDuration] = useState<string>('0'); // 0 = no limit
  const [submittingPoll, setSubmittingPoll] = useState<boolean>(false);

  // Load user, polls & announcements on mount
  useEffect(() => {
    const cached = localStorage.getItem('f1_user_session');
    if (cached) {
      try {
        setCurrentUser(JSON.parse(cached));
      } catch (e) {
        console.error(e);
      }
    }
    fetchPolls();
    fetchAnnouncements();
  }, []);

  const fetchPolls = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const response = await fetch('/api/polls');
      const resData = await response.json();
      if (response.ok && resData.success) {
        setPolls(resData.polls);
      } else {
        throw new Error(resData.error || 'Failed to fetch polls');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Connecting error.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnnouncements = async () => {
    setLoadingAnn(true);
    try {
      const response = await fetch('/api/announcements');
      const resData = await response.json();
      if (response.ok && resData.success) {
        setAnnouncements(resData.announcements);
      }
    } catch (err: any) {
      console.error('Error fetching announcements:', err);
    } finally {
      setLoadingAnn(false);
    }
  };

  const handleAddOptionField = () => {
    if (newOptions.length < 8) {
      setNewOptions([...newOptions, '']);
    }
  };

  const handleRemoveOptionField = (index: number) => {
    if (newOptions.length > 2) {
      const updated = [...newOptions];
      updated.splice(index, 1);
      setNewOptions(updated);
    }
  };

  const handleOptionChange = (index: number, val: string) => {
    const updated = [...newOptions];
    updated[index] = val;
    setNewOptions(updated);
  };

  const handleCreatePollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const questionText = newQuestion.trim();
    const filteredOptions = newOptions.map(o => o.trim()).filter(o => o.length > 0);

    if (!questionText) {
      setErrorMsg('Please input a valid poll question.');
      return;
    }

    if (filteredOptions.length < 2) {
      setErrorMsg('A poll must showcase at least 2 valid selection options.');
      return;
    }

    setSubmittingPoll(true);
    try {
      const response = await fetch('/api/polls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: questionText,
          options: filteredOptions,
          createdBy: currentUser ? `${currentUser.givenName} ${currentUser.familyName}` : 'Admin Paddock',
          category: newCategory,
          durationHours: newDuration !== '0' ? parseInt(newDuration) : null
        })
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || 'Unable to create poll');
      }

      setSuccessMsg('Successfully launched a new paddock poll!');
      setNewQuestion('');
      setNewOptions(['', '']);
      setNewCategory('REGULATIONS');
      setNewDuration('0');
      fetchPolls();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred while saving your poll.');
    } finally {
      setSubmittingPoll(false);
    }
  };

  const handleCreateAnnouncementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const titleText = newAnnTitle.trim();
    const contentText = newAnnContent.trim();

    if (!titleText || !contentText) {
      setErrorMsg('Title and description are required to release announcements.');
      return;
    }

    setReleasingAnn(true);
    try {
      const response = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: titleText,
          content: contentText,
          category: newAnnCategory,
          createdBy: currentUser ? `${currentUser.givenName} ${currentUser.familyName}` : 'Admin Paddock'
        })
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || 'Failed to release announcement');
      }

      setSuccessMsg('Successfully published news release to the paddock updates!');
      setNewAnnTitle('');
      setNewAnnContent('');
      setNewAnnCategory('REGULATIONS');
      fetchAnnouncements();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to publish announcement.');
    } finally {
      setReleasingAnn(false);
    }
  };

  const handleCastVote = async (pollId: string, option: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    const voteIdentity = currentUser ? currentUser.username : null;

    try {
      const response = await fetch(`/api/polls/${pollId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          option,
          username: voteIdentity
        })
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || 'Failed to submit paddock vote');
      }

      setSuccessMsg(`Your vote for "${option}" has been registered!`);
      fetchPolls();
    } catch (err: any) {
      setErrorMsg(err.message || 'Vote failed.');
    }
  };

  const handleTogglePollStatus = async (pollId: string) => {
    setErrorMsg(null);
    try {
      const response = await fetch(`/api/polls/${pollId}/toggle`, {
        method: 'POST'
      });
      if (response.ok) {
        fetchPolls();
      } else {
        const resData = await response.json();
        throw new Error(resData.error || 'Failed to toggle status');
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleDeletePoll = async (pollId: string) => {
    // Zero dialog confirmation to bypass secure iframe blocking
    setErrorMsg(null);
    try {
      const response = await fetch(`/api/polls/${pollId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setSuccessMsg('Poll deleted successfully.');
        fetchPolls();
      } else {
        const resData = await response.json();
        throw new Error(resData.error || 'Failed to delete poll');
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleDeleteAnnouncement = async (annId: string) => {
    setErrorMsg(null);
    try {
      const response = await fetch(`/api/announcements/${annId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setSuccessMsg('Announcement successfully cleared from record.');
        fetchAnnouncements();
      } else {
        const resData = await response.json();
        throw new Error(resData.error || 'Failed to delete announcement');
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const isAdmin = currentUser?.isAdmin || currentUser?.username === 'Admin' || simulateAdmin;

  const hasVotedPoll = (poll: Poll) => {
    const voteIdentity = currentUser ? currentUser.username.toLowerCase() : '';
    // Let's also fallback checking localStorage if they are guest
    if (!voteIdentity) {
      const guestVoted = localStorage.getItem(`voted_poll_${poll.id}`);
      return guestVoted === 'true';
    }
    return poll.votedUsers && poll.votedUsers.some(u => u.toLowerCase() === voteIdentity);
  };

  const getTimeRemainingStr = (expiresAt: string | null | undefined) => {
    if (!expiresAt) return null;
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return 'Expired';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    if (hours > 0) {
      return `${hours}h ${mins}m left`;
    }
    return `${mins}m left`;
  };

  return (
    <div id="polls-tab-root" className="space-y-8 animate-none">
      
      {/* Header Info Hero */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-100 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 px-2.5 bg-[#EF1A2D] text-white text-[10px] font-mono font-black uppercase rounded tracking-widest leading-none">
              Fans & Paddock
            </span>
          </div>
          <h2 className="text-2xl font-black font-sans uppercase tracking-tight text-gray-900 leading-none mt-1">
            Paddock Opinions & Polls
          </h2>
          <p className="text-xs text-gray-500 font-mono">
            Participate in real-time structural voting about rules, dynamic racing outcomes, and tire telemetry assessments.
          </p>
        </div>
        
        <button
          onClick={fetchPolls}
          className="self-start md:self-auto flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 hover:text-black border border-gray-200 hover:border-black rounded-lg transition-all font-mono"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          <span>Sync Polls</span>
        </button>
      </div>

      {/* Messages */}
      {errorMsg && (
        <div className="bg-red-50 text-[#EF1A2D] p-3 text-xs font-mono font-medium rounded-xl border border-red-100 flex items-center gap-2">
          <AlertTriangle size={14} />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 text-emerald-800 p-3 text-xs font-mono font-medium rounded-xl border border-emerald-100 flex items-center gap-2">
          <CheckCircle2 size={14} className="text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Admin Quick Switch Console */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <ShieldAlert size={15} className="text-red-650" />
          <span className="font-mono text-gray-700 font-medium">
            Currently simulated as <strong className="font-black text-black">PADDOCK REPRESENTATIVE</strong>. Use switches to test administrator flows.
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono">
          <label className="font-bold text-gray-500 text-[10px] uppercase">Simulation Console:</label>
          <button
            onClick={() => setSimulateAdmin(!simulateAdmin)}
            className={`px-3 py-1 rounded-md text-[10px] font-black uppercase transition-all ${
              simulateAdmin 
                ? 'bg-red-650 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {simulateAdmin ? 'ADMIN MODE ACTIVE' : 'GUEST MODE'}
          </button>
        </div>
      </div>

      {/* Grid: Admin section + Poll Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Admin controls (Only visible to Admin) */}
        {isAdmin && (
          <div className="lg:col-span-5 bg-white border border-gray-200 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <Vote size={18} className="text-[#EF1A2D]" />
              <h3 className="text-xs font-black font-sans uppercase text-gray-900 tracking-wider">
                Admin Poll Station
              </h3>
            </div>
            
            <form onSubmit={handleCreatePollSubmit} className="space-y-4 font-mono">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block font-sans">
                  Poll Question / Issue
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Who was responsible for the Lap 12 collision?"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-black outline-none rounded-xl px-3 py-2 text-xs text-black font-semibold transition-colors"
                />
              </div>

              {/* Categorization and Duration Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block font-sans">
                    Category Type
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-black outline-none rounded-lg p-2 text-xs text-black font-semibold uppercase"
                  >
                    <option value="REGULATIONS">Regulations</option>
                    <option value="TYRES">Tire Allocation</option>
                    <option value="AERODYNAMICS">Aerodynamics</option>
                    <option value="SAFETY">Track Safety</option>
                    <option value="WEATHER">Circuit Weather</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block font-sans">
                    Ballot Time Limit
                  </label>
                  <select
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-black outline-none rounded-lg p-2 text-xs text-black font-semibold"
                  >
                    <option value="0">Unlimited Hours</option>
                    <option value="1">1 Hour</option>
                    <option value="6">6 Hours</option>
                    <option value="12">12 Hours</option>
                    <option value="24">24 Hours</option>
                    <option value="48">48 Hours</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block font-sans">
                  Poll Response Options
                </label>
                
                <div className="space-y-2">
                  {newOptions.map((opt, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <span className="text-[10px] text-gray-400 font-bold w-4">#{idx+1}</span>
                      <input
                        type="text"
                        required
                        placeholder={`Option ${idx+1}`}
                        value={opt}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        className="flex-1 bg-gray-50 border border-gray-200 focus:border-black outline-none rounded-lg px-2.5 py-1.5 text-xs text-black font-medium transition-colors"
                      />
                      {newOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOptionField(idx)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {newOptions.length < 8 && (
                  <button
                    type="button"
                    onClick={handleAddOptionField}
                    className="mt-1 flex items-center gap-1 text-[10px] text-[#EF1A2D] hover:text-red-700 font-bold uppercase py-1 border-b border-transparent hover:border-red-700 transition"
                  >
                    <Plus size={12} /> Add Choice Option
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={submittingPoll}
                className="w-full mt-2 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white font-bold rounded-xl text-[10px] uppercase tracking-wider transition-colors disabled:opacity-40"
              >
                {submittingPoll ? 'Launching Poll...' : 'Launch Paddock Poll'}
              </button>
            </form>
          </div>
        )}

        {/* Poll List Component */}
        <div className={`${isAdmin ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-6`}>
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 space-y-3 bg-white border border-gray-150 rounded-2xl">
              <span className="w-8 h-8 border-3 border-[#EF1A2D] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-gray-500 font-mono">Synchronizing opinion logs with race telemetry servers...</p>
            </div>
          ) : polls.length === 0 ? (
            <div className="text-center p-12 bg-white border border-gray-150 rounded-2xl space-y-3">
              <HelpCircle className="mx-auto text-gray-300" size={32} />
              <p className="text-xs text-gray-500 font-mono">No feedback polls have been launched this Grand Prix weekend.</p>
            </div>
          ) : (
            <div id="polls-list" className="space-y-6">
              {polls.map((poll) => {
                // Calculate total votes
                const pollTotalVotes = (Object.values(poll.votes || {}) as number[]).reduce((sum, v) => sum + v, 0);
                const hasVoted = hasVotedPoll(poll);
                const isClosed = !poll.active;
                const timeRemainingStr = getTimeRemainingStr(poll.expiresAt);

                return (
                  <div
                    key={poll.id}
                    className={`bg-white border text-black rounded-2xl p-5 md:p-6 space-y-4 transition-all ${
                      isClosed ? 'opacity-85 border-dashed border-gray-200' : 'border-gray-200 shadow-sm'
                    }`}
                  >
                    {/* Poll Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {isClosed ? (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-500 text-[9px] font-mono font-bold uppercase rounded border border-gray-200">
                              <Lock size={10} /> Checked Flag (Closed)
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-[9px] font-mono font-bold uppercase rounded border border-green-150">
                              <Unlock size={10} /> Open Ballot
                            </span>
                          )}

                          {poll.category && (
                            <span className="px-2 py-0.5 bg-black text-white text-[9px] font-mono font-black uppercase rounded tracking-wider">
                              {poll.category}
                            </span>
                          )}

                          {timeRemainingStr && !isClosed && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-800 text-[9px] font-mono font-bold rounded">
                              <Clock size={10} className="text-amber-600 shrink-0" />
                              {timeRemainingStr}
                            </span>
                          )}

                          <span className="text-[9px] text-gray-400 font-mono">
                            Launched by {poll.createdBy} • {new Date(poll.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="text-sm font-extrabold text-gray-900 leading-snug">
                          {poll.question}
                        </h4>
                      </div>

                      {/* Admin action widgets */}
                      {isAdmin && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleTogglePollStatus(poll.id)}
                            title={isClosed ? 'Reopen Poll' : 'Close Poll'}
                            className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                          >
                            {isClosed ? <Unlock size={14} /> : <Lock size={14} />}
                          </button>
                          <button
                            onClick={() => handleDeletePoll(poll.id)}
                            title="Delete Poll"
                            className="p-1.5 text-gray-500 hover:text-[#EF1A2D] hover:bg-red-55 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Poll Options and Progress Visualizers */}
                    <div className="space-y-2.5 font-sans">
                      {poll.options.map((option) => {
                        const optionVotes = poll.votes?.[option] || 0;
                        const percentage = pollTotalVotes > 0 ? Math.round((optionVotes / pollTotalVotes) * 100) : 0;
                        
                        // Show results if user voted or if poll is closed
                        const showResults = hasVoted || isClosed || isAdmin;

                        return (
                          <div key={option} className="group relative">
                            {showResults ? (
                              // Results view
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs font-semibold text-gray-800 px-1">
                                  <span className="flex items-center gap-1.5 leading-tight">
                                    {option}
                                  </span>
                                  <span className="font-mono text-gray-500">
                                    {percentage}% <span className="text-[10px] font-normal">({optionVotes} votes)</span>
                                  </span>
                                </div>
                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{ duration: 0.6, ease: 'easeOut' }}
                                    className={`h-full rounded-full ${
                                      isClosed ? 'bg-gray-400' : 'bg-[#EF1A2D]'
                                    }`}
                                  />
                                </div>
                              </div>
                            ) : (
                              // Unvoted state / Interactive selection
                              <button
                                onClick={() => handleCastVote(poll.id, option)}
                                className="w-full flex items-center justify-between text-left text-xs font-bold text-gray-800 bg-gray-50 hover:bg-neutral-900 hover:text-white border border-gray-200 hover:border-black rounded-xl p-3 transition-all duration-200 cursor-pointer outline-none font-sans"
                              >
                                <span>{option}</span>
                                <span className="opacity-0 group-hover:opacity-100 text-[10px] font-mono tracking-wider font-semibold">
                                  CAST VOTE →
                                </span>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Vote Summary Footer info */}
                    <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-[10px] font-mono text-gray-400">
                      <div className="flex items-center gap-1">
                        <Users size={11} />
                        <span>{pollTotalVotes} paddock participants</span>
                      </div>
                      
                      {!currentUser && !hasVoted && !isClosed && (
                        <span className="text-[9px] text-[#EF1A2D] font-bold">
                          * Guest vote mode enabled
                        </span>
                      )}

                      {currentUser && !hasVoted && !isClosed && (
                        <span className="flex items-center gap-1 text-[9.5px] text-emerald-600 font-bold">
                          <UserCheck size={11} /> Profile certified to vote
                        </span>
                      )}

                      {hasVoted && (
                        <span className="text-emerald-600 font-black">
                          ✔ BALANCED CAST
                        </span>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* ADMIN RELEASES SECTION AT THE BOTTOM */}
      <div id="paddock-announcements-section" className="border-t border-gray-200 pt-8 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <Megaphone className="text-red-650" size={18} />
              <h3 className="text-sm font-black font-sans uppercase tracking-wider text-black">
                Paddock Official Announcements & Bulletins
              </h3>
            </div>
            <p className="text-xs text-gray-500 font-mono">
              Live notifications released directly from the Stewards office and engineering panel hierarchy.
            </p>
          </div>
          <span className="text-[10px] font-mono text-gray-400 uppercase bg-gray-100 px-2.5 py-1 rounded-md">
            {announcements.length} bulletins archived
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Post announcement form (Admin only) */}
          {isAdmin && (
            <div className="lg:col-span-5 bg-neutral-950 text-white rounded-2xl p-5 space-y-4 shadow-md font-mono">
              <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
                <Megaphone size={16} className="text-red-500" />
                <h4 className="text-xs font-black uppercase text-white tracking-widest">
                  Release Paddock Bulletin
                </h4>
              </div>

              <form onSubmit={handleCreateAnnouncementSubmit} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold text-neutral-400 uppercase tracking-wider block">
                    Bulletin Header / Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Mandatory Baseline Tire Inflation Mandate"
                    value={newAnnTitle}
                    onChange={(e) => setNewAnnTitle(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 focus:border-red-500 outline-none rounded-xl px-3 py-2 text-xs text-neutral-100 font-semibold transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] font-extrabold text-neutral-400 uppercase tracking-wider block">
                      Release Category
                    </label>
                    <select
                      value={newAnnCategory}
                      onChange={(e) => setNewAnnCategory(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 focus:border-red-500 outline-none rounded-lg p-2 text-xs text-neutral-100 font-semibold uppercase"
                    >
                      <option value="REGULATIONS">Regulations</option>
                      <option value="SAFETY">Safety briefing</option>
                      <option value="TECH">Engineering</option>
                      <option value="PENALTY">Stewards Penalty</option>
                      <option value="WEATHER">Weather flash</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold text-neutral-400 uppercase tracking-wider block">
                    Announcement Body content
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Explain the technical or regulatory change released..."
                    value={newAnnContent}
                    onChange={(e) => setNewAnnContent(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 focus:border-red-500 outline-none rounded-xl px-3 py-2 text-xs text-neutral-100 transition-colors font-sans resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={releasingAnn}
                  className="w-full py-2 bg-[#EF1A2D] hover:bg-[#c91222] text-white font-black rounded-lg text-[9px] uppercase tracking-wider transition-all cursor-pointer border-none"
                >
                  {releasingAnn ? 'Broadcasting Release...' : 'Publish Official Bulletin'}
                </button>
              </form>
            </div>
          )}

          {/* Announcements Roster display */}
          <div className={`${isAdmin ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-4`}>
            {loadingAnn ? (
              <div className="flex items-center justify-center p-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <span className="w-6 h-6 border-2 border-[#EF1A2D] border-t-transparent rounded-full animate-spin mr-2" />
                <p className="text-xs text-gray-500 font-mono">Loading announcements archive...</p>
              </div>
            ) : announcements.length === 0 ? (
              <div className="text-center p-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p className="text-xs text-gray-500 font-mono">No official news releases have been issued by managers.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {announcements.map((ann) => {
                  let badgeColor = "bg-neutral-900 text-white";
                  if (ann.category === 'SAFETY') badgeColor = "bg-amber-100 text-amber-800 border-amber-250";
                  if (ann.category === 'REGULATIONS') badgeColor = "bg-indigo-100 text-indigo-850 border-indigo-250";
                  if (ann.category === 'PENALTY') badgeColor = "bg-red-100 text-red-950 border-red-250";
                  if (ann.category === 'TECH') badgeColor = "bg-emerald-100 text-emerald-805 border-emerald-250";

                  return (
                    <div 
                      key={ann.id} 
                      className="bg-white border border-gray-150 rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:border-neutral-950 transition-all duration-200 shadow-xs"
                    >
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded text-[8.5px] font-mono font-black border uppercase tracking-wider ${badgeColor}`}>
                              {ann.category || 'NEWS'}
                            </span>
                            <span className="text-[9px] text-gray-400 font-semibold font-mono">
                              {new Date(ann.createdAt).toLocaleString()}
                            </span>
                          </div>
                          
                          {isAdmin && (
                            <button
                              onClick={() => handleDeleteAnnouncement(ann.id)}
                              title="Delete Announcement"
                              className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>

                        <h4 className="text-xs sm:text-sm font-extrabold text-neutral-950 uppercase tracking-tight">
                          {ann.title}
                        </h4>
                        
                        <p className="text-xs text-gray-650 font-sans leading-relaxed font-semibold">
                          {ann.content}
                        </p>
                      </div>

                      <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-3 text-[9px] font-mono text-gray-400">
                        <span>Cleared for broadcast by: <strong>{ann.createdBy}</strong></span>
                        <span className="text-red-650 font-black">Official Release</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
