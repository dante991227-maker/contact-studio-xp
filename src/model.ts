import * as XLSX from 'xlsx';
export const TYPES = ['电话', '邮箱', '社交账号', '地址'] as const;
export type Method = { type: (typeof TYPES)[number]; value: string };
export type Contact = {
  id: string;
  name: string;
  company: string;
  favorite: boolean;
  methods: Method[];
  notes: string;
};
export const HEADERS = ['姓名', '公司', '收藏', '电话', '邮箱', '社交账号', '地址', '备注'];
export function validate(c: Contact): string {
  if (!c.name.trim()) return '请填写姓名';
  if (c.methods.some((m) => !m.value.trim())) return '请填写联系方式，或删除空白项';
  if (c.methods.some((m) => m.type === '邮箱' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m.value)))
    return '请输入有效的邮箱地址';
  return '';
}
export function exportBook(contacts: Contact[]) {
  const rows = contacts.map((c) => [
    c.name,
    c.company,
    c.favorite ? '是' : '否',
    ...TYPES.map((t) => JSON.stringify(c.methods.filter((m) => m.type === t).map((m) => m.value))),
    c.notes,
  ]);
  const sheet = XLSX.utils.aoa_to_sheet([HEADERS, ...rows]);
  sheet['!cols'] = HEADERS.map((_, i) => ({ wch: i === 0 ? 16 : 30 }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheet, '通讯录');
  return wb;
}
export function importBook(data: ArrayBuffer): Contact[] {
  if (data.byteLength > 5 * 1024 * 1024) throw Error('文件不能超过 5 MB');
  const wb = XLSX.read(data, { type: 'array' });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  if (!sheet) throw Error('Excel 文件没有工作表');
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: '', raw: false });
  if (!HEADERS.every((h, i) => rows[0]?.[i] === h)) throw Error('表头不匹配，请先下载模板');
  if (rows.length > 5001) throw Error('一次最多导入 5000 位联系人');
  return rows
    .slice(1)
    .filter((r) => r.some((v) => String(v).trim()))
    .map((r, i) => {
      const methods: Method[] = [];
      TYPES.forEach((type, j) => {
        const cell = String(r[j + 3] ?? '').trim();
        if (!cell) return;
        let values: unknown;
        try {
          values = cell.startsWith('[') ? JSON.parse(cell) : cell.split(/\r?\n/);
        } catch {
          throw Error(`第 ${i + 2} 行的${type}格式错误`);
        }
        if (!Array.isArray(values) || values.some((v) => typeof v !== 'string'))
          throw Error(`第 ${i + 2} 行的${type}必须是文本数组`);
        values.forEach((value) => {
          if (value.trim()) methods.push({ type, value: value.trim() });
        });
      });
      const favorite = String(r[2] ?? '').trim();
      if (!['是', '否', ''].includes(favorite)) throw Error(`第 ${i + 2} 行收藏只能填写是或否`);
      const c: Contact = {
        id: crypto.randomUUID(),
        name: String(r[0] ?? '').trim(),
        company: String(r[1] ?? ''),
        favorite: favorite === '是',
        methods,
        notes: String(r[7] ?? ''),
      };
      const error = validate(c);
      if (error) throw Error(`第 ${i + 2} 行：${error}`);
      return c;
    });
}
export function loadContacts(): Contact[] {
  const raw = localStorage.getItem('contact-studio-v1');
  if (raw === null) return [];
  const data: unknown = JSON.parse(raw);
  if (
    !Array.isArray(data) ||
    data.some(
      (c) =>
        !c ||
        typeof c.id !== 'string' ||
        typeof c.name !== 'string' ||
        typeof c.company !== 'string' ||
        typeof c.notes !== 'string' ||
        typeof c.favorite !== 'boolean' ||
        !Array.isArray(c.methods) ||
        c.methods.some((m: Method) => !m || !TYPES.includes(m.type) || typeof m.value !== 'string'),
    )
  )
    throw Error('本地数据格式损坏，请先备份浏览器数据');
  return data;
}
