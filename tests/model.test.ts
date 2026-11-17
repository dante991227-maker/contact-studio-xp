import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as XLSX from 'xlsx';
import { exportBook, importBook, validate, HEADERS, Contact } from '../src/model';
const c: Contact = {
  id: '1',
  name: '测试 <script>',
  company: '学校',
  favorite: true,
  notes: '多行\n备注',
  methods: [
    { type: '电话', value: '0012345' },
    { type: '电话', value: '+86 13800000000' },
    { type: '邮箱', value: 'a@example.com' },
    { type: '地址', value: '一号路, 2楼' },
  ],
};
test('Excel round trip preserves all fields and leading zeros', () => {
  const bytes = XLSX.write(exportBook([c]), { type: 'array', bookType: 'xlsx' });
  const [actual] = importBook(bytes);
  assert.deepEqual({ ...actual, id: '1' }, c);
});
test('invalid header rejected', () => {
  const w = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(w, XLSX.utils.aoa_to_sheet([['wrong']]));
  assert.throws(() => importBook(XLSX.write(w, { type: 'array', bookType: 'xlsx' })), /表头/);
});
test('invalid row rejects entire import', () => {
  const w = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(w, XLSX.utils.aoa_to_sheet([HEADERS, ['正确'], ['', '', '否']]));
  assert.throws(() => importBook(XLSX.write(w, { type: 'array', bookType: 'xlsx' })), /第 3 行/);
});
test('empty template is valid', () =>
  assert.deepEqual(
    importBook(XLSX.write(exportBook([]), { type: 'array', bookType: 'xlsx' })),
    [],
  ));
test('email and required names validated', () => {
  assert.match(validate({ ...c, name: ' ' }), /姓名/);
  assert.match(validate({ ...c, methods: [{ type: '邮箱', value: 'bad' }] }), /邮箱/);
});
