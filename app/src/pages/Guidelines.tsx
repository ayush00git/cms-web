import { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, MailCheck, LogIn, FilePlus, Bell, CheckCircle2, MailQuestion, MousePointerClick, LayoutDashboard, ClipboardList, MessageSquare, Network, UserCheck, Undo2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { MainLayout } from '../components/layout/MainLayout';

type RoleKey = 'employee' | 'warden' | 'centrehead' | 'admin';
type PositionKey = 'xen' | 'ae' | 'je';

// what each admin position can do on a complaint post
const POSITIONS: Record<PositionKey, { label: string; actions: string[] }> = {
  xen: {
    label: 'XEN',
    actions: [
      'Post a comment on the complaint thread.',
      'Approve the complaint — it then moves down to the AE.',
      'Close the complaint. Only the XEN can close one.',
      'When a complaint already passed to the AE comes back up, mark it as completed — or send it back to the AE if something looks off.',
    ],
  },
  ae: {
    label: 'AE',
    actions: [
      'Post a comment on the complaint thread.',
      'Pass the complaint back to the XEN for re-approval if confused about it.',
      'Pass the complaint to a JE — and when multiple JEs work under you, pick whichever JE you want.',
      'When a JE marks the work completed, mark it as passed (if satisfied) so it moves up to the XEN.',
    ],
  },
  je: {
    label: 'JE',
    actions: [
      'Post a comment on the complaint thread.',
      'Mark the complaint as completed once the work is done — a JE cannot close it.',
      'After that, the AE passes it (if satisfied) and finally the XEN marks it as completed — or sends it back down if confused.',
    ],
  },
};

interface RoleInfo {
  label: string;
  description: string;
  signupRoute: string;
  loginRoute: string;
  postRoute: string;
  extraField: string;
}

const ROLES: Record<RoleKey, RoleInfo> = {
  employee: {
    label: 'Employee',
    description: 'Faculty members and non-teaching staff residing in campus quarters.',
    signupRoute: '/faculty/signup',
    loginRoute: '/faculty/login',
    postRoute: '/faculty/posts',
    extraField: 'your department, house number, block and quarter type',
  },
  warden: {
    label: 'Warden',
    description: 'Hostel wardens file complaints on behalf of the students of their hostel — students report issues to their warden, who lodges and tracks them here.',
    signupRoute: '/warden/signup',
    loginRoute: '/warden/login',
    postRoute: '/warden/posts',
    extraField: 'the hostel you are the warden of',
  },
  centrehead: {
    label: 'Centre Head',
    description: 'Centre heads file complaints on behalf of the employees of their department/centre — issues faced at the centre are reported to the head, who lodges and tracks them here.',
    signupRoute: '/centre-head/signup',
    loginRoute: '/centre-head/login',
    postRoute: '/centre-head/posts',
    extraField: 'the building your centre operates from',
  },
  admin: {
    label: 'Admin Staff (XEN / AE / JE)',
    description: 'Construction Cell staff — Executive Engineers, Assistant Engineers and Junior Engineers (Civil / Electrical) — who act on the complaints.',
    signupRoute: '/staff/login',
    loginRoute: '/staff/login',
    postRoute: '/',
    extraField: '',
  },
};

interface Step {
  icon: LucideIcon;
  title: string;
  body: React.ReactNode;
}

export function Guidelines() {
  const [role, setRole] = useState<RoleKey>('employee');
  const [position, setPosition] = useState<PositionKey>('xen');
  const info = ROLES[role];

  const registrationSteps: Step[] = [
    {
      icon: UserPlus,
      title: 'Create your account',
      body: (
        <>
          Go to the{' '}
          <Link to={info.signupRoute} className="font-semibold text-[#16a34a] hover:underline">
            {info.label} signup page
          </Link>{' '}
          and fill in your name, institute email address, a password, your phone number and {info.extraField}.
        </>
      ),
    },
    {
      icon: MailCheck,
      title: 'Verify your email',
      body: (
        <>
          A verification link is mailed to the address you signed up with. Open it and click{' '}
          <span className="font-semibold">Verify Email Address</span>. Until you verify, you cannot log in.
        </>
      ),
    },
    {
      icon: LogIn,
      title: 'Log in',
      body: (
        <>
          Once verified, log in from the{' '}
          <Link to={info.loginRoute} className="font-semibold text-[#16a34a] hover:underline">
            {info.label} login page
          </Link>{' '}
          with your email and password. Forgot it? Use the forgot-password link on the same page to get a reset mail.
        </>
      ),
    },
  ];

  const complaintSteps: Step[] = [
    {
      icon: FilePlus,
      title: 'Lodge the complaint',
      body: (
        <>
          After logging in, open{' '}
          <span className="font-semibold">Lodge a Complaint</span> (or go to your complaints page directly) and describe
          the issue — a clear title, a short description of the problem, and the exact place/room so the staff can locate it.
        </>
      ),
    },
    {
      icon: Bell,
      title: 'Track updates',
      body: (
        <>
          Your complaint is forwarded to the concerned XEN / AE / JE. Every status change or comment on it is
          mailed to you, and you can follow the whole thread from your{' '}
          <span className="font-semibold">Profile</span> page at any time.
        </>
      ),
    },
    {
      icon: MessageSquare,
      title: 'Ask queries via comments',
      body: (
        <>
          You can comment on your complaint anytime to ask a query. Depending on the stage your complaint is at,
          the concerned staff (XEN / AE / JE) receive a notification for it and can reply on the same thread.
        </>
      ),
    },
    {
      icon: CheckCircle2,
      title: 'Resolution',
      body: (
        <>
          When the work is done the complaint is marked resolved. If the issue persists, comment on the same
          complaint thread instead of filing a duplicate — it keeps the history in one place.
        </>
      ),
    },
  ];

  // admin accounts are pre-registered and log in passwordless via email link
  const adminLoginSteps: Step[] = [
    {
      icon: MailQuestion,
      title: 'Request a login link',
      body: (
        <>
          Admin accounts are pre-registered by the Construction Cell — there is no signup and no password.
          Open the{' '}
          <Link to="/staff/login" className="font-semibold text-[#16a34a] hover:underline">
            Staff Login page
          </Link>
          , enter your official email address and click <span className="font-semibold">Mail me a login link</span>.
        </>
      ),
    },
    {
      icon: MousePointerClick,
      title: 'Log in from your inbox',
      body: (
        <>
          Check your inbox for the login mail and click <span className="font-semibold">Log In</span> — you land on a
          confirmation page; one click there logs you in and takes you straight to your dashboard. The link expires,
          so request a fresh one if it stops working.
        </>
      ),
    },
    {
      icon: LayoutDashboard,
      title: 'Your dashboard',
      body: (
        <>
          Depending on your position you get the XEN, AE or JE dashboard, listing the complaints relevant to you.
          You stay logged in on this browser, and can log out any time from the top bar.
        </>
      ),
    },
  ];

  const adminHandlingSteps: Step[] = [
    {
      icon: ClipboardList,
      title: 'Review and update status',
      body: (
        <>
          Open a complaint to see its full details and history. Move it through its stages as work progresses —
          every status change is mailed automatically to the complainant, so keep the status honest and current.
        </>
      ),
    },
    {
      icon: MessageSquare,
      title: 'Communicate on the thread',
      body: (
        <>
          Use comments on the complaint thread to ask for clarifications or record what was done. Everyone involved
          in the thread is notified by email, keeping the whole conversation in one place.
        </>
      ),
    },
    {
      icon: CheckCircle2,
      title: 'Close it out',
      body: (
        <>
          Once the work is verified, mark the complaint resolved. If the complainant reports the issue again on the
          same thread, it comes back to you with the full context attached.
        </>
      ),
    },
  ];

  // the chain of command XEN → AE → JE that the site enforces
  const adminHierarchySteps: Step[] = [
    {
      icon: Network,
      title: 'XEN → AE',
      body: (
        <>
          Complaints approved by the <span className="font-semibold">XEN</span> move down to the{' '}
          <span className="font-semibold">AE</span>. Only the AE has the authority to pass a complaint onward —
          or to send it back up to the XEN with queries.
        </>
      ),
    },
    {
      icon: UserCheck,
      title: 'AE → JE',
      body: (
        <>
          The AE assigns the complaint to a <span className="font-semibold">JE</span> for execution. When multiple
          JEs work under an AE, the AE selects which JE the complaint goes to.
        </>
      ),
    },
    {
      icon: Undo2,
      title: 'Reporting goes back up the same chain',
      body: (
        <>
          JEs report to AEs, and AEs report to XENs. A JE cannot convey queries about a post directly to the XEN,
          even though all three are present on the same conversation thread — queries travel through the AE.
          This order is mandatory and the site follows it.
        </>
      ),
    },
  ];

  const renderSteps = (steps: Step[]) => (
    <ol className="space-y-4">
      {steps.map((step, i) => (
        <li key={step.title} className="flex gap-4 bg-white border border-[#E5E5E5] rounded-lg p-5">
          <div className="shrink-0 w-10 h-10 rounded-full bg-[#E6F7ED] border border-[#bbf0d0] flex items-center justify-center">
            <step.icon className="w-5 h-5 text-[#16a34a]" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#111111]">
              <span className="text-[#999999] mr-1.5">Step {i + 1}.</span>
              {step.title}
            </p>
            <p className="text-sm text-[#666666] mt-1 leading-relaxed">{step.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );

  return (
    <MainLayout>
      <div className="flex-grow flex flex-col">

        {/* Header strip */}
        <div className="border-b border-[#E5E5E5] py-5">
          <div className="max-w-6xl mx-auto w-full px-4 sm:px-8">
            <h1 className="text-xl font-bold text-[#111111]">Guidelines</h1>
            <p className="text-sm text-[#666666] mt-0.5">
              How to register and lodge a complaint on the Construction Cell CMS.
            </p>
          </div>
        </div>

        <div className="flex-grow px-4 sm:px-8 py-8 sm:py-10">
          <div className="max-w-3xl mx-auto w-full space-y-8">

            {/* Role selector */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#666666] mb-3">I am a…</h2>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(ROLES) as RoleKey[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => setRole(key)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors cursor-pointer ${
                      role === key
                        ? 'bg-[#111111] border-[#111111] text-white'
                        : 'bg-white border-[#CCCCCC] text-[#111111] hover:bg-[#F5F5F5]'
                    }`}
                  >
                    {ROLES[key].label}
                  </button>
                ))}
              </div>
              <p className="text-sm text-[#666666] mt-3">{info.description}</p>

              {/* Position branch — only for admin staff */}
              {role === 'admin' && (
                <div className="mt-4 pl-4 border-l-2 border-[#E5E5E5]">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#666666] mb-3">Which one…</h3>
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(POSITIONS) as PositionKey[]).map((key) => (
                      <button
                        key={key}
                        onClick={() => setPosition(key)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors cursor-pointer ${
                          position === key
                            ? 'bg-[#16a34a] border-[#16a34a] text-white'
                            : 'bg-white border-[#CCCCCC] text-[#111111] hover:bg-[#F5F5F5]'
                        }`}
                      >
                        {POSITIONS[key].label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-[#E5E5E5]" />

            {role === 'admin' ? (
              <>
                {/* Per-position powers */}
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-[#666666] mb-4">
                    1 — What a {POSITIONS[position].label} can do on a complaint
                  </h2>
                  <div className="bg-white border border-[#E5E5E5] rounded-lg p-5">
                    <ul className="space-y-3">
                      {POSITIONS[position].actions.map((action) => (
                        <li key={action} className="flex gap-3 text-sm text-[#666666] leading-relaxed">
                          <CheckCircle2 className="w-4 h-4 text-[#16a34a] shrink-0 mt-0.5" />
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Passwordless login */}
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-[#666666] mb-4">
                    2 — Logging in (passwordless)
                  </h2>
                  {renderSteps(adminLoginSteps)}
                </div>

                {/* Handling complaints */}
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-[#666666] mb-4">
                    3 — Handling complaints
                  </h2>
                  {renderSteps(adminHandlingSteps)}
                </div>

                {/* Hierarchy */}
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-[#666666] mb-4">
                    4 — Hierarchy (XEN → AE → JE)
                  </h2>
                  {renderSteps(adminHierarchySteps)}
                </div>
              </>
            ) : (
              <>
                {/* Registration */}
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-[#666666] mb-4">
                    1 — Registering as {info.label}
                  </h2>
                  {renderSteps(registrationSteps)}
                </div>

                {/* Posting a complaint */}
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-[#666666] mb-4">
                    2 — Posting a complaint
                  </h2>
                  {renderSteps(complaintSteps)}
                </div>
              </>
            )}

            {/* Help */}
            <div className="bg-[#F9F9F9] border border-[#E5E5E5] rounded-lg p-5">
              <p className="text-sm text-[#666666]">
                Stuck somewhere? Write to{' '}
                <a href="mailto:admin.cccms@nith.ac.in" className="font-semibold text-[#111111] hover:underline">
                  admin.cccms@nith.ac.in
                </a>{' '}
                and the Construction Cell will help you out.
              </p>
            </div>

          </div>
        </div>

      </div>
    </MainLayout>
  );
}
