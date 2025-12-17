(() => {
  const $ = (id) => document.getElementById(id);
  let token = localStorage.getItem("token") || "";
  $("btn-send-otp").onclick = async () => {
    const phone = $("phone").value.trim();
    const r = await fetch("/api/auth/request-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone })
    });
    if (!r.ok) return showMsg("ارسال پیامک ناموفق بود");
    hide("step-phone"); show("step-otp");
  };
  $("btn-verify-otp").onclick = async () => {
    const phone = $("phone").value.trim();
    const code = $("otp").value.trim();
    const r = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, code })
    });
    if (!r.ok) return showMsg("کد تایید نامعتبر است");
    const j = await r.json();
    token = j.token;
    try { localStorage.setItem("token", token); } catch {}
    await refreshCredit();
    hide("step-otp"); show("step-credit");
  };
  $("btn-charge").onclick = async () => {
    const amount = Number($("amount").value || 0);
    const r = await fetch(`/api/credit/charge?token=${encodeURIComponent(token)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount })
    });
    if (!r.ok) return showMsg("شارژ ناموفق بود");
    const j = await r.json();
    $("credit-info").textContent = `اعتبار شما: ${j.credits}`;
  };
  $("btn-next-inputs").onclick = () => {
    hide("step-credit"); show("step-inputs");
  };
  $("btn-start").onclick = async () => {
    const topic = $("topic").value.trim();
    const keywords = $("keywords").value.trim();
    const tone = $("tone").value;
    const faq = $("faq").value;
    hide("step-inputs"); show("stream");
    $("out-title").textContent = "";
    $("out-intro").textContent = "";
    $("out-toc").textContent = "";
    $("out-sections").textContent = "";
    $("out-conclusion").textContent = "";
    $("out-faq").textContent = "";
    const src = new EventSource(`/api/content/stream?token=${encodeURIComponent(token)}&topic=${encodeURIComponent(topic)}&keywords=${encodeURIComponent(keywords)}&tone=${encodeURIComponent(tone)}&faq=${encodeURIComponent(faq)}`);
    src.addEventListener("title", (e) => $("out-title").textContent += e.data);
    src.addEventListener("intro", (e) => $("out-intro").textContent += e.data);
    src.addEventListener("toc", (e) => $("out-toc").textContent += e.data);
    src.addEventListener("sections", (e) => $("out-sections").textContent += e.data);
    src.addEventListener("conclusion", (e) => $("out-conclusion").textContent += e.data);
    src.addEventListener("faq", (e) => $("out-faq").textContent += e.data);
    src.addEventListener("close", () => src.close());
    src.onerror = () => { showMsg("خطا در استریم"); src.close(); };
  };
  async function refreshCredit() {
    const r = await fetch(`/api/credit?token=${encodeURIComponent(token)}`);
    if (!r.ok) { return false; }
    const j = await r.json();
    $("credit-info").textContent = `اعتبار شما: ${j.credits}`;
    return true;
  }
  function show(id){ $(id).classList.remove("hidden"); }
  function hide(id){ $(id).classList.add("hidden"); }
  function showMsg(t){ $("msg").textContent = t; setTimeout(()=> $("msg").textContent="", 4000); }
  async function init(){
    if (token) {
      const ok = await refreshCredit();
      if (ok) {
        hide("step-phone"); hide("step-otp"); show("step-credit");
        return;
      } else {
        token = "";
        try { localStorage.removeItem("token"); } catch {}
      }
    }
    show("step-phone");
    hide("step-otp"); hide("step-credit"); hide("step-inputs"); hide("stream");
  }
  init();
})();
