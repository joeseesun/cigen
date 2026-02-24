const DATA_PATH = "./data/roots_affixes.json";
const STORAGE_KEY = "cigen-root-progress-v1";

const state = {
  roots: [],
  entries: [],
  rootMap: new Map(),
  rootToEntries: new Map(),
  filteredRoots: [],
  selectedRoot: null,
  flash: {
    pool: [],
    index: 0,
    revealed: false,
  },
  quiz: {
    question: null,
  },
  progress: loadProgress(),
};

const els = {
  tabs: [...document.querySelectorAll(".tab")],
  panels: {
    map: document.getElementById("panel-map"),
    flash: document.getElementById("panel-flash"),
    quiz: document.getElementById("panel-quiz"),
  },
  metaStats: document.getElementById("metaStats"),
  rootSearch: document.getElementById("rootSearch"),
  randomRoot: document.getElementById("randomRoot"),
  rootList: document.getElementById("rootList"),
  rootDetail: document.getElementById("rootDetail"),
  flashMeta: document.getElementById("flashMeta"),
  flashCard: document.getElementById("flashCard"),
  flashReveal: document.getElementById("flashReveal"),
  flashAgain: document.getElementById("flashAgain"),
  flashKnow: document.getElementById("flashKnow"),
  flashNext: document.getElementById("flashNext"),
  quizScore: document.getElementById("quizScore"),
  quizQuestion: document.getElementById("quizQuestion"),
  quizOptions: document.getElementById("quizOptions"),
  quizFeedback: document.getElementById("quizFeedback"),
  nextQuiz: document.getElementById("nextQuiz"),
};

bindEvents();
loadData();

function bindEvents() {
  els.tabs.forEach((tab) => {
    tab.addEventListener("click", () => activateTab(tab.dataset.tab));
  });

  els.rootSearch.addEventListener("input", () => {
    renderRootList(els.rootSearch.value.trim());
  });

  els.randomRoot.addEventListener("click", () => {
    if (!state.filteredRoots.length) {
      return;
    }
    const chosen = sample(state.filteredRoots);
    selectRoot(chosen.root);
  });

  els.flashReveal.addEventListener("click", () => {
    state.flash.revealed = true;
    renderFlashCard();
  });

  els.flashAgain.addEventListener("click", () => {
    advanceFlash();
  });

  els.flashKnow.addEventListener("click", () => {
    const root = state.flash.pool[state.flash.index];
    if (root) {
      state.progress.mastered[root] = true;
      saveProgress();
      renderMeta();
    }
    advanceFlash();
  });

  els.flashNext.addEventListener("click", () => {
    advanceFlash(true);
  });

  els.quizOptions.addEventListener("click", (event) => {
    const target = event.target.closest("button[data-root]");
    if (!target || !state.quiz.question) {
      return;
    }
    answerQuiz(target.dataset.root);
  });

  els.nextQuiz.addEventListener("click", () => {
    newQuizQuestion();
  });
}

async function loadData() {
  try {
    const response = await fetch(DATA_PATH);
    if (!response.ok) {
      throw new Error(`无法加载数据: ${response.status}`);
    }
    const data = await response.json();
    state.roots = data.roots || [];
    state.entries = data.entries || [];
    state.rootMap = new Map(state.roots.map((item) => [item.root, item]));
    state.rootToEntries = buildRootToEntries(state.entries);

    renderMeta(data.meta || {});
    renderRootList("");
    if (state.roots.length) {
      selectRoot(state.roots[0].root);
    }
    initFlash();
    newQuizQuestion();
  } catch (error) {
    els.metaStats.textContent = `加载失败: ${error.message}`;
    els.rootDetail.textContent = "请确认 data/roots_affixes.json 文件存在。";
  }
}

function buildRootToEntries(entries) {
  const map = new Map();
  entries.forEach((entry) => {
    (entry.components || []).forEach((component) => {
      const root = component.morpheme;
      if (!root) {
        return;
      }
      if (!map.has(root)) {
        map.set(root, []);
      }
      map.get(root).push(entry);
    });
  });
  return map;
}

function renderMeta(meta = {}) {
  clearNode(els.metaStats);
  const masteredCount = Object.values(state.progress.mastered).filter(Boolean).length;
  const chips = [
    `词条 ${meta.entryCount || state.entries.length}`,
    `词根/词缀 ${meta.rootCount || state.roots.length}`,
    `已掌握 ${masteredCount}`,
    `测验 ${state.progress.quizCorrect}/${state.progress.quizTotal}`,
  ];
  chips.forEach((text) => {
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = text;
    els.metaStats.appendChild(chip);
  });
}

