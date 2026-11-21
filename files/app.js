const sb = supabase.createClient(CFG.url, CFG.key);
const $ = s => document.querySelector(s), app = $('#app');
let me = null, prof = null, cache = [], flt = 'all';

/* ---------- helpers ---------- */
const P = {
  home:'M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z',
  folder:'M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  bell:'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10 21h4',
  user:'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8',
  plus:'M12 5v14M5 12h14',
  flask:'M9 3h6M10 3v6L4 19a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3l-6-10V3',
  grid:'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
  file:'M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6M8 13h8M8 17h6',
  check:'M5 12l5 5L20 7',
  clock:'M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18',
  upload:'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12',
  search:'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16M21 21l-5-5',
  back:'M15 18l-6-6 6-6', next:'M9 18l6-6-6-6',
  out:'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
  gear:'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z'
};
const ic = n => `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${P[n]}"/></svg>`;
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ST = {not_started:'Not started', pending:'Pending', submitted:'Submitted', approved:'Approved'};
const cap = s => s[0].toUpperCase() + s.slice(1);
const ini = n => n.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
const fmt = d => new Date(d + 'T00:00').toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'});
const fdt = d => new Date(d).toLocaleString('en-US', {month:'short', day:'numeric', year:'numeric', hour:'numeric', minute:'2-digit'});
const ago = d => { const s = (Date.now() - new Date(d)) / 1e3; return s < 60 ? 'now' : s < 3600 ? ~~(s / 60) + 'm ago' : s < 86400 ? ~~(s / 3600) + 'h ago' : ~~(s / 86400) + 'd ago'; };
const sub = s => { s = (s || '').toLowerCase(); return /bio|sci/.test(s) ? ['flask','c-pink'] : /math/.test(s) ? ['grid','c-blue'] : /eng/.test(s) ? ['file','c-green'] : ['file','c-slate']; };
const days = p => { const n = Math.ceil((new Date(p.deadline + 'T00:00') - new Date().setHours(0,0,0,0)) / 864e5); return [n < 0 ? 'Overdue' : n === 0 ? 'Due today' : n + (n === 1 ? ' day left' : ' days left'), n <= 3 ? 'red' : n <= 10 ? 'pur' : 'blue', n]; };
const toast = m => { const t = document.createElement('div'); t.className = 'toast'; t.textContent = m; document.body.append(t); setTimeout(() => t.remove(), 2800); };
const isT = () => prof.role === 'teacher';
const safe = n => n.replace(/[^\w.-]/g, '_');

const navbar = () => {
  const c = location.hash.split('/')[1] || 'home';
  const a = (k, i, l, h) => `<a href="${h}" class="${c === k || (k === 'projects' && c === 'project') ? 'on' : ''}">${ic(i)}<span>${l}</span></a>`;
  return `<nav>${a('home','home','Home','#/home')}${a('projects','folder','Projects','#/projects')}${isT() ? '' : `<a href="#/new" class="fab" aria-label="New project">${ic('plus')}</a>`}${a('updates','bell','Updates','#/updates')}${a('profile','user','Profile','#/profile')}</nav>`;
};
const shell = (t, b, o = {}) => `<header>${o.back ? `<a class="bk" href="${o.back}" aria-label="Back">${ic('back')}</a>` : ''}<h2>${t}</h2></header><main>${b}</main>${o.nonav ? '' : navbar()}`;
const projCard = p => { const [i, c] = sub(p.subject); return `<a class="card row" href="#/project/${p.id}"><div class="ico ${c}">${ic(i)}</div><div class="grow"><b>${esc(p.title)}</b><small>${esc(p.subject)} · ${fmt(p.deadline)}${isT() && p.profiles ? ' · ' + esc(p.profiles.full_name) : ''}</small></div><span class="badge ${p.status}">${ST[p.status]}</span></a>`; };

async function getProjects() {
  const q = sb.from('projects').select('*, profiles(full_name)').order('deadline');
  if (!isT()) q.eq('student_id', me.id);
  const { data, error } = await q; if (error) throw error; return data;
}
async function one(id) {
  const { data, error } = await sb.from('projects').select('*, profiles(full_name)').eq('id', id).single();
  if (error) throw error; return data;
}

