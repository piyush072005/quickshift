import React, { useState } from 'react';
import { 
  Search, 
  Send, 
  Check, 
  X, 
  Clock, 
  MapPin, 
  Briefcase, 
  Calendar, 
  Users, 
  ChevronRight,
  Info,
  CheckSquare
} from 'lucide-react';
import { AppState, TalentCandidate, Department } from '../../types';

interface TalentPoolViewProps {
  appState: AppState;
  onSendOffer: (candidateId: string) => void;
  onSendBulkOffers: (candidateIds: string[]) => void;
}

export const TalentPoolView: React.FC<TalentPoolViewProps> = ({
  appState,
  onSendOffer,
  onSendBulkOffers,
}) => {
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('tc-1');
  const [checkedIds, setCheckedIds] = useState<string[]>(['tc-1', 'tc-2', 'tc-3']);
  const [deptFilters, setDeptFilters] = useState<Record<string, boolean>>({
    Housekeeping: false,
    'Front Desk': false,
    Restaurant: true,
    Kitchen: false,
  });
  const [skillTags, setSkillTags] = useState<string[]>(['Food Safety', 'Customer Service', 'Cleaning', 'Cooking']);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('Best Match');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDetailTab, setActiveDetailTab] = useState<'overview' | 'skills' | 'availability' | 'history'>('overview');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Selected candidate for side panel
  const selectedCandidate = appState.talentPool.find((c) => c.id === selectedCandidateId) || appState.talentPool[0];

  const handleToggleCheck = (id: string) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSendSelectedOffers = () => {
    if (checkedIds.length === 0) return;
    onSendBulkOffers(checkedIds);
    setFeedbackMessage(`Dispatched shift offers to ${checkedIds.length} candidate(s)! Stored locally.`);
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const removeSkillTag = (tag: string) => {
    setSkillTags((prev) => prev.filter((t) => t !== tag));
  };

  const clearFilters = () => {
    setDeptFilters({ Housekeeping: false, 'Front Desk': false, Restaurant: false, Kitchen: false });
    setSkillTags([]);
    setStatusFilter('All');
    setSearchQuery('');
  };

  // Filter candidates
  const filteredCandidates = appState.talentPool.filter((c) => {
    // Dept filter if any checked
    const activeDepts = Object.keys(deptFilters).filter((k) => deptFilters[k]);
    if (activeDepts.length > 0 && !activeDepts.includes(c.department)) {
      return false;
    }
    // Status filter
    if (statusFilter !== 'All' && c.status !== statusFilter) {
      return false;
    }
    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match = c.name.toLowerCase().includes(q) ||
                    c.role.toLowerCase().includes(q) ||
                    c.skills.some((s) => s.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="p-6 space-y-6 max-w-[1700px] mx-auto">
      {/* Toast Feedback */}
      {feedbackMessage && (
        <div className="p-3 bg-teal-700 text-white rounded-xl shadow-md flex items-center justify-between text-xs font-semibold animate-in fade-in">
          <span>{feedbackMessage}</span>
          <button onClick={() => setFeedbackMessage(null)} className="text-white hover:text-teal-200">✕</button>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Temporary Talent Pool</h1>
        <p className="text-sm text-slate-500">Find qualified workers for your hotel's open shifts.</p>
      </div>

      {/* Vacant Shift Announcement Banner (matching Image 2) */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-700 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Active Need</div>
            <div className="text-sm font-bold text-slate-900">Vacant Shift</div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Department</span>
            <span className="font-semibold text-slate-800">Kitchen</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Date</span>
            <span className="font-semibold text-slate-800">Apr 26, 2025</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Time</span>
            <span className="font-semibold text-slate-800">12:00 PM – 08:00 PM</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Workers Needed</span>
            <span className="font-semibold text-amber-600">2</span>
          </div>
        </div>

        <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
          <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-700">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">12</div>
            <div className="text-[11px] text-slate-500">Matching Candidates</div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>
      </div>

      {/* 3-Column Layout: Left Filters + Center Candidates + Right Profile Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 1. Left Filters Column (2.5 cols) */}
        <div className="lg:col-span-3 bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">Filters</h2>
            <button
              onClick={clearFilters}
              className="text-xs text-teal-700 hover:text-teal-900 font-medium"
            >
              Clear filters
            </button>
          </div>

          {/* Department */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 mb-2">Department</h3>
            <div className="space-y-2 text-xs">
              {[
                { name: 'Housekeeping', count: 4 },
                { name: 'Front Desk', count: 3 },
                { name: 'Restaurant', count: 3 },
                { name: 'Kitchen', count: 2 },
              ].map((d) => (
                <label key={d.name} className="flex items-center justify-between cursor-pointer text-slate-700 hover:text-slate-900">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!!deptFilters[d.name]}
                      onChange={(e) => setDeptFilters({ ...deptFilters, [d.name]: e.target.checked })}
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span>{d.name}</span>
                  </div>
                  <span className="text-slate-400 tabular-nums">({d.count})</span>
                </label>
              ))}
            </div>
          </div>

          {/* Skills / Certifications */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 mb-2">Skills / Certifications</h3>
            <div className="relative mb-2">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search skills..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
              />
            </div>
            {/* Active skill tags */}
            <div className="flex flex-wrap gap-1.5">
              {skillTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-teal-50 text-teal-800 text-[11px] font-medium border border-teal-100"
                >
                  {tag}
                  <button onClick={() => removeSkillTag(tag)} className="text-teal-600 hover:text-teal-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Availability for selected shift */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 mb-2">Availability for selected shift</h3>
            <div className="space-y-2 text-xs">
              <label className="flex items-center justify-between text-slate-700 cursor-pointer">
                <div className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded text-teal-600" />
                  <span>Available now</span>
                </div>
                <span className="text-slate-400 tabular-nums">(10)</span>
              </label>
              <label className="flex items-center justify-between text-slate-700 cursor-pointer">
                <div className="flex items-center gap-2">
                  <input type="checkbox" className="rounded text-teal-600" />
                  <span>Available later</span>
                </div>
                <span className="text-slate-400 tabular-nums">(2)</span>
              </label>
              <label className="flex items-center justify-between text-slate-400 cursor-pointer">
                <div className="flex items-center gap-2">
                  <input type="checkbox" disabled className="rounded text-slate-300" />
                  <span>Not available</span>
                </div>
                <span className="text-slate-400 tabular-nums">(0)</span>
              </label>
            </div>
          </div>

          {/* Distance from hotel */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 mb-2">Distance from hotel</h3>
            <select className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700">
              <option>Any distance</option>
              <option>Under 5 km</option>
              <option>Under 10 km</option>
            </select>
          </div>

          {/* Helper box */}
          <div className="p-3 bg-teal-50/70 rounded-lg border border-teal-100 flex items-start gap-2.5 text-xs text-teal-900">
            <Users className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
            <span className="text-[11px] leading-relaxed">
              You can select multiple candidates and send offers at once. Changes are cached locally offline.
            </span>
          </div>
        </div>

        {/* 2. Center Candidate Cards Column (5.5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Controls Bar */}
          <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search by name, skills or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-teal-600"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700"
              >
                <option value="All">Worker Status: All</option>
                <option value="Available">Available</option>
                <option value="Offer Sent">Offer Sent</option>
                <option value="Declined">Declined</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700"
              >
                <option>Sort: Best Match</option>
                <option>Sort: Experience</option>
                <option>Sort: Distance</option>
              </select>
            </div>
          </div>

          {/* Bulk Selection Header */}
          <div className="flex items-center justify-between px-2 text-xs">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={checkedIds.length === appState.talentPool.length}
                  onChange={() => {
                    if (checkedIds.length === appState.talentPool.length) {
                      setCheckedIds([]);
                    } else {
                      setCheckedIds(appState.talentPool.map((c) => c.id));
                    }
                  }}
                  className="rounded text-teal-600"
                />
                <span>{checkedIds.length} selected</span>
              </label>

              {checkedIds.length > 0 && (
                <button
                  onClick={handleSendSelectedOffers}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs shadow-2xs transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Offers ({checkedIds.length})</span>
                </button>
              )}
            </div>

            <span className="text-slate-400 font-medium">{filteredCandidates.length} candidates</span>
          </div>

          {/* Candidates List */}
          <div className="space-y-3">
            {filteredCandidates.map((candidate) => {
              const isChecked = checkedIds.includes(candidate.id);
              const isSelected = selectedCandidateId === candidate.id;

              return (
                <div
                  key={candidate.id}
                  onClick={() => setSelectedCandidateId(candidate.id)}
                  className={`bg-white rounded-xl p-4 border transition cursor-pointer ${
                    isSelected
                      ? 'border-teal-600 ring-2 ring-teal-600/20 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleToggleCheck(candidate.id);
                      }}
                      className="mt-1 rounded text-teal-600 focus:ring-teal-500"
                    />

                    {/* Avatar */}
                    {candidate.avatar ? (
                      <img
                        src={candidate.avatar}
                        alt={candidate.name}
                        className="w-11 h-11 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm shrink-0">
                        {candidate.initials}
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{candidate.name}</h4>
                          <div className="text-xs text-slate-500">
                            {candidate.department} · {candidate.role}
                          </div>
                        </div>

                        {/* Status Badge */}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                            candidate.status === 'Available'
                              ? 'bg-emerald-100 text-emerald-800'
                              : candidate.status === 'Offer Sent'
                              ? 'bg-sky-100 text-sky-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {candidate.status}
                        </span>
                      </div>

                      {/* Skill tags */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {candidate.skills.slice(0, 3).map((s) => (
                          <span
                            key={s}
                            className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium"
                          >
                            {s}
                          </span>
                        ))}
                      </div>

                      {/* Details row: Exp, availability, distance */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                          <span>{candidate.experience}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>Available: {candidate.availableDates}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{candidate.distanceKm} km</span>
                        </div>
                      </div>

                      {/* Match Score Strip */}
                      <div className="mt-2.5 p-2 rounded-lg bg-teal-50/60 border border-teal-100/80 flex items-center justify-between text-xs">
                        <span className="font-bold text-teal-800">{candidate.matchScore}% Match</span>
                        <span className="text-[11px] text-teal-700 truncate max-w-[280px]">
                          {candidate.matchReason}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Right Candidate Details Column (4 cols) matching Image 2 right pane */}
        <div className="lg:col-span-4 bg-white rounded-xl p-6 border border-slate-200 shadow-2xs sticky top-24 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Candidate Details</h2>
            <button className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Profile Card Header */}
          <div className="flex items-center gap-4">
            {selectedCandidate.avatar ? (
              <img
                src={selectedCandidate.avatar}
                alt={selectedCandidate.name}
                className="w-16 h-16 rounded-full object-cover shadow-2xs"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xl">
                {selectedCandidate.initials}
              </div>
            )}
            <div>
              <h3 className="text-lg font-bold text-slate-900">{selectedCandidate.name}</h3>
              <p className="text-xs text-slate-500">
                {selectedCandidate.department} · {selectedCandidate.role}
              </p>
              <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                selectedCandidate.status === 'Available'
                  ? 'bg-emerald-100 text-emerald-800'
                  : selectedCandidate.status === 'Offer Sent'
                  ? 'bg-sky-100 text-sky-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {selectedCandidate.status}
              </span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 text-center">
            <div>
              <div className="text-lg font-bold text-slate-900 tabular-nums">
                {selectedCandidate.matchScore}%
              </div>
              <div className="text-[11px] text-slate-400">Match Score</div>
            </div>
            <div>
              <div className="text-lg font-bold text-slate-900">
                {selectedCandidate.experience.split(' ')[0]} yrs
              </div>
              <div className="text-[11px] text-slate-400">Experience</div>
            </div>
            <div>
              <div className="text-lg font-bold text-slate-900 tabular-nums">
                {selectedCandidate.distanceKm} km
              </div>
              <div className="text-[11px] text-slate-400">Distance</div>
            </div>
          </div>

          {/* Tabs: Overview, Skills, Availability, Offer History */}
          <div className="flex border-b border-slate-200 text-xs font-medium">
            {(['overview', 'skills', 'availability', 'history'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveDetailTab(tab)}
                className={`flex-1 pb-2 capitalize transition ${
                  activeDetailTab === tab
                    ? 'border-b-2 border-teal-600 text-teal-800 font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab === 'history' ? 'Offer History' : tab}
              </button>
            ))}
          </div>

          {/* Tab Contents */}
          <div className="space-y-4 text-xs">
            {/* Skills & Certifications */}
            <div>
              <h4 className="font-bold text-slate-800 mb-2">Skills & Certifications</h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedCandidate.skills.map((s) => (
                  <span
                    key={s}
                    className="px-2.5 py-1 rounded bg-teal-50 text-teal-800 font-medium border border-teal-100"
                  >
                    {s}
                  </span>
                ))}
                <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-600 font-medium">Basic English</span>
                <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-600 font-medium">Teamwork</span>
              </div>
            </div>

            {/* Availability */}
            <div>
              <h4 className="font-bold text-slate-800 mb-1.5">Availability for Selected Shift</h4>
              <div className="p-2.5 bg-slate-50 rounded-lg space-y-1.5 text-slate-700">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Apr 26 – Apr 30, 2025</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Flexible timing (within shift hours)</span>
                </div>
              </div>
            </div>

            {/* Match Explanation */}
            <div>
              <h4 className="font-bold text-slate-800 mb-1.5">Match Explanation</h4>
              <div className="p-2.5 bg-teal-50/50 border border-teal-100 rounded-lg flex items-start gap-2 text-teal-900 text-[11px] leading-relaxed">
                <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span>
                  {selectedCandidate.matchReason} Verified historical check-in reliability rating of 4.9/5.0.
                </span>
              </div>
            </div>

            {/* Offer History */}
            <div>
              <h4 className="font-bold text-slate-800 mb-2">Offer History</h4>
              {selectedCandidate.offerHistory && selectedCandidate.offerHistory.length > 0 ? (
                <div className="space-y-2">
                  {selectedCandidate.offerHistory.map((hist) => (
                    <div key={hist.id} className="p-2 rounded bg-slate-50 border border-slate-100 text-[11px]">
                      <div className="flex justify-between font-semibold text-slate-800">
                        <span>{hist.action}</span>
                        <span className="text-slate-400">{hist.date} · {hist.time}</span>
                      </div>
                      <div className="text-slate-500 mt-0.5">{hist.status}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-slate-400 text-[11px] italic">No prior offers recorded.</div>
              )}
            </div>
          </div>

          {/* Action Buttons: Edit, Reassign, Send/Cancel Offer */}
          <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
            <button
              onClick={() => alert(`Editing candidate profile ${selectedCandidate.name} (stored locally)`)}
              className="flex-1 py-2 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition text-center"
            >
              Edit
            </button>
            <button
              onClick={() => alert(`Reassigning candidate ${selectedCandidate.name}`)}
              className="flex-1 py-2 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition text-center"
            >
              Reassign
            </button>
            {selectedCandidate.status === 'Offer Sent' ? (
              <button
                onClick={() => {
                  alert(`Offer cancelled for ${selectedCandidate.name}`);
                }}
                className="flex-1 py-2 text-xs font-semibold rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition text-center"
              >
                Cancel Offer
              </button>
            ) : (
              <button
                onClick={() => {
                  onSendOffer(selectedCandidate.id);
                  setFeedbackMessage(`Sent shift offer to ${selectedCandidate.name}!`);
                  setTimeout(() => setFeedbackMessage(null), 3000);
                }}
                className="flex-1 py-2 text-xs font-semibold rounded-lg bg-teal-700 hover:bg-teal-800 text-white transition text-center shadow-2xs"
              >
                Send Offer
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
