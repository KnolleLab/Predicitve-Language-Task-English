var inactivityLink = 'https://app.prolific.com/submissions/complete?cc=COMRDA0D'; 
var abortStudyLink = 'https://app.prolific.com/submissions/complete?cc=CJNJFARE'; 
var noConsentLink = 'https://app.prolific.com/submissions/complete?cc=CEQHFPM5'; 
var studyCompletedLink = 'https://app.prolific.com/submissions/complete?cc=C52J6LQV' 

function abortStudy() {
    if (confirm("Are you sure you want to abort the study? You will be redirected to Prolific and marked as incomplete.")) {
        studyInProgress = false;
        jatos.endStudyAndRedirect(abortStudyLink);
    }
}
window.abortStudyLink = abortStudyLink
window.inactivityLink = inactivityLink
window.studyCompletedLink = studyCompletedLink
window.noConsentLink = noConsentLink



// ---- AC Redirect target ----
const failedattentioncheck = 'https://app.prolific.com/submissions/complete?cc=C4KAJWWD';
window.failedattentioncheck = failedattentioncheck;

// ---- AC boot helper (no counter here) ----
function bootForFailedAttentionCheck() {
  try { window.onbeforeunload = null; } catch (_) {}
  const link = window.failedattentioncheck;
  if (typeof window.jatos?.endStudyAndRedirect === 'function') window.jatos.endStudyAndRedirect(link);
  else window.location.href = link;
}
window.bootForFailedAttentionCheck = bootForFailedAttentionCheck;

// ---- Global AC counter (JATOS sessionData or localStorage fallback) ----
(function () {
  const LSK = "acFailCount";                 // local fallback
  const MAX_ALLOWED_FAILS = 1;               // allow 1 fail total; boot on 2nd

  function getCountLS() {
    try { const v = localStorage.getItem(LSK); const n = v == null ? 0 : Number(v); return Number.isFinite(n) ? n : 0; }
    catch { return 0; }
  }
  function setCountLS(n) { try { localStorage.setItem(LSK, String(n)); } catch {} }

  function getCountJATOS() {
    try {
      const sd = window.jatos?.studySessionData || {};
      return (typeof sd.attentionFailsTotal === 'number') ? sd.attentionFailsTotal : 0;
    } catch { return 0; }
  }
  function setCountJATOS(n, cb) {
    if (!(window.jatos && typeof window.jatos.setStudySessionData === 'function')) { cb && cb(); return; }
    const sd = window.jatos.studySessionData || {};
    window.jatos.setStudySessionData({ ...sd, attentionFailsTotal: n }, () => cb && cb(), () => cb && cb());
  }

  function ensureInit(cb) {
    if (window.jatos && typeof window.jatos.setStudySessionData === 'function') {
      const sd = window.jatos.studySessionData || {};
      if (typeof sd.attentionFailsTotal !== 'number') {
        return window.jatos.setStudySessionData({ ...sd, attentionFailsTotal: 0 }, () => cb && cb(), () => cb && cb());
      }
      return cb && cb();
    }
    // fallback
    if (!Number.isFinite(getCountLS())) setCountLS(0);
    cb && cb();
  }

  function getCount() {
    return (window.jatos && typeof window.jatos.setStudySessionData === 'function') ? getCountJATOS() : getCountLS();
  }
  function setCount(n, cb) {
    if (window.jatos && typeof window.jatos.setStudySessionData === 'function') setCountJATOS(n, cb);
    else { setCountLS(n); cb && cb(); }
  }

  // Call this ONLY when an AC is actually failed at Next/Submit click time
  function recordACFailAndMaybeBoot() {
    ensureInit(() => {
      const current = getCount();
      const next = current + 1;
      setCount(next, () => {
        console.log(`[AC] fail recorded: ${current} -> ${next} (max allowed ${MAX_ALLOWED_FAILS})`);
        if (next > MAX_ALLOWED_FAILS) {
          console.log("[AC] threshold exceeded — booting");
          bootForFailedAttentionCheck();
        } else {
          // first fail allowed; continue
          console.warn("[AC] first fail allowed — continuing");
        }
      });
    });
  }

  // Dev helper so you don't get surprised by a sticky localStorage/jatos count
  function resetACFailCount() {
    if (window.jatos && typeof window.jatos.setStudySessionData === 'function') {
      const sd = window.jatos.studySessionData || {};
      return window.jatos.setStudySessionData({ ...sd, attentionFailsTotal: 0 }, () => console.log("[AC] reset to 0 (JATOS)"));
    }
    setCountLS(0);
    console.log("[AC] reset to 0 (localStorage)");
  }

  window.recordACFailAndMaybeBoot = recordACFailAndMaybeBoot;
  window.getACFailCount = getCount;
  window.resetACFailCount = resetACFailCount;
  window.AC_FAIL_MAX_ALLOWED = MAX_ALLOWED_FAILS;
})();


// Call when an AC is failed at Next/Submit time.
// If this is within the allowed budget, continueAction() is executed immediately.
// If threshold exceeded, the participant is booted.
window.handleACFailThen = function (continueAction) {
  // Read current
  const getCount = (window.getACFailCount && typeof window.getACFailCount === 'function')
    ? window.getACFailCount
    : () => 0;

  const setAfter = (next, cb) => {
    if (typeof window.jatos?.setStudySessionData === 'function') {
      const sd = window.jatos.studySessionData || {};
      window.jatos.setStudySessionData({ ...sd, attentionFailsTotal: next }, cb, cb);
    } else {
      try { localStorage.setItem("acFailCount", String(next)); } catch {}
      cb && cb();
    }
  };

  const maxAllowed = (typeof window.AC_FAIL_MAX_ALLOWED === 'number') ? window.AC_FAIL_MAX_ALLOWED : 1;
  const current = Number(getCount()) || 0;
  const next = current + 1;

  setAfter(next, () => {
    console.log(`[AC] fail ${current}→${next}, allowed=${maxAllowed}`);
    if (next > maxAllowed) {
      // boot now
      if (typeof window.bootForFailedAttentionCheck === 'function') {
        window.bootForFailedAttentionCheck();
      } else if (typeof window.jatos?.endStudyAndRedirect === 'function' && window.failedattentioncheck) {
        window.jatos.endStudyAndRedirect(window.failedattentioncheck);
      } else if (window.failedattentioncheck) {
        window.location.href = window.failedattentioncheck;
      }
      return;
    }
    // still within allowance → advance immediately
    if (typeof continueAction === 'function') continueAction();
  });
};