/* ---------- auth ---------- */
function authView(reg) {
  app.innerHTML = `<div class="auth"><div class="blob b1"></div><div class="blob b2"></div>
  <div class="logo">${ic('file')}</div><h1>Student Project</h1><p class="sub">Student Project Management System</p><p class="tag">Organize. Submit. Succeed.</p>
  <form onsubmit="return auth(event,${reg})">
    ${reg ? `<label class="inp">${ic('user')}<input name="name" placeholder="Full name" required></label>` : ''}
    <label class="inp">${ic('user')}<input name="email" type="email" placeholder="Email" required></label>
    <label class="inp">${ic('gear')}<input name="password" type="password" placeholder="Password" minlength="6" required></label>
    ${reg ? `<label class="inp"><select name="role"><option value="student">I’m a student</option><option value="teacher">I’m a teacher</option></select></label>` : ''}
    <button class="btn">${reg ? 'Create account' : 'Login'}</button>
  </form>
  ${reg ? '' : '<a class="link" onclick="forgot()">Forgot password?</a>'}
  <div class="or"><span>OR</span></div>
  <a class="btn ghost" href="#/${reg ? '' : 'register'}">${reg ? 'Back to login' : 'Create an account'}</a>
  <p class="foot">For students &amp; teachers</p></div>`;
}
async function auth(e, reg) {
  e.preventDefault(); const f = Object.fromEntries(new FormData(e.target)), b = e.submitter; b.disabled = true;
  const q = reg ? await sb.auth.signUp({ email: f.email, password: f.password, options: { data: { full_name: f.name, role: f.role } } })
                : await sb.auth.signInWithPassword({ email: f.email, password: f.password });
  b.disabled = false;
  if (q.error) return toast(q.error.message);
  if (reg && !q.data.session) { toast('Check your email to confirm your account'); location.hash = '#/'; return; }
  location.hash = '#/home';
}
async function forgot() {
  const email = document.querySelector('[name=email]').value;
  if (!email) return toast('Enter your email first');
  const { error } = await sb.auth.resetPasswordForEmail(email);
  toast(error ? error.message : 'Password reset link sent');
}
async function logout() { await sb.auth.signOut(); prof = null; location.hash = '#/'; }

/* ---------- views ---------- */
const V = {};

V.home = async () => {
  const ps = await getProjects(), n = s => ps.filter(p => p.status === s).length;
  const up = ps.filter(p => p.status !== 'approved').slice(0, 3);
  const { data: nt } = await sb.from('notifications').select('*').eq('user_id', me.id).order('created_at', { ascending: false }).limit(3);
  const h = new Date().getHours(), g = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  return `<main><div class="hi"><div><p>${g},</p><h1>${esc(prof.full_name.split(' ')[0])}</h1><small>${isT() ? 'Your students are waiting for feedback.' : 'Keep going! Your projects matter.'}</small></div><div class="av">${ini(prof.full_name)}</div></div>
  <div class="stats">${[['folder','Projects',ps.length,'c-pur'],['clock','Pending',n('pending'),'c-yel'],['file','Submitted',n('submitted'),'c-blue'],['check','Approved',n('approved'),'c-green']].map(s => `<div class="stat"><div class="ico sm ${s[3]}">${ic(s[0])}</div><b>${s[2]}</b><small>${s[1]}</small></div>`).join('')}</div>
  <div class="sec"><h3>Upcoming deadlines</h3><a href="#/projects">View all</a></div>
  <div class="card list">${up.map(p => { const [i, c] = sub(p.subject), d = days(p); return `<a class="r" href="#/project/${p.id}"><div class="ico sm ${c}">${ic(i)}</div><div class="grow"><b>${esc(p.title)}</b><small>Due: ${fmt(p.deadline)}</small></div><span class="d ${d[1]}">${d[0]}</span></a>`; }).join('') || '<p class="empty">No upcoming deadlines</p>'}</div>
  <div class="sec"><h3>Recent activity</h3></div>
  <div class="card list">${(nt || []).map(x => `<div class="r"><div class="ico sm c-slate">${ic('check')}</div><div class="grow"><b>${esc(x.title)}</b><small>${esc(x.body)}</small></div><small>${ago(x.created_at)}</small></div>`).join('') || '<p class="empty">No activity yet</p>'}</div></main>${navbar()}`;
};

