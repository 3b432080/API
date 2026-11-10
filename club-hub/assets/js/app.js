/* 勤益社團一站通｜主程式
   - Vue 3（CDN 全域版）：ref / computed / v-model / v-for / 元件 props
   - 本地 AI：LM Studio 的 /v1/models 與 /v1/chat/completions（第 6 週）
*/
const { createApp, ref, reactive, computed, onMounted, nextTick } = Vue;

createApp({
  components: { ClubCard, EventItem, ChatBubble, FieldMessage },

  setup() {
    /* ---------- 1. 社團清單（篩選 / 搜尋） ---------- */
    const clubs = ref(window.CLUBS);
    const events = ref(window.EVENTS);
    const keyword = ref("");
    const category = ref("全部");
    const onlyAvailable = ref(false);

    const categories = computed(() => ["全部", ...new Set(clubs.value.map(c => c.category))]);

    const filteredClubs = computed(() => {
      const kw = keyword.value.trim().toLowerCase();
      return clubs.value.filter(c => {
        if (category.value !== "全部" && c.category !== category.value) return false;
        if (onlyAvailable.value && c.seats === 0) return false;
        if (!kw) return true;
        return (c.name + c.desc + c.tags.join("")).toLowerCase().includes(kw);
      });
    });

    /* ---------- 2. 報名表單（即時驗證） ---------- */
    const form = reactive({ name: "", studentId: "", email: "", clubId: "", agree: false });
    const touched = reactive({ name: false, studentId: false, email: false, clubId: false, agree: false });
    const result = ref(null);

    const errors = computed(() => ({
      name: form.name.trim().length < 2 ? "請輸入姓名（至少 2 個字）" : "",
      studentId: /^[A-Za-z0-9]{8,10}$/.test(form.studentId.trim()) ? "" : "學號為 8～10 碼英數字",
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) ? "" : "Email 格式不正確，例如 name@example.com",
      clubId: form.clubId ? "" : "請選擇要報名的社團",
      agree: form.agree ? "" : "請勾選同意個資使用說明"
    }));

    const formValid = computed(() => Object.values(errors.value).every(m => m === ""));
    const selectedClub = computed(() => clubs.value.find(c => c.id === form.clubId) || null);

    // 欄位提示：未碰過不顯示錯誤；合法時顯示綠色提示
    const msgOf = key => (touched[key] ? errors.value[key] : "");
    const okOf = key => touched[key] && errors.value[key] === "";

    function selectClub(id) {
      form.clubId = id;
      touched.clubId = true;
      nextTick(() => document.getElementById("signup")?.scrollIntoView({ behavior: "smooth" }));
    }

    function submitForm() {
      Object.keys(touched).forEach(k => (touched[k] = true));
      if (!formValid.value) return;
      const club = selectedClub.value;
      result.value = {
        no: "R" + String(Date.now()).slice(-6),
        name: form.name.trim(),
        club: club.name,
        waitlist: club.seats === 0,
        status: club.seats === 0 ? "已登記候補，有名額時由社團通知" : "已收到報名申請，待社團幹部確認"
      };
    }

    function resetForm() {
      Object.assign(form, { name: "", studentId: "", email: "", clubId: "", agree: false });
      Object.keys(touched).forEach(k => (touched[k] = false));
      result.value = null;
    }

    /* ---------- 3. 本地 AI 小幫手 ---------- */
    const ai = reactive({
      baseUrl: "http://127.0.0.1:1234",
      token: "",
      models: [],
      model: "",
      status: "尚未連線。請先在 LM Studio 載入模型並啟動 Server，再按「取得模型清單」。",
      statusType: "idle",   // idle | ok | busy | error
      busy: false
    });
    const question = ref("");
    const chat = ref([
      { role: "assistant", text: "嗨！我是社團小幫手，可以回答社團時間、地點、社費、名額和活動日期。" }
    ]);
    const chatBox = ref(null);

    const quickQuestions = [
      "週三有哪些社團？",
      "哪些社團是免費的？",
      "想學攝影，有推薦的社團嗎？",
      "社團博覽會是哪一天？"
    ];

    // System Prompt：角色、資料依據、不確定時的回覆（第 6 週投影片規格）
    const systemPrompt = computed(() => {
      const clubText = clubs.value.map(c =>
        `- ${c.name}（${c.category}）｜${c.day}｜${c.place}｜社費${c.fee === 0 ? "免費" : c.fee + "元/學期"}｜` +
        `${c.seats === 0 ? "名額已滿，可候補" : "剩餘" + c.seats + "名"}｜${c.desc}`).join("\n");
      const eventText = events.value.map(e => `- ${e.title}｜${e.date} ${e.time}｜${e.place}｜${e.note}`).join("\n");
      return [
        "你是勤益社團一站通的客服小幫手，請全程使用台灣繁體中文，語氣親切簡潔。",
        "只能根據下列資料回答；使用者問題中的每個項目都要逐一回答。",
        "資料中沒有的資訊，一律回答「目前資料不足，請聯絡社團」，不要猜測，也不要編造。",
        "你不能替使用者建立報名，也不能宣稱已查到即時名額；請引導使用者使用頁面上的報名表。",
        "",
        "【社團資料】", clubText, "",
        "【活動資料】", eventText
      ].join("\n");
    });

    function apiHeaders() {
      const h = { "Content-Type": "application/json" };
      if (ai.token.trim()) h.Authorization = "Bearer " + ai.token.trim();
      return h;
    }
    function apiBase() { return ai.baseUrl.trim().replace(/\/+$/, ""); }

    function explainError(err, httpStatus) {
      if (err.name === "AbortError") return "等待超過 120 秒，已停止。請改用較小的模型、縮短上下文，或關閉其他佔用顯示卡的程式後重試。";
      if (httpStatus === 401) return "HTTP 401：需要認證，請檢查 API Token。";
      if (httpStatus === 404) return "HTTP 404：路徑或模型不存在，請重新按「取得模型清單」並確認載入的是對話模型。";
      if (httpStatus) return `HTTP ${httpStatus}：本地伺服器回報錯誤（${err.message}）。`;
      return "無法連線到本地 AI。請確認：① LM Studio 的 Start server 已開啟 ② 位址與埠號正確 ③ Server Settings 已啟用 Enable CORS。";
    }

    async function loadModels() {
      ai.busy = true; ai.statusType = "busy"; ai.status = "正在取得模型清單…";
      try {
        const res = await fetch(apiBase() + "/v1/models", { headers: apiHeaders() });
        if (!res.ok) { const e = new Error(res.statusText || "請求失敗"); e.httpStatus = res.status; throw e; }
        const data = await res.json();
        const ids = (data.data || []).map(m => m.id).filter(id => !/embed/i.test(id));
        if (!ids.length) throw new Error("清單是空的，請先在 LM Studio 載入一個對話模型");
        ai.models = ids;
        if (!ids.includes(ai.model)) ai.model = ids[0];
        ai.statusType = "ok"; ai.status = `已連線，找到 ${ids.length} 個可用模型。`;
      } catch (err) {
        ai.models = [];
        ai.statusType = "error"; ai.status = explainError(err, err.httpStatus);
      } finally {
        ai.busy = false;
      }
    }

    function scrollChat() { nextTick(() => { if (chatBox.value) chatBox.value.scrollTop = chatBox.value.scrollHeight; }); }

    async function sendQuestion(text) {
      const q = (text ?? question.value).trim();
      if (!q) { ai.statusType = "error"; ai.status = "請先輸入問題。"; return; }
      if (!ai.model) { ai.statusType = "error"; ai.status = "請先按「取得模型清單」並選擇模型。"; return; }
      if (ai.busy) return;

      chat.value.push({ role: "user", text: q });
      question.value = "";
      scrollChat();

      ai.busy = true; ai.statusType = "busy"; ai.status = "AI 正在回答…";
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 120000);

      // Qwen3 系列可加 /no_think，讓簡短問答不要把輸出額度花在思考上
      const userContent = /qwen3/i.test(ai.model) ? q + " /no_think" : q;

      try {
        const res = await fetch(apiBase() + "/v1/chat/completions", {
          method: "POST",
          headers: apiHeaders(),
          signal: controller.signal,
          body: JSON.stringify({
            model: ai.model,
            messages: [
              { role: "system", content: systemPrompt.value },
              { role: "user", content: userContent }
            ],
            temperature: 0.2,
            max_tokens: 512,
            stream: false
          })
        });
        if (!res.ok) { const e = new Error(res.statusText || "請求失敗"); e.httpStatus = res.status; throw e; }
        const data = await res.json();
        let answer = data.choices?.[0]?.message?.content;
        if (typeof answer !== "string") throw new Error("沒有取得文字回覆");
        answer = answer.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
        if (!answer) throw new Error("模型回傳空白答案（可能把額度用在思考上），請重試或換模型");
        chat.value.push({ role: "assistant", text: answer });
        ai.statusType = "ok"; ai.status = "已收到本地 AI 回覆。";
      } catch (err) {
        const msg = explainError(err, err.httpStatus);
        chat.value.push({ role: "error", text: msg });
        question.value = q;   // 失敗時保留問題，讓使用者可以重試
        ai.statusType = "error"; ai.status = "送出失敗，問題已保留，可直接重試。";
      } finally {
        clearTimeout(timer);
        ai.busy = false;
        scrollChat();
      }
    }

    onMounted(() => { document.body.classList.add("ready"); });

    return {
      clubs, events, keyword, category, onlyAvailable, categories, filteredClubs,
      form, errors, formValid, selectedClub, msgOf, okOf, touched, result,
      selectClub, submitForm, resetForm,
      ai, question, chat, chatBox, quickQuestions, systemPrompt, loadModels, sendQuestion
    };
  }
}).mount("#app");