function activateTab(tabName) {
  els.tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.tab === tabName));
  Object.entries(els.panels).forEach(([key, panel]) => {
    panel.classList.toggle("active", key === tabName);
  });
}

function renderRootList(query) {
  const q = query.toLowerCase();
  state.filteredRoots = state.roots.filter((rootData) => {
    if (!q) {
      return true;
    }
    if (rootData.root.includes(q)) {
      return true;
    }
    if ((rootData.gloss || "").includes(q)) {
      return true;
    }
    if ((rootData.sampleWords || []).some((word) => word.includes(q))) {
      return true;
    }
    const entries = state.rootToEntries.get(rootData.root) || [];
    return entries.some((entry) => (entry.meaning || "").includes(q));
  });

  clearNode(els.rootList);
  if (!state.filteredRoots.length) {
    const empty = document.createElement("div");
    empty.textContent = "没有找到匹配项，试试更短关键词。";
    els.rootList.appendChild(empty);
    return;
  }

  state.filteredRoots.forEach((rootData) => {
    const item = document.createElement("div");
    item.className = "root-item";
    if (rootData.root === state.selectedRoot) {
      item.classList.add("active");
    }

    const head = document.createElement("div");
    head.className = "root-head";

    const root = document.createElement("span");
    root.className = "root-key";
    root.textContent = rootData.root;

    const count = document.createElement("span");
    count.textContent = `${rootData.wordCount}词`;

    head.appendChild(root);
    head.appendChild(count);

    const gloss = document.createElement("div");
    gloss.className = "root-gloss";
    gloss.textContent = rootData.gloss || "点击查看例词联想";

    item.appendChild(head);
    item.appendChild(gloss);
    item.addEventListener("click", () => selectRoot(rootData.root));
    els.rootList.appendChild(item);
  });
}

function selectRoot(root) {
  state.selectedRoot = root;
  renderRootList(els.rootSearch.value.trim());
  renderRootDetail();
}

function renderRootDetail() {
  const rootData = state.rootMap.get(state.selectedRoot);
  clearNode(els.rootDetail);
  if (!rootData) {
    els.rootDetail.textContent = "未找到该词根数据。";
    return;
  }

  const head = document.createElement("div");
  head.className = "detail-head";

  const rootName = document.createElement("div");
  rootName.className = "detail-root";
  rootName.textContent = rootData.root;

  const gloss = document.createElement("span");
  gloss.className = "chip";
  gloss.textContent = rootData.gloss || "建议通过例词记忆";

  const count = document.createElement("span");
  count.className = "chip";
  count.textContent = `${rootData.wordCount} 个相关词`;

  const mastered = document.createElement("span");
  mastered.className = "chip";
  mastered.textContent = state.progress.mastered[rootData.root] ? "已掌握" : "待复习";

  head.appendChild(rootName);
  head.appendChild(gloss);
  head.appendChild(count);
  head.appendChild(mastered);

  const intro = document.createElement("p");
  intro.textContent = "例词拆解（优先展示包含此词根/词缀的词条）:";

  const examples = document.createElement("div");
  examples.className = "examples";
  const relatedEntries = (state.rootToEntries.get(rootData.root) || []).slice(0, 24);
  if (!relatedEntries.length) {
    const empty = document.createElement("p");
    empty.textContent = "暂无相关例词。";
    els.rootDetail.appendChild(head);
    els.rootDetail.appendChild(empty);
    return;
  }

  relatedEntries.forEach((entry) => {
    const card = document.createElement("div");
    card.className = "example-card";

    const word = document.createElement("div");
    word.className = "example-word";
    word.textContent = entry.word;

    const meaning = document.createElement("div");
    meaning.className = "example-meaning";
    meaning.textContent = entry.meaning;

    const decomposition = document.createElement("div");
    decomposition.className = "example-decomp";
    decomposition.textContent = entry.decomposition;

    card.appendChild(word);
    card.appendChild(meaning);
    card.appendChild(decomposition);
    examples.appendChild(card);
  });

  els.rootDetail.appendChild(head);
  els.rootDetail.appendChild(intro);
  els.rootDetail.appendChild(examples);
}

function initFlash() {
  const pool = state.roots.filter((item) => item.wordCount >= 2).map((item) => item.root);
  state.flash.pool = shuffle(pool);
  state.flash.index = 0;
  state.flash.revealed = false;
  renderFlashCard();
}