V.projects = async () => {
  cache = await getProjects();
  return shell('My Projects', `<label class="inp">${ic('search')}<input id="q" placeholder="Search projects..." oninput="drawList()"></label>
  <div class="tabs">${['all','pending','submitted','approved'].map(t => `<a class="${t === flt ? 'on' : ''}" onclick="setF('${t}')">${cap(t)}</a>`).join('')}</div><div id="list"></div>`);
};
function setF(t) { flt = t; route(); }
function drawList() {
  const q = ($('#q')?.value || '').toLowerCase();
  const l = cache.filter(p => (flt === 'all' || p.status === flt) && (p.title + p.subject).toLowerCase().includes(q));
  $('#list').innerHTML = l.map(projCard).join('') || '<p class="empty">No projects found</p>';
}

V.project = async id => {
  const p = await one(id), [i, c] = sub(p.subject), t = isT();
  const review = t && p.status === 'submitted' ? `<form class="rev" onsubmit="return review(event,'${p.id}')"><h3>Review</h3>
    <textarea name="comment" placeholder="Teacher’s comments" required></textarea><input name="grade" placeholder="Grade (e.g. A-)" required>
    <label class="drop sm"><input type="file" name="file" hidden onchange="this.nextElementSibling.nextElementSibling.textContent=this.files[0]?.name||'Attach feedback file (optional)'">${ic('upload')}<span>Attach feedback file (optional)</span></label>
    <div class="two"><button class="btn" value="approved">Approve</button><button class="btn ghost" value="pending">Request revision</button></div></form>` : '';
  const btn = t ? '' : p.status === 'approved' ? `<a class="btn fix" href="#/feedback/${p.id}">View feedback</a>` : p.status === 'submitted' ? `<a class="btn fix" href="#/status/${p.id}">View submission status</a>` : `<a class="btn fix" href="#/submit/${p.id}">Submit project</a>`;
  return shell('Project details', `<div class="row" style="padding:0"><div class="ico ${c}">${ic(i)}</div><div><h3>${esc(p.title)}</h3><small>${esc(p.subject)}${t ? ' · ' + esc(p.profiles?.full_name) : ''}</small></div></div>
  <div class="dt">${ic('folder')}<div><small>Deadline</small><b>${fmt(p.deadline)}</b></div></div>
  <div class="dt">${ic('clock')}<div><small>Status</small><span class="badge ${p.status}">${ST[p.status]}</span></div></div>
  <div class="dt">${ic('file')}<div><small>Description</small><p style="font-size:14px;line-height:1.5">${esc(p.description) || 'No description.'}</p></div></div>
  ${p.feedback && p.status === 'pending' ? `<div class="note"><b>Revision requested:</b> ${esc(p.feedback)}</div>` : ''}
  <h3 class="lbl">Files</h3>${p.file_path ? `<a class="file" onclick="dl('${p.file_path}')"><div class="ico sm c-green">${ic('file')}</div><div class="grow"><b>${esc(p.file_name)}</b><small>Submitted ${fdt(p.submitted_at)}</small></div>${ic('upload')}</a>` : `<div class="drop">${ic('upload')}No files uploaded yet</div>`}
  ${review}${btn}`, { back: '#/projects' });
};

V.new = async () => shell('New project', `<form onsubmit="return create(event)">
  <label class="inp"><input name="title" placeholder="Project title" required></label>
  <label class="inp"><input name="subject" placeholder="Subject (e.g. Biology)" required></label>
  <label class="inp"><input name="deadline" type="date" required></label>
  <label class="inp"><select name="status"><option value="not_started">Not started</option><option value="pending">In progress (pending)</option></select></label>
  <textarea name="description" placeholder="Description"></textarea><button class="btn">Create project</button></form>`, { back: '#/projects' });
async function create(e) {
  e.preventDefault(); const f = Object.fromEntries(new FormData(e.target));
  const { data, error } = await sb.from('projects').insert({ ...f, student_id: me.id }).select().single();
  if (error) return toast(error.message);
  toast('Project created'); location.hash = '#/project/' + data.id;
}

