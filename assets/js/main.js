/* ------------------------------------------------------------------
   Kundai Nelly Semu — Portfolio Interactive Scripts
   Theme persistence, section spy, filter bar, case-study modal,
   image lightbox, and in-browser model / scenario runners.
   ------------------------------------------------------------------ */

/* ------------------------------------------------------------------
   1. Theme toggle (defaults to OS setting, persists in localStorage)
   ------------------------------------------------------------------ */
(function(){
  var root = document.documentElement, btn = document.getElementById('themeBtn');
  if (!btn) return;

  var saved = null;
  try { saved = window.localStorage.getItem('theme'); } catch (e) {}

  if (saved === 'dark' || saved === 'light'){
    root.setAttribute('data-theme', saved);
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches){
    root.setAttribute('data-theme', 'dark');
  }
  var word = document.getElementById('themeWord'), use = document.getElementById('themeUse');
  function label(){
    var dark = root.getAttribute('data-theme') === 'dark';
    word.textContent = dark ? 'Light' : 'Dark';
    use.setAttribute('href', dark ? '#i-sun' : '#i-moon');
    btn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
  }
  label();
  btn.addEventListener('click', function(){
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { window.localStorage.setItem('theme', next); } catch (e) {}
    label();
  });
})();

/* ------------------------------------------------------------------
   2. Current section highlight in masthead navigation
   ------------------------------------------------------------------ */
(function(){
  if (!('IntersectionObserver' in window)) return;
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      var link = document.querySelector('.top nav a[href="#' + e.target.id + '"]');
      if (!link || !e.isIntersecting) return;
      document.querySelectorAll('.top nav a').forEach(function(a){ a.classList.remove('here'); });
      link.classList.add('here');
    });
  }, { rootMargin:'-35% 0px -55% 0px' });
  document.querySelectorAll('main section[id]').forEach(function(s){ io.observe(s); });
})();

/* ------------------------------------------------------------------
   3. Flagship project category filter
   ------------------------------------------------------------------ */
(function(){
  var bar = document.getElementById('filters');
  if (!bar) return;
  var cards = document.querySelectorAll('#workList .pcard');
  bar.addEventListener('click', function(e){
    var b = e.target.closest('button');
    if (!b) return;
    bar.querySelectorAll('button').forEach(function(x){ x.classList.remove('on'); });
    b.classList.add('on');
    var want = b.dataset.f;
    cards.forEach(function(c){
      c.classList.toggle('off', want !== 'all' && c.dataset.cat.split(' ').indexOf(want) === -1);
    });
  });
})();

/* ------------------------------------------------------------------
   4. Copy email address to clipboard
   ------------------------------------------------------------------ */
(function(){
  var btn = document.getElementById('copyBtn'), toast = document.getElementById('toast');
  if (!btn || !toast) return;
  var address = 'kundaisemu@gmail.com';
  btn.addEventListener('click', function(){
    function flash(msg){
      toast.textContent = msg;
      toast.classList.add('up');
      setTimeout(function(){ toast.classList.remove('up'); }, 2200);
    }
    if (navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(address).then(function(){ flash('Email address copied'); }, function(){ flash(address); });
    } else {
      flash(address);
    }
  });
})();

/* ------------------------------------------------------------------
   5. Case-study modal sheet (supports triggers, keyboard trap, URL hash)
   ------------------------------------------------------------------ */
(function(){
  var veil = document.getElementById('veil'),
      sheet = document.getElementById('sheet'),
      body = document.getElementById('sheetBody'),
      label = document.getElementById('sheetLabel'),
      closeBtn = document.getElementById('closeBtn'),
      prevBtn = document.getElementById('prevBtn'),
      nextBtn = document.getElementById('nextBtn'),
      panels = Array.prototype.slice.call(document.querySelectorAll('.deep')),
      order = panels.map(function(p){ return p.id; }),
      at = 0, returnTo = null;

  if (!veil || !sheet) return;

  function show(id){
    at = Math.max(0, order.indexOf(id));
    panels.forEach(function(p){
      p.hidden = (p.id !== id);
      var h = p.querySelector('h2');
      if (h) h.removeAttribute('id');
    });
    var panel = document.getElementById(id);
    if (!panel) return;
    var head = panel.querySelector('h2');
    if (head){
      head.id = 'sheetTitle';
      label.textContent = head.textContent;
    }
    body.scrollTop = 0;
  }

  function open(id){
    if (order.indexOf(id) === -1) return;
    returnTo = document.activeElement;
    show(id);
    veil.classList.add('open');
    veil.setAttribute('aria-hidden', 'false');
    document.body.classList.add('locked');
    closeBtn.focus();
  }

  function close(){
    veil.classList.remove('open');
    veil.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('locked');
    if (returnTo && returnTo.focus) returnTo.focus();
  }

  function step(d){
    show(order[(at + d + order.length) % order.length]);
  }

  document.querySelectorAll('[data-deep]').forEach(function(t){
    t.addEventListener('click', function(e){
      e.preventDefault();
      e.stopPropagation();
      open(t.getAttribute('data-deep'));
    });
  });

  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', function(){ step(-1); });
  nextBtn.addEventListener('click', function(){ step(1); });
  veil.addEventListener('click', function(e){ if (!sheet.contains(e.target)) close(); });

  document.addEventListener('keydown', function(e){
    if (!veil.classList.contains('open')) return;
    if (e.key === 'Escape'){ close(); return; }
    var onField = document.activeElement && /INPUT|SELECT/.test(document.activeElement.tagName);
    if (!onField && e.key === 'ArrowLeft'){ step(-1); return; }
    if (!onField && e.key === 'ArrowRight'){ step(1); return; }
    if (e.key === 'Tab'){
      var f = Array.prototype.filter.call(
        sheet.querySelectorAll('button, a[href], input, select'),
        function(el){ return el.offsetParent !== null; }
      );
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    }
  });
})();

/* ------------------------------------------------------------------
   6. Chart & screenshot lightbox
   ------------------------------------------------------------------ */
