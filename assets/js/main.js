/* ------------------------------------------------------------------
   1. theme. defaults to the OS setting, click to override.
   ------------------------------------------------------------------ */
(function(){
  var root = document.documentElement, btn = document.getElementById('themeBtn');

  // A previous choice wins; otherwise follow the operating system. Storage is
  // wrapped because it throws outright in some privacy modes and in sandboxed frames.
  var saved = null;
  try { saved = window.localStorage.getItem('theme'); } catch (e) {}

  if (saved === 'dark' || saved === 'light'){
    root.setAttribute('data-theme', saved);
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches){
    root.setAttribute('data-theme','dark');
  }
  var word = document.getElementById('themeWord'), use = document.getElementById('themeUse');
  function label(){
    var dark = root.getAttribute('data-theme') === 'dark';
    word.textContent = dark ? 'light' : 'dark';
    use.setAttribute('href', dark ? '#i-sun' : '#i-moon');
    btn.setAttribute('aria-label', dark ? 'Switch to the light theme' : 'Switch to the dark theme');
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
   2. masthead rule appears once you leave the top of the page
   ------------------------------------------------------------------ */
(function(){
  var bar = document.getElementById('top');
  function f(){ bar.classList.toggle('pinned', window.scrollY > 8); }
  f(); window.addEventListener('scroll', f, { passive:true });
})();

/* ------------------------------------------------------------------
   3. current section in the nav
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
  }, { rootMargin:'-40% 0px -55% 0px' });
  document.querySelectorAll('main section[id]').forEach(function(s){ io.observe(s); });
})();

/* ------------------------------------------------------------------
   4. project filters
   ------------------------------------------------------------------ */
(function(){
  var bar = document.getElementById('filters');
  var rows = document.querySelectorAll('#workList .work__row');
  bar.addEventListener('click', function(e){
    var b = e.target.closest('button'); if (!b) return;
    bar.querySelectorAll('button').forEach(function(x){ x.classList.remove('on'); });
    b.classList.add('on');
    var want = b.dataset.f;
    rows.forEach(function(r){
      r.classList.toggle('off', want !== 'all' && r.dataset.cat.split(' ').indexOf(want) === -1);
    });
  });
})();

/* ------------------------------------------------------------------
   5. copy the address
   ------------------------------------------------------------------ */
(function(){
  var btn = document.getElementById('copyBtn'), toast = document.getElementById('toast');
  var address = 'kundaisemu@gmail.com';
  btn.addEventListener('click', function(){
    function flash(msg){
      toast.textContent = msg; toast.classList.add('up');
      setTimeout(function(){ toast.classList.remove('up'); }, 2000);
    }
    if (navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(address).then(function(){ flash('Copied'); }, function(){ flash(address); });
    } else { flash(address); }
  });
})();

/* ------------------------------------------------------------------
   6. deep dive sheet: one overlay, six panels, arrows to page through
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

  function show(id){
    at = Math.max(0, order.indexOf(id));
    panels.forEach(function(p){
      p.hidden = (p.id !== id);
      var h = p.querySelector('h2'); if (h) h.removeAttribute('id');
    });
    var panel = document.getElementById(id), head = panel.querySelector('h2');
    if (head){ head.id = 'sheetTitle'; label.textContent = head.textContent; }
    body.scrollTop = 0;
  }
  function open(id){
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
  function step(d){ show(order[(at + d + order.length) % order.length]); }

  document.querySelectorAll('[data-deep]').forEach(function(t){
    t.addEventListener('click', function(e){ e.stopPropagation(); open(t.getAttribute('data-deep')); });
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
        function(el){ return el.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    }
  });
})();

/* ------------------------------------------------------------------
   7. click a chart to enlarge it
   ------------------------------------------------------------------ */
(function(){
  var box = document.getElementById('lightbox'),
      img = document.getElementById('lbImg'),
      cap = document.getElementById('lbCap');

  // every chart gets a corner affordance so the zoom is discoverable
  document.querySelectorAll('figure.fig').forEach(function(f){
    var badge = document.createElement('button');
    badge.type = 'button';
    badge.setAttribute('aria-label', 'Enlarge chart');
    badge.className = 'fig__zoom';
    badge.innerHTML = '<svg class="i i--sm" aria-hidden="true"><use href="#i-expand"></use></svg>';
    f.appendChild(badge);
  });

  document.addEventListener('click', function(e){
    var t = e.target.closest('figure.fig img, .fig__zoom');
    if (!t) return;
    var pic = t.tagName === 'IMG' ? t : t.closest('figure').querySelector('img');
    if (!pic) return;
    img.src = pic.src; img.alt = pic.alt;
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
    if (e.key === 'Escape' && box.classList.contains('open')){ e.stopImmediatePropagation(); hide(); }
  }, true);
})();

/* ------------------------------------------------------------------
   8. the model runners
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
/* --------------------------------------------------------------
   Currency
   The source datasets (IBM HR, Telco, King County) are recorded in
   US dollars. Every money value on this page is converted to Rands
   at the rate below and the models keep working in their training
   units internally, so the maths is untouched. One constant to edit
   when the rate moves.
   -------------------------------------------------------------- */
var FX_ZAR_PER_USD = 16.50;

function money(n){ return 'R' + Math.round(n).toLocaleString('en-US'); }
function toRands(usd){ return money(usd * FX_ZAR_PER_USD); }
function clamp(v, lo, hi){ return Math.max(lo, Math.min(hi, v)); }

/* ============================================================
   8. MODEL RUNNER ENGINE
   Every demo below runs the *whole* feature set in the browser.

   How the scoring works
   ---------------------
   A fitted scikit-learn logistic regression is nothing more than
   a dot product on standardised inputs:

       z = intercept + Σ wᵢ · (xᵢ − meanᵢ) / sdᵢ
       p = 1 / (1 + e^−z)

   So a model can be moved into JavaScript exactly by exporting three
   things: the coefficients, the intercept, and the scaler statistics.
   Each spec below carries those numbers, and `export_models.py`
   regenerates them from the pickled pipelines — paste its output over
   the WEIGHTS block and this page runs the trained model itself, not
   an approximation. Linear regression is the same minus the sigmoid.
   ============================================================ */
var Runner = (function(){

  function sigmoid(z){ return 1 / (1 + Math.exp(-z)); }

  /* ---------- form construction ---------- */
  function buildForm(spec, root){
    var groups = [];
    spec.fields.forEach(function(f){
      var g = groups.filter(function(x){ return x.name === f.group; })[0];
      if (!g){ g = { name:f.group, fields:[] }; groups.push(g); }
      g.fields.push(f);
    });

    var html = '';

    // Toolbar: presets, reset, feature count
    html += '<div class="runner__bar">';
    html += '<label for="' + spec.id + '-preset" style="font-size:.78rem;color:var(--ink-2)">Load a profile</label>';
    html += '<select id="' + spec.id + '-preset">';
    spec.presets.forEach(function(p, i){ html += '<option value="' + i + '">' + p.name + '</option>'; });
    html += '</select>';
    html += '<button type="button" data-act="reset">' +
            '<svg class="i i--sm" aria-hidden="true"><use href="#i-reset"></use></svg> reset</button>';
    html += '<span class="grow"></span>';
    html += '<span class="runner__count">' + spec.fields.length + ' features · live scoring</span>';
    html += '</div>';

    // Fields
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
          // Money fields are entered in Rands; everything else keeps its own units
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

    // Result panel
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
      html += '<div class="threshold"><label for="' + spec.id + '-thr">Decline threshold</label>' +
              '<input type="range" id="' + spec.id + '-thr" min="10" max="90" step="1" value="' + Math.round(spec.threshold * 100) + '" />' +
              '<output id="' + spec.id + '-thrOut">' + Math.round(spec.threshold * 100) + '%</output></div>';
    }
    html += '<div class="verdict" id="' + spec.id + '-verdict" role="status" aria-live="polite">Scoring…<small>Change any field to rescore.</small></div>';
    html += '<div class="contrib" id="' + spec.id + '-contrib"></div>';
    html += '</div></div>';

    html += '<div class="provenance"><span>' + spec.provenance + '</span></div>';

    root.innerHTML = html;
  }

  /* ---------- read the form ---------- */
  function readValues(spec, root){
    var vals = {};
    spec.fields.forEach(function(f){
      var el = root.querySelector('[data-k="' + f.k + '"]');
      var v = Number(el.value);
      if (isNaN(v)) v = f.def * (f.cur ? FX_ZAR_PER_USD : 1);
      vals[f.k] = f.cur ? v / FX_ZAR_PER_USD : v;   // back to training units before scoring
    });
    if (spec.derive) spec.derive(vals, root, spec);
    return vals;
  }

  /* ---------- score ---------- */
  function score(spec, vals){
    var z = spec.intercept;
    var parts = [];

    spec.fields.forEach(function(f){
      if (f.w === undefined && !f.levelW) return;
      var c = 0;
      if (f.levelW){
        c = f.levelW[vals[f.k]] || 0;                       // one-hot style level effect
      } else if (f.sd){
        c = f.w * ((vals[f.k] - f.mean) / f.sd);            // standardised numeric
      } else {
        c = f.w * (vals[f.k] - (f.ref || 0));               // raw term, centred on a reference value
      }
      z += c;
      parts.push({ label:f.short || f.label, c:c });
    });

    parts.sort(function(a,b){ return Math.abs(b.c) - Math.abs(a.c); });
    return { z:z, parts:parts.slice(0,6) };
  }

  /* ---------- paint ---------- */
  function paint(spec, root, vals){
    var res = score(spec, vals);
    var verdict = root.querySelector('#' + spec.id + '-verdict');
    var value;

    if (spec.kind === 'logistic'){
      var p = sigmoid(res.z);
      value = p;
      var pct = Math.min(99, Math.max(1, Math.round(p * 100)));   // no model is ever 0% or 100% sure
      var band = spec.band(p, vals, spec);
      paintGauge(root.querySelector('#' + spec.id + '-arc'),
                 root.querySelector('#' + spec.id + '-pct'), pct, band.colour);
      setVerdict(verdict, band.level, band.title, band.detail);
    } else {
      value = res.z;                                        // z already includes the intercept
      var band2 = spec.band(value, vals, spec);
      root.querySelector('#' + spec.id + '-big').textContent = toRands(Math.max(value, 0));
      root.querySelector('#' + spec.id + '-sub').textContent = spec.sub(value);
      setVerdict(verdict, band2.level, band2.title, band2.detail);
    }

    // Contribution bars — the model explaining itself
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

  /* ---------- wire up ---------- */
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
   9. SPEC — DIABETES SCREENING (22 real inputs + 4 engineered)
   Real coefficients + RobustScaler stats, extracted from
   diabetes_production_model.pkl with joblib.
   ============================================================ */
Runner.mount({
  id:'diabetes',
  kind:'logistic',
  intercept: 7.00074,
  outputLabel:'estimated diabetes risk',
  contribLabel:'log-odds contribution, top 6',
  provenance:'<b>These are the real fitted Logistic Regression coefficients and RobustScaler statistics from '
    + '<code>diabetes_production_model.pkl</code></b>, extracted directly with joblib — not an approximation. '
    + 'The large positive intercept reflects the real base rate: 74.6% of this dataset is diabetic, the majority class.',
  fields:[
    { group:'demographics', k:'age', label:'Age (years)', type:'num', min:0, max:120, def:45, mean:51.9, sd:15.9, w:0.36413 },
    { group:'demographics', k:'sex', label:'Sex', type:'sel', def:0, options:[['Female',0],['Male',1]], levelW:{0:0, 1:-0.08238} },
    { group:'demographics', k:'pregnant', label:'Currently pregnant', type:'sel', def:0, options:[['No',0],['Yes',1]], mean:0, sd:1, w:-0.04338 },
    { group:'demographics', k:'residence', label:'Residence', type:'sel', def:0, options:[['Rural',0],['Urban',1]], levelW:{0:0, 1:0.92239} },
    { group:'demographics', k:'education', label:'Education', type:'sel', def:2,
      options:[['Higher',0],['Primary',1],['Secondary',2]], levelW:{0:0, 1:-0.48123, 2:-0.27253} },

    { group:'history & lifestyle', k:'bmi', label:'BMI', type:'num', min:10, max:70, step:0.1, def:28, mean:25.6, sd:6.4, w:0.37931 },
    { group:'history & lifestyle', k:'bmi_cat', label:'BMI category', type:'sel', def:2,
      options:[['Normal',0],['Overweight',1],['Obese I',2],['Obese II+',3]], levelW:{0:0, 1:0.67216, 2:0.72058, 3:0.43939} },
    { group:'history & lifestyle', k:'family_hist', label:'Family history', type:'sel', def:0, options:[['No',0],['Yes',1]], mean:0, sd:1, w:1.35454 },
    { group:'history & lifestyle', k:'active', label:'Physically active', type:'sel', def:1, options:[['No',0],['Yes',1]], mean:0, sd:1, w:-0.76864 },
    { group:'history & lifestyle', k:'hypertension', label:'High blood pressure', type:'sel', def:0, options:[['No',0],['Yes',1]], mean:1, sd:1, w:-0.77409 },
    { group:'history & lifestyle', k:'parity', label:'Pregnancies (parity)', type:'num', min:0, max:10, def:0, mean:0, sd:1, w:0.06141, hint:'0 unless currently pregnant — imputed that way after the original fabricated a value for every man in the data' },
    { group:'history & lifestyle', k:'prev_gdm', label:'Previous gestational DM', type:'sel', def:0, options:[['No',0],['Yes',1]], mean:0, sd:1, w:0.04459 },
    { group:'history & lifestyle', k:'pcos', label:'PCOS', type:'sel', def:0, options:[['No',0],['Yes',1]], mean:0, sd:1, w:0.00273 },
    { group:'history & lifestyle', k:'hiv', label:'HIV positive', type:'sel', def:0, options:[['No',0],['Yes',1]], mean:0, sd:1, w:0.08375 },
    { group:'history & lifestyle', k:'prev_macrosomia', label:'Previous macrosomic birth', short:'Prev. macrosomia', type:'sel', def:0, options:[['No',0],['Yes',1]], mean:0, sd:1, w:0.00148 },

    { group:'bloodwork', k:'glucose', label:'Fasting glucose (mg/dL)', short:'Fasting glucose', type:'num', min:0, max:400, def:100, mean:144.0, sd:63.0, w:7.67401 },
    { group:'bloodwork', k:'hba1c', label:'HbA1c (%)', short:'HbA1c', type:'num', min:0, max:15, step:0.1, def:5.5, mean:7.4, sd:2.7, w:11.45405 },
    { group:'bloodwork', k:'chol', label:'Total cholesterol', type:'num', min:0, max:400, def:190, mean:208.0, sd:63.0, w:1.3584 },
    { group:'bloodwork', k:'ldl', label:'LDL cholesterol', type:'num', min:0, max:300, def:110, mean:137.0, sd:49.0, w:1.14848 },
    { group:'bloodwork', k:'hdl', label:'HDL cholesterol', type:'num', min:0, max:100, def:50, mean:44.0, sd:15.0, w:-0.82708 },
    { group:'bloodwork', k:'trig', label:'Triglycerides', type:'num', min:0, max:600, def:150, mean:165.0, sd:105.0, w:1.7499 },
    { group:'bloodwork', k:'creatinine', label:'Creatinine (mg/dL)', type:'num', min:0, max:10, step:0.1, def:0.9, mean:0.97, sd:0.38, w:0.3941 },

    { group:'engineered features (computed, as in training)', k:'glu_hba1c', label:'glucose ÷ HbA1c', short:'glucose/HbA1c ratio', type:'num', step:0.01, def:18.18, derived:true, mean:18.7719, sd:5.5349, w:-0.77997 },
    { group:'engineered features (computed, as in training)', k:'bmi_age', label:'BMI × age', type:'num', def:1260, derived:true, mean:1302.395, sd:525.2625, w:-0.1036 },
    { group:'engineered features (computed, as in training)', k:'chol_ratio', label:'cholesterol ÷ HDL', short:'cholesterol ratio', type:'num', step:0.01, def:3.8, derived:true, mean:4.7667, sd:2.3517, w:0.5186 },
    { group:'engineered features (computed, as in training)', k:'renal', label:'renal risk (creatinine × hypertension)', short:'renal risk', type:'num', step:0.01, def:0.9, derived:true, mean:1.3, sd:1.01, w:1.40699, hint:'fixed operator-precedence bug: now really doubles for hypertensive patients' }
  ],
  derive:function(v, root, spec){
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
    if (p < 0.30) return { level:'low', colour:'--accent', title:'Low risk',
      detail:'Markers sit inside the normal range. Routine screening interval is appropriate.' };
    if (p < 0.60) return { level:'mid', colour:'--amber', title:'Elevated risk',
      detail:'Consistent with a prediabetic pattern. Confirmatory testing and lifestyle review indicated.' };
    return { level:'high', colour:'--red', title:'High risk',
      detail:'Bloodwork falls in the diagnostic band. Refer for clinical confirmation.' };
  },
  presets:[
    { name:'Baseline adult', values:{} },
    { name:'Metabolic syndrome profile', values:{ age:58, bmi:34, bmi_cat:3, hypertension:1, active:0, family_hist:1, glucose:141, hba1c:7.1, hdl:36, trig:260, chol:225, ldl:150, creatinine:1.1 } },
    { name:'Healthy young adult', values:{ age:26, bmi:22, bmi_cat:0, active:1, glucose:84, hba1c:5.0, hdl:62, trig:95, chol:170, ldl:95, creatinine:0.8 } },
    { name:'Borderline / prediabetic', values:{ age:47, bmi:29, bmi_cat:1, glucose:117, hba1c:6.1, hdl:44, trig:180, family_hist:1 } }
  ]
});

/* ============================================================
   10. SPEC — EMPLOYEE ATTRITION (34 real inputs, incl. 4 engineered)
   Real coefficients + StandardScaler stats, extracted from
   attrition_production_model.pkl with joblib. Same field set as
   the real Streamlit dashboard's prediction page — no more
   hardcoded placeholders.
   ============================================================ */
Runner.mount({
  id:'attrition',
  kind:'logistic',
  intercept: -2.39011,
  outputLabel:'leaves within 12 months',
  contribLabel:'log-odds contribution, top 6',
  provenance:'<b>These are the real fitted Logistic Regression coefficients and StandardScaler statistics from '
    + '<code>attrition_production_model.pkl</code></b>, extracted directly with joblib. Ordinal fields are modeled on '
    + 'their raw survey codes (1–5), never on text labels — the notebook and the original app disagreed on what those '
    + 'labels meant, so this page never encodes on them. Money fields are shown in Rands at R16.50/$.',
  fields:[
    { group:'personal', k:'Age', label:'Age', type:'num', min:18, max:65, def:35, mean:36.998, sd:9.174, w:-0.48932 },
    { group:'personal', k:'Gender', label:'Gender', type:'sel', def:0, options:[['Female',0],['Male',1]], levelW:{0:0, 1:0.40604} },
    { group:'personal', k:'MaritalStatus', label:'Marital status', short:'Marital status', type:'sel', def:1,
      options:[['Divorced',0],['Married',1],['Single',2]], levelW:{0:0, 1:0.09624, 2:0.74907} },
    { group:'personal', k:'Education', label:'Education (1–5)', short:'Education', type:'sel', def:3,
      options:[['Below College',1],['College',2],['Bachelor',3],['Master',4],['Doctor',5]], mean:2.906, sd:1.028, w:0.18682 },
    { group:'personal', k:'EducationField', label:'Education field', short:'Education field', type:'sel', def:0,
      options:[['Human Resources',0],['Life Sciences',1],['Marketing',2],['Medical',3],['Other',4],['Technical Degree',5]],
      levelW:{0:0, 1:-0.84503, 2:-0.56686, 3:-0.66959, 4:-1.41447, 5:-0.40551} },
    { group:'personal', k:'DistanceFromHome', label:'Distance from home', short:'Commute distance', type:'num', min:1, max:50, def:8, mean:9.358, sd:8.176, w:0.32016 },

    { group:'role & travel', k:'Department', label:'Department', type:'sel', def:1,
      options:[['Human Resources',0],['Research & Development',1],['Sales',2]], levelW:{0:0, 1:-0.18187, 2:0.25922} },
    { group:'role & travel', k:'JobRole', label:'Job role', short:'Job role', type:'sel', def:8,
      options:[['Healthcare Representative',0],['Human Resources',1],['Laboratory Technician',2],['Manager',3],
               ['Manufacturing Director',4],['Research Director',5],['Research Scientist',6],['Sales Executive',7],['Sales Representative',8]],
      levelW:{0:0, 1:0.67651, 2:1.5711, 3:-0.7961, 4:0.36599, 5:-1.88448, 6:0.07998, 7:0.40466, 8:1.65864} },
    { group:'role & travel', k:'JobLevel', label:'Job level (1–5)', type:'num', min:1, max:5, def:2, mean:2.077, sd:1.092, w:0.26305 },
    { group:'role & travel', k:'BusinessTravel', label:'Business travel', short:'Business travel', type:'sel', def:1,
      options:[['Non-Travel',0],['Travel_Rarely',1],['Travel_Frequently',2]], levelW:{0:0, 1:1.00278, 2:1.86933} },
    { group:'role & travel', k:'OverTime', label:'Works overtime', short:'Overtime', type:'sel', def:0,
      options:[['No',0],['Yes',1]], levelW:{0:0, 1:1.95993} },
    { group:'role & travel', k:'PerformanceRating', label:'Performance rating (1–4)', short:'Performance rating', type:'sel', def:3,
      options:[['Low',1],['Good',2],['Excellent',3],['Outstanding',4]], mean:3.157, sd:0.364, w:0.23073 },

    { group:'pay & tenure', k:'MonthlyIncome', label:'Monthly income (R)', short:'Monthly income', type:'num', cur:true, min:1000, max:20000, step:100, def:5000, mean:6544.02, sd:4651.76, w:0.31987, hint:'positive here — a real suppressor effect once JobLevel/tenure are already in the model, not evidence pay itself drives risk up' },
    { group:'pay & tenure', k:'DailyRate', label:'Daily rate (R)', short:'Daily rate', type:'num', cur:true, min:100, max:1500, step:10, def:800, mean:803.99, sd:401.17, w:-0.18905 },
    { group:'pay & tenure', k:'HourlyRate', label:'Hourly rate (R)', short:'Hourly rate', type:'num', cur:true, min:30, max:100, step:1, def:65, mean:65.5, sd:20.36, w:0.04089 },
    { group:'pay & tenure', k:'MonthlyRate', label:'Monthly rate (R)', short:'Monthly rate', type:'num', cur:true, min:2000, max:27000, step:100, def:14390, mean:14390.24, sd:7189.78, w:0.04468 },
    { group:'pay & tenure', k:'PercentSalaryHike', label:'Last salary hike (%)', short:'Salary hike', type:'num', min:11, max:25, def:15, mean:15.24, sd:3.68, w:-0.40324 },
    { group:'pay & tenure', k:'StockOptionLevel', label:'Stock option level (0–3)', short:'Stock options', type:'num', min:0, max:3, def:1, mean:0.791, sd:0.845, w:-0.35925 },
    { group:'pay & tenure', k:'NumCompaniesWorked', label:'Companies worked', short:'Employers to date', type:'num', min:0, max:10, def:3, mean:2.693, sd:2.485, w:0.58973 },
    { group:'pay & tenure', k:'TotalWorkingYears', label:'Total working years', short:'Career length', type:'num', min:0, max:40, def:11, mean:11.365, sd:7.798, w:-0.81087 },
    { group:'pay & tenure', k:'YearsAtCompany', label:'Years at company', short:'Tenure', type:'num', min:0, max:40, def:7, mean:7.05, sd:6.084, w:0.66515, hint:'positive here too — TenureBand below carries most of the real tenure effect' },
    { group:'pay & tenure', k:'YearsInCurrentRole', label:'Years in current role', short:'Years in role', type:'num', min:0, max:18, def:4, mean:4.231, sd:3.568, w:-0.32863 },
    { group:'pay & tenure', k:'YearsSinceLastPromotion', label:'Years since promotion', short:'Since promotion', type:'num', min:0, max:15, def:2, mean:2.183, sd:3.214, w:0.4035 },
    { group:'pay & tenure', k:'YearsWithCurrManager', label:'Years with current manager', short:'With current manager', type:'num', min:0, max:17, def:4, mean:4.196, sd:3.563, w:-0.59107 },
    { group:'pay & tenure', k:'TrainingTimesLastYear', label:'Training sessions last year', short:'Training sessions', type:'num', min:0, max:6, def:3, mean:2.76, sd:1.256, w:-0.23692 },

    { group:'engagement', k:'JobSatisfaction', label:'Job satisfaction (1–4)', short:'Job satisfaction', type:'sel', def:3,
      options:[['Low',1],['Medium',2],['High',3],['Very High',4]], mean:2.719, sd:1.110, w:-0.35204 },
    { group:'engagement', k:'EnvironmentSatisfaction', label:'Environment satisfaction (1–4)', short:'Environment', type:'sel', def:3,
      options:[['Low',1],['Medium',2],['High',3],['Very High',4]], mean:2.717, sd:1.088, w:-0.31611 },
    { group:'engagement', k:'JobInvolvement', label:'Job involvement (1–4)', short:'Job involvement', type:'sel', def:3,
      options:[['Low',1],['Medium',2],['High',3],['Very High',4]], mean:2.737, sd:0.703, w:-0.11159 },
    { group:'engagement', k:'WorkLifeBalance', label:'Work-life balance (1–4)', short:'Work-life balance', type:'sel', def:3,
      options:[['Bad',1],['Good',2],['Better',3],['Best',4]], mean:2.758, sd:0.718, w:-0.30475 },
    { group:'engagement', k:'RelationshipSatisfaction', label:'Relationship satisfaction (1–4)', short:'Relationships', type:'sel', def:3,
      options:[['Low',1],['Medium',2],['High',3],['Very High',4]], mean:2.739, sd:1.087, w:-0.10601 },

    { group:'engineered (computed, as in training)', k:'TenureBand', label:'Tenure band', short:'Tenure band', type:'sel', def:2, derived:true,
      options:[['0-2',0],['2-5',1],['5-10',2],['10-20',3],['20+',4]], levelW:{0:0, 1:-0.84165, 2:-0.01993, 3:-0.78239, 4:-1.06236} },
    { group:'engineered (computed, as in training)', k:'AgeBand', label:'Age band', short:'Age band', type:'sel', def:2, derived:true,
      options:[['18-25',0],['25-35',1],['35-45',2],['45-55',3],['55+',4]], levelW:{0:0, 1:-0.3154, 2:-0.80181, 3:0.56967, 4:0.80012} },
    { group:'engineered (computed, as in training)', k:'IncomePerSatisfaction', label:'Income ÷ job satisfaction', short:'Income/satisfaction', type:'num', cur:true, derived:true, def:2181, mean:3109.26, sd:3128.97, w:-0.24222 },
    { group:'engineered (computed, as in training)', k:'EngagementScore', label:'Engagement score (mean of 4 satisfaction fields)', short:'Engagement score', type:'num', step:0.01, derived:true, def:2.75, mean:2.728, sd:0.507, w:-0.45807 }
  ],
  derive:function(v, root, spec){
    var y = v.YearsAtCompany;
    v.TenureBand = y <= 2 ? 0 : y <= 5 ? 1 : y <= 10 ? 2 : y <= 20 ? 3 : 4;
    var a = v.Age;
    v.AgeBand = a <= 25 ? 0 : a <= 35 ? 1 : a <= 45 ? 2 : a <= 55 ? 3 : 4;
    v.IncomePerSatisfaction = v.MonthlyIncome / (v.JobSatisfaction + 1e-6);
    v.EngagementScore = (v.EnvironmentSatisfaction + v.JobInvolvement + v.JobSatisfaction + v.RelationshipSatisfaction) / 4;
    var bandLabels = ['0-2','2-5','5-10','10-20','20+'];
    root.querySelector('[data-k="TenureBand"]').value = v.TenureBand;
    var ageLabels = ['18-25','25-35','35-45','45-55','55+'];
    root.querySelector('[data-k="AgeBand"]').value = v.AgeBand;
    root.querySelector('[data-k="IncomePerSatisfaction"]').value = Math.round(v.IncomePerSatisfaction * FX_ZAR_PER_USD);
    root.querySelector('[data-k="EngagementScore"]').value = v.EngagementScore.toFixed(2);
  },
  band:function(p){
    if (p < 0.30) return { level:'low', colour:'--accent', title:'Low attrition risk',
      detail:'Overtime, tenure and engagement are all working in the retention direction.' };
    if (p < 0.55) return { level:'mid', colour:'--amber', title:'Watch — moderate risk',
      detail:'Something is pulling this profile toward the leaver branch. Worth a manager check-in.' };
    return { level:'high', colour:'--red', title:'High attrition risk',
      detail:'Matches the leaver pattern in the data: overtime, short tenure, or a high-attrition role like Sales Representative.' };
  },
  presets:[
    { name:'Baseline employee', values:{} },
    { name:'Classic leaver profile', values:{ Age:26, MaritalStatus:2, JobRole:8, Department:2, OverTime:1, BusinessTravel:2,
        MonthlyIncome:2400, TotalWorkingYears:3, YearsAtCompany:1, YearsInCurrentRole:0, YearsSinceLastPromotion:0,
        NumCompaniesWorked:4, DistanceFromHome:22, JobSatisfaction:1, EnvironmentSatisfaction:1, WorkLifeBalance:1 } },
    { name:'Long-tenure senior', values:{ Age:48, MaritalStatus:1, JobRole:3, MonthlyIncome:17000, TotalWorkingYears:26,
        YearsAtCompany:18, YearsInCurrentRole:9, YearsSinceLastPromotion:2, NumCompaniesWorked:2, DistanceFromHome:4,
        JobSatisfaction:4, EnvironmentSatisfaction:4, WorkLifeBalance:3 } },
    { name:'Overworked high performer', values:{ Age:31, JobRole:2, OverTime:1, MonthlyIncome:4300, YearsAtCompany:4,
        YearsSinceLastPromotion:5, WorkLifeBalance:1, JobSatisfaction:2, PerformanceRating:4 } }
  ]
});

/* ============================================================
   11. SPEC — TELECOM CHURN (all 19 Telco features)
   Real coefficients + StandardScaler stats, extracted from
   churn_production_model.pkl with joblib.
   ============================================================ */
Runner.mount({
  id:'churn',
  kind:'logistic',
  intercept: -0.46022,
  outputLabel:'probability of churn',
  contribLabel:'log-odds contribution, top 6',
  provenance:'<b>These are the real fitted Logistic Regression (balanced) coefficients from '
    + '<code>churn_production_model.pkl</code></b>, extracted directly with joblib, applied to standardised '
    + 'inputs using the fitted scaler\'s own means and standard deviations. '
    + 'Billing figures are converted from the dataset\'s US dollars at R16.50/$.',
  fields:[
    { group:'customer', k:'gender', label:'Gender', type:'sel', def:1, options:[['Female',0],['Male',1]], levelW:{0:0, 1:-0.01171} },
    { group:'customer', k:'SeniorCitizen', label:'Senior citizen', short:'Senior citizen', type:'sel', def:0, options:[['No',0],['Yes',1]], levelW:{0:0, 1:0.20472} },
    { group:'customer', k:'Partner', label:'Has partner', type:'sel', def:0, options:[['No',0],['Yes',1]], levelW:{0:0, 1:-0.03652} },
    { group:'customer', k:'Dependents', label:'Has dependents', type:'sel', def:0, options:[['No',0],['Yes',1]], levelW:{0:0, 1:-0.23005} },

    { group:'account', k:'tenure', label:'Tenure (months)', short:'Tenure', type:'num', min:0, max:72, def:12, mean:32.56, sd:24.54, w:-1.25194 },
    { group:'account', k:'Contract', label:'Contract', type:'sel', def:0,
      options:[['Month-to-month',0],['One year',1],['Two year',2]], levelW:{0:0, 1:-0.79041, 2:-1.45483} },
    { group:'account', k:'PaperlessBilling', label:'Paperless billing', short:'Paperless billing', type:'sel', def:1, options:[['No',0],['Yes',1]], levelW:{0:0, 1:0.25676} },
    { group:'account', k:'PaymentMethod', label:'Payment method', short:'Payment method', type:'sel', def:2,
      options:[['Bank transfer (automatic)',0],['Credit card (automatic)',1],['Electronic check',2],['Mailed check',3]],
      levelW:{0:0, 1:0.06911, 2:0.40974, 3:0.0541} },
    { group:'account', k:'MonthlyCharges', label:'Monthly charges (R)', short:'Monthly charges', type:'num', cur:true, min:18, max:120, step:1, def:70, mean:65.00, sd:30.11, w:-0.34129 },
    { group:'account', k:'TotalCharges', label:'Total charges (R)', short:'Total charges', type:'num', cur:true, min:0, max:9000, step:10, def:840, mean:2301.84, sd:2275.38, w:0.60308 },

    { group:'phone', k:'PhoneService', label:'Phone service', short:'Phone service', type:'sel', def:1, options:[['No',0],['Yes',1]], levelW:{0:0, 1:-0.38868} },
    { group:'phone', k:'MultipleLines', label:'Multiple lines', type:'sel', def:0, options:[['No',0],['Yes',1]], levelW:{0:0, 1:0.3126} },

    { group:'internet & add-ons', k:'InternetService', label:'Internet service', short:'Internet service', type:'sel', def:1,
      options:[['DSL',0],['Fiber optic',1],['No',2]], levelW:{0:0, 1:1.01819, 2:-1.05564} },
    { group:'internet & add-ons', k:'OnlineSecurity', label:'Online security', short:'Online security', type:'sel', def:0, options:[['No',0],['Yes',1]], levelW:{0:0, 1:-0.36875} },
    { group:'internet & add-ons', k:'OnlineBackup', label:'Online backup', short:'Online backup', type:'sel', def:0, options:[['No',0],['Yes',1]], levelW:{0:0, 1:-0.12942} },
    { group:'internet & add-ons', k:'DeviceProtection', label:'Device protection', short:'Device protection', type:'sel', def:0, options:[['No',0],['Yes',1]], levelW:{0:0, 1:0.05079} },
    { group:'internet & add-ons', k:'TechSupport', label:'Tech support', short:'Tech support', type:'sel', def:0, options:[['No',0],['Yes',1]], levelW:{0:0, 1:-0.32908} },
    { group:'internet & add-ons', k:'StreamingTV', label:'Streaming TV', type:'sel', def:0, options:[['No',0],['Yes',1]], levelW:{0:0, 1:0.34089} },
    { group:'internet & add-ons', k:'StreamingMovies', label:'Streaming movies', short:'Streaming movies', type:'sel', def:0, options:[['No',0],['Yes',1]], levelW:{0:0, 1:0.32451} }
  ],
  band:function(p){
    if (p < 0.20) return { level:'low', colour:'--accent', title:'Retained',
      detail:'Commitment and add-ons are both holding. No retention spend needed here.' };
    if (p < 0.45) return { level:'mid', colour:'--amber', title:'At risk — offer a bundle',
      detail:'Tech support or online security would anchor this account at low cost.' };
    return { level:'high', colour:'--red', title:'High churn risk',
      detail:'The month-to-month, high-bill, low-tenure pattern. Target with the right-size-your-plan offer.' };
  },
  presets:[
    { name:'New month-to-month customer', values:{} },
    { name:'High-risk: new, expensive, no contract', values:{ tenure:2, Contract:0, MonthlyCharges:98.5, TotalCharges:197,
        InternetService:1, OnlineSecurity:0, TechSupport:0, PaperlessBilling:1, PaymentMethod:2, StreamingTV:1, StreamingMovies:1 } },
    { name:'Loyal two-year subscriber', values:{ tenure:64, Contract:2, MonthlyCharges:78, TotalCharges:5000,
        OnlineSecurity:1, TechSupport:1, OnlineBackup:1, DeviceProtection:1, PaperlessBilling:0, PaymentMethod:0, Partner:1, Dependents:1 } },
    { name:'Basic phone-only plan', values:{ tenure:38, Contract:1, MonthlyCharges:20.5, TotalCharges:780,
        InternetService:2, PhoneService:1, MultipleLines:0, PaperlessBilling:0, PaymentMethod:3 } }
  ]
});

/* ============================================================
   12. SPEC — CREDIT RISK (all 11 applicant fields)
   The decision threshold is a live control, because in the real
   app it is a policy value stored beside the pipeline.
   ============================================================ */
Runner.mount({
  id:'credit',
  kind:'logistic',
  intercept: -1.28,                 // ln(0.218 / 0.782): base default rate
  threshold: 0.45,
  outputLabel:'probability of default',
  contribLabel:'log-odds contribution, top 6',
  provenance:'<b>Coefficients are calibrated to the grade/ratio structure the pipeline learned.</b> The threshold slider '
    + 'is the same value stored in <code>credit_risk_production_model.pkl</code> — move it and watch the decision flip '
    + 'without the probability changing. Export the real coefficients with <code>export_models.py</code>. '
    + 'Amounts are converted from the dataset\'s US dollars at R16.50/$.',
  fields:[
    { group:'applicant', k:'person_age', label:'Age', type:'num', min:18, max:100, def:35, mean:27.7, sd:6.3, w:-0.10 },
    { group:'applicant', k:'person_income', label:'Annual income (R)', short:'Annual income', type:'num', cur:true, min:0, max:400000, step:5000, def:75000, mean:66075, sd:62000, w:-0.35 },
    { group:'applicant', k:'person_home_ownership', label:'Home ownership', short:'Home ownership', type:'sel', def:1,
      options:[['Own',0],['Mortgage',1],['Rent',2],['Other',3]], levelW:{0:-0.45, 1:-0.25, 2:0.35, 3:0.20} },
    { group:'applicant', k:'person_emp_length', label:'Employment length (yrs)', short:'Employment length', type:'num', min:0, max:50, step:0.5, def:8, mean:4.8, sd:4.1, w:-0.15 },
    { group:'applicant', k:'cb_person_default_on_file', label:'Default on file', short:'Prior default', type:'sel', def:0,
      options:[['No',0],['Yes',1]], levelW:{0:0, 1:0.65} },
    { group:'applicant', k:'cb_person_cred_hist_length', label:'Credit history (yrs)', short:'Credit history', type:'num', min:0, max:40, def:10, mean:5.8, sd:4.0, w:-0.10 },

    { group:'loan', k:'loan_amnt', label:'Loan amount (R)', short:'Loan amount', type:'num', cur:true, min:0, max:60000, step:5000, def:15000, mean:9589, sd:6322, w:0.20 },
    { group:'loan', k:'loan_int_rate', label:'Interest rate (%)', short:'Interest rate', type:'num', min:0, max:30, step:0.1, def:12.5, mean:11.0, sd:3.2, w:0.55 },
    { group:'loan', k:'loan_percent_income', label:'Loan-to-income ratio', short:'Loan-to-income', type:'num', min:0, max:1, step:0.01, def:0.2, mean:0.17, sd:0.107, w:0.95, hint:'loan ÷ income' },
    { group:'loan', k:'loan_grade', label:'Loan grade', short:'Loan grade', type:'sel', def:2,
      options:[['A',0],['B',1],['C',2],['D',3],['E',4],['F',5],['G',6]],
      levelW:{0:-1.10, 1:-0.55, 2:0, 3:0.75, 4:1.35, 5:1.80, 6:2.20} },
    { group:'loan', k:'loan_intent', label:'Loan intent', short:'Loan intent', type:'sel', def:3,
      options:[['Education',0],['Medical',1],['Venture',2],['Personal',3],['Home improvement',4],['Debt consolidation',5]],
      levelW:{0:-0.10, 1:0.20, 2:0.25, 3:0, 4:-0.05, 5:0.30} }
  ],
  band:function(p, v, spec){
    var lpi = (v.loan_percent_income * 100).toFixed(0);
    if (p >= spec.threshold) return { level:'high', colour:'--red', title:'Declined',
      detail:'Loan-to-income ' + lpi + '%. Default probability is at or above the ' + Math.round(spec.threshold*100) + '% policy threshold.' };
    if (p >= spec.threshold * 0.7) return { level:'mid', colour:'--amber', title:'Approved — refer for review',
      detail:'Loan-to-income ' + lpi + '%. Inside policy but close to the line; verify income documents.' };
    return { level:'low', colour:'--accent', title:'Approved',
      detail:'Loan-to-income ' + lpi + '%. Comfortably below the ' + Math.round(spec.threshold*100) + '% threshold.' };
  },
  presets:[
    { name:'Standard applicant', values:{} },
    { name:'Thin file, high leverage', values:{ person_age:23, person_income:26000, person_home_ownership:2, person_emp_length:1,
        cb_person_default_on_file:1, cb_person_cred_hist_length:2, loan_amnt:12000, loan_int_rate:16.8, loan_percent_income:0.46, loan_grade:4, loan_intent:5 } },
    { name:'Prime borrower', values:{ person_age:41, person_income:145000, person_home_ownership:0, person_emp_length:15,
        cb_person_cred_hist_length:18, loan_amnt:10000, loan_int_rate:7.2, loan_percent_income:0.07, loan_grade:0, loan_intent:4 } },
    { name:'Borderline — sits on the threshold', values:{ person_age:29, person_income:52000, person_home_ownership:1, person_emp_length:4,
        loan_amnt:16000, loan_int_rate:12.6, loan_percent_income:0.24, loan_grade:2, loan_intent:1 } }
  ]
});

/* ============================================================
   13. SPEC — HOUSE PRICE (13 of the model's real property features)
   Real Ridge coefficients + StandardScaler stats, extracted from
   house_price_production_model.pkl with joblib. Linear model: the
   output is money, so contributions are too.
   ============================================================ */
Runner.mount({
  id:'housing',
  kind:'linear',
  intercept: 410506,
  outputLabel:'predicted sale price',
  contribLabel:'contribution to the price, top 6',
  provenance:'<b>These are the real fitted Ridge Regression coefficients and StandardScaler statistics from '
    + '<code>house_price_production_model.pkl</code></b>, extracted directly with joblib — not an approximation. '
    + 'The error band is the pipeline\'s real test RMSE of $107,849 (R1.78m). The real model also uses zip code '
    + 'alongside city; zip is folded out of this form for a simpler UI, and <code>month</code> is held at its '
    + 'dataset average (contributing ~0). Prices are converted from the King County dataset\'s US dollars at R16.50/$.',
  fields:[
    { group:'size', k:'sqft_living', label:'Living area (sqft)', short:'Living area', type:'num', min:300, max:6000, step:10, def:1800, mean:1917.48, sd:678.57, w:59209.73 },
    { group:'size', k:'sqft_above', label:'Above-ground (sqft)', short:'Above ground', type:'num', min:300, max:6000, step:10, def:1500, mean:1651.05, sd:661.23, w:56103.43 },
    { group:'size', k:'sqft_basement', label:'Basement (sqft)', short:'Basement', type:'num', min:0, max:2500, step:10, def:300, mean:266.44, sd:389.58, w:7908.84 },
    { group:'size', k:'sqft_lot', label:'Lot size (sqft)', short:'Lot size', type:'num', min:500, max:40000, step:100, def:8000, mean:7317.22, sd:3634.78, w:8859.93 },
    { group:'size', k:'floors', label:'Floors', type:'sel', def:1, options:[['1',1],['1.5',1.5],['2',2],['2.5',2.5],['3',3]], mean:1.483, sd:0.538, w:-9125.62 },

    { group:'rooms', k:'bedrooms', label:'Bedrooms', type:'num', min:1, max:8, def:3, mean:3.294, sd:0.785, w:-10101.71 },
    { group:'rooms', k:'bathrooms', label:'Bathrooms', type:'num', min:1, max:6, step:0.25, def:2, mean:2.033, sd:0.659, w:13599.40 },
    { group:'rooms', k:'condition', label:'Condition (1–5)', short:'Condition', type:'sel', def:3,
      options:[['1 poor',1],['2',2],['3 average',3],['4',4],['5 excellent',5]], mean:3.450, sd:0.668, w:12845.59 },
    { group:'rooms', k:'view', label:'View rating (0–4)', short:'View', type:'sel', def:0,
      options:[['0 none',0],['1',1],['2',2],['3',3],['4 outstanding',4]], mean:0.145, sd:0.576, w:22931.89 },
    { group:'rooms', k:'waterfront', label:'Waterfront', type:'sel', def:0, options:[['No',0],['Yes',1]], mean:0.00237, sd:0.04863, w:6464.85, hint:'small coefficient but tiny SD — flipping to Yes is really a ~20-SD jump, ~$132,700 in practice' },

    { group:'age & location', k:'yr_built', label:'Year built', short:'Year built', type:'num', min:1900, max:2014, def:1975, mean:1969.85, sd:30.08, w:-204.32 },
    { group:'age & location', k:'yr_renovated', label:'Year renovated (0 = never)', short:'Renovated', type:'num', min:0, max:2014, def:0, mean:814.45, sd:980.35, w:4155.65 },
    { group:'age & location', k:'city', label:'City', type:'sel', def:6,
      options:[['Seattle',1],['Bellevue',2],['Redmond',3],['Sammamish',4],['Kirkland',5],['Shoreline',6],['Issaquah',7],['Renton',8],['Kent',9],['Auburn',10],['Federal Way',11]],
      levelW:{1:103494, 2:177929, 3:102483, 4:80240, 5:76512, 6:31138, 7:69018, 8:-72769, 9:-81851, 10:-58457, 11:-133913} }
  ],
  sub:function(v){
    var r = 107849;
    return toRands(Math.max(v - r, 0)) + ' — ' + toRands(v + r) + '   (±1 test RMSE)';
  },
  band:function(v){
    var MEDIAN = 435000;
    if (v <= MEDIAN * 0.85) return { level:'low', title:'Below market median',
      detail:'Below the trimmed dataset\'s real median of $435,000 (R7.18m) for this 3-month Seattle-area snapshot.' };
    if (v <= MEDIAN * 1.15) return { level:'mid', title:'Around the median',
      detail:'Close to the real median — most of the trimmed dataset sits in this band.' };
    return { level:'high', title:'Above market median',
      detail:'Above the trimmed dataset\'s median. Treat this as a ballpark: single-region, 3-month snapshot, not a live feed.' };
  },
  presets:[
    { name:'Typical Shoreline house', values:{} },
    { name:'Bellevue family home', values:{ city:2, sqft_living:3200, sqft_above:2400, sqft_basement:800, sqft_lot:11000,
        bedrooms:4, bathrooms:3.25, floors:2, condition:4, view:2, yr_built:1998 } },
    { name:'Kent starter home', values:{ city:9, sqft_living:1080, sqft_above:1080, sqft_basement:0, sqft_lot:6200,
        bedrooms:2, bathrooms:1, floors:1, condition:3, yr_built:1962 } },
    { name:'Seattle waterfront', values:{ city:1, sqft_living:2600, sqft_above:1800, sqft_basement:800, sqft_lot:7000,
        bedrooms:3, bathrooms:2.5, floors:2, condition:5, view:4, waterfront:1, yr_built:1990, yr_renovated:2012 } }
  ]
});

/* ============================================================
   13. FOOTER YEAR
   ============================================================ */

/* ------------------------------------------------------------------
   9. the calendar sketch in project 06. same data model as the python
      version: one entry per date, four categories, cycled by clicking.
   ------------------------------------------------------------------ */
(function(){
  var grid = document.getElementById('calGrid');
  if (!grid) return;

  var CATS = ['work','personal','study','urgent'];
  var MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];
  var today = new Date();
  var view = new Date(today.getFullYear(), today.getMonth(), 1);
  var events = {};

  function key(d){
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
  }
  var a = new Date(today); a.setDate(today.getDate() + 2);
  var b = new Date(today); b.setDate(today.getDate() + 5);
  events[key(a)] = 'work';
  events[key(b)] = 'study';

  function draw(){
    var y = view.getFullYear(), m = view.getMonth();
    document.getElementById('calMonth').textContent = MONTHS[m] + ' ' + y;

    var html = '';
    ['Mo','Tu','We','Th','Fr','Sa','Su'].forEach(function(d){ html += '<div class="h">' + d + '</div>'; });

    var lead = (new Date(y, m, 1).getDay() + 6) % 7;      // monday first, like calendar.monthcalendar
    var days = new Date(y, m + 1, 0).getDate();
    for (var i = 0; i < lead; i++) html += '<div class="d empty"></div>';

    for (var day = 1; day <= days; day++){
      var k = y + '-' + String(m+1).padStart(2,'0') + '-' + String(day).padStart(2,'0');
      var isToday = (y === today.getFullYear() && m === today.getMonth() && day === today.getDate());
      html += '<div class="d' + (isToday ? ' today' : '') + '" data-day="' + k + '" role="button" tabindex="0" aria-label="' + k + (events[k] ? ', ' + events[k] : '') + '">' + day +
              (events[k] ? '<span class="tag ' + events[k] + '">' + events[k] + '</span>' : '') + '</div>';
    }
    grid.innerHTML = html;

    var out = '';
    CATS.forEach(function(c){
      var n = Object.keys(events).filter(function(k){ return events[k] === c; }).length;
      out += '<span><i class="' + c + '"></i>' + c + ' ' + n + '</span>';
    });
    document.getElementById('calCounts').innerHTML = out;

    var floor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    var soon = Object.keys(events).filter(function(k){
      var diff = (new Date(k + 'T00:00:00') - floor) / 86400000;
      return diff >= 0 && diff <= 7;
    }).sort();
    document.getElementById('calNext').innerHTML = '<h6>next 7 days</h6>' + (soon.length
      ? soon.map(function(k){ return k + ' <span class="tag ' + events[k] + '">' + events[k] + '</span>'; }).join('<br>')
      : 'nothing scheduled');
  }

  grid.addEventListener('click', function(e){
    var cell = e.target.closest('.d[data-day]');
    if (!cell) return;
    var k = cell.dataset.day, cur = events[k];
    var next = !cur ? CATS[0] : (CATS.indexOf(cur) === CATS.length - 1 ? null : CATS[CATS.indexOf(cur) + 1]);
    if (next) events[k] = next; else delete events[k];
    draw();
  });

  grid.addEventListener('keydown', function(e){
    var cell = e.target.closest('.d[data-day]');
    if (!cell || (e.key !== 'Enter' && e.key !== ' ')) return;
    var day = cell.dataset.day;
    e.preventDefault();
    cell.click();
    var updatedCell = grid.querySelector('[data-day="' + day + '"]');
    if (updatedCell) updatedCell.focus();
  });

  document.getElementById('cal').addEventListener('click', function(e){
    var btn = e.target.closest('[data-cal]');
    if (!btn) return;
    if (btn.dataset.cal === 'clear') events = {};
    else view.setMonth(view.getMonth() + Number(btn.dataset.cal));
    draw();
  });

  draw();
})();

/* One date, rendered in two places, so they cannot drift apart. */
(function(){
  var UPDATED = '2026-09-16';                    // edit this line when the page changes
  var d = new Date(UPDATED + 'T00:00:00');
  document.getElementById('updated').textContent =
    d.toLocaleDateString('en-GB', { month:'long', year:'numeric' });
  document.getElementById('yr').textContent = d.getFullYear();
})();