V.submit = async id => {
  const p = await one(id), [i, c] = sub(p.subject);
  return shell('Submit project', `<div class="row" style="padding:0"><div class="ico ${c}">${ic(i)}</div><div><h3>${esc(p.title)}</h3><small>${esc(p.subject)}</small></div></div>
  <form onsubmit="return submitP(event,'${id}')"><h3 class="lbl">Upload files</h3>
  <label class="drop"><input type="file" id="fi" hidden required onchange="pick(this)">${ic('upload')}<span>Tap to choose a file (.zip, .pdf, .docx)</span></label>
  <h3 class="lbl">Add a note <small style="display:inline">(optional)</small></h3><textarea name="note" placeholder="e.g. Additional information..."></textarea>
  <button class="btn fix">Submit</button></form>`, { back: '#/project/' + id, nonav: 1 });
};
function pick(i) {
  const f = i.files[0], d = i.parentNode; d.classList.toggle('ok', !!f);
  d.querySelector('span').innerHTML = f ? `<b>${esc(f.name)}</b><br>Ready to submit` : 'Tap to choose a file';
}
async function submitP(e, id) {
  e.preventDefault(); const f = $('#fi').files[0], b = e.submitter;
  if (!f) return toast('Choose a file first');
  if (f.size > 50 * 1048576) return toast('File is larger than 50 MB');
  b.disabled = true; b.textContent = 'Uploading…';
  const path = `${me.id}/${id}/${Date.now()}_${safe(f.name)}`;
  const u = await sb.storage.from('submissions').upload(path, f);
  const r = u.error ? u : await sb.from('projects').update({ status: 'submitted', submitted_at: new Date().toISOString(), note: e.target.note.value, file_path: path, file_name: f.name }).eq('id', id).select().single();
  if (r.error) { b.disabled = false; b.textContent = 'Submit'; return toast(r.error.message); }
  const { data: ts } = await sb.from('profiles').select('id').eq('role', 'teacher');
  await sb.from('notifications').insert([{ user_id: me.id, type: 'submitted', title: 'Project submitted', body: `You submitted your ${r.data.title}.` },
    ...(ts || []).map(t => ({ user_id: t.id, type: 'submitted', title: 'New submission', body: `${prof.full_name} submitted ${r.data.title}.` }))]);
  toast('Project submitted'); location.hash = '#/status/' + id;
}
async function dl(path) {
  const { data, error } = await sb.storage.from('submissions').createSignedUrl(path, 60);
  error ? toast(error.message) : open(data.signedUrl, '_blank');
}

V.status = async id => {
  const p = await one(id), ok = p.status === 'approved';
  const S = [['Submitted', fdt(p.submitted_at), 'done', 'check'], ['Under review', ok ? 'Reviewed by teacher' : 'Waiting for teacher', ok ? 'done' : 'now', ok ? 'check' : 'clock'],
    ['Feedback', ok ? 'Feedback is ready' : 'Will be updated soon', ok ? 'done' : '', ok ? 'check' : 'file'], ['Final status', ok ? 'Approved · Grade ' + esc(p.grade) : 'Will be updated soon', ok ? 'done' : '', ok ? 'check' : 'file']];
  return shell('Submission status', `<div style="margin-top:12px">${S.map(s => `<div class="tl"><div class="dot ${s[2]}">${ic(s[3])}</div><div><b>${s[0]}</b><small>${s[1]}</small></div></div>`).join('')}</div>
  <div class="note">${ok ? 'Your project was approved.' : 'Your project has been submitted. You will be notified once the teacher reviews it.'}</div>
  <a class="btn ghost fix" href="#/feedback/${id}">Preview teacher feedback</a>`, { back: '#/project/' + id, nonav: 1 });
};

V.feedback = async id => {
  const p = await one(id), [i, c] = sub(p.subject);
  const body = p.feedback ? `<h3 class="lbl">Teacher’s comments</h3><div class="ok-box">${esc(p.feedback)}</div>
    <div class="row" style="padding:0"><h3>Grade</h3><div class="grade">${esc(p.grade)}</div></div>
    ${p.feedback_path ? `<h3 class="lbl">Attachments</h3><a class="file" onclick="dl('${p.feedback_path}')"><div class="ico sm c-green">${ic('file')}</div><div class="grow"><b>${esc(p.feedback_file)}</b></div>${ic('upload')}</a>` : ''}`
    : '<p class="empty">No feedback yet. You’ll get a notification when your teacher reviews this project.</p>';
  return shell('Teacher feedback', `<div class="row" style="padding:0"><div class="ico ${c}">${ic(i)}</div><div class="grow"><h3>${esc(p.title)}</h3><small>${esc(p.subject)}</small></div><span class="badge ${p.status}">${ST[p.status]}</span></div>${body}
  <a class="btn fix" href="#/project/${id}">View project</a>`, { back: '#/status/' + id, nonav: 1 });
};
async function review(e, id) {
  e.preventDefault(); const f = e.target, act = e.submitter.value, file = f.file.files[0]; let fp = null;
  if (file) { fp = `feedback/${me.id}/${id}/${Date.now()}_${safe(file.name)}`; const u = await sb.storage.from('submissions').upload(fp, file); if (u.error) return toast(u.error.message); }
  const { data, error } = await sb.from('projects').update({ status: act, feedback: f.comment.value, grade: f.grade.value, feedback_path: fp, feedback_file: file?.name || null }).eq('id', id).select().single();
  if (error) return toast(error.message);
  const ok = act === 'approved';
  await sb.from('notifications').insert([{ user_id: data.student_id, type: ok ? 'approved' : 'feedback', title: ok ? 'Project approved' : 'Revision requested', body: ok ? `Your ${data.title} has been approved.` : `Your ${data.title} needs revisions.` },
    { user_id: data.student_id, type: 'feedback', title: 'New feedback', body: `Your ${data.title} has new feedback.` }]);
  toast(ok ? 'Project approved' : 'Revision requested'); route();
}