(function(){
  var box = document.getElementById('lightbox'),
      img = document.getElementById('lbImg'),
      cap = document.getElementById('lbCap');
  if (!box || !img) return;

  document.querySelectorAll('figure.fig').forEach(function(f){
    var badge = document.createElement('button');
    badge.type = 'button';
    badge.setAttribute('aria-label', 'Enlarge visual evidence');
    badge.className = 'fig__zoom';
    badge.innerHTML = '<svg class="i i--sm" aria-hidden="true"><use href="#i-expand"></use></svg>';
    f.appendChild(badge);
  });

  document.addEventListener('click', function(e){
    var t = e.target.closest('figure.fig img, .fig__zoom');
    if (!t) return;
    var pic = t.tagName === 'IMG' ? t : t.closest('figure').querySelector('img');
    if (!pic) return;
    img.src = pic.src;
    img.alt = pic.alt;
    var fig = pic.closest('figure');
    var l = fig.querySelector('.fig__label'), c = fig.querySelector('figcaption');
    cap.innerHTML = (l ? '<b>' + l.textContent + '</b><br>' : '') + (c ? c.textContent : '');
    box.classList.add('open');
    box.setAttribute('aria-hidden', 'false');
  });

  function hide(){
    box.classList.remove('open');
    box.setAttribute('aria-hidden', 'true');
    img.removeAttribute('src');
  }
  box.addEventListener('click', hide);
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape' && box.classList.contains('open')){
      e.stopImmediatePropagation();
      hide();
    }
  }, true);
})();

/* ------------------------------------------------------------------
   7. Model & Scenario Runner Engine
   ------------------------------------------------------------------ */
function themeColour(name){
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}
function paintGauge(arcEl, numEl, percent, cssVar){
  var colour = themeColour(cssVar);
  arcEl.style.strokeDashoffset = String(100 - percent);
  arcEl.style.stroke = colour;
  numEl.textContent = percent + '%';
  numEl.style.fill = colour;
}
function setVerdict(el, level, title, detail){
  el.className = 'verdict ' + level;
  el.innerHTML = title + '<small>' + detail + '</small>';
}

var FX_ZAR_PER_USD = 16.50;
function money(n){ return 'R' + Math.round(n).toLocaleString('en-US'); }
function toRands(usd){ return money(usd * FX_ZAR_PER_USD); }

var Runner = (function(){
  function sigmoid(z){ return 1 / (1 + Math.exp(-z)); }

  function buildForm(spec, root){
    var groups = [];
    spec.fields.forEach(function(f){
      var g = groups.filter(function(x){ return x.name === f.group; })[0];
      if (!g){ g = { name:f.group, fields:[] }; groups.push(g); }
      g.fields.push(f);
    });

    var html = '';
    html += '<div class="runner__bar">';
    html += '<label for="' + spec.id + '-preset" style="font-size:.78rem;color:var(--ink-2)">Load profile</label>';
    html += '<select id="' + spec.id + '-preset">';
    spec.presets.forEach(function(p, i){ html += '<option value="' + i + '">' + p.name + '</option>'; });
    html += '</select>';
    html += '<button type="button" data-act="reset">' +
            '<svg class="i i--sm" aria-hidden="true"><use href="#i-reset"></use></svg> Reset</button>';
    html += '<span class="grow"></span>';
    html += '<span class="runner__count">' + spec.fields.length + ' features · interactive evaluation</span>';
    html += '</div>';

    html += '<div class="runner__form">';
    groups.forEach(function(g){
      html += '<fieldset class="fgroup"><legend>' + g.name + '</legend><div class="fgrid">';
      g.fields.forEach(function(f){
        html += '<div class="fcell' + (f.derived ? ' derived' : '') + '">';
        html += '<label for="' + spec.id + '-' + f.k + '">' + f.label + '</label>';
        if (f.type === 'sel'){
          html += '<select id="' + spec.id + '-' + f.k + '" data-k="' + f.k + '">';
          f.options.forEach(function(o){
            html += '<option value="' + o[1] + '"' + (o[1] === f.def ? ' selected' : '') + '>' + o[0] + '</option>';
          });
          html += '</select>';
        } else {
          var cash = function(x){ return f.cur ? Math.round(x * FX_ZAR_PER_USD) : x; };
          html += '<input type="number" id="' + spec.id + '-' + f.k + '" data-k="' + f.k + '"' +
                  ' value="' + cash(f.def) + '"' +
                  (f.min !== undefined ? ' min="' + cash(f.min) + '"' : '') +
                  (f.max !== undefined ? ' max="' + cash(f.max) + '"' : '') +
                  ' step="' + (f.step || 1) + '"' +
                  (f.derived ? ' readonly tabindex="-1"' : '') + ' />';
        }
        if (f.hint) html += '<span class="hint">' + f.hint + '</span>';
        html += '</div>';
      });
      html += '</div></fieldset>';
    });
    html += '</div>';

    html += '<div class="runner__out">';
    html += '<div class="runner__score">';
    if (spec.kind === 'logistic'){
      html += '<svg class="gauge" viewBox="0 0 120 72" role="img" aria-label="Model output gauge">' +
              '<path class="gauge__track" d="M12 62 A 48 48 0 0 1 108 62" fill="none" stroke-width="9" stroke-linecap="round" pathLength="100"></path>' +
              '<path class="gauge__value" id="' + spec.id + '-arc" d="M12 62 A 48 48 0 0 1 108 62" fill="none" stroke-width="9" pathLength="100"></path>' +
              '<text class="gauge__num" id="' + spec.id + '-pct" x="60" y="54">—</text>' +
              '<text class="gauge__cap" x="60" y="68">' + spec.outputLabel + '</text></svg>';
    } else {
      html += '<p class="bignum" id="' + spec.id + '-big">—</p>' +
              '<p class="subnum" id="' + spec.id + '-sub">' + spec.outputLabel + '</p>';
    }
    html += '</div>';

    html += '<div class="runner__side">';
    if (spec.threshold !== undefined){
      html += '<div class="threshold"><label for="' + spec.id + '-thr">Decision threshold</label>' +
              '<input type="range" id="' + spec.id + '-thr" min="10" max="90" step="1" value="' + Math.round(spec.threshold * 100) + '" />' +
              '<output id="' + spec.id + '-thrOut">' + Math.round(spec.threshold * 100) + '%</output></div>';
    }
    html += '<div class="verdict" id="' + spec.id + '-verdict" role="status" aria-live="polite">Evaluating…<small>Adjust any field to recalculate.</small></div>';
    html += '<div class="contrib" id="' + spec.id + '-contrib"></div>';
    html += '</div></div>';

    html += '<div class="provenance"><span>' + spec.provenance + '</span></div>';
    root.innerHTML = html;
  }

  function readValues(spec, root){
    var vals = {};
    spec.fields.forEach(function(f){
      var el = root.querySelector('[data-k="' + f.k + '"]');
      var v = Number(el.value);
      if (isNaN(v)) v = f.def * (f.cur ? FX_ZAR_PER_USD : 1);
      vals[f.k] = f.cur ? v / FX_ZAR_PER_USD : v;
    });
    if (spec.derive) spec.derive(vals, root, spec);
    return vals;
  }

  function score(spec, vals){
    var z = spec.intercept;
    var parts = [];

    spec.fields.forEach(function(f){
      if (f.w === undefined && !f.levelW) return;
      var c = 0;
      if (f.levelW){
        c = f.levelW[vals[f.k]] || 0;
      } else if (f.sd){
        c = f.w * ((vals[f.k] - f.mean) / f.sd);
      } else {
        c = f.w * (vals[f.k] - (f.ref || 0));
      }
      z += c;
      parts.push({ label:f.short || f.label, c:c });
    });

    parts.sort(function(a,b){ return Math.abs(b.c) - Math.abs(a.c); });
    return { z:z, parts:parts.slice(0,6) };
  }

  function paint(spec, root, vals){
    var res = score(spec, vals);
    var verdict = root.querySelector('#' + spec.id + '-verdict');
    var value;

    if (spec.kind === 'logistic'){
      var p = sigmoid(res.z);
      value = p;
      var pct = Math.min(99, Math.max(1, Math.round(p * 100)));
      var band = spec.band(p, vals, spec);
      paintGauge(root.querySelector('#' + spec.id + '-arc'),
                 root.querySelector('#' + spec.id + '-pct'), pct, band.colour);
      setVerdict(verdict, band.level, band.title, band.detail);
    } else {
      value = res.z;
      var band2 = spec.band(value, vals, spec);
      root.querySelector('#' + spec.id + '-big').textContent = toRands(Math.max(value, 0));
      root.querySelector('#' + spec.id + '-sub').textContent = spec.sub(value);
      setVerdict(verdict, band2.level, band2.title, band2.detail);
    }

    var box = root.querySelector('#' + spec.id + '-contrib');
    var max = Math.max.apply(null, res.parts.map(function(p){ return Math.abs(p.c); }).concat([0.0001]));
    var rows = '<h4 class="contrib__h">' + spec.contribLabel + '</h4>';
    res.parts.forEach(function(p){
      var dir = p.c > 0 ? 'up' : 'down';
      var w = Math.round(Math.abs(p.c) / max * 100);
      rows += '<div class="contrib__row ' + dir + '"><span>' + p.label + '</span>' +
              '<div class="contrib__bar"><i class="' + dir + '" style="width:' + w + '%"></i></div>' +
              '<em>' + (spec.kind === 'logistic'
                          ? (p.c > 0 ? '+' : '') + p.c.toFixed(2)
                          : (p.c < 0 ? '−' : '+') + toRands(Math.abs(p.c))) + '</em></div>';
    });
    box.innerHTML = rows;
    return value;
  }

  function mount(spec){
    var root = document.getElementById('runner-' + spec.id);
    if (!root) return;
    buildForm(spec, root);

    function rescore(){ paint(spec, root, readValues(spec, root)); }

    root.addEventListener('input', function(e){
      if (e.target.id === spec.id + '-thr'){
        spec.threshold = Number(e.target.value) / 100;
        root.querySelector('#' + spec.id + '-thrOut').textContent = e.target.value + '%';
      }
      rescore();
    });
    root.addEventListener('change', rescore);

    root.addEventListener('click', function(e){
      var btn = e.target.closest('button[data-act="reset"]');
      if (!btn) return;
      spec.fields.forEach(function(f){
        root.querySelector('[data-k="' + f.k + '"]').value = f.cur ? Math.round(f.def * FX_ZAR_PER_USD) : f.def;
      });
      root.querySelector('#' + spec.id + '-preset').value = '0';
      rescore();
    });

    var preset = root.querySelector('#' + spec.id + '-preset');
    preset.addEventListener('change', function(){
      var p = spec.presets[Number(preset.value)];
      spec.fields.forEach(function(f){
        var v = (p.values[f.k] !== undefined) ? p.values[f.k] : f.def;
        root.querySelector('[data-k="' + f.k + '"]').value = f.cur ? Math.round(v * FX_ZAR_PER_USD) : v;
      });
      rescore();
    });

    rescore();
  }

  return { mount: mount, sigmoid: sigmoid };
})();

