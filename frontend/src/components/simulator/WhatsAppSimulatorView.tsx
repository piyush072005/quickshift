import React, { useState, useEffect } from 'react';
import { INITIAL_EMPLOYEES } from '../../data/mockData';

interface WhatsAppSimulatorViewProps {
  onTriggerToast: (msg: string) => void;
  onAutoAddShiftToRoster?: (empName: string, role: string, dept: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'hotel' | 'employee' | 'system';
  text: string;
  time: string;
  status?: 'sent' | 'delivered' | 'read';
  hasInteractiveButtons?: boolean;
}

export const WhatsAppSimulatorView: React.FC<WhatsAppSimulatorViewProps> = ({
  onTriggerToast,
  onAutoAddShiftToRoster,
}) => {
  // Preset scenarios
  const scenarios = [
    {
      id: 'banquet',
      title: 'Banquet Rush Line Cook',
      employeeIndex: 6, // Deepa Pillai (Kitchen)
      role: 'Line Cook Floater',
      dept: 'Kitchen',
      date: 'Sat, Apr 26, 2025',
      timeRange: '12:00 PM – 08:00 PM (8 hrs)',
      pay: '₹1,500 + ₹200 incentive',
      urgency: 'Immediate (Surge Deficit)',
      phone: '+91 98201 44812',
    },
    {
      id: 'housekeeping',
      title: 'North Wing VIP Suite Clean',
      employeeIndex: 0, // Sunita Rao (Housekeeping)
      role: 'Floor Lead / Steward',
      dept: 'Housekeeping',
      date: 'Wed, Apr 23, 2025',
      timeRange: '06:00 AM – 02:00 PM (8 hrs)',
      pay: '₹1,300 + ₹150 incentive',
      urgency: 'Priority Slot',
      phone: '+91 98402 33190',
    },
    {
      id: 'restaurant',
      title: 'Main Dining Dinner Rush',
      employeeIndex: 2, // Pooja Nair (Restaurant)
      role: 'Lead Server (Floor Captain)',
      dept: 'Restaurant',
      date: 'Sat, Apr 26, 2025',
      timeRange: '11:00 AM – 07:00 PM (8 hrs)',
      pay: '₹1,400 + ₹200 incentive',
      urgency: 'Peak Demand (+18%)',
      phone: '+91 98114 99021',
    },
    {
      id: 'reception',
      title: 'VIP Weekend Check-in Floater',
      employeeIndex: 1, // Rajesh Kulkarni (Front Desk)
      role: 'Concierge Associate',
      dept: 'Front Desk',
      date: 'Fri, Apr 25, 2025',
      timeRange: '08:00 AM – 04:00 PM (8 hrs)',
      pay: '₹1,450 + Travel Allowance',
      urgency: 'High Occupancy',
      phone: '+91 98220 88714',
    },
  ];

  const [activeScenarioId, setActiveScenarioId] = useState('restaurant');
  const activeScenario = scenarios.find(s => s.id === activeScenarioId) || scenarios[0];

  // Employee details from selection
  const [selectedEmpIndex, setSelectedEmpIndex] = useState(activeScenario.employeeIndex);
  const targetEmployee = INITIAL_EMPLOYEES[selectedEmpIndex] || INITIAL_EMPLOYEES[0];

  // Form states
  const [roleInput, setRoleInput] = useState(activeScenario.role);
  const [deptInput, setDeptInput] = useState(activeScenario.dept);
  const [dateInput, setDateInput] = useState(activeScenario.date);
  const [timeInput, setTimeInput] = useState(activeScenario.timeRange);
  const [payInput, setPayInput] = useState(activeScenario.pay);
  const [phoneInput, setPhoneInput] = useState(activeScenario.phone);
  const [customNote, setCustomNote] = useState('Banquet hall dinner rush. Immediate extra coverage needed on main floor.');

  // Simulation execution states
  const [dispatchStatus, setDispatchStatus] = useState<'idle' | 'transmitting' | 'sent' | 'read' | 'accepted' | 'declined'>('idle');
  const [isTyping, setIsTyping] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [customReplyText, setCustomReplyText] = useState('');

  // Switch scenario
  const handleSelectScenario = (scenId: string) => {
    const sc = scenarios.find(s => s.id === scenId);
    if (!sc) return;
    setActiveScenarioId(scenId);
    setSelectedEmpIndex(sc.employeeIndex);
    setRoleInput(sc.role);
    setDeptInput(sc.dept);
    setDateInput(sc.date);
    setTimeInput(sc.timeRange);
    setPayInput(sc.pay);
    setPhoneInput(sc.phone);
    handleResetSimulation();
  };

  const handleResetSimulation = () => {
    setDispatchStatus('idle');
    setIsTyping(false);
    setChatMessages([]);
  };

  // Dispatch trigger from Manager Console
  const handleSendWhatsAppRequest = () => {
    setDispatchStatus('transmitting');
    onTriggerToast(`Sending WhatsApp shift dispatch to ${targetEmployee.name} (${phoneInput})...`);

    setTimeout(() => {
      setDispatchStatus('sent');

      const initialOfferMessage: ChatMessage = {
        id: 'msg-offer-' + Date.now(),
        sender: 'hotel',
        text: `🏨 *SUNRISE GRAND HOTEL • URGENT SHIFT REQUEST*\n\nNamaste ${targetEmployee.name}! We have an immediate shift available:\n\n📍 *Role:* ${roleInput}\n🏢 *Department:* ${deptInput}\n📅 *Date:* ${dateInput}\n⏰ *Time:* ${timeInput}\n💰 *Payout:* ${payInput}\n📝 *Note:* ${customNote}\n\nPlease let us know if you can take this shift. First response gets confirmed!`,
        time: '10:24 AM',
        status: 'delivered',
        hasInteractiveButtons: true,
      };

      setChatMessages([initialOfferMessage]);
      onTriggerToast(`WhatsApp message delivered to ${targetEmployee.name} ✓✓`);

      // Simulate employee reading message after 1.5 seconds
      setTimeout(() => {
        setDispatchStatus('read');
        setChatMessages(prev =>
          prev.map(m => m.id === initialOfferMessage.id ? { ...m, status: 'read' } : m)
        );
      }, 1400);

    }, 800);
  };

  // Employee action: Accept Shift
  const handleEmployeeAccept = () => {
    setDispatchStatus('accepted');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const acceptMsg: ChatMessage = {
        id: 'msg-accept-' + Date.now(),
        sender: 'employee',
        text: `✅ Yes Alex sir, I accept the shift! I will reach Sunrise Grand Hotel by ${timeInput.split('–')[0].trim()}.`,
        time: '10:25 AM',
      };

      const confirmationMsg: ChatMessage = {
        id: 'msg-bot-confirm-' + Date.now(),
        sender: 'hotel',
        text: `🎉 *SHIFT CONFIRMED!* Thank you ${targetEmployee.name}!\n\nYour digital gate pass has been generated:\n🎫 *Pass ID:* #SG-${Math.floor(1000 + Math.random() * 9000)}\n🚪 *Report To:* Level B1 Staff Reception / Security\n👕 *Uniform:* Provided at Linen counter.\n\nSee you on shift! 🌟`,
        time: '10:25 AM',
        status: 'read',
      };

      setChatMessages(prev => [
        ...prev.map(m => ({ ...m, hasInteractiveButtons: false })),
        acceptMsg,
        confirmationMsg,
      ]);

      onTriggerToast(`🎉 ${targetEmployee.name} accepted the shift via WhatsApp! Master roster updated.`);
      if (onAutoAddShiftToRoster) {
        onAutoAddShiftToRoster(targetEmployee.name, roleInput, deptInput);
      }
    }, 900);
  };

  // Employee action: Decline Shift
  const handleEmployeeDecline = () => {
    setDispatchStatus('declined');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const declineMsg: ChatMessage = {
        id: 'msg-decline-' + Date.now(),
        sender: 'employee',
        text: `Sorry Alex sir, I am already committed to another family function today and won't be able to report for this shift.`,
        time: '10:25 AM',
      };

      const systemAckMsg: ChatMessage = {
        id: 'msg-bot-ack-' + Date.now(),
        sender: 'hotel',
        text: `No problem ${targetEmployee.name}! Thank you for the quick response. We will route this slot to the next verified candidate. Have a great day! 👍`,
        time: '10:25 AM',
        status: 'read',
      };

      setChatMessages(prev => [
        ...prev.map(m => ({ ...m, hasInteractiveButtons: false })),
        declineMsg,
        systemAckMsg,
      ]);

      onTriggerToast(`Notice: ${targetEmployee.name} declined. Manager Console re-routing to standby floaters.`);
    }, 900);
  };

  // Employee sends custom typed message
  const handleSendCustomReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customReplyText.trim()) return;

    const userText = customReplyText.trim();
    setCustomReplyText('');

    const newReply: ChatMessage = {
      id: 'msg-custom-' + Date.now(),
      sender: 'employee',
      text: userText,
      time: '10:26 AM',
    };

    setChatMessages(prev => [...prev, newReply]);

    // Bot automated response
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const botResponse: ChatMessage = {
        id: 'msg-bot-res-' + Date.now(),
        sender: 'hotel',
        text: `Received your note: "${userText}". Duty Manager Alex Carter has been notified directly.`,
        time: '10:26 AM',
        status: 'read',
      };
      setChatMessages(prev => [...prev, botResponse]);
      onTriggerToast(`Manager received WhatsApp reply: "${userText}"`);
    }, 1000);
  };

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Shift Dispatch & WhatsApp Simulator
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              Live Two-Way Sync
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Simulate a hotel manager dispatching urgent shifts directly to employee WhatsApp and test real-time acceptance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetSimulation}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">restart_alt</span>
            <span>Reset Simulation</span>
          </button>
        </div>
      </div>

      {/* Preset Scenarios Selector Strip */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-3 shadow-2xs mb-6">
        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2 px-1">
          Select Simulation Scenario Preset
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {scenarios.map(sc => (
            <button
              key={sc.id}
              onClick={() => handleSelectScenario(sc.id)}
              className={`text-left p-2.5 rounded-lg border transition-all text-xs ${
                activeScenarioId === sc.id
                  ? 'bg-teal-50/80 border-teal-500 text-teal-900 font-bold ring-1 ring-teal-500/30'
                  : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200/80 text-slate-700'
              }`}
            >
              <div className="font-semibold text-xs truncate">{sc.title}</div>
              <div className="text-[11px] text-slate-500 mt-0.5 flex items-center justify-between">
                <span>{sc.dept}</span>
                <span className="text-teal-700 font-bold">{sc.pay.split('+')[0]}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Two-Pane Workplace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT PANE: Manager Dispatch Console (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* Dispatch Control Form Card */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[18px]">cell_tower</span>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Hotel Dispatch Console</h2>
                  <p className="text-[11px] text-slate-400">Broadcast official WhatsApp invitations with instant gate pass issuance</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                Sunrise Grand Hotel (Goa)
              </span>
            </div>

            <div className="space-y-4">
              {/* Recipient Employee Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Target Recipient (Employee / Floater)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    value={selectedEmpIndex}
                    onChange={(e) => {
                      const idx = Number(e.target.value);
                      setSelectedEmpIndex(idx);
                      handleResetSimulation();
                    }}
                    className="w-full text-xs font-semibold py-2 px-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 outline-none cursor-pointer focus:bg-white focus:ring-1 focus:ring-teal-500"
                  >
                    {INITIAL_EMPLOYEES.map((emp, i) => (
                      <option key={emp.id} value={i}>
                        {emp.name} — {emp.department} ({emp.role})
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
                    <img
                      src={targetEmployee.avatarUrl}
                      alt={targetEmployee.name}
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-300"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-900 truncate">{targetEmployee.name}</div>
                      <div className="text-[10px] text-slate-500">{phoneInput}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shift Details Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Shift Role</label>
                  <input
                    type="text"
                    value={roleInput}
                    onChange={(e) => setRoleInput(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-200 bg-slate-50/70 py-1.5 px-3 text-slate-800 outline-none focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={deptInput}
                    onChange={(e) => setDeptInput(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-200 bg-slate-50/70 py-1.5 px-3 text-slate-800 outline-none focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Shift Date</label>
                  <input
                    type="text"
                    value={dateInput}
                    onChange={(e) => setDateInput(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-200 bg-slate-50/70 py-1.5 px-3 text-slate-800 outline-none focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Time Range</label>
                  <input
                    type="text"
                    value={timeInput}
                    onChange={(e) => setTimeInput(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-200 bg-slate-50/70 py-1.5 px-3 text-slate-800 outline-none focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Wage & Incentives</label>
                  <input
                    type="text"
                    value={payInput}
                    onChange={(e) => setPayInput(e.target.value)}
                    className="w-full text-xs font-bold rounded-lg border border-slate-200 bg-slate-50/70 py-1.5 px-3 text-teal-800 outline-none focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Verified WhatsApp Number</label>
                  <input
                    type="text"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    className="w-full text-xs font-mono rounded-lg border border-slate-200 bg-slate-50/70 py-1.5 px-3 text-slate-800 outline-none focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Manager Note / Instructions</label>
                <textarea
                  rows={2}
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-200 bg-slate-50/70 p-2.5 text-slate-800 outline-none focus:bg-white resize-none"
                />
              </div>

              {/* Big Send Dispatch CTA */}
              <div className="pt-2">
                <button
                  onClick={handleSendWhatsAppRequest}
                  disabled={dispatchStatus === 'transmitting'}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {dispatchStatus === 'transmitting' ? 'sync' : 'send'}
                  </span>
                  <span>
                    {dispatchStatus === 'transmitting'
                      ? 'Transmitting via WhatsApp Business API...'
                      : `Dispatch WhatsApp Request to ${targetEmployee.name}`}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Real-time Status & Telemetry Tracker Card */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Live Dispatch Telemetry & Audit Log
            </h3>

            <div className="space-y-3">
              <div className="flex items-start gap-3 text-xs">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  dispatchStatus !== 'idle' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
                }`}>
                  <span className="material-symbols-outlined text-[15px]">send</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between font-bold">
                    <span className={dispatchStatus !== 'idle' ? 'text-slate-900' : 'text-slate-400'}>
                      1. Manager Transmission
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {dispatchStatus !== 'idle' ? '10:24 AM' : 'Waiting'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {dispatchStatus !== 'idle' ? `Sent by Alex Carter (General Manager) to ${phoneInput}` : 'Not dispatched yet'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  ['sent', 'read', 'accepted', 'declined'].includes(dispatchStatus)
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-400'
                }`}>
                  <span className="material-symbols-outlined text-[15px]">done_all</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between font-bold">
                    <span className={['sent', 'read', 'accepted', 'declined'].includes(dispatchStatus) ? 'text-slate-900' : 'text-slate-400'}>
                      2. Delivery & Read Receipt
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {['read', 'accepted', 'declined'].includes(dispatchStatus) ? 'Read ✓✓' : ['sent'].includes(dispatchStatus) ? 'Delivered ✓✓' : 'Pending'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {['read', 'accepted', 'declined'].includes(dispatchStatus)
                      ? `Opened by ${targetEmployee.name} on WhatsApp Mobile`
                      : 'Awaiting device handshake'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  dispatchStatus === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                  dispatchStatus === 'declined' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-400'
                }`}>
                  <span className="material-symbols-outlined text-[15px]">
                    {dispatchStatus === 'accepted' ? 'check' : dispatchStatus === 'declined' ? 'close' : 'hourglass_top'}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between font-bold">
                    <span className={dispatchStatus === 'accepted' ? 'text-emerald-700' : dispatchStatus === 'declined' ? 'text-rose-700' : 'text-slate-400'}>
                      3. Employee Response & Roster Update
                    </span>
                    <span className="text-[10px] font-bold">
                      {dispatchStatus === 'accepted' ? 'ACCEPTED' : dispatchStatus === 'declined' ? 'DECLINED' : 'Awaiting Click'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {dispatchStatus === 'accepted'
                      ? `Shift allocated on master schedule. Digital pass #SG-8821 active.`
                      : dispatchStatus === 'declined'
                      ? `Candidate unavailable. Shift remained open.`
                      : `Click "Accept Shift" or "Decline" on the simulated WhatsApp phone on the right to test!`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANE: Simulated Employee WhatsApp Phone (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          {/* Smartphone Frame */}
          <div className="w-full max-w-[380px] bg-slate-900 rounded-[42px] p-3 shadow-2xl ring-1 ring-slate-800">
            {/* Phone Screen Container */}
            <div className="w-full bg-[#efeae2] rounded-[32px] overflow-hidden flex flex-col h-[640px] relative border border-slate-700/50">
              {/* Phone Status Bar */}
              <div className="bg-[#075e54] text-white px-5 pt-2.5 pb-1 flex items-center justify-between text-[11px] font-semibold select-none">
                <span>10:24</span>
                <div className="w-20 h-4 bg-slate-900 rounded-full mx-auto -mt-1"></div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">signal_cellular_4_bar</span>
                  <span className="material-symbols-outlined text-[14px]">wifi</span>
                  <span className="material-symbols-outlined text-[14px]">battery_full</span>
                </div>
              </div>

              {/* WhatsApp Chat Top Header */}
              <div className="bg-[#075e54] text-white px-3 py-2 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="material-symbols-outlined text-[20px] cursor-pointer">arrow_back</span>
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-teal-800 flex items-center justify-center font-bold text-xs border border-teal-600">
                      SG
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full ring-2 ring-[#075e54] flex items-center justify-center text-[8px] text-slate-950 font-black">
                      ✓
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold leading-tight truncate flex items-center gap-1">
                      <span>Sunrise Grand Hotel</span>
                      <span className="material-symbols-outlined text-[13px] text-emerald-300">verified</span>
                    </div>
                    <div className="text-[10px] text-emerald-200 leading-none">
                      {isTyping ? 'typing...' : 'QuickShift Dispatch Bot • online'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-white">
                  <span className="material-symbols-outlined text-[18px] cursor-pointer">videocam</span>
                  <span className="material-symbols-outlined text-[18px] cursor-pointer">call</span>
                  <span className="material-symbols-outlined text-[18px] cursor-pointer">more_vert</span>
                </div>
              </div>

              {/* WhatsApp Messages Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5 text-xs bg-[#e5ddd5]/60 bg-[radial-gradient(#d1c7b8_1px,transparent_1px)] [background-size:16px_16px]">
                {/* Security encryption pill */}
                <div className="p-1.5 px-3 rounded-lg bg-[#ffeecd] border border-[#f5db99] text-[#554b38] text-[10px] text-center max-w-[280px] mx-auto leading-tight shadow-2xs">
                  🔒 Messages are end-to-end encrypted. No one outside of this chat can read them.
                </div>

                {/* Date separator */}
                <div className="text-center">
                  <span className="px-2.5 py-0.5 rounded-md bg-white/80 shadow-2xs text-[10px] uppercase font-bold text-slate-500">
                    TODAY
                  </span>
                </div>

                {chatMessages.length === 0 && (
                  <div className="text-center py-12 px-4">
                    <div className="w-12 h-12 rounded-full bg-white/70 text-slate-400 mx-auto flex items-center justify-center mb-2 shadow-2xs">
                      <span className="material-symbols-outlined text-[24px]">chat</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-600">No shift invitations yet</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Click <strong className="text-emerald-700">"Dispatch WhatsApp Request"</strong> on the manager console to simulate an incoming offer!
                    </p>
                  </div>
                )}

                {chatMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'employee' ? 'items-end' : 'items-start'} animate-in fade-in duration-200`}
                  >
                    <div
                      className={`max-w-[88%] rounded-xl p-2.5 shadow-2xs text-xs relative ${
                        msg.sender === 'employee'
                          ? 'bg-[#dcf8c6] text-slate-900 rounded-tr-none'
                          : 'bg-white text-slate-900 rounded-tl-none'
                      }`}
                    >
                      <div className="whitespace-pre-line leading-relaxed text-[11px] text-slate-800">
                        {msg.text}
                      </div>

                      <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-slate-400">
                        <span>{msg.time}</span>
                        {msg.sender === 'hotel' && (
                          <span className={`material-symbols-outlined text-[13px] ${
                            msg.status === 'read' ? 'text-sky-500' : 'text-slate-400'
                          }`}>
                            done_all
                          </span>
                        )}
                      </div>

                      {/* Interactive WhatsApp Quick Action Buttons inside message card */}
                      {msg.hasInteractiveButtons && dispatchStatus !== 'accepted' && dispatchStatus !== 'declined' && (
                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-col gap-1.5">
                          <button
                            onClick={handleEmployeeAccept}
                            className="w-full py-1.5 px-2 rounded-lg bg-[#25d366] hover:bg-[#1ebd5a] text-white text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-xs transition-transform active:scale-95"
                          >
                            <span>✅</span>
                            <span>Accept Shift (Earn {payInput.split('+')[0]})</span>
                          </button>

                          <button
                            onClick={handleEmployeeDecline}
                            className="w-full py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <span>❌</span>
                            <span>Decline Shift</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full w-fit shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                )}
              </div>

              {/* WhatsApp Bottom Chat Input Bar */}
              <form onSubmit={handleSendCustomReply} className="bg-[#f0f2f5] p-2 flex items-center gap-2 border-t border-slate-200">
                <span className="material-symbols-outlined text-slate-500 text-[20px] cursor-pointer">mood</span>
                <span className="material-symbols-outlined text-slate-500 text-[20px] cursor-pointer">attach_file</span>
                <input
                  type="text"
                  value={customReplyText}
                  onChange={(e) => setCustomReplyText(e.target.value)}
                  placeholder="Type WhatsApp reply..."
                  className="flex-1 text-xs py-1.5 px-3 bg-white rounded-full border border-slate-300 outline-none text-slate-800 placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  className="w-8 h-8 rounded-full bg-[#00a884] text-white flex items-center justify-center shadow-xs hover:bg-[#008f6f] transition-colors shrink-0"
                >
                  <span className="material-symbols-outlined text-[16px]">send</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
