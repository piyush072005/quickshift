import React, { useEffect, useRef, useState } from 'react';
import { API_BASE_URL } from '../../lib/api';
import type { Employee } from '../../types';

interface WhatsAppSimulatorViewProps {
  employees: Employee[];
  onTriggerToast: (msg: string) => void;
  onAutoAddShiftToRoster?: (
    empName: string,
    role: string,
    dept: string,
    dayIndex: number,
    timeRange: string,
    shiftLabel: string
  ) => boolean | void;
}

interface OfferStatus {
  offer_id: string;
  status: 'awaiting_response' | 'accepted' | 'declined';
  employee_name: string;
  role: string;
  department: string;
  date: string;
  time_range: string;
  shift_label: string;
  payout: string;
  note: string;
  recipient_phone: string;
  meta_message_id?: string | null;
  reply_text?: string | null;
}

interface ChatMessage {
  id: string;
  sender: 'hotel' | 'employee' | 'system';
  text: string;
  time: string;
  status?: 'sent' | 'delivered' | 'read';
}

const DEPARTMENTS = ['Housekeeping', 'Front Desk', 'Restaurant', 'Kitchen'];

const localDateString = (date = new Date()) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

const getDayIndex = (date: string): number => {
  if (!date) return -1;
  const parsed = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return -1;
  return (parsed.getDay() + 6) % 7;
};

const formatDate = (date: string) => {
  if (!date) return 'Select a date';
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });
};

const getShiftLabel = (timeRange: string): string => {
  const match = timeRange.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/i);
  if (!match) return 'Day';
  let hour = Number(match[1]);
  const suffix = match[3]?.toUpperCase();
  if (suffix === 'AM' && hour === 12) hour = 0;
  if (suffix === 'PM' && hour !== 12) hour += 12;
  if (hour < 11) return 'Morning';
  if (hour < 16) return 'Day';
  if (hour < 22) return 'Evening';
  return 'Night';
};

const currentTime = () => new Date().toLocaleTimeString('en-IN', {
  hour: '2-digit', minute: '2-digit',
});