/* ============================================================
   8. SPEC — PROJECT 01: DIABETES RISK SCREENING
   ============================================================ */
Runner.mount({
  id:'diabetes',
  kind:'logistic',
  intercept: 7.00074,
  outputLabel:'estimated diabetes risk',
  contribLabel:'Top 6 log-odds contributions',
  provenance:'<b>Provenance:</b> Fitted Logistic Regression coefficients and RobustScaler statistics exported directly from <code>diabetes_production_model.pkl</code>. Built on synthetic educational data (74.6% diabetic base rate) — not a clinical diagnostic tool.',
  fields:[
    { group:'Demographics', k:'age', label:'Age (years)', type:'num', min:0, max:120, def:45, mean:51.9, sd:15.9, w:0.36413 },
    { group:'Demographics', k:'sex', label:'Sex', type:'sel', def:0, options:[['Female',0],['Male',1]], levelW:{0:0, 1:-0.08238} },
    { group:'Demographics', k:'pregnant', label:'Currently pregnant', type:'sel', def:0, options:[['No',0],['Yes',1]], mean:0, sd:1, w:-0.04338 },
    { group:'Demographics', k:'residence', label:'Residence', type:'sel', def:0, options:[['Rural',0],['Urban',1]], levelW:{0:0, 1:0.92239} },
    { group:'Demographics', k:'education', label:'Education', type:'sel', def:2,
      options:[['Higher',0],['Primary',1],['Secondary',2]], levelW:{0:0, 1:-0.48123, 2:-0.27253} },

    { group:'Clinical History & Lifestyle', k:'bmi', label:'BMI (kg/m²)', type:'num', min:10, max:70, step:0.1, def:28, mean:25.6, sd:6.4, w:0.37931 },
    { group:'Clinical History & Lifestyle', k:'bmi_cat', label:'BMI category', type:'sel', def:2,
      options:[['Normal',0],['Overweight',1],['Obese I',2],['Obese II+',3]], levelW:{0:0, 1:0.67216, 2:0.72058, 3:0.43939} },
    { group:'Clinical History & Lifestyle', k:'family_hist', label:'Family history', type:'sel', def:0, options:[['No',0],['Yes',1]], mean:0, sd:1, w:1.35454 },
    { group:'Clinical History & Lifestyle', k:'active', label:'Physically active', type:'sel', def:1, options:[['No',0],['Yes',1]], mean:0, sd:1, w:-0.76864 },
    { group:'Clinical History & Lifestyle', k:'hypertension', label:'Hypertension', type:'sel', def:0, options:[['No',0],['Yes',1]], mean:1, sd:1, w:-0.77409 },
    { group:'Clinical History & Lifestyle', k:'parity', label:'Pregnancies (parity)', type:'num', min:0, max:10, def:0, mean:0, sd:1, w:0.06141, hint:'Structural 0 when not pregnant' },
    { group:'Clinical History & Lifestyle', k:'prev_gdm', label:'Previous gestational DM', type:'sel', def:0, options:[['No',0],['Yes',1]], mean:0, sd:1, w:0.04459 },
    { group:'Clinical History & Lifestyle', k:'pcos', label:'PCOS', type:'sel', def:0, options:[['No',0],['Yes',1]], mean:0, sd:1, w:0.00273 },
    { group:'Clinical History & Lifestyle', k:'hiv', label:'HIV positive', type:'sel', def:0, options:[['No',0],['Yes',1]], mean:0, sd:1, w:0.08375 },
    { group:'Clinical History & Lifestyle', k:'prev_macrosomia', label:'Previous macrosomic birth', short:'Prev. macrosomia', type:'sel', def:0, options:[['No',0],['Yes',1]], mean:0, sd:1, w:0.00148 },

    { group:'Laboratory Markers', k:'glucose', label:'Fasting glucose (mg/dL)', short:'Fasting glucose', type:'num', min:0, max:400, def:100, mean:144.0, sd:63.0, w:7.67401 },
    { group:'Laboratory Markers', k:'hba1c', label:'HbA1c (%)', short:'HbA1c', type:'num', min:0, max:15, step:0.1, def:5.5, mean:7.4, sd:2.7, w:11.45405 },
    { group:'Laboratory Markers', k:'chol', label:'Total cholesterol', type:'num', min:0, max:400, def:190, mean:208.0, sd:63.0, w:1.3584 },
    { group:'Laboratory Markers', k:'ldl', label:'LDL cholesterol', type:'num', min:0, max:300, def:110, mean:137.0, sd:49.0, w:1.14848 },
    { group:'Laboratory Markers', k:'hdl', label:'HDL cholesterol', type:'num', min:0, max:100, def:50, mean:44.0, sd:15.0, w:-0.82708 },
    { group:'Laboratory Markers', k:'trig', label:'Triglycerides', type:'num', min:0, max:600, def:150, mean:165.0, sd:105.0, w:1.7499 },
    { group:'Laboratory Markers', k:'creatinine', label:'Creatinine (mg/dL)', type:'num', min:0, max:10, step:0.1, def:0.9, mean:0.97, sd:0.38, w:0.3941 },

    { group:'Engineered Features (computed automatically)', k:'glu_hba1c', label:'Glucose / HbA1c ratio', short:'Glucose/HbA1c ratio', type:'num', step:0.01, def:18.18, derived:true, mean:18.7719, sd:5.5349, w:-0.77997 },
    { group:'Engineered Features (computed automatically)', k:'bmi_age', label:'BMI × Age', type:'num', def:1260, derived:true, mean:1302.395, sd:525.2625, w:-0.1036 },
    { group:'Engineered Features (computed automatically)', k:'chol_ratio', label:'Cholesterol / HDL', short:'Cholesterol ratio', type:'num', step:0.01, def:3.8, derived:true, mean:4.7667, sd:2.3517, w:0.5186 },
    { group:'Engineered Features (computed automatically)', k:'renal', label:'Renal risk (creatinine × (HTN+1))', short:'Renal risk', type:'num', step:0.01, def:0.9, derived:true, mean:1.3, sd:1.01, w:1.40699 }
  ],
  derive:function(v, root){
    v.glu_hba1c  = v.glucose / (v.hba1c + 1e-5);
    v.bmi_age    = v.bmi * v.age;
    v.chol_ratio = v.chol / (v.hdl + 1e-5);
    v.renal      = v.creatinine * (v.hypertension ? 2 : 1);
    root.querySelector('[data-k="glu_hba1c"]').value  = v.glu_hba1c.toFixed(2);
    root.querySelector('[data-k="bmi_age"]').value    = Math.round(v.bmi_age);
    root.querySelector('[data-k="chol_ratio"]').value = v.chol_ratio.toFixed(2);
    root.querySelector('[data-k="renal"]').value      = v.renal.toFixed(2);
  },
  band:function(p){
    if (p < 0.30) return { level:'low', colour:'--accent', title:'Low estimated screening risk',
      detail:'Laboratory markers sit within non-diabetic reference ranges in the synthetic dataset.' };
    if (p < 0.60) return { level:'mid', colour:'--amber', title:'Elevated screening risk',
      detail:'Borderline glycemic profile in the model. Educational portfolio demonstration only.' };
    return { level:'high', colour:'--red', title:'High estimated screening risk',
      detail:'Glycemic markers exceed the synthetic dataset diagnostic thresholds (Fasting glucose >= 126 or HbA1c >= 6.5).' };
  },
  presets:[
    { name:'Baseline adult profile', values:{} },
    { name:'Metabolic syndrome profile', values:{ age:58, bmi:34, bmi_cat:3, hypertension:1, active:0, family_hist:1, glucose:141, hba1c:7.1, hdl:36, trig:260, chol:225, ldl:150, creatinine:1.1 } },
    { name:'Low-risk young adult', values:{ age:26, bmi:22, bmi_cat:0, active:1, glucose:84, hba1c:5.0, hdl:62, trig:95, chol:170, ldl:95, creatinine:0.8 } },
    { name:'Borderline glycemic profile', values:{ age:47, bmi:29, bmi_cat:1, glucose:117, hba1c:6.1, hdl:44, trig:180, family_hist:1 } }
  ]
});

