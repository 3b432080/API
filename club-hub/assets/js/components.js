/* Vue 元件（第 8 週：元件化 + props）
   五個元件：BaseTag、ClubCard、EventItem、ChatBubble、FieldMessage */

/* 技術標籤元件：title 是標籤文字，content 是滑過時的補充說明 */
const BaseTag = {
  props: {
    title: { type: String, required: true },
    content: { type: String, default: "" }
  },
  template: `<span class="base-tag" :title="content">{{ title }}</span>`
};

const ClubCard = {
  components: { BaseTag },
  props: {
    club: { type: Object, required: true },
    selected: { type: Boolean, default: false }
  },
  emits: ["select"],
  computed: {
    full() { return this.club.seats === 0; },
    feeText() { return this.club.fee === 0 ? "免費" : "NT$ " + this.club.fee + " / 學期"; },
    seatText() { return this.full ? "名額已滿（可候補）" : "剩餘 " + this.club.seats + " 名"; }
  },
  template: `
    <article class="card club-card" :class="{ 'is-selected': selected, 'is-full': full }">
      <header class="card__head">
        <h3>{{ club.name }}</h3>
        <span class="badge">{{ club.category }}</span>
      </header>
      <p class="card__desc">{{ club.desc }}</p>
      <dl class="meta">
        <div><dt>時間</dt><dd>{{ club.day }}</dd></div>
        <div><dt>地點</dt><dd>{{ club.place }}</dd></div>
        <div><dt>社費</dt><dd>{{ feeText }}</dd></div>
        <div><dt>名額</dt><dd :class="{ warn: full }">{{ seatText }}</dd></div>
      </dl>
      <ul class="tags" aria-label="標籤">
        <li v-for="t in club.tags" :key="t"><base-tag :title="'#' + t" :content="club.name + '的標籤：' + t"></base-tag></li>
      </ul>
      <button type="button" class="btn btn--small" @click="$emit('select', club.id)">
        {{ selected ? '已選擇（見下方報名表）' : (full ? '登記候補' : '我要報名') }}
      </button>
    </article>`
};

const EventItem = {
  props: { event: { type: Object, required: true } },
  computed: {
    month() { return Number(this.event.date.split("-")[1]) + " 月"; },
    day() { return this.event.date.split("-")[2]; }
  },
  template: `
    <li class="event">
      <time class="event__date" :datetime="event.date">
        <span class="event__day">{{ day }}</span>
        <span class="event__month">{{ month }}</span>
      </time>
      <div class="event__body">
        <h3>{{ event.title }}</h3>
        <p>{{ event.time }}｜{{ event.place }}</p>
        <p class="muted">{{ event.note }}</p>
      </div>
    </li>`
};

const ChatBubble = {
  props: {
    role: { type: String, default: "assistant" },   // user | assistant | error
    text: { type: String, required: true }
  },
  computed: {
    who() { return { user: "你", assistant: "小幫手", error: "系統" }[this.role] || this.role; }
  },
  template: `
    <div class="bubble" :class="'bubble--' + role">
      <span class="bubble__who">{{ who }}</span>
      <p>{{ text }}</p>
    </div>`
};

const FieldMessage = {
  props: { msg: { type: String, default: "" }, ok: { type: Boolean, default: false } },
  template: `<p class="field-msg" :class="{ ok: ok }" role="status" v-if="msg">{{ msg }}</p>`
};