export const WhatsAppSimulatorView: React.FC<WhatsAppSimulatorViewProps> = ({
  employees,
  onTriggerToast,
  onAutoAddShiftToRoster,
}) => {
  const [selectedEmpIndex, setSelectedEmpIndex] = useState(0);
  const [roleInput, setRoleInput] = useState('Extra Shift Associate');
  const [deptInput, setDeptInput] = useState('Restaurant');
  const [dateInput, setDateInput] = useState(localDateString());
  const [timeInput, setTimeInput] = useState('16:00 - 22:00');
  const [payInput, setPayInput] = useState('₹1,500 + incentive');
  const [phoneInput, setPhoneInput] = useState('');
  const [customNote, setCustomNote] = useState('Extra staffing required due to a busy service period.');
  const [dispatchStatus, setDispatchStatus] = useState<'idle' | 'transmitting' | 'sent' | 'accepted' | 'declined'>('idle');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [activeOffer, setActiveOffer] = useState<OfferStatus | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const handledOfferIds = useRef(new Set<string>());
  const pollingStopped = useRef(false);

  const safeEmployeeIndex = employees.length > 0
    ? Math.min(selectedEmpIndex, employees.length - 1)
    : 0;
  const employee = employees[safeEmployeeIndex];
  const dayIndex = getDayIndex(dateInput);
  const existingShift = employee?.shifts.find((shift) => shift.dayIndex === dayIndex);
  const isOptimizerRestDay = Boolean(
    existingShift && existingShift.status === 'Unavailability' &&
    existingShift.role === 'Rest day' && existingShift.shiftLabel === 'OFF'
  );
  const shiftAvailable = Boolean(existingShift && (
    existingShift.status === 'Vacant' || isOptimizerRestDay
  ));

  const schedule = (callback: () => void, delay: number) => {
    const timer = setTimeout(callback, delay);
    timers.current.push(timer);
  };

  useEffect(() => () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const resetConversation = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    pollingStopped.current = true;
    setActiveOffer(null);
    setDispatchStatus('idle');
    setChatMessages([]);
    handledOfferIds.current.clear();
  };

  const pollOfferStatus = async (offerId: string, attempt = 0): Promise<void> => {
    if (pollingStopped.current || attempt >= 120) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/whatsapp/offers/${offerId}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Could not check WhatsApp reply status.');
      }

      const offer = data as OfferStatus;
      setActiveOffer(offer);

      if (offer.status === 'awaiting_response') {
        schedule(() => { void pollOfferStatus(offerId, attempt + 1); }, 3000);
        return;
      }

      if (handledOfferIds.current.has(offerId)) return;
      handledOfferIds.current.add(offerId);

      if (offer.status === 'accepted') {
        const result = onAutoAddShiftToRoster?.(
          offer.employee_name,
          offer.role,
          offer.department,
          getDayIndex(offer.date),
          offer.time_range,
          offer.shift_label
        );
        const rosterUpdated = result !== false;
        setDispatchStatus('accepted');
        setChatMessages((previous) => [
          ...previous,
          {
            id: `reply-${offerId}`,
            sender: 'employee',
            text: offer.reply_text || 'ACCEPT',
            time: currentTime(),
          },
          {
            id: `accepted-${offerId}`,
            sender: 'hotel',
            text: rosterUpdated
              ? `Acceptance received from ${offer.employee_name}. The QuickShift roster was updated for ${formatDate(offer.date)}.`
              : 'WhatsApp acceptance was received, but this employee did not have an available roster slot. Review the roster before confirming the shift.',
            time: currentTime(),
            status: 'read',
          },
        ]);
        onTriggerToast(rosterUpdated ? 'Real WhatsApp reply received: ACCEPT. Roster updated.' : 'Real WhatsApp reply received, but the roster slot could not be updated.');
        return;
      }

      setDispatchStatus('declined');
      setChatMessages((previous) => [
        ...previous,
        { id: `reply-${offerId}`, sender: 'employee', text: offer.reply_text || 'DECLINE', time: currentTime() },
        { id: `declined-${offerId}`, sender: 'hotel', text: 'Decline received. The roster was not changed.', time: currentTime(), status: 'read' },
      ]);
      onTriggerToast('Real WhatsApp reply received: DECLINE. Roster unchanged.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to check WhatsApp status.';
      onTriggerToast(message);
      // Keep polling after transient network errors.
      schedule(() => { void pollOfferStatus(offerId, attempt + 1); }, 5000);
    }
  };

  const handleSendOffer = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!employee) {
      onTriggerToast('Add at least one employee to the roster first.');
      return;
    }
    if (!phoneInput.trim() || !roleInput.trim() || !deptInput.trim() || !dateInput || !timeInput.trim() || !payInput.trim()) {
      onTriggerToast('Complete the phone number and all required shift details.');
      return;
    }
    if (getDayIndex(dateInput) < 0 || getDayIndex(dateInput) > 6) {
      onTriggerToast('Select a valid shift date.');
      return;
    }

    resetConversation();
    pollingStopped.current = false;
    setDispatchStatus('transmitting');

    try {
      const response = await fetch(`${API_BASE_URL}/api/whatsapp/send-offer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient_phone: phoneInput.trim(),
          employee_name: employee.name,
          role: roleInput.trim(),
          department: deptInput,
          date: dateInput,
          time_range: timeInput.trim(),
          shift_label: getShiftLabel(timeInput),
          payout: payInput.trim(),
          note: customNote.trim(),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'WhatsApp message could not be sent.');
      }

      const offer = data as OfferStatus;
      setActiveOffer(offer);
      setDispatchStatus('sent');
      setChatMessages([{
        id: offer.offer_id,
        sender: 'hotel',
        text: [
          'QUICKSHIFT — HOTEL SHIFT OFFER',
          '',
          `Hello ${employee.name},`,
          `Role: ${roleInput}`,
          `Department: ${deptInput}`,
          `Date: ${formatDate(dateInput)}`,
          `Time: ${timeInput}`,
          `Payout: ${payInput}`,
          `Manager note: ${customNote || 'No additional instructions.'}`,
          '',
          'Reply ACCEPT to accept this shift, or DECLINE to decline it.',
        ].join('\n'),
        time: currentTime(),
        status: 'sent',
      }]);
      onTriggerToast(`Real WhatsApp offer sent to ${phoneInput}. Waiting for the reply.`);
      schedule(() => { void pollOfferStatus(offer.offer_id); }, 1500);
    } catch (error) {
      setDispatchStatus('idle');
      const message = error instanceof Error ? error.message : 'WhatsApp send failed.';
      onTriggerToast(message);
    }
  };

  const statusText = dispatchStatus === 'idle' ? 'Not sent'
    : dispatchStatus === 'transmitting' ? 'Sending through Meta'
    : dispatchStatus === 'sent' ? 'Waiting for real reply'
    : dispatchStatus === 'accepted' ? 'Accepted'
    : 'Declined';

  return (
    <div className="flex w-full flex-col pb-16">
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="mb-1 flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">WhatsApp Shift Dispatch</h1>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-800">CLOUD API</span>
          </div>
          <p className="text-xs text-slate-500 sm:text-sm">Send a real shift offer to one verified WhatsApp recipient and process ACCEPT or DECLINE replies.</p>
        </div>
        <button type="button" onClick={resetConversation} className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">Reset conversation</button>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <section className="space-y-5 lg:col-span-7">
          <form onSubmit={handleSendOffer} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-4 flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700"><span className="material-symbols-outlined">campaign</span></div>
              <div><h2 className="text-sm font-bold text-slate-900">Manager Dispatch Console</h2><p className="mt-0.5 text-[11px] text-slate-500">This sends an actual WhatsApp message through Meta.</p></div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">Roster employee</label>
                <select value={safeEmployeeIndex} onChange={(event) => setSelectedEmpIndex(Number(event.target.value))} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-900" disabled={dispatchStatus === 'transmitting'}>
                  {employees.map((item, index) => <option key={item.id} value={index}>{item.name} — {item.department}</option>)}
                </select>
                {employee && <p className="mt-1.5 text-[11px] text-slate-500">Selected roster employee: {employee.name}. The phone number below is the actual WhatsApp recipient.</p>}
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">Verified recipient phone number (with country code)</label>
                <input type="tel" required value={phoneInput} onChange={(event) => setPhoneInput(event.target.value)} placeholder="+91XXXXXXXXXX" autoComplete="tel" className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs outline-none focus:border-emerald-500" disabled={dispatchStatus === 'transmitting'} />
                <p className="mt-1 text-[10px] text-slate-500">Use the same number you added to Meta's WhatsApp API Setup as a test recipient. Do not use placeholder numbers.</p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div><label className="mb-1 block text-xs font-bold text-slate-700">Shift role</label><input required value={roleInput} onChange={(event) => setRoleInput(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs outline-none focus:border-emerald-500" disabled={dispatchStatus === 'transmitting'} /></div>
                <div><label className="mb-1 block text-xs font-bold text-slate-700">Department</label><select value={deptInput} onChange={(event) => setDeptInput(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs outline-none" disabled={dispatchStatus === 'transmitting'}>{DEPARTMENTS.map((dept) => <option key={dept}>{dept}</option>)}</select></div>
                <div><label className="mb-1 block text-xs font-bold text-slate-700">Date</label><input type="date" required value={dateInput} onChange={(event) => setDateInput(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs outline-none" disabled={dispatchStatus === 'transmitting'} /></div>
                <div><label className="mb-1 block text-xs font-bold text-slate-700">Time range</label><input required value={timeInput} onChange={(event) => setTimeInput(event.target.value)} placeholder="16:00 - 22:00" className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs outline-none" disabled={dispatchStatus === 'transmitting'} /></div>
                <div className="sm:col-span-2"><label className="mb-1 block text-xs font-bold text-slate-700">Pay and incentives</label><input required value={payInput} onChange={(event) => setPayInput(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs outline-none" disabled={dispatchStatus === 'transmitting'} /></div>
              </div>

              <div><label className="mb-1 block text-xs font-bold text-slate-700">Manager instructions</label><textarea rows={3} value={customNote} onChange={(event) => setCustomNote(event.target.value)} className="w-full resize-y rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs outline-none" disabled={dispatchStatus === 'transmitting'} /></div>

              {existingShift && <div className="rounded-lg border border-slate-200 p-3"><p className="text-xs font-bold text-slate-800">Roster availability for {formatDate(dateInput)}</p><p className={`mt-1 text-[11px] font-semibold ${shiftAvailable ? 'text-emerald-700' : 'text-amber-700'}`}>{shiftAvailable ? 'Vacant or optimizer rest-day slot detected.' : `Current slot: ${existingShift.status}. Check the roster before offering this shift.`}</p></div>}

              <button type="submit" disabled={dispatchStatus === 'transmitting' || !employee} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"><span className="material-symbols-outlined text-lg">{dispatchStatus === 'transmitting' ? 'progress_activity' : 'send'}</span>{dispatchStatus === 'transmitting' ? 'Sending through Meta…' : 'Send real WhatsApp offer'}</button>
            </div>
          </form>

          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-900">Delivery and response status</h3>
            <div className="flex items-start gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><span className="material-symbols-outlined">send</span></div><div className="flex-1"><p className="text-xs font-bold text-slate-800">WhatsApp Cloud API</p><p className="mt-1 text-xs text-slate-500">{activeOffer?.meta_message_id ? `Meta message ID: ${activeOffer.meta_message_id}` : 'A Meta message ID appears here after successful sending.'}</p></div><span className="text-[10px] font-bold text-slate-500">{statusText}</span></div>
            <p className="mt-4 text-[11px] leading-relaxed text-slate-500">The worker must reply <strong>ACCEPT</strong> or <strong>DECLINE</strong> from the real WhatsApp account. The browser polls the backend and reflects the incoming reply. A public HTTPS webhook must be configured in Meta before replies can reach QuickShift.</p>
          </section>
        </section>

        <section className="lg:col-span-5">
          <div className="mx-auto w-full max-w-[380px] rounded-[32px] bg-slate-900 p-3 shadow-2xl">
            <div className="flex h-[610px] flex-col overflow-hidden rounded-[24px] bg-[#efeae2]">
              <div className="flex items-center gap-3 bg-[#075e54] px-4 py-4 text-white"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-800"><span className="material-symbols-outlined">hotel</span></div><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold">QuickShift · Hotel Staffing</p><p className="text-[10px] text-emerald-200">Actual API message preview</p></div><span className="material-symbols-outlined">more_vert</span></div>
              <div className="flex-1 space-y-3 overflow-y-auto p-3">
                <div className="mx-auto max-w-[280px] rounded-lg border border-[#eddfa9] bg-[#fff2c9] p-2 text-center text-[10px] text-slate-600">This panel is a local preview. The real message and reply appear on the recipient's WhatsApp phone.</div>
                <div className="text-center"><span className="rounded-lg bg-white/80 px-3 py-1 text-[10px] text-slate-500">{formatDate(dateInput)}</span></div>
                {chatMessages.length === 0 && <div className="px-5 py-14 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/80 text-slate-400"><span className="material-symbols-outlined text-3xl">chat</span></div><p className="mt-3 text-xs font-bold text-slate-700">No messages yet</p><p className="mt-1 text-[11px] leading-relaxed text-slate-500">Enter your verified test recipient number and send a shift offer.</p></div>}
                {chatMessages.map((message) => <div key={message.id} className={`flex ${message.sender === 'employee' ? 'justify-end' : 'justify-start'}`}><div className={`w-fit max-w-[92%] whitespace-pre-wrap rounded-xl p-3 shadow-sm ${message.sender === 'employee' ? 'rounded-tr-sm bg-[#d9fdd3]' : message.sender === 'system' ? 'bg-amber-50' : 'rounded-tl-sm bg-white'}`}><p className="text-[11px] leading-relaxed text-slate-800">{message.text}</p><div className="mt-2 flex items-center justify-end gap-1"><span className="text-[9px] text-slate-400">{message.time}</span>{message.sender === 'hotel' && <span className="material-symbols-outlined text-[13px] text-slate-400">done_all</span>}</div></div></div>)}
                {dispatchStatus === 'sent' && <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-[10px] leading-relaxed text-emerald-800">Waiting for the actual phone reply. Ask the recipient to reply <strong>ACCEPT</strong> or <strong>DECLINE</strong> in WhatsApp. This panel updates after the webhook records it.</div>}
                {(dispatchStatus === 'accepted' || dispatchStatus === 'declined') && <div className="rounded-lg border border-slate-200 bg-white p-3 text-[10px] text-slate-600">Latest result: <strong>{dispatchStatus.toUpperCase()}</strong></div>}
              </div>
              <div className="border-t border-slate-200 bg-[#f7f5f0] p-3"><div className="rounded-full border border-slate-200 bg-white px-4 py-3 text-[10px] text-slate-400">Reply from the real WhatsApp phone to respond</div></div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