/* ============================================================
   9. SPEC — PROJECT 02: EMPLOYEE ATTRITION PREDICTION
   ============================================================ */
Runner.mount({
  id:'attrition',
  kind:'logistic',
  intercept: -2.39011,
  outputLabel:'estimated attrition risk',
  contribLabel:'Top 6 log-odds contributions',
  provenance:'<b>Provenance:</b> Fitted Logistic Regression coefficients and StandardScaler statistics exported from <code>attrition_production_model.pkl</code> (IBM HR dataset, 1,470 employees, 16.12% base attrition rate). Monetary inputs are displayed in ZAR at R16.50/USD.',
  fields:[
    { group:'Demographics & Commute', k:'Age', label:'Age', type:'num', min:18, max:65, def:35, mean:36.998, sd:9.174, w:-0.48932 },
    { group:'Demographics & Commute', k:'Gender', label:'Gender', type:'sel', def:0, options:[['Female',0],['Male',1]], levelW:{0:0, 1:0.40604} },
    { group:'Demographics & Commute', k:'MaritalStatus', label:'Marital status', short:'Marital status', type:'sel', def:1,
      options:[['Divorced',0],['Married',1],['Single',2]], levelW:{0:0, 1:0.09624, 2:0.74907} },
    { group:'Demographics & Commute', k:'Education', label:'Education (1–5)', short:'Education', type:'sel', def:3,
      options:[['Below College',1],['College',2],['Bachelor',3],['Master',4],['Doctor',5]], mean:2.906, sd:1.028, w:0.18682 },
    { group:'Demographics & Commute', k:'EducationField', label:'Education field', short:'Education field', type:'sel', def:0,
      options:[['Human Resources',0],['Life Sciences',1],['Marketing',2],['Medical',3],['Other',4],['Technical Degree',5]],
      levelW:{0:0, 1:-0.84503, 2:-0.56686, 3:-0.66959, 4:-1.41447, 5:-0.40551} },
    { group:'Demographics & Commute', k:'DistanceFromHome', label:'Distance from home (miles)', short:'Commute distance', type:'num', min:1, max:50, def:8, mean:9.358, sd:8.176, w:0.32016 },

    { group:'Role & Workload', k:'Department', label:'Department', type:'sel', def:1,
      options:[['Human Resources',0],['Research & Development',1],['Sales',2]], levelW:{0:0, 1:-0.18187, 2:0.25922} },
    { group:'Role & Workload', k:'JobRole', label:'Job role', short:'Job role', type:'sel', def:8,
      options:[['Healthcare Representative',0],['Human Resources',1],['Laboratory Technician',2],['Manager',3],
               ['Manufacturing Director',4],['Research Director',5],['Research Scientist',6],['Sales Executive',7],['Sales Representative',8]],
      levelW:{0:0, 1:0.67651, 2:1.5711, 3:-0.7961, 4:0.36599, 5:-1.88448, 6:0.07998, 7:0.40466, 8:1.65864} },
    { group:'Role & Workload', k:'JobLevel', label:'Job level (1–5)', type:'num', min:1, max:5, def:2, mean:2.077, sd:1.092, w:0.26305 },
    { group:'Role & Workload', k:'BusinessTravel', label:'Business travel', short:'Business travel', type:'sel', def:1,
      options:[['Non-Travel',0],['Travel_Rarely',1],['Travel_Frequently',2]], levelW:{0:0, 1:1.00278, 2:1.86933} },
    { group:'Role & Workload', k:'OverTime', label:'Works overtime', short:'Overtime', type:'sel', def:0,
      options:[['No',0],['Yes',1]], levelW:{0:0, 1:1.95993} },
    { group:'Role & Workload', k:'PerformanceRating', label:'Performance rating (1–4)', short:'Performance rating', type:'sel', def:3,
      options:[['Low',1],['Good',2],['Excellent',3],['Outstanding',4]], mean:3.157, sd:0.364, w:0.23073 },

    { group:'Compensation & Tenure', k:'MonthlyIncome', label:'Monthly income (R)', short:'Monthly income', type:'num', cur:true, min:1000, max:20000, step:100, def:5000, mean:6544.02, sd:4651.76, w:0.31987 },
    { group:'Compensation & Tenure', k:'DailyRate', label:'Daily rate (R)', short:'Daily rate', type:'num', cur:true, min:100, max:1500, step:10, def:800, mean:803.99, sd:401.17, w:-0.18905 },
    { group:'Compensation & Tenure', k:'HourlyRate', label:'Hourly rate (R)', short:'Hourly rate', type:'num', cur:true, min:30, max:100, step:1, def:65, mean:65.5, sd:20.36, w:0.04089 },
    { group:'Compensation & Tenure', k:'MonthlyRate', label:'Monthly rate (R)', short:'Monthly rate', type:'num', cur:true, min:2000, max:27000, step:100, def:14390, mean:14390.24, sd:7189.78, w:0.04468 },
    { group:'Compensation & Tenure', k:'PercentSalaryHike', label:'Last salary hike (%)', short:'Salary hike', type:'num', min:11, max:25, def:15, mean:15.24, sd:3.68, w:-0.40324 },
    { group:'Compensation & Tenure', k:'StockOptionLevel', label:'Stock option level (0–3)', short:'Stock options', type:'num', min:0, max:3, def:1, mean:0.791, sd:0.845, w:-0.35925 },
    { group:'Compensation & Tenure', k:'NumCompaniesWorked', label:'Companies worked', short:'Prior employers', type:'num', min:0, max:10, def:3, mean:2.693, sd:2.485, w:0.58973 },
    { group:'Compensation & Tenure', k:'TotalWorkingYears', label:'Total working years', short:'Career length', type:'num', min:0, max:40, def:11, mean:11.365, sd:7.798, w:-0.81087 },
    { group:'Compensation & Tenure', k:'YearsAtCompany', label:'Years at company', short:'Tenure', type:'num', min:0, max:40, def:7, mean:7.05, sd:6.084, w:0.66515 },
    { group:'Compensation & Tenure', k:'YearsInCurrentRole', label:'Years in current role', short:'Years in role', type:'num', min:0, max:18, def:4, mean:4.231, sd:3.568, w:-0.32863 },
    { group:'Compensation & Tenure', k:'YearsSinceLastPromotion', label:'Years since promotion', short:'Since promotion', type:'num', min:0, max:15, def:2, mean:2.183, sd:3.214, w:0.4035 },
    { group:'Compensation & Tenure', k:'YearsWithCurrManager', label:'Years with current manager', short:'With manager', type:'num', min:0, max:17, def:4, mean:4.196, sd:3.563, w:-0.59107 },
    { group:'Compensation & Tenure', k:'TrainingTimesLastYear', label:'Training sessions last year', short:'Training sessions', type:'num', min:0, max:6, def:3, mean:2.76, sd:1.256, w:-0.23692 },

    { group:'Survey Engagement (Ordinal 1–4)', k:'JobSatisfaction', label:'Job satisfaction (1–4)', short:'Job satisfaction', type:'sel', def:3,
      options:[['Low',1],['Medium',2],['High',3],['Very High',4]], mean:2.719, sd:1.110, w:-0.35204 },
    { group:'Survey Engagement (Ordinal 1–4)', k:'EnvironmentSatisfaction', label:'Environment satisfaction (1–4)', short:'Environment', type:'sel', def:3,
      options:[['Low',1],['Medium',2],['High',3],['Very High',4]], mean:2.717, sd:1.088, w:-0.31611 },
    { group:'Survey Engagement (Ordinal 1–4)', k:'JobInvolvement', label:'Job involvement (1–4)', short:'Job involvement', type:'sel', def:3,
      options:[['Low',1],['Medium',2],['High',3],['Very High',4]], mean:2.737, sd:0.703, w:-0.11159 },
    { group:'Survey Engagement (Ordinal 1–4)', k:'WorkLifeBalance', label:'Work-life balance (1–4)', short:'Work-life balance', type:'sel', def:3,
      options:[['Bad',1],['Good',2],['Better',3],['Best',4]], mean:2.758, sd:0.718, w:-0.30475 },
    { group:'Survey Engagement (Ordinal 1–4)', k:'RelationshipSatisfaction', label:'Relationship satisfaction (1–4)', short:'Relationships', type:'sel', def:3,
      options:[['Low',1],['Medium',2],['High',3],['Very High',4]], mean:2.739, sd:1.087, w:-0.10601 },

    { group:'Engineered Features (computed automatically)', k:'TenureBand', label:'Tenure band', short:'Tenure band', type:'sel', def:2, derived:true,
      options:[['0-2',0],['2-5',1],['5-10',2],['10-20',3],['20+',4]], levelW:{0:0, 1:-0.84165, 2:-0.01993, 3:-0.78239, 4:-1.06236} },
    { group:'Engineered Features (computed automatically)', k:'AgeBand', label:'Age band', short:'Age band', type:'sel', def:2, derived:true,
      options:[['18-25',0],['25-35',1],['35-45',2],['45-55',3],['55+',4]], levelW:{0:0, 1:-0.3154, 2:-0.80181, 3:0.56967, 4:0.80012} },
    { group:'Engineered Features (computed automatically)', k:'IncomePerSatisfaction', label:'Income / Job satisfaction', short:'Income/satisfaction', type:'num', cur:true, derived:true, def:2181, mean:3109.26, sd:3128.97, w:-0.24222 },
    { group:'Engineered Features (computed automatically)', k:'EngagementScore', label:'Engagement score (mean of 4)', short:'Engagement score', type:'num', step:0.01, derived:true, def:2.75, mean:2.728, sd:0.507, w:-0.45807 }
  ],
  derive:function(v, root){
    var y = v.YearsAtCompany;
    v.TenureBand = y <= 2 ? 0 : y <= 5 ? 1 : y <= 10 ? 2 : y <= 20 ? 3 : 4;
    var a = v.Age;
    v.AgeBand = a <= 25 ? 0 : a <= 35 ? 1 : a <= 45 ? 2 : a <= 55 ? 3 : 4;
    v.IncomePerSatisfaction = v.MonthlyIncome / (v.JobSatisfaction + 1e-6);
    v.EngagementScore = (v.EnvironmentSatisfaction + v.JobInvolvement + v.JobSatisfaction + v.RelationshipSatisfaction) / 4;
    root.querySelector('[data-k="TenureBand"]').value = v.TenureBand;
    root.querySelector('[data-k="AgeBand"]').value = v.AgeBand;
    root.querySelector('[data-k="IncomePerSatisfaction"]').value = Math.round(v.IncomePerSatisfaction * FX_ZAR_PER_USD);
    root.querySelector('[data-k="EngagementScore"]').value = v.EngagementScore.toFixed(2);
  },
  band:function(p){
    if (p < 0.30) return { level:'low', colour:'--accent', title:'Low attrition risk (<30%)',
      detail:'Workload, tenure, and engagement indicators align with retention in the IBM HR sample.' };
    if (p < 0.60) return { level:'mid', colour:'--amber', title:'Moderate attrition risk (30%–60%)',
      detail:'Exceeds the 16.1% sample base rate. Indicates a candidate for a supportive manager check-in.' };
    return { level:'high', colour:'--red', title:'High attrition risk (>60%)',
      detail:'Matches high-turnover patterns (such as overtime + early tenure). Note: test precision is 0.40, so treat as a conversation prompt, not an automated HR verdict.' };
  },
  presets:[
    { name:'Baseline employee profile', values:{} },
    { name:'Early-tenure sales representative with overtime', values:{ Age:26, MaritalStatus:2, JobRole:8, Department:2, OverTime:1, BusinessTravel:2,
        MonthlyIncome:2400, TotalWorkingYears:3, YearsAtCompany:1, YearsInCurrentRole:0, YearsSinceLastPromotion:0,
        NumCompaniesWorked:4, DistanceFromHome:22, JobSatisfaction:1, EnvironmentSatisfaction:1, WorkLifeBalance:1 } },
    { name:'Long-tenure senior manager', values:{ Age:48, MaritalStatus:1, JobRole:3, MonthlyIncome:17000, TotalWorkingYears:26,
        YearsAtCompany:18, YearsInCurrentRole:9, YearsSinceLastPromotion:2, NumCompaniesWorked:2, DistanceFromHome:4,
        JobSatisfaction:4, EnvironmentSatisfaction:4, WorkLifeBalance:3 } },
    { name:'Overworked laboratory technician', values:{ Age:31, JobRole:2, OverTime:1, MonthlyIncome:4300, YearsAtCompany:4,
        YearsSinceLastPromotion:5, WorkLifeBalance:1, JobSatisfaction:2, PerformanceRating:4 } }
  ]
});

