/* Дані користувача. Кожен акаунт бачить лише своє: users/{uid}/...
   Режим «демо» зберігає все в браузері (без реєстрації). */
const FB = 'https://www.gstatic.com/firebasejs/10.12.2/';
export const firebaseConfig = {
  apiKey: 'AIzaSyCfpBkCjYYkvTI1bMrXeEKtvcqWQx9yX80',
  authDomain: 'home-finance-c6bb8.firebaseapp.com',
  projectId: 'home-finance-c6bb8',
  storageBucket: 'home-finance-c6bb8.firebasestorage.app',
  messagingSenderId: '781971004293',
  appId: '1:781971004293:web:4d597584a0834f2ab182ec',
};

let fb = null; // { auth, db, a, fs }
async function firebase() {
  if (fb) return fb;
  const [app, a, fs] = await Promise.all([import(FB + 'firebase-app.js'), import(FB + 'firebase-auth.js'), import(FB + 'firebase-firestore.js')]);
  const inst = app.initializeApp(firebaseConfig);
  fb = { auth: a.getAuth(inst), db: fs.getFirestore(inst), a, fs };
  fb.auth.languageCode = 'uk';
  return fb;
}

const AUTH_ERR = {
  'auth/invalid-email': 'Перевірте адресу пошти.',
  'auth/missing-password': 'Введіть пароль.',
  'auth/weak-password': 'Пароль має містити щонайменше 6 символів.',
  'auth/email-already-in-use': 'Акаунт з цією поштою вже існує — увійдіть.',
  'auth/invalid-credential': 'Неправильна пошта або пароль.',
  'auth/wrong-password': 'Неправильна пошта або пароль.',
  'auth/user-not-found': 'Акаунта з такою поштою немає — створіть його.',
  'auth/too-many-requests': 'Забагато спроб. Зачекайте кілька хвилин.',
  'auth/network-request-failed': 'Немає з’єднання з інтернетом.',
  'auth/operation-not-allowed': 'Вхід за поштою ще не увімкнено у Firebase (Authentication → Sign-in method → Email/Password).',
};
export const authMessage = (e) => AUTH_ERR[e?.code] || e?.message || 'Щось пішло не так. Спробуйте ще раз.';

export const auth = {
  async onChange(cb) { const { auth, a } = await firebase(); return a.onAuthStateChanged(auth, cb); },
  async signIn(email, pass) { const { auth, a } = await firebase(); return a.signInWithEmailAndPassword(auth, email, pass); },
  async signUp(email, pass) { const { auth, a } = await firebase(); return a.createUserWithEmailAndPassword(auth, email, pass); },
  async reset(email) { const { auth, a } = await firebase(); return a.sendPasswordResetEmail(auth, email); },
  async signOut() { const { auth, a } = await firebase(); return a.signOut(auth); },
};

/* ── сховище ── */
export function createStore(mode, uid) {
  const listeners = {};
  const emit = (col, list) => (listeners[col] || []).forEach((cb) => cb(list));

  if (mode === 'demo') {
    const key = (c) => 'hf_demo_' + c;
    const read = (c) => { try { return JSON.parse(localStorage.getItem(key(c)) || '[]'); } catch { return []; } };
    const write = (c, l) => { localStorage.setItem(key(c), JSON.stringify(l)); emit(c, l); };
    const id = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    return {
      mode,
      watch(c, cb) { (listeners[c] ||= []).push(cb); cb(read(c)); return () => {}; },
      async add(c, d) { const l = read(c); const x = { ...d, id: id(), createdAt: Date.now() }; l.push(x); write(c, l); return x.id; },
      async update(c, i, d) { write(c, read(c).map((x) => (x.id === i ? { ...x, ...d } : x))); },
      async set(c, i, d) { const l = read(c).filter((x) => x.id !== i); l.push({ ...d, id: i }); write(c, l); },
      async remove(c, i) { write(c, read(c).filter((x) => x.id !== i)); },
      async batchAdd(c, arr) { const l = read(c); arr.forEach((d) => l.push({ ...d, id: id(), createdAt: Date.now() })); write(c, l); },
    };
  }

  const path = (c) => `users/${uid}/${c}`;
  return {
    mode, uid,
    watch(c, cb) {
      let unsub = () => {};
      firebase().then(({ db, fs }) => {
        unsub = fs.onSnapshot(fs.collection(db, path(c)), (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))), (e) => { console.error(c, e); cb([], e); });
      });
      return () => unsub();
    },
    async add(c, d) { const { db, fs } = await firebase(); const r = await fs.addDoc(fs.collection(db, path(c)), { ...d, createdAt: Date.now() }); return r.id; },
    async update(c, i, d) { const { db, fs } = await firebase(); await fs.updateDoc(fs.doc(db, path(c), i), d); },
    async set(c, i, d) { const { db, fs } = await firebase(); await fs.setDoc(fs.doc(db, path(c), i), d, { merge: true }); },
    async remove(c, i) { const { db, fs } = await firebase(); await fs.deleteDoc(fs.doc(db, path(c), i)); },
    async batchAdd(c, arr) {
      const { db, fs } = await firebase();
      for (let k = 0; k < arr.length; k += 400) {
        const b = fs.writeBatch(db);
        arr.slice(k, k + 400).forEach((d) => b.set(fs.doc(fs.collection(db, path(c))), { ...d, createdAt: Date.now() }));
        await b.commit();
      }
    },
    /* перенесення даних зі старої версії (спільні колекції без входу) */
    async readLegacy(name) {
      const { db, fs } = await firebase();
      try { const s = await fs.getDocs(fs.collection(db, name)); return s.docs.map((d) => ({ id: d.id, ...d.data() })); } catch { return []; }
    },
    async readLegacyDoc(col, id) {
      const { db, fs } = await firebase();
      try { const s = await fs.getDoc(fs.doc(db, col, id)); return s.exists() ? s.data() : null; } catch { return null; }
    },
  };
}