function renderFlashCard() {
  clearNode(els.flashCard);
  if (!state.flash.pool.length) {
    els.flashMeta.textContent = "没有可用闪卡。";
    els.flashCard.textContent = "请检查数据文件。";
    return;
  }

  const root = state.flash.pool[state.flash.index];
  const rootData = state.rootMap.get(root);
  if (!rootData) {
    return;
  }

  const masteredCount = Object.values(state.progress.mastered).filter(Boolean).length;
  els.flashMeta.textContent = `第 ${state.flash.index + 1}/${state.flash.pool.length} 张 | 已掌握 ${masteredCount}`;

  const prompt = document.createElement("div");
  prompt.textContent = "请回忆这个词根/词缀的含义和常见单词:";
  els.flashCard.appendChild(prompt);

  const rootText = document.createElement("div");
  rootText.className = "flash-root";
  rootText.textContent = rootData.root;
  els.flashCard.appendChild(rootText);

  if (state.flash.revealed) {
    const gloss = document.createElement("div");
    gloss.textContent = `提示: ${rootData.gloss || "建议通过例词理解"}`;

    const words = document.createElement("div");
    words.textContent = `例词: ${(rootData.sampleWords || []).slice(0, 8).join(", ")}`;

    const sampleEntry = (state.rootToEntries.get(rootData.root) || [])[0];
    const breakdown = document.createElement("div");
    if (sampleEntry) {
      breakdown.textContent = `拆解示例: ${sampleEntry.word} -> ${sampleEntry.decomposition}`;
    }

    els.flashCard.appendChild(gloss);
    els.flashCard.appendChild(words);
    els.flashCard.appendChild(breakdown);
  }

  els.flashReveal.disabled = state.flash.revealed;
  els.flashAgain.disabled = !state.flash.revealed;
  els.flashKnow.disabled = !state.flash.revealed;
}

function advanceFlash(randomJump = false) {
  if (!state.flash.pool.length) {
    return;
  }
  if (randomJump) {
    state.flash.index = Math.floor(Math.random() * state.flash.pool.length);
  } else {
    state.flash.index = (state.flash.index + 1) % state.flash.pool.length;
  }
  state.flash.revealed = false;
  renderFlashCard();
}

function newQuizQuestion() {
  const candidates = state.roots.filter((item) => item.gloss);
  if (candidates.length < 4) {
    els.quizQuestion.textContent = "可用于选择题的数据不足。";
    return;
  }

  const correct = sample(candidates);
  const incorrectRoots = shuffle(
    candidates
      .filter((item) => item.root !== correct.root)
      .slice()
      .map((item) => item.root)
  ).slice(0, 3);
  const options = shuffle([correct.root, ...incorrectRoots]);

  state.quiz.question = {
    prompt: correct.gloss,
    correctRoot: correct.root,
    options,
  };
  renderQuiz();
}

function renderQuiz() {
  const q = state.quiz.question;
  if (!q) {
    return;
  }
  els.quizQuestion.textContent = `哪个词根/词缀最接近这个提示: “${q.prompt}”`;
  els.quizFeedback.textContent = "";
  clearNode(els.quizOptions);
  q.options.forEach((optionRoot) => {
    const button = document.createElement("button");
    button.className = "quiz-option";
    button.dataset.root = optionRoot;
    button.textContent = optionRoot;
    els.quizOptions.appendChild(button);
  });
  renderQuizScore();
}

function answerQuiz(chosenRoot) {
  const q = state.quiz.question;
  if (!q) {
    return;
  }
  const correct = chosenRoot === q.correctRoot;
  state.progress.quizTotal += 1;
  if (correct) {
    state.progress.quizCorrect += 1;
  }
  saveProgress();
  renderMeta();

  const buttons = [...els.quizOptions.querySelectorAll(".quiz-option")];
  buttons.forEach((button) => {
    const root = button.dataset.root;
    button.disabled = true;
    if (root === q.correctRoot) {
      button.classList.add("correct");
    } else if (root === chosenRoot) {
      button.classList.add("wrong");
    }
  });

  const correctData = state.rootMap.get(q.correctRoot);
  const examples = (correctData?.sampleWords || []).slice(0, 4).join(", ");
  els.quizFeedback.textContent = correct
    ? `回答正确。例词: ${examples}`
    : `回答错误。正确答案是 ${q.correctRoot}。例词: ${examples}`;
  renderQuizScore();
}

function renderQuizScore() {
  els.quizScore.textContent = `正确率: ${state.progress.quizCorrect} / ${state.progress.quizTotal}`;
}

function sample(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function shuffle(items) {
  const arr = items.slice();
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function clearNode(node) {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { mastered: {}, quizCorrect: 0, quizTotal: 0 };
    }
    const parsed = JSON.parse(raw);
    return {
      mastered: parsed.mastered || {},
      quizCorrect: parsed.quizCorrect || 0,
      quizTotal: parsed.quizTotal || 0,
    };
  } catch (error) {
    return { mastered: {}, quizCorrect: 0, quizTotal: 0 };
  }
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.progress));
}