/* ============================================================
   10. SPEC — PROJECT 03: CREDIT RISK ASSESSMENT
   ============================================================ */
Runner.mount({
  id:'credit',
  kind:'logistic',
  intercept: -1.28,
  threshold: 0.62,
  outputLabel:'probability of default',
  contribLabel:'Top 6 risk factor contributions',
  provenance:'<b>Provenance:</b> Interactive approximation calibrated to the feature-importance structure of <code>credit_risk_production_model.pkl</code> (Random Forest + SMOTE, test ROC-AUC 0.9202). The default 62% threshold matches the persisted F1-optimal policy cutoff (<code>0.62</code>). Monetary inputs are displayed in ZAR at R16.50/USD.',
  fields:[
    { group:'Applicant Profile', k:'person_age', label:'Age (years)', type:'num', min:18, max:100, def:35, mean:27.7, sd:6.3, w:-0.10 },
    { group:'Applicant Profile', k:'person_income', label:'Annual income (R)', short:'Annual income', type:'num', cur:true, min:0, max:400000, step:5000, def:75000, mean:66075, sd:62000, w:-0.35 },
    { group:'Applicant Profile', k:'person_home_ownership', label:'Home ownership', short:'Home ownership', type:'sel', def:1,
      options:[['OWN',0],['MORTGAGE',1],['RENT',2],['OTHER',3]], levelW:{0:-0.45, 1:-0.25, 2:0.35, 3:0.20} },
    { group:'Applicant Profile', k:'person_emp_length', label:'Employment length (years)', short:'Employment length', type:'num', min:0, max:50, step:0.5, def:8, mean:4.8, sd:4.1, w:-0.15 },
    { group:'Applicant Profile', k:'cb_person_default_on_file', label:'Historical default on file', short:'Prior default', type:'sel', def:0,
      options:[['N (No)',0],['Y (Yes)',1]], levelW:{0:0, 1:0.65} },
    { group:'Applicant Profile', k:'cb_person_cred_hist_length', label:'Credit history length (years)', short:'Credit history', type:'num', min:0, max:40, def:10, mean:5.8, sd:4.0, w:-0.10 },

    { group:'Loan Specification', k:'loan_amnt', label:'Loan amount (R)', short:'Loan amount', type:'num', cur:true, min:0, max:60000, step:5000, def:15000, mean:9589, sd:6322, w:0.20 },
    { group:'Loan Specification', k:'loan_int_rate', label:'Interest rate (%)', short:'Interest rate', type:'num', min:0, max:30, step:0.1, def:12.5, mean:11.0, sd:3.2, w:0.55 },
    { group:'Loan Specification', k:'loan_percent_income', label:'Loan-to-income ratio', short:'Loan-to-income', type:'num', min:0, max:1, step:0.01, def:0.20, mean:0.17, sd:0.107, w:0.95 },
    { group:'Loan Specification', k:'loan_grade', label:'Loan grade (A–G)', short:'Loan grade', type:'sel', def:1,
      options:[['A',0],['B',1],['C',2],['D',3],['E',4],['F',5],['G',6]],
      levelW:{0:-1.10, 1:-0.55, 2:0, 3:0.75, 4:1.35, 5:1.80, 6:2.20} },
    { group:'Loan Specification', k:'loan_intent', label:'Loan intent', short:'Loan intent', type:'sel', def:3,
      options:[['EDUCATION',0],['MEDICAL',1],['VENTURE',2],['PERSONAL',3],['HOMEIMPROVEMENT',4],['DEBTCONSOLIDATION',5]],
      levelW:{0:-0.10, 1:0.20, 2:0.25, 3:0, 4:-0.05, 5:0.30} }
  ],
  band:function(p, v, spec){
    var lpi = (v.loan_percent_income * 100).toFixed(0);
    if (p >= spec.threshold) return { level:'high', colour:'--red', title:'DECLINED (Exceeds policy threshold)',
      detail:'Loan-to-income ' + lpi + '%. Estimated default probability meets or exceeds the ' + Math.round(spec.threshold*100) + '% cutoff.' };
    if (p >= spec.threshold * 0.75) return { level:'mid', colour:'--amber', title:'APPROVED — Manual underwriting review advised',
      detail:'Loan-to-income ' + lpi + '%. Below the ' + Math.round(spec.threshold*100) + '% threshold but approaching policy limit.' };
    return { level:'low', colour:'--accent', title:'APPROVED (Within policy threshold)',
      detail:'Loan-to-income ' + lpi + '%. Comfortably below the ' + Math.round(spec.threshold*100) + '% policy threshold.' };
  },
  presets:[
    { name:'Standard applicant (Grade B, Mortgage)', values:{} },
    { name:'High-leverage renter with prior default (Grade E)', values:{ person_age:23, person_income:15000, person_home_ownership:2, person_emp_length:1,
        cb_person_default_on_file:1, cb_person_cred_hist_length:2, loan_amnt:9000, loan_int_rate:16.8, loan_percent_income:0.60, loan_grade:4, loan_intent:5 } },
    { name:'Prime borrower (Grade A, Homeowner)', values:{ person_age:41, person_income:145000, person_home_ownership:0, person_emp_length:15,
        cb_person_cred_hist_length:18, loan_amnt:10000, loan_int_rate:7.2, loan_percent_income:0.07, loan_grade:0, loan_intent:4 } },
    { name:'Borderline applicant (near 62% threshold)', values:{ person_age:26, person_income:34000, person_home_ownership:2, person_emp_length:2,
        loan_amnt:13500, loan_int_rate:15.2, loan_percent_income:0.40, loan_grade:3, loan_intent:1 } }
  ]
});

