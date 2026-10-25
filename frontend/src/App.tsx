
import { useMemo, useRef, useState } from "react";
import {
  Activity, ArrowDownUp, Bell, CalendarClock, Check,
  ChevronDown, Clock3, FileUp, LayoutDashboard, LogOut,
  Mail, MailCheck, Menu, Plus, Search, Send, Settings, Users, X,
} from "lucide-react";
import Papa from "papaparse";

type Email = {
  id: string;
  email: string;
  subject: string;
  time: string;
  status: "Scheduled" | "Sent" | "Failed";
};

const initialEmails: Email[] = [
  { id: "1", email: "alex@acme.com", subject: "Partnership opportunity", time: "Oct 26, 2026, 10:00 AM", status: "Scheduled" },
  { id: "2", email: "sarah@techco.io", subject: "Following up on our conversation", time: "Oct 26, 2026, 10:02 AM", status: "Scheduled" },
  { id: "3", email: "mike@startup.dev", subject: "A quick introduction", time: "Oct 26, 2026, 10:04 AM", status: "Scheduled" },
  { id: "4", email: "jordan@company.com", subject: "Exploring a partnership", time: "Oct 25, 2026, 9:30 AM", status: "Sent" },
  { id: "5", email: "priya@business.io", subject: "Product demonstration", time: "Oct 25, 2026, 9:32 AM", status: "Sent" },
  { id: "6", email: "tom@agency.co", subject: "Quick question", time: "Oct 25, 2026, 9:34 AM", status: "Failed" },
];

const inputStyle =
  "mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100";