V.updates = async () => {
  const { data } = await sb.from('notifications').select('*').eq('user_id', me.id).order('created_at', { ascending: false }).limit(50);
  const rem = isT() ? [] : (await getProjects()).filter(p => ['not_started', 'pending'].includes(p.status) && days(p)[2] <= 3 && days(p)[2] >= 0)
    .map(p => ({ type: 'reminder', title: 'Deadline reminder', body: `Your ${p.title} is due ${days(p)[2] === 0 ? 'today' : 'in ' + days(p)[2] + ' day(s)'}.`, created_at: new Date().toISOString(), read: false }));
  const L = { approved: ['check', 'c-green'], feedback: ['file', 'c-blue'], reminder: ['bell', 'c-red'], submitted: ['check', 'c-blue'], welcome: ['home', 'c-yel'] };
  const all = [...rem, ...(data || [])];
  sb.from('notifications').update({ read: true }).eq('user_id', me.id).eq('read', false).then(() => {});
  return shell('Notifications', `<div style="margin:-16px">${all.map(n => { const l = L[n.type] || L.welcome; return `<div class="n ${n.read ? '' : 'un'}"><div class="ico sm ${l[1]}">${ic(l[0])}</div><div class="grow"><b>${esc(n.title)}</b><small>${esc(n.body)}</small></div><time>${ago(n.created_at)}</time></div>`; }).join('') || '<p class="empty">You’re all caught up</p>'}</div>`);
};

V.profile = async () => shell('Profile', `<div class="av lg">${ini(prof.full_name)}</div><h3 style="text-align:center">${esc(prof.full_name)}</h3><small style="text-align:center">${esc(me.email)}</small>
  <div class="tabs2"><span class="${isT() ? '' : 'on'}">Student</span><span class="${isT() ? 'on' : ''}">Teacher</span></div>
  <div class="card menu">${[['folder', 'My projects', "location.hash='#/projects'"], ['gear', 'Settings', 'editName()'], ['bell', 'Help &amp; support', "toast('Ask your teacher or school admin for help')"], ['file', 'About Student Project', "toast('Student Project Management System v1.0')"]]
    .map(m => `<a class="row r" onclick="${m[2]}">${ic(m[0])}<span>${m[1]}</span>${ic('next')}</a>`).join('')}</div>
  <a class="out" onclick="logout()">${ic('out')} Log out</a>`);
async function editName() {
  const n = prompt('Full name', prof.full_name); if (!n || n === prof.full_name) return;
  const { error } = await sb.from('profiles').update({ full_name: n.trim() }).eq('id', me.id);
  if (error) return toast(error.message); prof.full_name = n.trim(); route();
}

/* ---------- router ---------- */
async function route() {
  const { data: { session } } = await sb.auth.getSession(); me = session?.user || null;
  const [r, id] = (location.hash.slice(2) || '').split('/');
  if (!me) return authView(r === 'register');
  if (!prof) prof = (await sb.from('profiles').select('*').eq('id', me.id).single()).data;
  if (!prof) return toast('Profile not found. Did you run schema.sql?');
  app.innerHTML = '<div class="load">Loading…</div>';
  try { app.innerHTML = await (V[r] || V.home)(id); if (r === 'projects') drawList(); }
  catch (e) { app.innerHTML = shell('Oops', `<p class="empty">${esc(e.message)}</p>`, { back: '#/home' }); }
  scrollTo(0, 0);
}
addEventListener('hashchange', route);
sb.auth.onAuthStateChange(() => setTimeout(route, 0));