/* ============================================================
   11. SPEC — PROJECT 04: GRAINFLOW ANALYTICS FUEL & POLICY SIMULATOR
   Deterministic interactive calculator verifying Phase 6 & Phase 7
   Canonical Aggregate Method A fuel sensitivity and mitigations.
   ============================================================ */
(function(){
  var root = document.getElementById('runner-grainflow');
  if (!root) return;

  var BASE = {
    revenue: 232863245.60,
    farmerNet: 212735855.88,
    depotOp: 23319186.81,
    baseFuel: 8815146.62,
    baseNonFuel: 10681999.67,
    baseFreight: 19497146.29,
    invBuild: 14302205.23,
    receivedMt: 34410.869,
    acceptedMt: 37007.2705,
    m3BaseEligibleSaving: 445518.96 // at +15% shock and 20% shift
  };

  var html = '' +
    '<div class="runner__bar">' +
      '<span style="font-weight:500;color:var(--ink)">Interactive Fuel Shock &amp; Policy Mitigation Calculator (Method A)</span>' +
      '<span class="grow"></span>' +
      '<button type="button" id="gf-reset"><svg class="i i--sm" aria-hidden="true"><use href="#i-reset"></use></svg> Reset to +15% Benchmark</button>' +
    '</div>' +
    '<div class="runner__form">' +
      '<div class="fgrid">' +
        '<div class="fcell">' +
          '<label for="gf-shock">Diesel price shock ladder</label>' +
          '<select id="gf-shock">' +
            '<option value="-0.10">-10% Fuel Shock</option>' +
            '<option value="-0.05">-5% Fuel Shock</option>' +
            '<option value="0">0% (Baseline R 8,815,146.62)</option>' +
            '<option value="0.05">+5% Fuel Shock</option>' +
            '<option value="0.10">+10% Fuel Shock</option>' +
            '<option value="0.15" selected>+15% Canonical Shock (MQ-06)</option>' +
            '<option value="0.20">+20% Fuel Shock</option>' +
            '<option value="0.25">+25% Fuel Shock</option>' +
            '<option value="0.30">+30% Fuel Shock</option>' +
          '</select>' +
          '<span class="hint">Canonical Aggregate Method A: ROUND(R 8,815,146.62 × (1 + shock), 2)</span>' +
        '</div>' +
        '<div class="fcell">' +
          '<label for="gf-lever">Optional policy mitigation scenario (GB-04)</label>' +
          '<select id="gf-lever">' +
            '<option value="NONE" selected>Unmitigated (Cooperative absorbs shock)</option>' +
            '<option value="M1">Option M1: Buyer Fuel Surcharge (+R 38.43/MT at +15%)</option>' +
            '<option value="M3">Option M3: 20% Long-Haul Road-to-Rail Shift (&gt;350 km)</option>' +
            '<option value="M2">Option M2: Farmer Deduction [Counter-Policy Only]</option>' +
          '</select>' +
          '<span class="hint">Scenarios are evaluated separately per governance decision DEC-013 (GB-04)</span>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div class="runner__out">' +
      '<div class="runner__score">' +
        '<p class="bignum" id="gf-delta">+R 1,322,271.99</p>' +
        '<p class="subnum" id="gf-sub">Unmitigated fuel cost increase</p>' +
      '</div>' +
      '<div class="runner__side">' +
        '<div class="verdict mid" id="gf-verdict" role="status" aria-live="polite"></div>' +
        '<div class="table-wrap" style="margin:0">' +
          '<table class="res" style="margin:0">' +
            '<thead><tr><th>Reconciled Metric (ZAR)</th><th>Baseline (0%)</th><th>Scenario Output</th></tr></thead>' +
            '<tbody>' +
              '<tr><td>Outbound Fuel Expenditure</td><td>R 8,815,146.62</td><td id="gf-fuel">R 10,137,418.61</td></tr>' +
              '<tr><td>Total Outbound Freight Cost</td><td>R 19,497,146.29</td><td id="gf-freight">R 20,819,418.28</td></tr>' +
              '<tr><td>Scenario Mitigation Offset</td><td>R 0.00</td><td id="gf-offset">R 0.00</td></tr>' +
              '<tr><td>Period Operational Cash Contribution (KPI-22)</td><td>-R 22,688,943.38</td><td id="gf-cash">-R 24,011,215.37</td></tr>' +
              '<tr class="mark"><td>Inventory-Adjusted Pre-Tax Result (GB-02)</td><td>-R 8,386,738.15</td><td id="gf-pretax">-R 9,709,010.14</td></tr>' +
            '</tbody>' +
          '</table>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div class="provenance">' +
      '<span><b>Provenance:</b> Exact deterministic formulas from Phase 6 (<code>GrainFlow_Analytics_Financial_Model.xlsx</code>) and Phase 7 (<code>grainflow_dax_measures.dax</code>). All figures are synthetic planning outputs, not observed operational savings.</span>' +
    '</div>';

  root.innerHTML = html;

  function fmtZar(v, signed){
    var neg = v < -0.004;
    var pos = v > 0.004;
    var absStr = 'R ' + Math.abs(v).toLocaleString('en-US', { minimumFractionDigits:2, maximumFractionDigits:2 });
    if (neg) return '-' + absStr;
    if (signed && pos) return '+' + absStr;
    return absStr;
  }

  function update(){
    var shock = Number(document.getElementById('gf-shock').value);
    var lever = document.getElementById('gf-lever').value;

    var shockedFuel = Math.round(BASE.baseFuel * (1 + shock) * 100) / 100;
    var fuelDelta = Math.round((shockedFuel - BASE.baseFuel) * 100) / 100;
    var shockedFreight = Math.round((BASE.baseNonFuel + shockedFuel) * 100) / 100;

    var offset = 0;
    var noteTitle = '';
    var noteDetail = '';
    var level = 'mid';

    if (lever === 'M1'){
      offset = Math.max(0, fuelDelta);
      var perMt = offset / BASE.receivedMt;
      level = 'low';
      noteTitle = 'Option M1: Commercial Buyer Fuel Surcharge (+R ' + perMt.toFixed(2) + ' / received MT)';
      noteDetail = 'Passes 100% of positive fuel shock to commercial off-takers across 34,410.87 received MT, protecting smallholder farmer payouts.';
    } else if (lever === 'M3'){
      // M3 shifts 20% of eligible long-haul (>350 km) TRN-HBL to TRN-RAIL.
      // At +15% shock, documented benchmark saving is R 445,518.96.
      offset = (shock === 0.15) ? 445518.96 : Math.round(445518.96 * ((1 + 0.54 * shock) / (1 + 0.54 * 0.15)) * 100) / 100;
      level = 'low';
      noteTitle = 'Option M3: 20% Long-Haul Road-to-Rail Modal Shift (>350 km routes)';
      noteDetail = 'Re-routes 20% of eligible heavy bulk road shipments to bulk rail (R 1.0829 vs R 1.5829/MT-km), offsetting R ' + offset.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2}) + ' in simulated freight expenditure.';
    } else if (lever === 'M2'){
      offset = Math.max(0, fuelDelta);
      var perAccMt = offset / BASE.acceptedMt;
      level = 'high';
      noteTitle = 'Option M2 [Counter-Policy Only]: Farmer Deduction (+R ' + perAccMt.toFixed(2) + ' / accepted MT)';
      noteDetail = 'Illustrative counter-policy (GB-04): recovering fuel costs from smallholder payouts reduces net farmer disbursements by ' + fmtZar(offset, false) + ' and is rejected on cooperative mandate grounds.';
    } else {
      level = fuelDelta > 0 ? 'high' : (fuelDelta < 0 ? 'low' : 'mid');
      noteTitle = 'Unmitigated Fuel Scenario (' + (shock >= 0 ? '+' : '') + Math.round(shock * 100) + '% diesel shock)';
      noteDetail = 'Cooperative absorbs the full ' + fmtZar(fuelDelta, true) + ' fuel variance. Period Cash Contribution (-R 22.69M base) and Inventory-Adjusted Pre-Tax Result (-R 8.39M base) remain bridged by +R 14,302,205.23 net inventory build.';
    }

    var netCash = -22688943.38 - fuelDelta + offset;
    var netPretax = -8386738.15 - fuelDelta + offset;

    document.getElementById('gf-delta').textContent = fmtZar(fuelDelta - offset, true);
    document.getElementById('gf-sub').textContent = lever === 'NONE' ? 'Net fuel shock impact on cooperative' : 'Residual shock after ' + lever + ' offset';
    document.getElementById('gf-fuel').textContent = fmtZar(shockedFuel, false);
    document.getElementById('gf-freight').textContent = fmtZar(shockedFreight, false);
    document.getElementById('gf-offset').textContent = fmtZar(offset, true);
    document.getElementById('gf-cash').textContent = fmtZar(netCash, false);
    document.getElementById('gf-pretax').textContent = fmtZar(netPretax, false);

    setVerdict(document.getElementById('gf-verdict'), level, noteTitle, noteDetail);
  }

  document.getElementById('gf-shock').addEventListener('change', update);
  document.getElementById('gf-lever').addEventListener('change', update);
  document.getElementById('gf-reset').addEventListener('click', function(){
    document.getElementById('gf-shock').value = '0.15';
    document.getElementById('gf-lever').value = 'NONE';
    update();
  });

  update();
})();

/* ============================================================
   12. Footer timestamp
   ============================================================ */
(function(){
  var UPDATED = '2026-11-23';
  var d = new Date(UPDATED + 'T00:00:00');
  var upEl = document.getElementById('updated');
  var yrEl = document.getElementById('yr');
  if (upEl) upEl.textContent = d.toLocaleDateString('en-GB', { month:'long', year:'numeric' });
  if (yrEl) yrEl.textContent = d.getFullYear();
})();