function App() {
  const [tab, setTab] = useState<"Scheduled" | "Sent">("Scheduled");
  const [emails, setEmails] = useState<Email[]>(initialEmails);
  const [query, setQuery] = useState("");
  const [compose, setCompose] = useState(false);
  const [recipients, setRecipients] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [startTime, setStartTime] = useState("");
  const [delay, setDelay] = useState(2);
  const [hourlyLimit, setHourlyLimit] = useState(20);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const visibleEmails = useMemo(
    () =>
      emails.filter((e) => {
        const matchesTab =
          tab === "Scheduled"
            ? e.status === "Scheduled"
            : e.status === "Sent" || e.status === "Failed";
        const term = query.toLowerCase();
        return (
          matchesTab &&
          (e.email.toLowerCase().includes(term) ||
            e.subject.toLowerCase().includes(term))
        );
      }),
    [emails, tab, query]
  );

  const scheduled = emails.filter((e) => e.status === "Scheduled").length;
  const sent = emails.filter((e) => e.status === "Sent").length;
  const failed = emails.filter((e) => e.status === "Failed").length;

  function importCSV(file?: File) {
    if (!file) return;
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: ({ data }) => {
        const found = data
          .map((row) =>
            Object.values(row).find((v) =>
              /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((v || "").trim())
            )
          )
          .filter(Boolean) as string[];
        setRecipients((old) => [...new Set([
          ...old.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean),
          ...found,
        ])].join("\n"));
        setNotice(`${found.length} email addresses detected in the file.`);
      },
      error: () => setNotice("Could not read the file. Please try another CSV."),
    });
  }

  // function scheduleEmails() {
  //   const list = [...new Set(
  //     recipients.split(/[,;\s]+/).map((s) => s.trim()).filter(Boolean)
  //   )];
  //   const invalid = list.filter(
  //     (email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  //   );

  //   if (!list.length || invalid.length || !subject.trim() || !body.trim() || !startTime) {
  //     setNotice("Enter a valid recipient list, subject, body and start time.");
  //     return;
  //   }
  //   if (new Date(startTime).getTime() < Date.now()) {
  //     setNotice("Choose a future start time.");
  //     return;
  //   }

  //   const when = new Date(startTime);
  //   const newEmails = list.map((email, index): Email => ({
  //     id: `${Date.now()}-${index}`,
  //     email,
  //     subject: subject.trim(),
  //     time: new Date(when.getTime() + index * delay * 1000).toLocaleString(),
  //     status: "Scheduled",
  //   }));

  //   setEmails((old) => [...newEmails, ...old]);
  //   setTab("Scheduled");
  //   setCompose(false);
  //   setRecipients("");
  //   setSubject("");
  //   setBody("");
  //   setNotice(
  //     `${newEmails.length} email(s) added to the local demo schedule. No emails have been sent.`
  //   );
  // }
  async function scheduleEmails(){
    const list=[
      ...new Set(
        recipients
          .split(/[,;\s]+/)
          .map((email)=>email.trim())
          .filter(Boolean)
      ),
    ];
    const invalid = list.filter(
      (email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    );
    if(!list.length || invalid.length || !subject.trim() || !body.trim() || !startTime){
      setNotice("Enter valid recipients, subject, body and start time.");
      return;
    }
    if(new Date(startTime).getTime()<=Date.now()){
      setNotice("Choose a future start time.");
      return;
    }
    try{
      setLoading(true);
      setNotice("");
      const response = await fetch(
        "http://localhost:5000/api/emails/schedule",{
          method:"POST",
          headers:{
            "Content-Type":"application/json",
          },
          body:JSON.stringify({
            recipients:list,
            subject:subject.trim(),
            body:body.trim(),
            startTime,
            delay,
            hourlyLimit
          }),
        }
      );
      const result=await response.json();
      if(!response.ok){
        throw new Error(
          result.message || "Failed to schedule Emails."
        );
      }
      const newEmail: Email[]=result.emails.map(
        (email:{
          id:string;
          email:string;
          subject:string;
          scheduleAt:string;
        })=>({
          id:email.id,
          email:email.email,
          subject:email.subject,
          time: new Date(email.scheduleAt).toLocaleString(),
          status:"Scheduled",
        })
      );
      setEmails((previous) => [
        ...newEmails,
        ...previous,
      ]);

      setTab("Scheduled");
      setCompose(false);
      setRecipients("");
      setSubject("");
      setBody("");
      setStartTime("");

      setNotice(
        `${result.count} email(s) accepted by the backend.`
      );
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Could not connect to the backend."
      );
    } finally {
      setLoading(false);
    }
  }

  function simulateSend() {
    setLoading(true);
    window.setTimeout(() => {
      setEmails((old) =>
        old.map((e) =>
          e.status === "Scheduled"
            ? { ...e, status: "Sent", time: new Date().toLocaleString() }
            : e
        )
      );
      setTab("Sent");
      setLoading(false);
      setNotice("Demo only: statuses updated locally. No SMTP delivery occurred.");
    }, 700);
  }

  return (
    <div className="min-h-screen bg-white text-slate-800">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-56 flex-col border-r border-slate-200 bg-white md:flex">
        <div className="flex h-20 items-center gap-3 border-b border-slate-100 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-violet-600 text-white">
            <Send size={19} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">ReachInbox</h1>
            <p className="text-xs text-slate-400">Email workspace</p>
          </div>
        </div>

        <div className="px-4 py-6">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">Workspace</p>
          <button className="flex w-full items-center gap-3 rounded-lg bg-violet-50 px-3 py-3 text-sm font-semibold text-violet-700">
            <LayoutDashboard size={18} /> Email scheduler
          </button>
          <div className="mt-2 space-y-1">
            <button onClick={() => setTab("Scheduled")} className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-slate-600 hover:bg-slate-50">
              <CalendarClock size={18} /> Scheduled
              <span className="ml-auto text-xs text-slate-400">{scheduled}</span>
            </button>
            <button onClick={() => setTab("Sent")} className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-slate-600 hover:bg-slate-50">
              <MailCheck size={18} /> Sent emails
            </button>
          </div>
          <p className="mb-3 mt-8 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">Manage</p>
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-slate-600 hover:bg-slate-50">
            <Users size={18} /> Contacts
          </button>
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-slate-600 hover:bg-slate-50">
            <Activity size={18} /> Activity
          </button>
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-slate-600 hover:bg-slate-50">
            <Settings size={18} /> Settings
          </button>
        </div>

        <div className="mt-auto border-t border-slate-100 p-4">
          <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">D</div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">Demo User</p>
              <p className="truncate text-xs text-slate-400">demo@example.com</p>
            </div>
            <LogOut size={16} className="text-slate-400" />
          </div>
        </div>
      </aside>

      <main className="md:ml-56">
        <header className="sticky top-0 z-[5] flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5 md:px-8">
          <div className="flex items-center gap-3">
            <Menu className="text-slate-500 md:hidden" />
            <div>
              <p className="text-xs text-slate-400">Workspace</p>
              <h2 className="mt-1 text-lg font-bold">Email scheduler</h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button aria-label="Notifications" className="relative rounded-lg border border-slate-200 p-2.5 text-slate-500 hover:bg-slate-50">
              <Bell size={18} />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-violet-500" />
            </button>
            <div className="hidden items-center gap-2 sm:flex">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-800">D</div>
              <div>
                <p className="text-sm font-semibold">Demo User</p>
                <p className="text-xs text-slate-400">Workspace</p>
              </div>
              <ChevronDown size={15} className="text-slate-400" />
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-6xl p-5 md:p-8">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700">
                <Mail size={13} /> Email scheduler
              </div>
              <h1 className="text-2xl font-semibold tracking-tight">Email scheduler</h1>
              <p className="mt-2 text-sm text-slate-500">Create scheduled emails, import recipients, and track their status.</p>
            </div>
            <button onClick={() => { setNotice(""); setCompose(true); }} className="inline-flex items-center justify-center gap-2 rounded-md bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-violet-700">
              <Plus size={18} /> New email
            </button>
          </div>

          {notice && (
            <div role="status" className="mb-5 flex items-start justify-between gap-3 rounded-lg border border-violet-100 bg-violet-50 px-4 py-3 text-sm text-violet-800">
              <span>{notice}</span>
              <button onClick={() => setNotice("")} aria-label="Dismiss"><X size={16} /></button>
            </div>
          )}

          <section className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "All emails", value: emails.length, icon: Mail, color: "bg-violet-50 text-violet-600" },
              { label: "Scheduled", value: scheduled, icon: Clock3, color: "bg-blue-50 text-blue-600" },
              { label: "Sent", value: sent, icon: Check, color: "bg-emerald-50 text-emerald-600" },
              { label: "Failed", value: failed, icon: Activity, color: "bg-rose-50 text-rose-600" },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">{item.label}</span>
                  <span className={`rounded-lg p-2.5 ${item.color}`}><item.icon size={19} /></span>
                </div>
                <p className="mt-4 text-3xl font-bold">{item.value}</p>
                <p className="mt-1 text-xs text-slate-400">Current workspace</p>
              </div>
            ))}
          </section>

          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="border-b border-slate-100 px-5 pt-5 md:px-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold">Email queue</h3>
                  <p className="mt-1 text-sm text-slate-500">Search and review your scheduled and sent messages.</p>
                </div>
                <button onClick={() => setQuery("")} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50">
                  Clear search
                </button>
              </div>
              <div className="mt-5 flex gap-6">
                {(["Scheduled", "Sent"] as const).map((name) => (
                  <button key={name} onClick={() => setTab(name)} className={`border-b-2 pb-3 text-sm font-semibold transition ${tab === name ? "border-violet-600 text-violet-700" : "border-transparent text-slate-400 hover:text-slate-700"}`}>
                    {name === "Scheduled" ? "Scheduled emails" : "Sent emails"}
                    <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs">{name === "Scheduled" ? scheduled : sent + failed}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between md:px-6">
              <div className="relative w-full sm:max-w-sm">
                <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search emails or subjects..." className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500"><ArrowDownUp size={15} /> Sorted by schedule</div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left">
                <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Recipient</th>
                    <th className="px-6 py-4 font-semibold">Subject</th>
                    <th className="px-6 py-4 font-semibold">{tab === "Scheduled" ? "Scheduled time" : "Sent time"}</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan={4} className="p-12 text-center text-sm text-slate-400">Loading emails...</td></tr>
                  ) : visibleEmails.length === 0 ? (
                    <tr><td colSpan={4} className="p-12 text-center">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-md bg-slate-100 text-slate-500"><Mail size={22} /></div>
                      <p className="font-semibold">No emails found</p>
                      <p className="mt-1 text-sm text-slate-400">Try another search or compose a new email.</p>
                    </td></tr>
                  ) : visibleEmails.map((email) => (
                    <tr key={email.id} className="transition hover:bg-slate-50/70">
                      <td className="px-6 py-4 text-sm font-medium text-slate-700">{email.email}</td>
                      <td className="max-w-64 truncate px-6 py-4 text-sm text-slate-600">{email.subject}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-xs text-slate-500">{email.time}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${email.status === "Sent" ? "bg-emerald-50 text-emerald-700" : email.status === "Failed" ? "bg-rose-50 text-rose-700" : "bg-blue-50 text-blue-700"}`}>
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />{email.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 text-xs text-slate-400 md:px-6">
              <span>Showing {visibleEmails.length} email(s)</span>
              <span>Demo data · Not connected to a sending server</span>
            </div>
          </section>

          <div className="mt-4 flex justify-end">
            <button onClick={simulateSend} disabled={loading || scheduled === 0} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">
              Simulate sending (local preview)
            </button>
          </div>
        </div>
      </main>

      {compose && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/30 p-3 sm:p-6" onMouseDown={(e) => { if (e.target === e.currentTarget) setCompose(false); }}>
          <div role="dialog" aria-modal="true" aria-labelledby="compose-title" className="max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5">
              <div>
                <h2 id="compose-title" className="text-lg font-bold">New email</h2>
                <p className="mt-1 text-xs text-slate-500">Add recipients and choose when to send.</p>
              </div>
              <button onClick={() => setCompose(false)} aria-label="Close" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X size={20} /></button>
            </div>

            <div className="space-y-5 p-6">
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label htmlFor="recipients" className="text-sm font-semibold">Recipients</label>
                  <button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-700 hover:text-violet-900"><FileUp size={15} /> Upload CSV</button>
                  <input ref={fileRef} type="file" accept=".csv,.txt,text/csv,text/plain" className="hidden" onChange={(e) => importCSV(e.target.files?.[0])} />
                </div>
                <textarea id="recipients" rows={3} value={recipients} onChange={(e) => setRecipients(e.target.value)} placeholder={"alex@example.com\nsarah@example.com"} className={inputStyle} />
                <p className="mt-1.5 text-xs text-slate-400">Enter one email per line or upload a CSV with an email column.</p>
              </div>

              <div>
                <label htmlFor="subject" className="text-sm font-semibold">Subject</label>
                <input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="A quick introduction..." className={inputStyle} />
              </div>

              <div>
                <label htmlFor="body" className="text-sm font-semibold">Email body</label>
                <textarea id="body" rows={4} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Hi there, I wanted to reach out because..." className={inputStyle} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="start-time" className="text-sm font-semibold">Start time</label>
                  <input id="start-time" type="datetime-local" min={new Date(Date.now() + 60000).toISOString().slice(0, 16)} value={startTime} onChange={(e) => setStartTime(e.target.value)} className={inputStyle} />
                </div>
                <div>
                  <label htmlFor="delay" className="text-sm font-semibold">Delay between emails</label>
                  <div className="relative">
                    <input id="delay" type="number" min={2} max={3600} value={delay} onChange={(e) => setDelay(Math.max(2, Number(e.target.value)))} className={inputStyle} />
                    <span className="absolute right-3 top-4 text-xs text-slate-400">seconds</span>
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="hourly-limit" className="text-sm font-semibold">Hourly sending limit</label>
                  <input id="hourly-limit" type="number" min={1} max={10000} value={hourlyLimit} onChange={(e) => setHourlyLimit(Math.max(1, Number(e.target.value)))} className={inputStyle} />
                  <p className="mt-1.5 text-xs text-slate-400">Maximum emails per sender per hour. Server enforcement is not yet connected.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg border border-amber-100 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                <Clock3 size={17} className="mt-0.5 shrink-0" />
                <p>This is a frontend preview. Scheduled emails stay in memory and will not be sent.</p>
              </div>

              <div className="flex flex-col-reverse justify-end gap-3 border-t border-slate-100 pt-5 sm:flex-row">
                <button onClick={() => setCompose(false)} className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
                <button
                onClick={scheduleEmails}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-violet-600 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
              >
                {loading ? "Scheduling..." : "Schedule emails"}
              </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="pb-6 text-center text-xs text-slate-400 md:ml-60">
        <span>ReachInbox · </span>
        <span>Scheduling backend not connected</span>
      </footer>
    </div>
  );
}

export default App;
