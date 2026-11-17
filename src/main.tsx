import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import * as XLSX from 'xlsx';
import { Contact, TYPES, validate, exportBook, importBook, loadContacts } from './model';
import './style.css';
const blank = (): Contact => ({
  id: crypto.randomUUID(),
  name: '',
  company: '',
  favorite: false,
  methods: [{ type: '电话', value: '' }],
  notes: '',
});
function App() {
  const [initial] = useState(() => {
    try {
      return { contacts: loadContacts(), error: '' };
    } catch (e) {
      return { contacts: [], error: String(e) };
    }
  });
  const [contacts, setContacts] = useState<Contact[]>(initial.contacts),
    [fatal] = useState(initial.error),
    [query, setQuery] = useState(''),
    [favorites, setFavorites] = useState(false),
    [draft, setDraft] = useState<Contact | null>(null),
    [selected, setSelected] = useState<string | null>(null),
    [message, setMessage] = useState(''),
    [error, setError] = useState('');
  const save = (next: Contact[]) => {
    if (fatal) {
      setMessage(fatal);
      return false;
    }
    try {
      localStorage.setItem('contact-studio-v1', JSON.stringify(next));
      setContacts(next);
      return true;
    } catch {
      setMessage('保存失败：浏览器存储空间不足或被禁用，请先导出备份');
      return false;
    }
  };
  const filtered = contacts
    .filter(
      (c) =>
        (!favorites || c.favorite) &&
        [c.name, c.company, c.notes, ...c.methods.map((m) => m.value)]
          .join(' ')
          .toLocaleLowerCase()
          .includes(query.toLocaleLowerCase()),
    )
    .sort((a, b) => Number(b.favorite) - Number(a.favorite) || a.name.localeCompare(b.name, 'zh'));
  const active = contacts.find((c) => c.id === selected);
  const download = (template = false) => {
    XLSX.writeFile(
      exportBook(template ? [] : contacts),
      template ? '通讯录导入模板.xlsx' : '拾联通讯录.xlsx',
    );
    setMessage(template ? '模板已下载，填写后即可导入' : '已导出全部联系人');
  };
  const read = async (file?: File) => {
    if (!file) return;
    try {
      if (!file.name.toLowerCase().endsWith('.xlsx')) throw Error('请选择 .xlsx 文件');
      if (file.size > 5 * 1024 * 1024) throw Error('文件不能超过 5 MB');
      const imported = importBook(await file.arrayBuffer());
      if (!imported.length) throw Error('文件没有联系人');
      if (
        !window.confirm(
          `校验通过，将新增 ${imported.length} 位联系人（不会覆盖现有记录，重复项也会新增）。是否继续？`,
        )
      )
        return;
      if (save([...contacts, ...imported])) setMessage(`成功导入 ${imported.length} 位联系人`);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : '导入失败');
    }
  };
  const edit = (c: Contact) => {
    setDraft(structuredClone(c));
    setError('');
  };
  return (
    <div className="shell">
      <aside>
        <a className="brand" href="#">
          拾<span>联</span>
          <small>CONTACT STUDIO</small>
        </a>
        <div className="workspace">
          个人工作空间 <span>LOCAL</span>
        </div>
        <nav>
          <button className={!favorites ? 'current' : ''} onClick={() => setFavorites(false)}>
            <i>▦</i> 全部联系人 <b>{contacts.length}</b>
          </button>
          <button className={favorites ? 'current' : ''} onClick={() => setFavorites(true)}>
            <i>☆</i> 我的收藏 <b>{contacts.filter((c) => c.favorite).length}</b>
          </button>
        </nav>
        <section className="side-note">
          <span>
            让每一次联系
            <br />
            都有迹可循。
          </span>
          <p>重要的人，值得被记住。</p>
          <div className="orb">◎</div>
        </section>
        <footer>
          <span className="avatar small">我</span>
          <div>
            我的通讯录<small>保存在当前浏览器</small>
          </div>
          <span className="status-dot" />
        </footer>
      </aside>
      <main>
        <header>
          <span>
            工作空间 <em>/</em> 通讯录
          </span>
          <span className="privacy">● 本地存储 · 由你掌控</span>
        </header>
        <div className="content">
          <div className="heading">
            <div className="eyebrow">YOUR PEOPLE, ONE PLACE</div>
            <h1>
              {favorites ? '我的收藏' : '联系，从这里开始'}
              <span>↗</span>
            </h1>
            <p>把重要的人放在一起，让每一次联系更简单。</p>
          </div>
          <div className="stats">
            <div>
              <label>全部联系人</label>
              <strong>{contacts.length.toString().padStart(2, '0')}</strong>
              <span>你的每一份连接</span>
            </div>
            <div>
              <label>已收藏</label>
              <strong>
                {contacts
                  .filter((c) => c.favorite)
                  .length.toString()
                  .padStart(2, '0')}
                <i>★</i>
              </strong>
              <span>随时找到重要的人</span>
            </div>
            <div>
              <label>联系方式</label>
              <strong>
                {contacts
                  .reduce((n, c) => n + c.methods.length, 0)
                  .toString()
                  .padStart(2, '0')}
              </strong>
              <span>电话、邮箱，以及更多</span>
            </div>
          </div>
          <section className="book">
            <div className="book-title">
              <h2>
                {favorites ? '收藏列表' : '联系人列表'} <span>{filtered.length}</span>
              </h2>
              <button className="primary" disabled={!!fatal} onClick={() => edit(blank())}>
                ＋ 新建联系人
              </button>
            </div>
            <div className="tools">
              <label className="search">
                <span>⌕</span>
                <input
                  aria-label="搜索联系人"
                  placeholder="搜索姓名、公司或联系方式…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              <div className="actions">
                <button onClick={() => download(true)}>↓ 模板</button>
                <label className="button">
                  ↥ 导入 Excel
                  <input
                    aria-label="导入 Excel"
                    type="file"
                    accept=".xlsx"
                    hidden
                    disabled={!!fatal}
                    onChange={(e) => {
                      void read(e.target.files?.[0]);
                      e.target.value = '';
                    }}
                  />
                </label>
                <button onClick={() => download()}>↧ 导出 Excel</button>
              </div>
            </div>
            {(message || fatal) && (
              <div role="status" className="notice">
                {fatal || message}
                <button aria-label="关闭提示" onClick={() => setMessage('')}>
                  ×
                </button>
              </div>
            )}
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>姓名 / 公司</th>
                    <th>联系方式</th>
                    <th>备注</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <button className="person" onClick={() => setSelected(c.id)}>
                          <span className="avatar">{Array.from(c.name)[0]}</span>
                          <span>
                            <strong>{c.name}</strong>
                            <small>{c.company || '未填写公司'}</small>
                          </span>
                        </button>
                      </td>
                      <td>
                        <div className="method-line">
                          {c.methods[0] ? (
                            <>
                              <span className="tag">{c.methods[0].type}</span>
                              {c.methods[0].value}
                            </>
                          ) : (
                            <span className="muted">暂无联系方式</span>
                          )}
                        </div>
                        {c.methods.length > 1 && (
                          <small className="extra">另有 {c.methods.length - 1} 个联系方式</small>
                        )}
                      </td>
                      <td className="notes">{c.notes || '—'}</td>
                      <td>
                        <div className="row-actions">
                          <button
                            className={c.favorite ? 'star on' : 'star'}
                            aria-label={`${c.favorite ? '取消收藏' : '收藏'}${c.name}`}
                            onClick={() =>
                              save(
                                contacts.map((x) =>
                                  x.id === c.id ? { ...x, favorite: !x.favorite } : x,
                                ),
                              )
                            }
                          >
                            {c.favorite ? '★' : '☆'}
                          </button>
                          <button onClick={() => edit(c)}>编辑</button>
                          <button
                            aria-label={`删除${c.name}`}
                            onClick={() => {
                              if (window.confirm(`确定删除“${c.name}”？此操作不能撤销。`)) {
                                if (save(contacts.filter((x) => x.id !== c.id)))
                                  setMessage('联系人已删除');
                              }
                            }}
                          >
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!filtered.length && (
                <div className="empty">
                  <div>◎</div>
                  <h3>
                    {query
                      ? '没有找到匹配的联系人'
                      : favorites
                        ? '还没有收藏联系人'
                        : '为重要的人，留一个位置'}
                  </h3>
                  <p>
                    {query ? '试试其他姓名或联系方式。' : '新建联系人，或从 Excel 导入你的通讯录。'}
                  </p>
                  {!query && !favorites && (
                    <button onClick={() => edit(blank())}>＋ 添加第一位联系人</button>
                  )}
                </div>
              )}
            </div>
            <div className="book-bottom">
              <span>共 {filtered.length} 位联系人</span>
              <span>收藏优先 · 按姓名排序</span>
            </div>
          </section>
          <div className="bottom-note">
            <span>✧ 少一点寻找，多一点连接。</span>
            <span>CONTACT STUDIO / v1.0</span>
          </div>
        </div>
      </main>
      {active && (
        <div className="overlay" onClick={() => setSelected(null)}>
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label="联系人详情"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-top">
              <h2>{active.name}</h2>
              <button onClick={() => setSelected(null)} aria-label="关闭详情">
                ×
              </button>
            </div>
            <p>{active.company}</p>
            <div className="details">
              {active.methods.map((m, i) => (
                <div key={i}>
                  <span className="tag">{m.type}</span>
                  <span>{m.value}</span>
                </div>
              ))}
            </div>
            <p className="detail-notes">{active.notes}</p>
            <button
              className="primary"
              onClick={() => {
                edit(active);
                setSelected(null);
              }}
            >
              编辑联系人
            </button>
          </section>
        </div>
      )}
      {draft && (
        <div className="overlay">
          <form
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-title"
            onSubmit={(e) => {
              e.preventDefault();
              const clean = {
                ...draft,
                name: draft.name.trim(),
                methods: draft.methods.map((m) => ({ ...m, value: m.value.trim() })),
              };
              const msg = validate(clean);
              if (msg) {
                setError(msg);
                return;
              }
              if (
                save(
                  contacts.some((c) => c.id === draft.id)
                    ? contacts.map((c) => (c.id === draft.id ? clean : c))
                    : [...contacts, clean],
                )
              ) {
                setDraft(null);
                setMessage('联系人已保存');
              }
            }}
          >
            <div className="modal-top">
              <div>
                <small>KEEP IN TOUCH</small>
                <h2 id="edit-title">
                  {contacts.some((c) => c.id === draft.id) ? '编辑联系人' : '新建联系人'}
                </h2>
              </div>
              <button type="button" onClick={() => setDraft(null)} aria-label="关闭编辑">
                ×
              </button>
            </div>
            <div className="fields">
              <label>
                姓名 <em>*</em>
                <input
                  autoFocus
                  required
                  maxLength={100}
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  placeholder="怎么称呼这位联系人？"
                />
              </label>
              <label>
                公司 / 组织
                <input
                  maxLength={200}
                  value={draft.company}
                  onChange={(e) => setDraft({ ...draft, company: e.target.value })}
                  placeholder="学校、公司或组织"
                />
              </label>
            </div>
            <div className="methods-title">
              联系方式
              <button
                type="button"
                onClick={() =>
                  setDraft({ ...draft, methods: [...draft.methods, { type: '电话', value: '' }] })
                }
              >
                ＋ 添加一项
              </button>
            </div>
            {draft.methods.map((m, i) => (
              <div className="method-edit" key={i}>
                <select
                  aria-label={`联系方式类型 ${i + 1}`}
                  value={m.type}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      methods: draft.methods.map((x, j) =>
                        j === i ? { ...x, type: e.target.value as typeof m.type } : x,
                      ),
                    })
                  }
                >
                  {TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
                <input
                  aria-label={`联系方式 ${i + 1}`}
                  required
                  maxLength={1000}
                  value={m.value}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      methods: draft.methods.map((x, j) =>
                        j === i ? { ...x, value: e.target.value } : x,
                      ),
                    })
                  }
                  placeholder="填写联系方式"
                />
                <button
                  type="button"
                  aria-label={`删除联系方式 ${i + 1}`}
                  onClick={() =>
                    setDraft({ ...draft, methods: draft.methods.filter((_, j) => j !== i) })
                  }
                >
                  ×
                </button>
              </div>
            ))}
            <label className="note-input">
              备注
              <textarea
                maxLength={2000}
                value={draft.notes}
                onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                placeholder="记录一点关于 TA 的事…"
              />
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={draft.favorite}
                onChange={(e) => setDraft({ ...draft, favorite: e.target.checked })}
              />{' '}
              收藏这位联系人
            </label>
            {error && (
              <p role="alert" className="error">
                {error}
              </p>
            )}
            <div className="modal-bottom">
              <button type="button" onClick={() => setDraft(null)}>
                取消
              </button>
              <button className="primary" type="submit">
                保存联系人
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
createRoot(document.getElementById('root')!).render(<App />);
