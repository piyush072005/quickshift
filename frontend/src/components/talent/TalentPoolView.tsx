import React, { useState } from 'react';
import { TalentCandidate } from '../../types';
import { TALENT_CANDIDATES } from '../../data/mockData';

interface TalentPoolViewProps {
  onTriggerToast: (msg: string) => void;
}

export const TalentPoolView: React.FC<TalentPoolViewProps> = ({
  onTriggerToast,
}) => {
  const [candidates, setCandidates] = useState<TalentCandidate[]>(TALENT_CANDIDATES);
  const [selectedCandidate, setSelectedCandidate] = useState<TalentCandidate>(TALENT_CANDIDATES[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'availability' | 'log'>('overview');
  
  // Filters
  const [selectedDepts, setSelectedDepts] = useState<string[]>(['Restaurant', 'Kitchen']);
  const [availFilter, setAvailFilter] = useState<'now' | 'later' | 'all'>('now');
  const [radiusFilter, setRadiusFilter] = useState('10');
  const [activeSkills, setActiveSkills] = useState<string[]>(['Food Safety', 'Customer Service']);
  const [skillSearch, setSkillSearch] = useState('');

  // Toggle candidate selection for batch dispatch
  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCandidates(prev =>
      prev.map(c => c.id === id ? { ...c, selectedForDispatch: !c.selectedForDispatch } : c)
    );
  };

  const selectedCount = candidates.filter(c => c.selectedForDispatch).length;

  const handleSendBatchOffers = () => {
    onTriggerToast(`Transmitted automated dispatch offers to ${selectedCount} candidates!`);
    setCandidates(prev =>
      prev.map(c => c.selectedForDispatch ? { ...c, status: 'Offer Sent', selectedForDispatch: false } : c)
    );
  };

  const handleDispatchSingle = (candidate: TalentCandidate) => {
    onTriggerToast(`Instant shift assignment offer sent to ${candidate.name} via QuickShift App!`);
    setCandidates(prev =>
      prev.map(c => c.id === candidate.id ? { ...c, status: 'Offer Sent' } : c)
    );
    if (selectedCandidate.id === candidate.id) {
      setSelectedCandidate({ ...selectedCandidate, status: 'Offer Sent' });
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setActiveSkills(activeSkills.filter(s => s !== skill));
  };

  const handleAddSkill = (skill: string) => {
    if (!activeSkills.includes(skill)) {
      setActiveSkills([...activeSkills, skill]);
    }
    setSkillSearch('');
  };

  const handleResetFilters = () => {
    setSelectedDepts(['Restaurant', 'Kitchen']);
    setActiveSkills(['Food Safety', 'Customer Service']);
    setAvailFilter('now');
    setRadiusFilter('10');
    setSearchQuery('');
    onTriggerToast('All pool filters reset to defaults');
  };

  // Filter candidates
  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = 
      searchQuery === '' || 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDept = selectedDepts.length === 0 || selectedDepts.some(d => c.department.includes(d));

    const matchesAvail = 
      availFilter === 'all' || 
      (availFilter === 'now' && c.status !== 'Declined') ||
      (availFilter === 'later' && c.status === 'Declined');

    const matchesRadius = radiusFilter === 'all' || c.distanceKm <= Number(radiusFilter);

    const matchesSkills = 
      activeSkills.length === 0 || 
      activeSkills.some(reqSkill => c.skills.some(s => s.toLowerCase().includes(reqSkill.toLowerCase())));

    return matchesSearch && matchesDept && matchesAvail && matchesRadius && matchesSkills;
  });

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Top Banner / Page Subtitle & Shift Context Strip */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5 mb-1 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Temporary Talent Pool
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200">
                12 Verified Matched
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Find, match, and instantly dispatch pre-vetted freelance hotel staff for urgent roster vacancies.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onTriggerToast('Accessing QuickShift Dispatch Log (38 past shifts recorded)')}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">history</span>
              <span>Dispatch Log</span>
            </button>
            <button
              onClick={() => {
                onTriggerToast('Auto-filling open Kitchen Assistant vacancy with Priya Sharma & Rohan Singh!');
              }}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[18px]">bolt</span>
              <span>Auto-Fill Vacancy</span>
            </button>
          </div>
        </div>

        {/* Shift Target Context Strip Card */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
            <div className="w-11 h-11 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">emergency</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-rose-600 tracking-wider">
                  Unassigned Priority Slot
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                <span className="text-[11px] text-slate-400 font-medium">Shift ID #SH-8821</span>
              </div>
              <h2 className="text-sm font-bold text-slate-900">Kitchen Assistant • Commis Chef</h2>
            </div>
          </div>

          {/* Badges Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:border-l lg:border-slate-100 lg:pl-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-[16px]">restaurant</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 font-medium uppercase">Department</span>
                <span className="text-xs font-bold text-slate-800">Kitchen & F&B</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-[16px]">calendar_today</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 font-medium uppercase">Target Date</span>
                <span className="text-xs font-bold text-slate-800">Apr 26, 2025</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-[16px]">schedule</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 font-medium uppercase">Shift Hours</span>
                <span className="text-xs font-bold text-slate-800">12:00 PM – 08:00 PM</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[16px]">person_alert</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 font-medium uppercase">Needed</span>
                <span className="text-xs font-bold text-rose-600">2 Workers Req.</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-slate-700">12 Available</span>
            <span className="text-[10px] text-slate-400">(&gt;70% Match)</span>
          </div>
        </div>
      </div>

      {/* Main Three-Pane Workplace Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* LEFT PANEL: Multi-Tier Filter Sidebar (Col: 3 of 12) */}
        <div className="xl:col-span-3 bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs flex flex-col gap-5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-slate-700">tune</span>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Filter Pool</h2>
            </div>
            <button
              onClick={handleResetFilters}
              className="text-xs font-bold text-teal-700 hover:underline"
            >
              Reset all
            </button>
          </div>

          {/* Department Filter */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Department</span>
            <div className="space-y-1.5">
              {[
                { label: 'Housekeeping', count: 4, value: 'Housekeeping' },
                { label: 'Front Desk', count: 3, value: 'Front Desk' },
                { label: 'Restaurant & Bar', count: 3, value: 'Restaurant' },
                { label: 'Kitchen & Culinary', count: 2, value: 'Kitchen' },
              ].map(d => {
                const checked = selectedDepts.includes(d.value);
                return (
                  <label key={d.value} className="flex items-center justify-between text-xs text-slate-700 cursor-pointer hover:text-slate-900">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          if (checked) {
                            setSelectedDepts(selectedDepts.filter(item => item !== d.value));
                          } else {
                            setSelectedDepts([...selectedDepts, d.value]);
                          }
                        }}
                        className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 accent-teal-600"
                      />
                      <span className={checked ? 'font-semibold text-teal-900' : ''}>{d.label}</span>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-500">
                      {d.count}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Skills & Badges Tags */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Skills & Badges</span>
            <div className="relative">
              <span className="material-symbols-outlined text-[16px] text-slate-400 absolute left-2.5 top-2">
                search
              </span>
              <input
                type="text"
                value={skillSearch}
                onChange={(e) => setSkillSearch(e.target.value)}
                placeholder="Search skills..."
                className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg bg-slate-50 text-slate-800 placeholder:text-slate-400 outline-none border border-slate-200"
              />
            </div>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {activeSkills.map((s, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-bold"
                >
                  {s}
                  <button onClick={() => handleRemoveSkill(s)} className="hover:text-teal-950">
                    <span className="material-symbols-outlined text-[13px]">close</span>
                  </button>
                </span>
              ))}
              {['Cooking', 'Cleaning'].map((addS, idx) => (
                !activeSkills.includes(addS) && (
                  <button
                    key={idx}
                    onClick={() => handleAddSkill(addS)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-medium"
                  >
                    + {addS}
                  </button>
                )
              ))}
            </div>
          </div>

          {/* Shift Availability */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Shift Availability</span>
            <div className="space-y-1.5 text-xs">
              <label className="flex items-center justify-between cursor-pointer text-slate-700">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="avail"
                    checked={availFilter === 'now'}
                    onChange={() => setAvailFilter('now')}
                    className="w-3.5 h-3.5 text-teal-600 accent-teal-600"
                  />
                  <span className="font-semibold">Available now</span>
                </div>
                <span className="text-[11px] font-bold text-slate-800">10</span>
              </label>
              <label className="flex items-center justify-between cursor-pointer text-slate-600">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="avail"
                    checked={availFilter === 'later'}
                    onChange={() => setAvailFilter('later')}
                    className="w-3.5 h-3.5 text-teal-600 accent-teal-600"
                  />
                  <span>Available later</span>
                </div>
                <span className="text-[11px] text-slate-400">2</span>
              </label>
              <label className="flex items-center justify-between cursor-pointer text-slate-400 opacity-60">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="avail"
                    disabled
                    className="w-3.5 h-3.5 text-teal-600 accent-teal-600"
                  />
                  <span>Not available</span>
                </div>
                <span className="text-[11px]">0</span>
              </label>
            </div>
          </div>

          {/* Radius from Hotel */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Radius From Hotel</span>
              <span className="text-xs font-bold text-teal-700">&lt; {radiusFilter === 'all' ? 'Any' : `${radiusFilter} km`}</span>
            </div>
            <select
              value={radiusFilter}
              onChange={(e) => setRadiusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none cursor-pointer"
            >
              <option value="10">Within 10 km (Recommended)</option>
              <option value="5">Within 5 km (Immediate Transit)</option>
              <option value="20">Within 20 km (Expanded Perimeter)</option>
              <option value="all">Any distance</option>
            </select>
          </div>

          {/* Helper notice */}
          <div className="p-3 rounded-xl bg-teal-50/70 border border-teal-100 flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[16px] text-teal-700 shrink-0 mt-0.5">tips_and_updates</span>
            <p className="text-[11px] text-teal-900 leading-snug">
              Select multiple candidates to transmit bulk digital offers. Shift goes to the first responder who accepts.
            </p>
          </div>
        </div>

        {/* MIDDLE PANEL: Candidate List Table (Col: 5 of 12) */}
        <div className="xl:col-span-5 flex flex-col gap-3">
          {/* Controls toolbar */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-2.5 shadow-2xs flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <span className="material-symbols-outlined text-[18px] text-slate-400 absolute left-2.5 top-2">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, skills or certification..."
                className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white"
              />
            </div>
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
              {filteredCandidates.length} candidates
            </span>
          </div>

          {/* Batch Action Banner */}
          {selectedCount > 0 && (
            <div className="bg-teal-700 text-white px-4 py-2.5 rounded-xl shadow-md flex items-center justify-between animate-in fade-in duration-150">
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded bg-white text-teal-800 flex items-center justify-center font-bold text-xs">
                  {selectedCount}
                </span>
                <span className="text-xs font-bold">{selectedCount} Candidates Selected for Dispatch</span>
              </div>
              <button
                onClick={handleSendBatchOffers}
                className="px-3 py-1 rounded-lg bg-white hover:bg-slate-100 text-teal-800 text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">send</span>
                <span>Send Offers ({selectedCount})</span>
              </button>
            </div>
          )}

          {/* Candidate Card List */}
          <div className="space-y-2">
            {filteredCandidates.map((c) => {
              const isInspected = selectedCandidate?.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCandidate(c)}
                  className={`
                    bg-white rounded-xl p-3.5 shadow-2xs border transition-all cursor-pointer hover:shadow-md
                    ${isInspected ? 'ring-2 ring-teal-600 border-teal-500' : 'border-slate-200/90'}
                  `}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={!!c.selectedForDispatch}
                        onClick={(e) => handleToggleSelect(c.id, e)}
                        onChange={() => {}}
                        className="w-4 h-4 mt-2 text-teal-600 accent-teal-600 rounded cursor-pointer shrink-0"
                      />

                      {/* Avatar */}
                      <div className="relative shrink-0">
                        {c.avatarUrl ? (
                          <img
                            src={c.avatarUrl}
                            alt={c.name}
                            className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-sm border border-slate-200">
                            {c.initials || c.name.slice(0, 2)}
                          </div>
                        )}
                        {c.status === 'Available' && (
                          <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full ring-2 ring-white flex items-center justify-center text-white">
                            <span className="material-symbols-outlined text-[9px]">check</span>
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-900 truncate">{c.name}</span>
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold">
                            {c.role}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-500 text-[11px] mt-1 flex-wrap">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px] text-slate-400">work_history</span>
                            {c.experienceYears} yrs exp.
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px] text-slate-400">calendar_month</span>
                            {c.availabilityRange}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px] text-slate-400">near_me</span>
                            {c.distanceKm} km
                          </span>
                        </div>
                        {/* Skills chips */}
                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                          {c.skills.slice(0, 2).map((sk, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium"
                            >
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Score & Status */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-xs font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">auto_awesome</span>
                        {c.matchScore}% Match
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        c.status === 'Available' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                        c.status === 'Offer Sent' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                        'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {c.status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT PANEL: Candidate Inspection Profile Card (Col: 4 of 12) */}
        <div className="xl:col-span-4 bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs flex flex-col gap-4 sticky top-20">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Candidate Details</span>
            <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 font-bold text-[10px]">Active Preview</span>
          </div>

          {/* Avatar & Headline */}
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              {selectedCandidate.avatarUrl ? (
                <img
                  src={selectedCandidate.avatarUrl}
                  alt={selectedCandidate.name}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-teal-600/30 shadow-xs"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-base">
                  {selectedCandidate.initials || selectedCandidate.name.slice(0, 2)}
                </div>
              )}
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-xs">
                <span className="material-symbols-outlined text-[12px]">verified</span>
              </span>
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-extrabold text-slate-900 truncate">{selectedCandidate.name}</h3>
              <p className="text-xs text-slate-500">{selectedCandidate.department} • {selectedCandidate.role}</p>
              <div className="mt-1">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                  selectedCandidate.status === 'Available' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                  selectedCandidate.status === 'Offer Sent' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                  'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                  {selectedCandidate.status === 'Available' ? 'Available for Dispatch' : selectedCandidate.status}
                </span>
              </div>
            </div>
          </div>

          {/* Metric Badges */}
          <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
            <div>
              <div className="text-lg font-black text-teal-700">{selectedCandidate.matchScore}%</div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Match Score</div>
            </div>
            <div className="border-x border-slate-200 px-1">
              <div className="text-lg font-black text-slate-900">{selectedCandidate.experienceYears} yrs</div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Experience</div>
            </div>
            <div>
              <div className="text-lg font-black text-slate-900">{selectedCandidate.distanceKm} km</div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Distance</div>
            </div>
          </div>

          {/* Tab Strip */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-1 text-xs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-2 font-bold transition-colors ${activeTab === 'overview' ? 'text-teal-700 border-b-2 border-teal-700 -mb-1' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('skills')}
              className={`pb-2 font-bold transition-colors ${activeTab === 'skills' ? 'text-teal-700 border-b-2 border-teal-700 -mb-1' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Skills & Exp
            </button>
            <button
              onClick={() => setActiveTab('availability')}
              className={`pb-2 font-bold transition-colors ${activeTab === 'availability' ? 'text-teal-700 border-b-2 border-teal-700 -mb-1' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Availability
            </button>
            <button
              onClick={() => setActiveTab('log')}
              className={`pb-2 font-bold transition-colors ${activeTab === 'log' ? 'text-teal-700 border-b-2 border-teal-700 -mb-1' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Offer History
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-3.5">
              {/* AI Match Rationale */}
              <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-indigo-700">
                  <span className="material-symbols-outlined text-[16px]">psychology</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider">AI Predictive Match Rationale</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {selectedCandidate.bio}
                </p>
              </div>

              {/* Verified Badges */}
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Verified Hospitality Badges</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {selectedCandidate.badges.map((b, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px] text-teal-600">check_circle</span>
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              {/* Dispatch Timeline */}
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Shift Dispatch Timeline</span>
                <div className="mt-2 flex items-start gap-3 pl-1">
                  <div className="flex flex-col items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-teal-600 mt-1"></div>
                    <div className="w-0.5 h-8 bg-slate-200"></div>
                    <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                  </div>
                  <div className="flex flex-col gap-2 flex-1">
                    <div>
                      <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                        <span>Offer Transmitted</span>
                        <span className="text-[10px] text-slate-400 font-normal">Apr 24 • 3:15 PM</span>
                      </div>
                      <span className="text-[11px] text-slate-500">Automated push & SMS notification sent</span>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-400">Candidate Response</div>
                      <span className="text-[11px] text-slate-400">Awaiting confirmation (Expires in 4 hrs)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="space-y-3">
              <span className="text-[10px] uppercase font-bold text-slate-400">All Registered Skills</span>
              <div className="grid grid-cols-2 gap-2">
                {selectedCandidate.skills.map((sk, idx) => (
                  <div key={idx} className="p-2 bg-slate-50 rounded-lg border border-slate-100 text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px] text-teal-600">star</span>
                    {sk}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'availability' && (
            <div className="space-y-2 text-xs text-slate-700">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400">Selected Window</span>
                <div className="text-sm font-bold text-slate-900 mt-0.5">{selectedCandidate.availabilityRange}, 2025</div>
                <div className="text-slate-500 mt-1">Flexible timing within active rotation hours</div>
              </div>
            </div>
          )}

          {activeTab === 'log' && (
            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center">
                <span>Shift #SH-8821 dispatched</span>
                <span className="text-slate-400 text-[10px]">Today 10:24 AM</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center">
                <span>Profile verified by HR</span>
                <span className="text-slate-400 text-[10px]">Apr 18, 2025</span>
              </div>
            </div>
          )}

          {/* Action CTAs */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => onTriggerToast(`Editing match parameters for ${selectedCandidate.name}`)}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors text-center"
            >
              Edit Match
            </button>
            <button
              onClick={() => onTriggerToast(`Reassigned ${selectedCandidate.name} to general floater pool`)}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors text-center"
            >
              Reassign
            </button>
            <button
              onClick={() => handleDispatchSingle(selectedCandidate)}
              className="flex-1 py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all text-center shadow-xs flex items-center justify-center gap-1 active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[16px]">send</span>
              <span>Dispatch</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
