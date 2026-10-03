// Focused checks use the installed TypeScript compiler and Node, with no new dependencies.
const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const path = require('node:path')
const ts = require('typescript')
function load(file, dependencies = {}, globals = {}) {
  const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8').replaceAll('import.meta.env.', 'testEnv.')
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText
  const exports = {}
  vm.runInNewContext(output, { exports, require: (name) => { if (!(name in dependencies)) throw Error(`Unexpected dependency ${name}`); return dependencies[name] }, ...globals }, { filename: file })
  return exports
}
const money = load('src/features/friends-family/money.ts')
const privacy = load('src/services/analyticsPrivacy.ts', {}, { URL })
const config = { minAmountMinor: '1', maxAmountMinor: '1000000000000', inrMinorPerUsd: '9500', inrPerUsd: '95', targetUsdMinor: '200000000' }
test('exact paise survive crore and lakh entry, including smallest allowed amount', () => {
  assert.equal(money.parseAmount('1.000000001', 'INR', 'Crore'), '1000000001')
  assert.equal(money.parseAmount('0.000000001', 'INR', 'Crore'), '1')
  assert.equal(money.parseAmount('0.0000001', 'INR', 'Lakh'), '1')
  assert.equal(money.parseAmount('10.01', 'USD', 'Crore'), '1001')
  assert.equal(money.parseAmount('1.01000', 'USD', 'Crore'), '101')
})
test('invalid formats and fractional minor units never reach a payload', () => {
  for (const value of ['', '-1', '1e6', '1,000', 'NaN', '1.001', ' 1', '.1', '1.']) assert.equal(money.parseAmount(value, 'USD', 'Crore'), null)
  assert.equal(money.parseAmount('9'.repeat(41), 'INR', 'Crore'), null)
})
test('server bounds accept one paise and reject zero or above maximum', () => {
  assert.equal(money.amountError('1', config), null)
  assert.equal(money.amountError(config.maxAmountMinor, config), null)
  assert.ok(money.amountError('0', config))
  assert.ok(money.amountError('1000000000001', config))
})
test('unit switches preserve exact amounts across repeated toggles', () => {
  const initial = 1000000001n
  for (const unit of ['Crore', 'Lakh', 'Crore', 'Lakh']) assert.equal(money.parseAmount(money.decimalForScale(initial, money.unitScale('INR', unit)), 'INR', unit), initial.toString())
})
test('currency toggles retain canonical amount without conversion drift', () => {
  const canonical = { currency: 'INR', amountMinor: '1000000001' }
  for (let i = 0; i < 100; i++) {
    assert.equal(money.selectedMoney(canonical, 'USD', '9500').amountMinor, '10526316')
    assert.equal(money.selectedMoney(canonical, 'INR', '9500').amountMinor, '1000000001')
  }
})
test('save uses selected currency and validates converted bounds, including tiny INR to zero USD', () => {
  assert.equal(money.selectedMoney({ currency: 'INR', amountMinor: '9500' }, 'USD', '9500').currency, 'USD')
  assert.equal(money.selectedMoney({ currency: 'INR', amountMinor: '9500' }, 'USD', '9500').amountMinor, '100')
  assert.ok(money.amountError(money.selectedMoney({ currency: 'INR', amountMinor: '1' }, 'USD', '9500').amountMinor, config))
  assert.ok(money.amountError(money.selectedMoney({ currency: 'USD', amountMinor: config.maxAmountMinor }, 'INR', '9500').amountMinor, config))
  assert.equal(money.convertMinor({ currency: 'INR', amountMinor: '47' }, 'USD', '9500'), 0n)
  assert.equal(money.convertMinor({ currency: 'INR', amountMinor: '48' }, 'USD', '9500'), 1n)
})
test('large amounts format without floating point loss and percentages identify target share', () => {
  assert.equal(money.formatMoney('1000000000001', 'INR'), '₹10,00,00,00,000.01')
  assert.equal(money.ownBasisPoints({ currency: 'USD', amountMinor: '1000000' }, config), 50n)
  assert.equal(money.percentLabel(50n), '0.5%')
})
test('retry sends the identical operation UUID and payload; a reviewed new command gets a new UUID', async () => {
  const requests = []; let attempt = 0; let id = 0
  const api = load('src/features/friends-family/api.ts', { '../../services/api': { API_URL: 'http://localhost:8080' } }, {
    crypto: { randomUUID: () => `uuid-${++id}` }, AbortSignal,
    fetch: async (url, options) => { requests.push({ url, options }); if (++attempt === 1) throw Error('Response lost'); return { ok: true, json: async () => ({ replayed: true }) } },
  })
  const command = api.createCommand('3', { currency: 'USD', amountMinor: '100' })
  await assert.rejects(api.executeCommand(command)); await api.executeCommand(command)
  assert.equal(requests[0].options.body, requests[1].options.body)
  assert.equal(requests[0].options.credentials, 'include'); assert.equal(requests[0].options.cache, 'no-store')
  assert.equal(requests[0].url, 'http://localhost:8080/friends-and-family/commitment')
  const body = JSON.parse(requests[0].options.body)
  assert.deepEqual(Object.keys(body).sort(), ['amountMinor', 'currency', 'expectedVersion', 'operationId'])
  assert.notEqual(api.createCommand('4').operationId, command.operationId)
})
test('authentication and stale versions retain distinct typed error statuses', async () => {
  for (const status of [401, 409, 500]) {
    const api = load('src/features/friends-family/api.ts', { '../../services/api': { API_URL: '' } }, { AbortSignal, fetch: async () => ({ ok: false, status }) })
    await assert.rejects(api.privateFetch('/friends-and-family'), (error) => error instanceof api.RoundApiError && error.status === status)
  }
})
test('private path matching covers trailing slash, descendants and URLs without blocking unrelated pages', () => {
  for (const item of ['/invest', '/invest/', '/invest/admin']) assert.equal(privacy.isPrivateAnalyticsPath(item), true)
  assert.equal(privacy.isPrivateAnalyticsUrl('https://ankush.wiki/invest?x=1'), true)
  for (const item of ['/investors', '/invest-public']) assert.equal(privacy.isPrivateAnalyticsPath(item), false)
  assert.equal(privacy.isPrivateAnalyticsPath('/friends-and-family'), false)
  assert.equal(privacy.isPrivateAnalyticsPath('/new'), false)
})

function analyticsHarness(initialPath) {
  const calls = []; const callbacks = {}; const configs = []
  const window = { location: { pathname: initialPath, href: `https://ankush.wiki${initialPath}` }, addEventListener: (event, fn) => { (callbacks[event] ??= []).push(fn) }, history: {} }
  for (const method of ['pushState', 'replaceState']) window.history[method] = (_data, _unused, url) => { window.location.pathname = new URL(url, window.location.href).pathname; window.location.href = `https://ankush.wiki${window.location.pathname}` }
  const sdk = { init: (_key, config) => configs.push(config), capture: (...args) => calls.push(['capture', ...args]), identify: (...args) => calls.push(['identify', ...args]), reset: () => calls.push(['reset']), stopSessionRecording: () => calls.push(['stop']), set_config: (config) => calls.push(['config', config]) }
  const module = load('src/services/analytics.ts', { 'posthog-js': { default: sdk }, './analyticsPrivacy': privacy }, {
    window, URL, console, testEnv: { VITE_PUBLIC_POSTHOG_KEY: 'synthetic-test-key' },
    document: { readyState: 'loading', querySelectorAll: () => [], addEventListener: () => {} },
  })
  return { calls, callbacks, configs, window, module }
}
test('direct private load does not initialize analytics or identify the member', () => {
  const state = analyticsHarness('/invest/')
  state.module.installAnalyticsPrivacyGuard(); state.module.syncAnalyticsRoute()
  state.module.identifyUser('synthetic-member', { email: 'synthetic@example.test' }); state.module.trackEvent('financial-edit')
  assert.equal(state.configs.length, 0); assert.equal(state.calls.length, 0)
})
test('SPA entry stops recording before navigation, blocks delayed callbacks, and restores public analytics', () => {
  const state = analyticsHarness('/')
  state.module.installAnalyticsPrivacyGuard(); state.module.syncAnalyticsRoute()
  assert.equal(state.configs.length, 1)
  state.module.trackEvent('public-event'); assert.equal(state.calls.filter(call => call[0] === 'capture').length, 1)
  state.window.history.pushState(null, '', '/invest')
  assert.ok(state.calls.some(call => call[0] === 'stop'))
  state.module.identifyUser('member', { email: 'synthetic@example.test' }); state.module.trackEvent('financial-edit')
  for (const callback of state.callbacks.error ?? []) callback({ message: 'private financial data' })
  assert.equal(state.calls.filter(call => call[0] === 'capture').length, 1)
  assert.equal(state.calls.filter(call => call[0] === 'identify').length, 0)
  assert.equal(state.configs[0].before_send({ properties: { $current_url: 'https://ankush.wiki/invest' } }), null)
  assert.equal(state.configs[0].session_recording.maskCapturedNetworkRequestFn({ name: 'https://api.example.test/friends-and-family/commitment' }), null)
  state.window.history.pushState(null, '', '/new'); state.module.syncAnalyticsRoute(); state.module.trackEvent('public-again')
  assert.equal(state.calls.filter(call => call[0] === 'capture').length, 2)
  assert.equal(state.configs[0].before_send({ properties: { path: '/invest/' } }), null)
  assert.ok(state.configs[0].before_send({ properties: { path: '/new' } }))
  state.window.location.pathname = '/invest/'
  for (const callback of state.callbacks.popstate ?? []) callback()
  state.module.trackEvent('private-back-navigation')
  assert.equal(state.calls.filter(call => call[0] === 'capture').length, 2)
})
test('session replay masks the /admin/friends-and-family API paths without masking every /admin/ path', () => {
  for (const item of ['https://api.example.test/admin/friends-and-family', 'https://api.example.test/admin/friends-and-family/', 'https://api.example.test/admin/friends-and-family/participants', 'https://api.example.test/admin/friends-and-family/round-target', 'https://api.example.test/admin/friends-and-family/exchange-rate', '/admin/friends-and-family/participants?x=1']) assert.equal(privacy.isPrivateNetworkUrl(item), true, item)
  for (const item of ['https://api.example.test/admin', 'https://api.example.test/admin/', 'https://api.example.test/admin/other', 'https://api.example.test/admin/friends-and-family-public', 'https://api.example.test/x/admin/friends-and-family']) assert.equal(privacy.isPrivateNetworkUrl(item), false, item)
  const state = analyticsHarness('/')
  state.module.installAnalyticsPrivacyGuard(); state.module.syncAnalyticsRoute()
  const mask = state.configs[0].session_recording.maskCapturedNetworkRequestFn
  for (const name of ['https://api.example.test/admin/friends-and-family/participants', 'https://api.example.test/admin/friends-and-family/round-target', 'https://api.example.test/admin/friends-and-family/exchange-rate']) assert.equal(mask({ name }), null, name)
  assert.deepEqual(mask({ name: 'https://api.example.test/admin/other' }), { name: 'https://api.example.test/admin/other' })
})
const participantHelpers = load('src/features/friends-family/participants.ts')
test('participants fetch policy allows only server-enabled admin capability and isolates account keys', () => {
  const member = { capabilities: { canViewParticipants: false } }
  const admin = { capabilities: { canViewParticipants: true } }
  assert.equal(participantHelpers.participantsQueryPolicy(member, 'member-account').enabled, false)
  assert.equal(participantHelpers.participantsQueryPolicy(admin, '').enabled, false)
  assert.equal(participantHelpers.participantsQueryPolicy(admin, 'admin-account').enabled, true)
  assert.notEqual(participantHelpers.participantsQueryPolicy(admin, 'a').queryKey[2], participantHelpers.participantsQueryPolicy(admin, 'b').queryKey[2])
  assert.equal(participantHelpers.participantsQueryPolicy(admin, 'a').gcTime, 0)
  assert.equal(participantHelpers.participantsQueryPolicy(admin, 'a').refetchInterval, 15000)
})
test('participant search matches name/email case-insensitively without mutating original list', () => {
  const participants = [{ name: 'Asha Example', email: 'asha@example.test' }, { name: 'Ravi Sample', email: 'ravi@other.test' }]
  assert.equal(participantHelpers.searchParticipants(participants, '  ASHA ').length, 1)
  assert.equal(participantHelpers.searchParticipants(participants, '@OTHER.TEST')[0].name, 'Ravi Sample')
  assert.equal(participantHelpers.searchParticipants(participants, 'unmatched').length, 0)
  assert.equal(participantHelpers.searchParticipants(participants, ''), participants)
  assert.equal(participants.length, 2)
})
test('remaining total is exact and never becomes negative beyond target', () => {
  assert.equal(participantHelpers.remainingUsdMinor('200000000', '105263'), '199894737')
  assert.equal(participantHelpers.remainingUsdMinor('200000000', '200000000'), '0')
  assert.equal(participantHelpers.remainingUsdMinor('200000000', '200000001'), '0')
  assert.equal(participantHelpers.remainingUsdMinor('999999999999999999999', '1'), '999999999999999999998')
})
const React = require('react')
const jsxRuntime = require('react/jsx-runtime')
const { renderToStaticMarkup } = require('react-dom/server')
const flow = load('src/features/friends-family/memberFlow.ts')
const roundFixture = {
  config: { ...config, minTargetUsdMinor: '1', maxTargetUsdMinor: '1000000000000', rateIsTemporary: true, currencies: ['INR', 'USD'], minorUnitsPerMajor: '100' },
  round: { version: '0', updatedAt: '2026-10-03T00:00:00.000Z' },
  summary: { participantCount: '3', totalInrMinor: '9500000', totalUsdMinor: '100000', exactUsdMinor: { numerator: '9500000', denominator: '95' }, progressBasisPoints: '5' },
  ownCommitment: null, currentVersion: '0', capabilities: { canViewParticipants: false, canManageRound: false },
}
const ui = load('src/features/friends-family/ui.tsx', { 'react/jsx-runtime': jsxRuntime })
const moneyEditor = load('src/features/friends-family/MoneyEditor.tsx', { react: React, 'react/jsx-runtime': jsxRuntime, './money': money, './ui': ui })
const inertApi = load('src/features/friends-family/api.ts', { '../../services/api': { API_URL: '' } }, { AbortSignal, crypto: { randomUUID: () => 'synthetic-operation' } })
const panel = load('src/features/friends-family/CommitmentPanel.tsx', { react: React, 'react/jsx-runtime': jsxRuntime, '@tanstack/react-query': { useQueryClient: () => ({}) }, './api': inertApi, './money': money, './MoneyEditor': moneyEditor, './ui': ui })
const progress = load('src/features/friends-family/RoundProgress.tsx', { 'react/jsx-runtime': jsxRuntime, './money': money, './ui': ui })
// The assets module is stubbed: the committed one holds nothing, and filled-in states are exercised here only.
const emptyAssets = { ankushPhoto: null, welcomeMedia: null }
function loadMember({ react = React, assets = emptyAssets } = {}) {
  return load('src/features/friends-family/MemberRound.tsx', {
    react, 'react/jsx-runtime': jsxRuntime, './CommitmentPanel': panel, './RoundProgress': progress,
    './money': money, './participants': participantHelpers, './memberFlow': flow, './ui': ui, './assets': assets,
  })
}
const member = loadMember()
const memberProps = { overview: roundFixture, queryKey: ['private-friends-family', 'overview', 'synthetic-member'], refresh: async () => roundFixture, onUnauthorized: () => {}, refreshFailed: false }
function renderStage(stage, overview = roundFixture, extra = {}, component = member) {
  return renderToStaticMarkup(React.createElement(component.MemberRoundContent, { ...memberProps, overview, stage, onNext: () => {}, onSaveConfirmed: () => {}, ...extra }))
}
function assertNoRoundTotals(html) {
  for (const marker of ['Round progress', 'progressbar', 'US$2,000,000', 'US$1,000', 'of the target', 'Friends and family so far', 'Still to go']) assert.equal(html.includes(marker), false, marker)
}
const historyFixtures = [
  { ...roundFixture, currentVersion: '1' },
  { ...roundFixture, ownCommitment: { status: 'withdrawn' } },
  { ...roundFixture, ownCommitment: { status: 'active' } },
]
// Mount the real MemberRound with a small useReducer store, so Next can be pressed between renders.
function memberFlowHarness(overview) {
  let stage; let mounted = false
  const hooks = { useReducer: (reducer, arg, init) => { if (!mounted) { stage = init ? init(arg) : arg; mounted = true } return [stage, event => { stage = reducer(stage, event) }] } }
  const component = loadMember({ react: hooks })
  const render = () => component.MemberRound({ ...memberProps, overview })
  return { render, next: () => render().props.onNext(), get stage() { return render().props.stage }, setOverview: next => { overview = next } }
}
test('every signed-in member starts at the welcome letter, with or without a commitment', () => {
  for (const overview of [roundFixture, ...historyFixtures]) {
    assert.equal(memberFlowHarness(overview).stage, 'welcome')
    const html = renderToStaticMarkup(React.createElement(member.MemberRound, { ...memberProps, overview }))
    assert.ok(html.includes(flow.hasMemberHistory(overview) ? 'Welcome back.' : 'Thank you for being here.'))
    assert.ok(html.includes('>Next</button>'))
  }
})
test('next opens amount entry for a member without history; only confirmed-save event opens summary from there', () => {
  assert.equal(flow.memberFlowReducer('welcome', { type: 'next', overview: roundFixture }), 'amount')
  assert.equal(flow.memberFlowReducer('amount', { type: 'next', overview: roundFixture }), 'amount')
  assert.equal(flow.memberFlowReducer('amount', { type: 'save-confirmed' }), 'summary')
  assert.equal(flow.memberFlowReducer('summary', { type: 'next', overview: roundFixture }), 'summary')
})
test('next goes to the summary for a member with history and to the amount step for a member with none, judged when pressed', () => {
  assert.equal(flow.hasMemberHistory(roundFixture), false)
  for (const overview of historyFixtures) {
    assert.equal(flow.hasMemberHistory(overview), true)
    const state = memberFlowHarness(overview); state.next()
    assert.equal(state.stage, 'summary')
  }
  const fresh = memberFlowHarness(roundFixture); fresh.next()
  assert.equal(fresh.stage, 'amount')
  // Polling never moves the stage, and Next reads the latest overview at the moment it is pressed.
  const polled = memberFlowHarness(roundFixture)
  polled.setOverview(historyFixtures[2])
  assert.equal(polled.stage, 'welcome')
  polled.next()
  assert.equal(polled.stage, 'summary')
  const reverted = memberFlowHarness(historyFixtures[2])
  reverted.setOverview(roundFixture)
  reverted.next()
  assert.equal(reverted.stage, 'amount')
})
test('welcome renders personal gratitude and Next without aggregate information', () => {
  const html = renderStage('welcome')
  assert.ok(html.includes('It means the world to me'))
  assert.ok(html.includes('very, very, very tough'))
  assert.ok(html.includes('>Next</button>'))
  assert.equal(html.includes('commitment-amount'), false)
  assertNoRoundTotals(html)
})
test('amount stage renders an empty INR/Crore editor and explicit-save CTA without aggregate DOM', () => {
  const html = renderStage('amount')
  assert.ok(html.includes('What amount are you comfortable investing?'))
  assert.ok(html.includes('Save commitment and view round'))
  assert.ok(html.includes('<option selected="">INR</option>'))
  assert.ok(html.includes('<option selected="">Crore</option>'))
  assert.ok(html.includes('value=""'))
  assert.ok(html.includes('US$1 = ₹95'))
  assertNoRoundTotals(html)
})
test('polling a remote commitment cannot expose totals before explicit local save', () => {
  const remote = { ...roundFixture, currentVersion: '1', ownCommitment: { status: 'active', currency: 'USD', amountMinor: '5000', version: '1', createdAt: '2026-10-03T00:01:00.000Z' } }
  assertNoRoundTotals(renderStage('welcome', remote))
  assertNoRoundTotals(renderStage('amount', remote))
})
test('summary exposes goal/progress, own amount/share, remaining and participant count after confirmation', () => {
  const saved = { ...roundFixture, currentVersion: '1', ownCommitment: { status: 'active', currency: 'USD', amountMinor: '5000', version: '1', createdAt: '2026-10-03T00:01:00.000Z' } }
  const html = renderStage('summary', saved)
  for (const marker of ['Round progress', 'US$2,000,000', 'US$50', 'of the target', 'Still to go', 'US$1,999,000', 'Friends and family so far', 'Change commitment']) assert.ok(html.includes(marker), marker)
})
// Exercise the panel's real handlers with a small hook store. No DOM or network dependency is needed.
function findElement(element, predicate) {
  if (!element || typeof element !== 'object') return undefined
  if (predicate(element)) return element
  for (const child of React.Children.toArray(element.props?.children)) {
    const match = findElement(child, predicate); if (match) return match
  }
}
function panelHarness() {
  const slots = []; let cursor = 0; let commandCount = 0; let confirmed = 0; let expired = 0; const commands = []; const cache = []; let response; let cleanup
  const hooks = {
    useEffect: effect => { if (!cleanup) cleanup = effect() },
    useState: (initial) => { const index = cursor++; if (!(index in slots)) slots[index] = typeof initial === 'function' ? initial() : initial; return [slots[index], (next) => { slots[index] = typeof next === 'function' ? next(slots[index]) : next }] },
    useRef: (initial) => { const index = cursor++; if (!(index in slots)) slots[index] = { current: initial }; return slots[index] },
  }
  const api = { ...inertApi, createCommand: (version, amount) => ({ operationId: `operation-${++commandCount}`, expectedVersion: version, kind: 'save', ...amount }), executeCommand: (command) => { commands.push(command); return new Promise((resolve, reject) => { response = { resolve, reject } }) } }
  const testPanel = load('src/features/friends-family/CommitmentPanel.tsx', { react: hooks, 'react/jsx-runtime': jsxRuntime, '@tanstack/react-query': { useQueryClient: () => ({ cancelQueries: async () => {}, setQueryData: (...args) => cache.push(args) }) }, './api': api, './money': money, './MoneyEditor': moneyEditor, './ui': ui })
  let overview = roundFixture
  function render() { cursor = 0; return testPanel.CommitmentPanel({ overview, queryKey: memberProps.queryKey, refresh: async () => overview, onUnauthorized: () => expired++, entry: true, onSaveConfirmed: () => confirmed++ }) }
  return { render, commands, cache, get response() { return response }, get confirmed() { return confirmed }, get expired() { return expired }, unmount: () => cleanup?.(), setOverview: (next) => { overview = next } }
}
test('unknown save failure keeps entry locked and retries the same command before revealing summary', async () => {
  const state = panelHarness()
  let tree = state.render()
  findElement(tree, node => node.type === moneyEditor.MoneyEditor).props.onSave({ currency: 'INR', amountMinor: '9500' })
  assert.equal(state.confirmed, 0)
  state.response.reject(Error('Response lost'))
  await new Promise(setImmediate)
  tree = state.render()
  assert.equal(findElement(tree, node => node.type === moneyEditor.MoneyEditor).props.locked, true)
  assert.equal(state.confirmed, 0)
  const retry = findElement(tree, node => node.type === 'button' && node.props.children === 'Retry same change')
  assert.ok(retry); retry.props.onClick()
  assert.equal(state.commands.length, 2)
  assert.equal(state.commands[0], state.commands[1])
  state.response.resolve({ ...roundFixture, replayed: true, currentVersion: '1', ownCommitment: { status: 'active', currency: 'INR', amountMinor: '9500' } })
  await new Promise(setImmediate)
  assert.equal(state.confirmed, 1)
})
test('an unsaved entry keeps its original version when polling shows a remote save', () => {
  const state = panelHarness(); state.render()
  state.setOverview({ ...roundFixture, currentVersion: '4', ownCommitment: { status: 'active', currency: 'USD', amountMinor: '100' } })
  const editor = findElement(state.render(), node => node.type === moneyEditor.MoneyEditor)
  assert.equal(editor.props.initial, null)
  editor.props.onSave({ currency: 'USD', amountMinor: '200' })
  assert.equal(state.commands[0].expectedVersion, '0')
  assert.equal(state.confirmed, 0)
})
test('member conflict review cannot adopt a newer polling version without loading it again', async () => {
  const state = panelHarness(); state.render()
  findElement(state.render(), node => node.type === moneyEditor.MoneyEditor).props.onSave({ currency: 'USD', amountMinor: '200' })
  state.setOverview({ ...roundFixture, currentVersion: '4', ownCommitment: { status: 'active', currency: 'USD', amountMinor: '100' } })
  state.response.reject(new inertApi.RoundApiError(409))
  await new Promise(setImmediate)
  const reviewButton = node => node.type === 'button' && node.props.children === 'I reviewed this, continue with my change'
  assert.ok(findElement(state.render(), reviewButton))
  state.setOverview({ ...roundFixture, currentVersion: '5', ownCommitment: { status: 'active', currency: 'USD', amountMinor: '300' } })
  let tree = state.render()
  assert.equal(findElement(tree, reviewButton), undefined)
  assert.equal(findElement(tree, node => node.type === moneyEditor.MoneyEditor).props.locked, true)
  await findElement(tree, node => node.type === 'button' && node.props.children === 'Load latest commitment').props.onClick()
  await new Promise(setImmediate)
  findElement(state.render(), reviewButton).props.onClick()
  findElement(state.render(), node => node.type === moneyEditor.MoneyEditor).props.onSave({ currency: 'USD', amountMinor: '200' })
  assert.equal(state.commands[1].expectedVersion, '5')
  assert.equal(state.commands[1].amountMinor, '200')
  assert.notEqual(state.commands[0].operationId, state.commands[1].operationId)
})
const targetHelpers = load('src/features/friends-family/roundTarget.ts', { './money': money })
const targetComponents = load('src/features/friends-family/RoundTargetEditor.tsx', { react: React, 'react/jsx-runtime': jsxRuntime, './api': inertApi, './money': money, './roundTarget': targetHelpers, './ui': ui })
const rateHelpers = load('src/features/friends-family/exchangeRate.ts', { './money': money })
const rateComponents = load('src/features/friends-family/ExchangeRateEditor.tsx', { react: React, 'react/jsx-runtime': jsxRuntime, './api': inertApi, './money': money, './exchangeRate': rateHelpers, './ui': ui })
const targetSnapshot = { config: roundFixture.config, round: { version: '1', updatedAt: '2026-10-03T00:00:00.000Z' }, exchangeRate: { version: '1', updatedAt: '2026-10-03T00:00:00.000Z' }, summary: { ...roundFixture.summary, totalUsdMinor: '50000000', totalInrMinor: '4750000000', progressBasisPoints: '2500', participantCount: '2' }, participants: [] }
test('million USD entry produces exact canonical cents and rejects fractional cents/invalid formats', () => {
  assert.equal(targetHelpers.parseTargetMillions('2'), '200000000')
  assert.equal(targetHelpers.parseTargetMillions('1.00000001'), '100000001')
  assert.equal(targetHelpers.parseTargetMillions('0.00000001'), '1')
  assert.equal(targetHelpers.parseTargetMillions('0002.00'), '200000000')
  for (const input of ['0.000000001', '1e6', '-1', '1,000', 'NaN', '', '.1', ' 1']) assert.equal(targetHelpers.parseTargetMillions(input), null)
})
test('target bounds use server config, including exact minimum/maximum and no zero', () => {
  assert.equal(targetHelpers.targetError('1', targetSnapshot.config), null)
  assert.equal(targetHelpers.targetError('1000000000000', targetSnapshot.config), null)
  assert.ok(targetHelpers.targetError('0', targetSnapshot.config))
  assert.ok(targetHelpers.targetError('1000000000001', targetSnapshot.config))
  assert.ok(targetHelpers.targetError('1', { ...targetSnapshot.config, minTargetUsdMinor: '2' }))
  assert.ok(targetHelpers.targetError('100', { ...targetSnapshot.config, maxTargetUsdMinor: '99' }))
})
test('target mutation uses independent round version and exact authenticated payload without actor fields', async () => {
  const requests = []
  const api = load('src/features/friends-family/api.ts', { '../../services/api': { API_URL: 'http://localhost:8080' } }, { crypto: { randomUUID: () => 'round-operation' }, AbortSignal, fetch: async (url, options) => { requests.push({ url, options }); return { ok: true, json: async () => ({ ...targetSnapshot, replayed: false }) } } })
  const command = api.createRoundTargetCommand('7', '100000000')
  await api.executeRoundTargetCommand(command)
  assert.equal(requests[0].url, 'http://localhost:8080/admin/friends-and-family/round-target')
  assert.equal(requests[0].options.method, 'PUT')
  assert.equal(requests[0].options.credentials, 'include')
  assert.equal(requests[0].options.cache, 'no-store')
  assert.deepEqual(JSON.parse(requests[0].options.body), { operationId: 'round-operation', expectedVersion: '7', targetUsdMinor: '100000000' })
})
test('snapshot update cancels both older requests before whole-cache replacement and survives overview refresh failure', async () => {
  const calls = []; let finishParticipants; let finishOverview
  const participantsKey = ['private-friends-family', 'participants', 'admin']
  const overviewKey = ['private-friends-family', 'overview', 'admin']
  const client = {
    cancelQueries: ({ queryKey }) => { calls.push(['cancel', queryKey]); return new Promise(resolve => { if (queryKey === participantsKey) finishParticipants = resolve; else finishOverview = resolve }) },
    setQueryData: (key, data) => calls.push(['set', key, data]),
    invalidateQueries: ({ queryKey }) => { calls.push(['invalidate', queryKey]); return Promise.reject(Error('Refresh unavailable')) },
  }
  const result = { ...targetSnapshot, round: { ...targetSnapshot.round, version: '2' }, config: { ...targetSnapshot.config, targetUsdMinor: '100000000' }, summary: { ...targetSnapshot.summary, progressBasisPoints: '5000' }, replayed: false }
  const applying = targetHelpers.applyRoundSnapshot(client, participantsKey, overviewKey, result)
  assert.equal(calls.length, 2)
  finishParticipants(); await Promise.resolve(); assert.equal(calls.length, 2)
  finishOverview(); await applying
  assert.equal(calls[2][0], 'set'); assert.equal(calls[2][1], participantsKey); assert.equal(calls[2][2], result)
  assert.equal(calls[3][0], 'invalidate'); assert.equal(calls[3][1], overviewKey)
})
test('changing two-million target to one-million recomputes remaining/progress/share while own amount stays original', () => {
  const own = { status: 'active', currency: 'USD', amountMinor: '1000000', version: '8', createdAt: '2026-10-03T00:00:00.000Z' }
  const before = { ...roundFixture, ...targetSnapshot, ownCommitment: own, currentVersion: '8' }
  const after = { ...before, config: { ...before.config, targetUsdMinor: '100000000' }, round: { ...before.round, version: '2' }, summary: { ...before.summary, progressBasisPoints: '5000' } }
  assert.equal(targetHelpers.parseTargetMillions('1'), after.config.targetUsdMinor)
  assert.equal(participantHelpers.remainingUsdMinor(before.config.targetUsdMinor, before.summary.totalUsdMinor), '150000000')
  assert.equal(participantHelpers.remainingUsdMinor(after.config.targetUsdMinor, after.summary.totalUsdMinor), '50000000')
  assert.equal(money.ownBasisPoints(money.activeCommitmentMoney(before), before.config), 50n)
  assert.equal(money.ownBasisPoints(money.activeCommitmentMoney(after), after.config), 100n)
  assert.equal(after.ownCommitment, before.ownCommitment)
  const html = renderToStaticMarkup(React.createElement(progress.RoundProgress, { overview: after }))
  assert.ok(html.includes('50% of the round'))
  assert.ok(html.includes('US$1,000,000'))
})
test('a target below commitments shows uncapped percentage with capped bar and zero remaining', () => {
  const overview = { ...roundFixture, ...targetSnapshot, config: { ...targetSnapshot.config, targetUsdMinor: '40000000' }, summary: { ...targetSnapshot.summary, progressBasisPoints: '12500' } }
  const html = renderToStaticMarkup(React.createElement(progress.RoundProgress, { overview }))
  assert.ok(html.includes('125% of the round'))
  assert.ok(html.includes('aria-valuenow="100"'))
  assert.ok(html.includes('width:100%'))
  assert.equal(participantHelpers.remainingUsdMinor(overview.config.targetUsdMinor, overview.summary.totalUsdMinor), '0')
})
test('target controls require server management capability and current goal shows semantic update time', () => {
  const props = { snapshot: targetSnapshot, save: async () => {}, refresh: async () => targetSnapshot, onAccessDenied: () => {} }
  const denied = renderToStaticMarkup(React.createElement(targetComponents.RoundTargetEditor, { ...props, canManage: false }))
  assert.equal(denied.includes('Change target'), false)
  assert.equal(denied.includes('round-target-millions'), false)
  const allowed = renderToStaticMarkup(React.createElement(targetComponents.RoundTargetEditor, { ...props, canManage: true }))
  assert.ok(allowed.includes('Change target'))
  assert.ok(allowed.toLowerCase().includes(`datetime="${targetSnapshot.round.updatedAt.toLowerCase()}"`))
})
function targetHarness() {
  const slots = []; let cursor = 0; let count = 0; const commands = []; let response; let snapshot = targetSnapshot; let manage = true; let latest = targetSnapshot; const denied = []; const editing = []
  const hooks = {
    useState: (initial) => { const index = cursor++; if (!(index in slots)) slots[index] = typeof initial === 'function' ? initial() : initial; return [slots[index], (next) => { slots[index] = typeof next === 'function' ? next(slots[index]) : next }] },
    useRef: (initial) => { const index = cursor++; if (!(index in slots)) slots[index] = { current: initial }; return slots[index] },
  }
  const api = { ...inertApi, createRoundTargetCommand: (expectedVersion, targetUsdMinor) => ({ operationId: `target-operation-${++count}`, expectedVersion, targetUsdMinor }) }
  const component = load('src/features/friends-family/RoundTargetEditor.tsx', { react: hooks, 'react/jsx-runtime': jsxRuntime, './api': api, './money': money, './roundTarget': targetHelpers, './ui': ui })
  const render = () => { cursor = 0; return component.RoundTargetEditor({ snapshot, canManage: manage, save: (command) => { commands.push(command); return new Promise((resolve, reject) => { response = { resolve, reject } }) }, refresh: async () => { snapshot = latest; return latest }, onAccessDenied: status => denied.push(status), onEditStateChange: next => editing.push(next) }) }
  return { render, commands, denied, editing, get response() { return response }, setSnapshot: next => { snapshot = next }, setLatest: next => { latest = next }, setManage: next => { manage = next } }
}
function openTarget(state) {
  findElement(state.render(), node => node.type === 'button' && node.props.children === 'Change target').props.onClick()
  return state.render()
}
function editTarget(state, value) {
  findElement(state.render(), node => node.type === 'input').props.onChange({ target: { value } })
  return state.render()
}
function submitTarget(tree) { findElement(tree, node => node.type === 'form').props.onSubmit({ preventDefault() {} }) }
test('target form shows prefilled millions/full USD and INR equivalents, with editable exact decimals', () => {
  const state = targetHarness(); let tree = openTarget(state)
  assert.equal(findElement(tree, node => node.type === 'input').props.value, '2')
  tree = editTarget(state, '1')
  const html = renderToStaticMarkup(tree)
  for (const marker of ['Target in USD millions', 'million USD', 'US$1,000,000', '₹9,50,00,000', 'Save target', 'Cancel']) assert.ok(html.includes(marker), marker)
})
test('unknown target result locks cancel/input and retries identical command with re-entry guard', async () => {
  const state = targetHarness(); openTarget(state); const tree = editTarget(state, '1')
  assert.deepEqual(state.editing, [true])
  submitTarget(tree); submitTarget(tree)
  assert.equal(state.commands.length, 1)
  assert.equal(state.commands[0].expectedVersion, '1')
  state.response.reject(Error('Response lost')); await new Promise(setImmediate)
  const uncertain = state.render()
  assert.deepEqual(state.editing, [true])
  assert.equal(findElement(uncertain, node => node.type === 'input').props.disabled, true)
  const cancel = findElement(uncertain, node => node.type === 'button' && node.props.children === 'Cancel')
  assert.equal(cancel.props.disabled, true); cancel.props.onClick(); assert.ok(findElement(state.render(), node => node.type === 'form'))
  findElement(uncertain, node => node.type === 'button' && node.props.children === 'Retry same target change').props.onClick()
  assert.equal(state.commands.length, 2); assert.equal(state.commands[0], state.commands[1])
  state.response.resolve({ ...targetSnapshot, replayed: true }); await new Promise(setImmediate)
  assert.deepEqual(state.editing, [true, false])
  assert.equal(findElement(state.render(), node => node.type === 'form'), undefined)
  assert.ok(renderToStaticMarkup(state.render()).includes('The round target is up to date.'))
})
test('target polling preserves frozen draft; stale failure requires latest review before issuing new UUID', async () => {
  const state = targetHarness(); openTarget(state); editTarget(state, '1')
  state.setSnapshot({ ...targetSnapshot, round: { ...targetSnapshot.round, version: '2' }, config: { ...targetSnapshot.config, targetUsdMinor: '300000000' } })
  state.setLatest({ ...targetSnapshot, round: { ...targetSnapshot.round, version: '3' }, config: { ...targetSnapshot.config, targetUsdMinor: '400000000' } })
  submitTarget(state.render())
  assert.equal(state.commands[0].expectedVersion, '1')
  assert.equal(state.commands[0].targetUsdMinor, '100000000')
  state.response.reject(new inertApi.RoundApiError(409)); await new Promise(setImmediate)
  let tree = state.render()
  assert.equal(findElement(tree, node => node.type === 'input').props.value, '1')
  assert.equal(findElement(tree, node => node.type === 'input').props.disabled, true)
  assert.ok(renderToStaticMarkup(tree).includes('Latest target:'))
  submitTarget(tree); assert.equal(state.commands.length, 1)
  findElement(tree, node => node.type === 'button' && node.props.children === 'I reviewed this, keep my draft').props.onClick()
  tree = state.render(); submitTarget(tree)
  assert.equal(state.commands[1].expectedVersion, '3')
  assert.equal(state.commands[1].targetUsdMinor, '100000000')
  assert.notEqual(state.commands[1].operationId, state.commands[0].operationId)
})
test('a newer poll after conflict review fetch requires loading latest again rather than silently rebasing', async () => {
  const state = targetHarness(); openTarget(state); editTarget(state, '1'); submitTarget(state.render())
  state.setLatest({ ...targetSnapshot, round: { ...targetSnapshot.round, version: '2' } })
  state.response.reject(new inertApi.RoundApiError(409)); await new Promise(setImmediate)
  state.setSnapshot({ ...targetSnapshot, round: { ...targetSnapshot.round, version: '3' } })
  assert.equal(findElement(state.render(), node => node.type === 'button' && node.props.children === 'I reviewed this, keep my draft'), undefined)
  assert.ok(findElement(state.render(), node => node.type === 'button' && node.props.children === 'Load latest target'))
})
test('target access failures are handed to dashboard privacy feedback and revoked capability hides controls', async () => {
  for (const status of [401, 403]) {
    const state = targetHarness(); openTarget(state); editTarget(state, '1'); submitTarget(state.render())
    state.response.reject(new inertApi.RoundApiError(status)); await new Promise(setImmediate)
    assert.deepEqual(state.denied, [status])
  }
  const state = targetHarness(); openTarget(state); state.setManage(false)
  assert.equal(findElement(state.render(), node => node.type === 'form'), undefined)
})

const views = load('src/features/friends-family/RoundViews.tsx', { react: React, 'react/jsx-runtime': jsxRuntime, './MemberRound': member, './AdminDashboard': { AdminDashboard: () => { throw Error('Dashboard must be explicitly opened') } }, './ui': ui })
const adminOverview = { ...roundFixture, capabilities: { canViewParticipants: true, canManageRound: true } }
function pageHarness(user, overview) {
  const queries = []
  const page = load('src/pages/FriendsAndFamily.tsx', {
    react: React, 'react/jsx-runtime': jsxRuntime,
    '@tanstack/react-query': { useQueryClient: () => ({}), useQuery: (options) => { queries.push(options); return { data: options.queryKey[1] === 'session' ? { user } : overview, isPending: false, isError: false } } },
    '../services/api': { API_URL: 'https://example.com' },
    '../features/friends-family/api': inertApi, '../features/friends-family/RoundViews': views,
    '../features/friends-family/ThemeSwitch': { ThemeSwitch: () => null }, '../features/friends-family/ui': ui,
  })
  const html = renderToStaticMarkup(React.createElement(page.default))
  return { html, queries }
}
test('admin first load uses the regular welcome and owner overview without fetching participant data', () => {
  const state = pageHarness({ authId: 'admin-subject', name: 'Admin Example', email: 'admin@example.test' }, adminOverview)
  assert.ok(state.html.includes('Thank you for being here.'))
  assert.ok(state.html.includes('Admin view'))
  assertNoRoundTotals(state.html)
  assert.equal(state.queries.length, 2)
  assert.equal(state.queries[1].queryKey[2], 'admin-subject')
  assert.equal(state.queries.some(query => query.queryKey[1] === 'participants'), false)
})
test('a member or the admin with a saved commitment still lands on the welcome without round figures', () => {
  const saved = { status: 'active', currency: 'USD', amountMinor: '5000', version: '1', createdAt: '2026-10-03T00:01:00.000Z' }
  for (const [user, overview] of [
    [{ authId: 'admin-subject', name: 'Admin Example', email: 'admin@example.test' }, { ...adminOverview, currentVersion: '1', ownCommitment: saved }],
    [{ authId: 'member-subject', name: 'Member Example', email: 'member@example.test' }, { ...roundFixture, currentVersion: '1', ownCommitment: saved }],
  ]) {
    const state = pageHarness(user, overview)
    assert.ok(state.html.includes('Welcome back.'), user.authId)
    assert.equal(state.html.includes('Change commitment'), false, user.authId)
    assertNoRoundTotals(state.html)
  }
})
test('ordinary members have the same welcome and no Admin view action', () => {
  const state = pageHarness({ authId: 'member-subject', name: 'Member Example', email: 'member@example.test' }, roundFixture)
  assert.ok(state.html.includes('Thank you for being here.'))
  assert.equal(state.html.includes('Admin view'), false)
})
function viewsHarness(overview = adminOverview) {
  const slots = []; let cursor = 0
  const hooks = { useState: (initial) => { const index = cursor++; if (!(index in slots)) slots[index] = initial; return [slots[index], next => { slots[index] = typeof next === 'function' ? next(slots[index]) : next }] } }
  const dashboard = { AdminDashboard: function Dashboard() {} }
  const component = load('src/features/friends-family/RoundViews.tsx', { react: hooks, 'react/jsx-runtime': jsxRuntime, './MemberRound': member, './AdminDashboard': dashboard, './ui': ui })
  const render = () => { cursor = 0; return component.RoundViews({ ...memberProps, overview, authId: 'admin-subject', login: () => {} }) }
  return { render, dashboard: dashboard.AdminDashboard, setOverview: next => { overview = next } }
}
function toggleViews(state, label) { findElement(state.render(), node => node.type === 'button' && node.props.children === label).props.onClick() }
test('only explicit Admin view mounts dashboard; returning removes it and retains member subtree position', () => {
  const state = viewsHarness()
  const before = state.render()
  const initialMember = findElement(before, node => node.type === member.MemberRound)
  assert.ok(initialMember); assert.equal(findElement(before, node => node.type === state.dashboard), undefined)
  toggleViews(state, 'Admin view')
  let tree = state.render()
  assert.ok(findElement(tree, node => node.type === state.dashboard))
  const retainedMember = findElement(tree, node => node.type === member.MemberRound)
  assert.equal(retainedMember.type, initialMember.type)
  assert.equal(retainedMember.key, initialMember.key)
  assert.equal(retainedMember.props.queryKey, initialMember.props.queryKey)
  assert.equal(React.Children.toArray(tree.props.children)[1].props.hidden, true)
  toggleViews(state, 'Member view')
  tree = state.render()
  assert.equal(findElement(tree, node => node.type === state.dashboard), undefined)
  assert.equal(React.Children.toArray(tree.props.children)[1].props.hidden, false)
})
test('target drafts and uncertain results block FnF return until editor confirms save or cancellation', () => {
  const state = viewsHarness(); toggleViews(state, 'Admin view')
  findElement(state.render(), node => node.type === state.dashboard).props.onExitLockChange(true)
  let tree = state.render()
  const back = findElement(tree, node => node.type === 'button' && node.props.children === 'Member view')
  assert.equal(back.props.disabled, true)
  assert.ok(renderToStaticMarkup(findElement(tree, node => node.props?.id === 'round-view-lock')).includes('retry the same change first'))
  back.props.onClick(); assert.ok(findElement(state.render(), node => node.type === state.dashboard))
  findElement(state.render(), node => node.type === state.dashboard).props.onExitLockChange(false)
  toggleViews(state, 'Member view'); assert.equal(findElement(state.render(), node => node.type === state.dashboard), undefined)
})
test('capability removal immediately hides dashboard and restoration stays in FnF; a new account defaults to FnF', () => {
  const state = viewsHarness(); toggleViews(state, 'Admin view')
  state.setOverview(roundFixture)
  assert.equal(findElement(state.render(), node => node.type === state.dashboard), undefined)
  state.setOverview(adminOverview)
  assert.equal(findElement(state.render(), node => node.type === state.dashboard), undefined)
  assert.ok(findElement(state.render(), node => node.type === 'button' && node.props.children === 'Admin view'))
  assert.equal(findElement(viewsHarness().render(), node => node.type === state.dashboard), undefined)
})
test('the actual page keys the shared experience by authenticated subject when accounts change', () => {
  for (const authId of ['admin-one', 'admin-two']) {
    const hooks = { useState: initial => [initial, () => {}] }
    const page = load('src/pages/FriendsAndFamily.tsx', { react: hooks, 'react/jsx-runtime': jsxRuntime, '@tanstack/react-query': { useQueryClient: () => ({}), useQuery: options => ({ data: options.queryKey[1] === 'session' ? { user: { authId } } : adminOverview, isPending: false, isError: false }) }, '../services/api': { API_URL: '' }, '../features/friends-family/api': inertApi, '../features/friends-family/RoundViews': views, '../features/friends-family/ThemeSwitch': { ThemeSwitch: () => null }, '../features/friends-family/ui': ui })
    const experience = findElement(page.default(), node => node.type === views.RoundViews)
    assert.equal(experience.key.endsWith(`$${authId}`), true)
    assert.equal(experience.props.authId, authId)
    assert.equal(experience.props.queryKey[2], authId)
  }
})
test('login and logout return to the private /invest page', async () => {
  for (const user of [null, { authId: 'member-subject' }]) {
    const window = { location: { href: '' } }
    const hooks = { useState: initial => [initial, () => {}] }
    const page = load('src/pages/FriendsAndFamily.tsx', { react: hooks, 'react/jsx-runtime': jsxRuntime, '@tanstack/react-query': { useQueryClient: () => ({ cancelQueries: () => Promise.resolve(), removeQueries: () => {} }), useQuery: options => ({ data: options.queryKey[1] === 'session' ? { user } : roundFixture, isPending: false, isError: false }) }, '../services/api': { API_URL: 'https://api.example.test' }, '../features/friends-family/api': inertApi, '../features/friends-family/RoundViews': views, '../features/friends-family/ThemeSwitch': { ThemeSwitch: () => null }, '../features/friends-family/ui': ui }, { window })
    const label = user ? 'Sign out' : 'Continue with Google'
    findElement(page.default(), node => node.type === 'button' && node.props.children === label).props.onClick()
    await new Promise(resolve => setImmediate(resolve))
    assert.equal(window.location.href, `https://api.example.test/auth/${user ? 'logout' : 'login'}?returnTo=%2Finvest`)
  }
})
test('late target result cannot repopulate participant cache after account or view cleanup', async () => {
  const calls = []; let current = true; const finish = []
  const pending = targetHelpers.applyRoundSnapshot({ cancelQueries: () => new Promise(resolve => finish.push(resolve)), setQueryData: () => calls.push('set'), invalidateQueries: () => { calls.push('invalidate'); return Promise.resolve() } }, ['participants'], ['overview'], targetSnapshot, () => current)
  current = false; for (const resolve of finish) resolve(); await pending
  assert.deepEqual(calls, [])
})
test('canceling an editable target releases the view-exit lock without recording a target command', () => {
  const state = targetHarness(); openTarget(state); editTarget(state, '1')
  findElement(state.render(), node => node.type === 'button' && node.props.children === 'Cancel').props.onClick()
  assert.deepEqual(state.editing, [true, false])
  assert.equal(state.commands.length, 0)
})
test('dashboard unmount cancels and removes its account-specific participant query', () => {
  const cleanups = []; const calls = []
  const hooks = { useState: initial => [initial, () => {}], useRef: initial => ({ current: initial }), useEffect: effect => { const cleanup = effect(); if (cleanup) cleanups.push(cleanup) } }
  const dashboard = load('src/features/friends-family/AdminDashboard.tsx', { react: hooks, 'react/jsx-runtime': jsxRuntime, '@tanstack/react-query': { useQueryClient: () => ({ cancelQueries: options => { calls.push(['cancel', options.queryKey]); return Promise.resolve() }, removeQueries: options => calls.push(['remove', options.queryKey]) }), useQuery: options => { calls.push(['query', options.queryKey]); return { data: targetSnapshot, dataUpdatedAt: 1 } } }, './api': inertApi, './RoundProgress': progress, './money': money, './participants': participantHelpers, './ParticipantList': { ParticipantList: () => null }, './RoundTargetEditor': targetComponents, './ExchangeRateEditor': rateComponents, './roundTarget': targetHelpers, './ui': ui })
  dashboard.AdminDashboard({ overview: adminOverview, authId: 'admin-subject', login: () => {} })
  assert.deepEqual(Array.from(calls[0][1]), ['private-friends-family', 'participants', 'admin-subject'])
  for (const cleanup of cleanups) cleanup()
  assert.equal(calls[1][0], 'cancel'); assert.equal(calls[2][0], 'remove')
  assert.deepEqual(Array.from(calls[2][1]), ['private-friends-family', 'participants', 'admin-subject'])
})
test('the admin dashboard fetches participants from the /admin/friends-and-family path', async () => {
  const requests = []; let queryOptions
  const api = load('src/features/friends-family/api.ts', { '../../services/api': { API_URL: 'http://localhost:8080' } }, { AbortSignal, crypto: { randomUUID: () => 'unused' }, fetch: async (url, options) => { requests.push({ url, options }); return { ok: true, json: async () => targetSnapshot } } })
  const hooks = { useState: initial => [initial, () => {}], useRef: initial => ({ current: initial }), useEffect: () => {} }
  const dashboard = load('src/features/friends-family/AdminDashboard.tsx', { react: hooks, 'react/jsx-runtime': jsxRuntime, '@tanstack/react-query': { useQueryClient: () => ({}), useQuery: options => { queryOptions = options; return { data: targetSnapshot, dataUpdatedAt: 1 } } }, './api': api, './RoundProgress': progress, './money': money, './participants': participantHelpers, './ParticipantList': { ParticipantList: () => null }, './RoundTargetEditor': targetComponents, './ExchangeRateEditor': rateComponents, './roundTarget': targetHelpers, './ui': ui })
  dashboard.AdminDashboard({ overview: adminOverview, authId: 'admin-subject', login: () => {} })
  assert.equal(await queryOptions.queryFn({ signal: new AbortController().signal }), targetSnapshot)
  assert.equal(requests.length, 1)
  assert.equal(requests[0].url, 'http://localhost:8080/admin/friends-and-family/participants')
  assert.equal(requests[0].options.credentials, 'include'); assert.equal(requests[0].options.cache, 'no-store')
})
test('revoking target management permits FnF return even when participant viewing remains allowed', () => {
  const state = viewsHarness(); toggleViews(state, 'Admin view')
  findElement(state.render(), node => node.type === state.dashboard).props.onExitLockChange(true)
  state.setOverview({ ...adminOverview, capabilities: { canViewParticipants: true, canManageRound: false } })
  const back = findElement(state.render(), node => node.type === 'button' && node.props.children === 'Member view')
  assert.equal(back.props.disabled, false)
  back.props.onClick()
  assert.equal(findElement(state.render(), node => node.type === state.dashboard), undefined)
  state.setOverview(adminOverview)
  toggleViews(state, 'Admin view')
  assert.equal(findElement(state.render(), node => node.type === 'button' && node.props.children === 'Member view').props.disabled, false)
  toggleViews(state, 'Member view')
  assert.equal(findElement(state.render(), node => node.type === state.dashboard), undefined)
})
test('late own-command results after account unmount cannot expire a new session or restore old cache', async () => {
  for (const unauthorized of [true, false]) {
    const state = panelHarness()
    findElement(state.render(), node => node.type === moneyEditor.MoneyEditor).props.onSave({ currency: 'USD', amountMinor: '100' })
    state.unmount()
    if (unauthorized) state.response.reject(new inertApi.RoundApiError(401))
    else state.response.resolve({ ...roundFixture, replayed: false, currentVersion: '1', ownCommitment: { status: 'active', currency: 'USD', amountMinor: '100' } })
    await new Promise(setImmediate)
    assert.equal(state.expired, 0)
    assert.equal(state.confirmed, 0)
    assert.deepEqual(state.cache, [])
  }
})
test('unknown paths, including the retired /friends-and-family link, reach Not found while /invest still opens the private page', async () => {
  const { MemoryRouter, ...router } = require('react-router-dom')
  const pending = []
  const lazy = factory => { let page; pending.push(factory().then(loaded => { page = loaded })); return props => page.default(props) }
  const pages = Object.fromEntries(['Portfolio', 'AceShowcase', 'Chillouts', 'JsTsGuild', 'RealDevSquad', 'RealDSA', 'ImportantLinks', 'Dev', 'AskAnkush', 'FriendsAndFamily', 'NotFound'].map(name => [`./pages/${name}`, { default: () => `page:${name}` }]))
  const app = load('src/App.tsx', { react: { ...React, lazy }, 'react/jsx-runtime': jsxRuntime, 'react-router-dom': router, './components/layout/Navigation': { default: () => null }, './components/layout/PageTransition': { default: ({ children }) => children }, './services/analytics': { isPrivateAnalyticsPath: privacy.isPrivateAnalyticsPath }, './hooks/usePageTracking': { usePageTracking: () => {} }, ...pages })
  await Promise.allSettled(pending)
  const render = pathname => renderToStaticMarkup(React.createElement(MemoryRouter, { initialEntries: [pathname] }, React.createElement(app.default)))
  for (const pathname of ['/friends-and-family', '/friends-and-family/', '/some-unknown-page']) {
    const html = render(pathname)
    assert.ok(html.includes('page:NotFound'), pathname)
    assert.equal(html.includes('page:FriendsAndFamily'), false, pathname)
  }
  assert.equal(render('/invest'), 'page:FriendsAndFamily')
  assert.equal(render('/').includes('page:NotFound'), false)
})

// Exchange rate: minor-unit money maths, the admin rate editor and its dashboard wiring.
test('a two-decimal rate (88.75) converts and rounds half up both ways without drift', () => {
  assert.equal(money.convertMinor({ currency: 'USD', amountMinor: '1' }, 'INR', '8875'), 89n)
  assert.equal(money.convertMinor({ currency: 'USD', amountMinor: '2' }, 'INR', '8875'), 178n)
  assert.equal(money.convertMinor({ currency: 'USD', amountMinor: '100' }, 'INR', '8875'), 8875n)
  assert.equal(money.convertMinor({ currency: 'INR', amountMinor: '8875' }, 'USD', '8875'), 100n)
  assert.equal(money.convertMinor({ currency: 'INR', amountMinor: '44' }, 'USD', '8875'), 0n)
  assert.equal(money.convertMinor({ currency: 'INR', amountMinor: '45' }, 'USD', '8875'), 1n)
  const canonical = { currency: 'USD', amountMinor: '12345' }
  for (let i = 0; i < 50; i++) {
    assert.equal(money.selectedMoney(canonical, 'INR', '8875').amountMinor, '1095619')
    assert.equal(money.selectedMoney(canonical, 'USD', '8875').amountMinor, '12345')
  }
  const at8875 = { ...config, inrMinorPerUsd: '8875', inrPerUsd: '88.75' }
  assert.equal(money.ownBasisPoints({ currency: 'USD', amountMinor: '1000000' }, at8875), 50n)
  assert.equal(money.ownBasisPoints({ currency: 'INR', amountMinor: '88750000' }, at8875), 50n)
})
test('one formatter renders whole rates without decimals and others with two', () => {
  assert.equal(money.formatRate('9500'), '95')
  assert.equal(money.formatRate('8875'), '88.75')
  assert.equal(money.formatRate('8850'), '88.50')
  assert.equal(money.formatRate('100000'), '1,000')
  assert.equal(money.rateLine({ ...config, rateIsTemporary: true }), 'Temporary rate: US$1 = ₹95')
  assert.equal(money.rateLine({ ...config, inrMinorPerUsd: '8850', rateIsTemporary: false }), 'Conversion rate: US$1 = ₹88.50')
})
test('without inrMinorPerUsd from an older API, the rate falls back to inrPerUsd times 100', () => {
  assert.equal(money.inrMinorPerUsd({ inrPerUsd: '95' }), '9500')
  assert.equal(money.inrMinorPerUsd({ inrPerUsd: '88.75' }), '8875')
  assert.equal(money.inrMinorPerUsd({ inrMinorPerUsd: '8875', inrPerUsd: '89' }), '8875')
  const { inrMinorPerUsd: _omitted, ...legacy } = config
  assert.equal(money.ownBasisPoints({ currency: 'USD', amountMinor: '1000000' }, legacy), 50n)
})
test('the rate row shows US$1 = ₹95 and offers Change rate only to an account that can manage the round', () => {
  const props = { snapshot: targetSnapshot, save: async () => {}, refresh: async () => targetSnapshot, onAccessDenied: () => {} }
  const denied = renderToStaticMarkup(React.createElement(rateComponents.ExchangeRateEditor, { ...props, canManage: false }))
  const allowed = renderToStaticMarkup(React.createElement(rateComponents.ExchangeRateEditor, { ...props, canManage: true }))
  for (const html of [denied, allowed]) { assert.ok(html.includes('Conversion rate')); assert.ok(html.includes('US$1 = ₹95')) }
  assert.equal(denied.includes('Change rate'), false)
  assert.equal(denied.includes('exchange-rate-inr'), false)
  assert.ok(allowed.includes('Change rate'))
})
function dashboardHarness(overview, execute) {
  const calls = []
  const hooks = { useState: initial => [initial, () => {}], useRef: initial => ({ current: initial }), useEffect: () => {} }
  const client = { cancelQueries: async ({ queryKey }) => { calls.push(['cancel', queryKey]) }, removeQueries: () => {}, setQueryData: (key, data) => calls.push(['set', key, data]), invalidateQueries: async ({ queryKey }) => { calls.push(['invalidate', queryKey]) } }
  const dashboard = load('src/features/friends-family/AdminDashboard.tsx', { react: hooks, 'react/jsx-runtime': jsxRuntime, '@tanstack/react-query': { useQueryClient: () => client, useQuery: () => ({ data: targetSnapshot, dataUpdatedAt: 1 }) }, './api': { ...inertApi, executeExchangeRateCommand: execute }, './RoundProgress': progress, './money': money, './participants': participantHelpers, './ParticipantList': { ParticipantList: () => null }, './RoundTargetEditor': targetComponents, './ExchangeRateEditor': rateComponents, './roundTarget': targetHelpers, './ui': ui })
  const tree = dashboard.AdminDashboard({ overview, authId: 'admin-subject', login: () => {} })
  return { tree, calls }
}
test('the dashboard places the rate row beneath the round target and grants changes only with round management', () => {
  const managed = dashboardHarness(adminOverview, async () => {}).tree
  const editors = []
  findElement(managed, node => { if (node.type === targetComponents.RoundTargetEditor || node.type === rateComponents.ExchangeRateEditor) editors.push(node.type); return false })
  assert.deepEqual(editors, [targetComponents.RoundTargetEditor, rateComponents.ExchangeRateEditor])
  assert.equal(findElement(managed, node => node.type === rateComponents.ExchangeRateEditor).props.canManage, true)
  const viewer = dashboardHarness({ ...adminOverview, capabilities: { canViewParticipants: true, canManageRound: false } }, async () => {}).tree
  assert.equal(findElement(viewer, node => node.type === rateComponents.ExchangeRateEditor).props.canManage, false)
  const saved = { ...roundFixture, currentVersion: '1', ownCommitment: { status: 'active', currency: 'USD', amountMinor: '5000', version: '1', createdAt: '2026-10-03T00:01:00.000Z' } }
  for (const stage of ['amount', 'summary']) { const html = renderStage(stage, saved); assert.equal(html.includes('Change rate'), false); assert.equal(html.includes('exchange-rate-inr'), false) }
})
test('saving a rate sends the value and current rate version, then updates admin and member figures without a reload', async () => {
  const requests = []
  const api = load('src/features/friends-family/api.ts', { '../../services/api': { API_URL: 'http://localhost:8080' } }, { crypto: { randomUUID: () => 'rate-operation' }, AbortSignal, fetch: async (url, options) => { requests.push({ url, options }); return { ok: true, json: async () => ({ ...targetSnapshot, replayed: false }) } } })
  await api.executeExchangeRateCommand(api.createExchangeRateCommand('1', '8875'))
  assert.equal(requests[0].url, 'http://localhost:8080/admin/friends-and-family/exchange-rate')
  assert.equal(requests[0].options.method, 'PUT'); assert.equal(requests[0].options.credentials, 'include'); assert.equal(requests[0].options.cache, 'no-store')
  assert.deepEqual(JSON.parse(requests[0].options.body), { operationId: 'rate-operation', expectedVersion: '1', inrMinorPerUsd: '8875' })
  const result = { ...targetSnapshot, exchangeRate: { version: '2', updatedAt: '2026-10-03T01:00:00.000Z' }, config: { ...targetSnapshot.config, inrMinorPerUsd: '8875', inrPerUsd: '88.75', rateIsTemporary: false }, replayed: false }
  const sent = []
  const state = dashboardHarness(adminOverview, async command => { sent.push(command); return result })
  const editor = findElement(state.tree, node => node.type === rateComponents.ExchangeRateEditor)
  assert.equal(await editor.props.save({ operationId: 'rate-operation', expectedVersion: '1', inrMinorPerUsd: '8875' }), result)
  assert.equal(sent.length, 1)
  const set = state.calls.find(call => call[0] === 'set')
  assert.deepEqual(Array.from(set[1]), ['private-friends-family', 'participants', 'admin-subject']); assert.equal(set[2], result)
  assert.ok(state.calls.some(call => call[0] === 'invalidate' && call[1][1] === 'overview'))
  const member = renderToStaticMarkup(React.createElement(moneyEditor.MoneyEditor, { config: result.config, initial: { currency: 'USD', amountMinor: '100' }, locked: false, pending: false, onSave: () => {} }))
  assert.ok(member.includes('Conversion rate: US$1 = ₹88.75')); assert.ok(member.includes('About ₹88.75'))
})
function rateHarness() {
  const slots = []; let cursor = 0; let count = 0; const commands = []; let response; let snapshot = targetSnapshot; let latest = targetSnapshot; const editing = []
  const hooks = {
    useState: (initial) => { const index = cursor++; if (!(index in slots)) slots[index] = typeof initial === 'function' ? initial() : initial; return [slots[index], (next) => { slots[index] = typeof next === 'function' ? next(slots[index]) : next }] },
    useRef: (initial) => { const index = cursor++; if (!(index in slots)) slots[index] = { current: initial }; return slots[index] },
  }
  const api = { ...inertApi, createExchangeRateCommand: (expectedVersion, inrMinorPerUsd) => ({ operationId: `rate-operation-${++count}`, expectedVersion, inrMinorPerUsd }) }
  const component = load('src/features/friends-family/ExchangeRateEditor.tsx', { react: hooks, 'react/jsx-runtime': jsxRuntime, './api': api, './money': money, './exchangeRate': rateHelpers, './ui': ui })
  const render = () => { cursor = 0; return component.ExchangeRateEditor({ snapshot, canManage: true, save: (command) => { commands.push(command); return new Promise((resolve, reject) => { response = { resolve, reject } }) }, refresh: async () => { snapshot = latest; return latest }, onAccessDenied: () => {}, onEditStateChange: next => editing.push(next) }) }
  return { render, commands, editing, get response() { return response }, setSnapshot: next => { snapshot = next }, setLatest: next => { latest = next } }
}
const rateInput = node => node.type === 'input' && node.props.id === 'exchange-rate-inr'
function openRate(state) {
  findElement(state.render(), node => node.type === 'button' && node.props.children === 'Change rate').props.onClick()
  return state.render()
}
function editRate(state, value) {
  findElement(state.render(), rateInput).props.onChange({ target: { value } })
  return state.render()
}
function submitRate(tree) { findElement(tree, node => node.type === 'form').props.onSubmit({ preventDefault() {} }) }
test('the rate editor prefills the current rate and saves a two-decimal rate with the current version', async () => {
  const state = rateHarness(); let tree = openRate(state)
  assert.equal(findElement(tree, rateInput).props.value, '95')
  const html = renderToStaticMarkup(tree)
  for (const marker of ['for="exchange-rate-inr"', 'US$1 =', '₹', 'Save rate', 'Cancel']) assert.ok(html.includes(marker), marker)
  tree = editRate(state, '88.75'); submitRate(tree)
  assert.deepEqual(state.commands, [{ operationId: 'rate-operation-1', expectedVersion: '1', inrMinorPerUsd: '8875' }])
  state.response.resolve({ ...targetSnapshot, replayed: false }); await new Promise(setImmediate)
  assert.deepEqual(state.editing, [true, false])
  assert.equal(findElement(state.render(), node => node.type === 'form'), undefined)
  assert.ok(renderToStaticMarkup(state.render()).includes('The conversion rate is saved.'))
})
test('invalid rates show an error and send nothing', () => {
  for (const value of ['', '0', '-1', 'abc', '88.755', '0.99', '1000.01', '1,000', ' 95']) {
    const state = rateHarness(); openRate(state); const tree = editRate(state, value); submitRate(tree)
    assert.equal(state.commands.length, 0, value)
    const alert = findElement(state.render(), node => node.props?.id === 'exchange-rate-error')
    assert.ok(alert, value); assert.equal(alert.props.role, 'alert')
    assert.equal(findElement(state.render(), rateInput).props['aria-invalid'], true)
  }
})
test('a rate conflict asks the admin to review the latest rate; an uncertain failure retries the same command', async () => {
  const uncertain = rateHarness(); openRate(uncertain); submitRate(editRate(uncertain, '90'))
  uncertain.response.reject(Error('Response lost')); await new Promise(setImmediate)
  let tree = uncertain.render()
  assert.equal(findElement(tree, rateInput).props.disabled, true)
  findElement(tree, node => node.type === 'button' && node.props.children === 'Retry same rate change').props.onClick()
  assert.equal(uncertain.commands.length, 2); assert.equal(uncertain.commands[0], uncertain.commands[1])

  const state = rateHarness(); openRate(state); editRate(state, '90')
  state.setLatest({ ...targetSnapshot, exchangeRate: { ...targetSnapshot.exchangeRate, version: '3' }, config: { ...targetSnapshot.config, inrMinorPerUsd: '8850' } })
  submitRate(state.render())
  state.response.reject(new inertApi.RoundApiError(409)); await new Promise(setImmediate)
  tree = state.render()
  const html = renderToStaticMarkup(tree)
  assert.ok(html.includes('The conversion rate changed in another window. Review the latest rate before continuing.'))
  assert.ok(html.includes('Latest rate:')); assert.ok(html.includes('US$1 = ₹88.50'))
  assert.equal(findElement(tree, rateInput).props.value, '90'); assert.equal(findElement(tree, rateInput).props.disabled, true)
  submitRate(tree); assert.equal(state.commands.length, 1)
  findElement(tree, node => node.type === 'button' && node.props.children === 'I reviewed this, keep my draft').props.onClick()
  submitRate(state.render())
  assert.equal(state.commands[1].expectedVersion, '3'); assert.equal(state.commands[1].inrMinorPerUsd, '9000')
  assert.notEqual(state.commands[1].operationId, state.commands[0].operationId)
})

// Personal touches: greeting, welcome-back letter, signature, photo, contact line and media slot.
const savedUsd = { ...roundFixture, currentVersion: '1', ownCommitment: { status: 'active', currency: 'USD', amountMinor: '5000', version: '1', createdAt: '2026-10-03T00:01:00.000Z' } }
const savedInr = { ...roundFixture, currentVersion: '1', ownCommitment: { status: 'active', currency: 'INR', amountMinor: '250000000', version: '1', createdAt: '2026-10-03T00:01:00.000Z' } }
const withdrawn = { ...roundFixture, currentVersion: '2', ownCommitment: { status: 'withdrawn', currency: null, amountMinor: null, version: '2', createdAt: '2026-10-03T00:02:00.000Z' } }
const visibleText = html => html.replace(/<[^>]*>/g, ' ')
test('the letter greets the member by first name, and keeps the current opening when no name is available', () => {
  assert.equal(flow.firstNameFrom('  Asha   Rao '), 'Asha')
  assert.equal(flow.firstNameFrom('Kabir'), 'Kabir')
  for (const name of ['', '   ', undefined, null, 'asha.rao@example.test', ' someone@example.test ']) assert.equal(flow.firstNameFrom(name), null, String(name))
  const named = renderStage('welcome', roundFixture, { memberName: 'Asha Rao' })
  assert.ok(named.includes('Dear Asha,'))
  assert.ok(named.indexOf('Dear Asha,') < named.indexOf('It means the world to me'))
  for (const memberName of [undefined, '', 'asha.rao@example.test']) {
    const html = renderStage('welcome', roundFixture, { memberName })
    assert.equal(html.includes('Dear'), false, String(memberName))
    assert.ok(html.includes('Thank you for being here.'))
    assert.ok(html.includes('It means the world to me'))
  }
  // The page hands the signed-in session's name down to the letter.
  assert.ok(pageHarness({ authId: 'member-subject', name: 'Member Example', email: 'member@example.test' }, roundFixture).html.includes('Dear Member,'))
  // The summary thanks them by name on the existing thank-you line.
  assert.ok(renderStage('summary', savedUsd, { memberName: 'Asha Rao' }).includes('Thank you for being part of this round, Asha.'))
  assert.ok(renderStage('summary', savedUsd).includes('Thank you for being part of this round.'))
})
test('a member with a saved commitment sees a welcome-back letter with their recorded amount; one who withdrew sees it without an amount; a new member sees the original letter', () => {
  const usd = renderStage('welcome', savedUsd, { memberName: 'Asha Rao' })
  assert.ok(usd.includes('Welcome back.')); assert.ok(usd.includes('Dear Asha,'))
  assert.ok(usd.includes('Your commitment of US$50 is recorded.'))
  assert.equal(usd.includes('It means the world to me'), false)
  assert.ok(usd.includes('>Next</button>'))
  assert.ok(renderStage('welcome', savedInr).includes('Your commitment of ₹25,00,000 is recorded.'))
  const gone = renderStage('welcome', withdrawn, { memberName: 'Asha Rao' })
  assert.ok(gone.includes('Welcome back.')); assert.ok(gone.includes('Dear Asha,'))
  assert.ok(gone.includes('You withdrew your commitment, and that is completely fine.'))
  for (const marker of ['US$', '₹', 'is recorded']) assert.equal(gone.includes(marker), false, marker)
  const fresh = renderStage('welcome', roundFixture, { memberName: 'Asha Rao' })
  assert.ok(fresh.includes('Thank you for being here.')); assert.ok(fresh.includes('It means the world to me')); assert.ok(fresh.includes('very, very, very tough'))
  assert.equal(fresh.includes('Welcome back.'), false)
})
test('the first-time letter adds the MVP and no-obligation paragraphs before the sign-off; the welcome-back letter does not', () => {
  const lines = ['<p>I have already built the MVP. This round helps me get it to more people, faster.</p>', '<p>Please commit only what you are comfortable with. You are under no obligation, and I do not want you to feel that you have to.</p>']
  const fresh = renderStage('welcome', roundFixture, { memberName: 'Asha Rao' })
  for (const line of lines) {
    assert.ok(fresh.includes(line), line)
    assert.ok(fresh.indexOf('very, very, very tough') < fresh.indexOf(line))
    assert.ok(fresh.indexOf(line) < fresh.indexOf('data-signature'))
  }
  assert.ok(fresh.indexOf(lines[0]) < fresh.indexOf(lines[1]))
  for (const overview of [savedUsd, savedInr, withdrawn]) {
    const back = renderStage('welcome', overview, { memberName: 'Asha Rao' })
    for (const marker of ['already built the MVP', 'under no obligation']) assert.equal(back.includes(marker), false, marker)
  }
})
test('both letters show the signature and the photo when one is present; a missing photo leaves no image or gap', () => {
  const withPhoto = loadMember({ assets: { ...emptyAssets, ankushPhoto: '/assets/synthetic-photo.jpg' } })
  for (const overview of [roundFixture, savedUsd, withdrawn]) {
    const bare = renderStage('welcome', overview)
    assert.ok(bare.includes('data-signature'), 'signature drawn')
    assert.ok(bare.includes('<span class="sr-only">Ankush</span>'), 'name kept for screen readers')
    assert.equal(bare.includes('<img'), false)
    assert.equal(bare.includes('data-photo'), false)
    const pictured = renderStage('welcome', overview, {}, withPhoto)
    assert.ok(pictured.includes('src="/assets/synthetic-photo.jpg"'))
    assert.ok(pictured.includes('data-signature'))
  }
})
test('the summary always shows "Call me or WhatsApp me." with an Email me link, and no number or address as visible text', () => {
  for (const overview of [savedUsd, roundFixture]) {
    const html = renderStage('summary', overview)
    assert.ok(html.includes('Call me or WhatsApp me.'))
    assert.ok(/<a [^>]*href="mailto:ankushdharkar@gmail.com"[^>]*>Email me<\/a>/.test(html))
    for (const marker of ['tel:', 'wa.me']) assert.equal(html.includes(marker), false, marker)
    const text = visibleText(html)
    assert.equal(text.includes('@'), false)
    assert.equal(/\+?\d[\d\s-]{8,}\d/.test(text.replace(/US\$[\d,.]+|₹[\d,.]+/g, '')), false)
  }
  for (const stage of ['welcome', 'amount']) assert.equal(renderStage(stage).includes('Call me or WhatsApp me.'), false, stage)
})
test('the video or voice-note player appears only when a media file is present, never autoplaying', () => {
  for (const html of [renderStage('welcome'), renderStage('welcome', savedUsd)]) { assert.equal(html.includes('<video'), false); assert.equal(html.includes('<audio'), false) }
  const video = renderStage('welcome', roundFixture, {}, loadMember({ assets: { ...emptyAssets, welcomeMedia: { kind: 'video', src: '/assets/welcome.mp4', type: 'video/mp4' } } }))
  assert.ok(/<video [^>]*controls=""/.test(video)); assert.ok(video.includes('preload="metadata"')); assert.ok(video.includes('playsInline=""'))
  assert.ok(/<video [^>]*aria-label="[^"]+"/.test(video)); assert.ok(video.includes('src="/assets/welcome.mp4"'))
  const audio = renderStage('welcome', roundFixture, {}, loadMember({ assets: { ...emptyAssets, welcomeMedia: { kind: 'audio', src: '/assets/welcome.m4a', type: 'audio/mp4' } } }))
  assert.ok(/<audio [^>]*controls=""/.test(audio)); assert.ok(audio.includes('preload="none"')); assert.ok(/<audio [^>]*aria-label="[^"]+"/.test(audio))
  for (const html of [video, audio]) { assert.equal(html.toLowerCase().includes('autoplay'), false); assertNoRoundTotals(html) }
})
test('the welcome letters and the amount step, with every personal touch filled in, still show no round figures', () => {
  const full = loadMember({ assets: { ankushPhoto: '/assets/synthetic-photo.jpg', welcomeMedia: { kind: 'video', src: '/assets/welcome.mp4', type: 'video/mp4' } } })
  for (const overview of [roundFixture, savedUsd, savedInr, withdrawn]) {
    for (const stage of ['welcome', 'amount']) assertNoRoundTotals(renderStage(stage, overview, { memberName: 'Asha Rao' }, full))
  }
})
// The viewer's own share is the last segment of the bar. Only the round total and the viewer's own commitment draw it.
const ownActive = { status: 'active', currency: 'USD', amountMinor: '10000000', version: '1', createdAt: '2026-10-03T00:01:00.000Z' }
const shareRound = { ...roundFixture, ...targetSnapshot, currentVersion: '1', ownCommitment: ownActive }
function progressBar(overview) {
  return findElement(progress.RoundProgress({ overview }), node => node.props?.role === 'progressbar')
}
function barSegments(bar) {
  const segments = []
  findElement(bar, node => { if (node.props?.['data-segment']) segments.push(node); return false })
  return segments
}
function dashboardWith(overview, snapshot) {
  const hooks = { useState: initial => [initial, () => {}], useRef: initial => ({ current: initial }), useEffect: () => {} }
  const dashboard = load('src/features/friends-family/AdminDashboard.tsx', { react: hooks, 'react/jsx-runtime': jsxRuntime, '@tanstack/react-query': { useQueryClient: () => ({}), useQuery: () => ({ data: snapshot, dataUpdatedAt: 1 }) }, './api': inertApi, './RoundProgress': progress, './money': money, './participants': participantHelpers, './ParticipantList': { ParticipantList: () => null }, './RoundTargetEditor': targetComponents, './ExchangeRateEditor': rateComponents, './roundTarget': targetHelpers, './ui': ui })
  return findElement(dashboard.AdminDashboard({ overview, authId: 'admin-subject', login: () => {} }), node => node.type === progress.RoundProgress)
}
test('with an active commitment the bar has exactly two filled segments, everyone else first and the viewer last, together the total', () => {
  const others = [
    { name: 'Synthetic Member One', email: 'one@example.test', commitment: { status: 'active', currency: 'USD', amountMinor: '12345678', version: '1', createdAt: '2026-10-03T00:00:00.000Z' } },
    { name: 'Synthetic Member Two', email: 'two@example.test', commitment: { status: 'active', currency: 'INR', amountMinor: '2765432100', version: '1', createdAt: '2026-10-03T00:00:00.000Z' } },
  ]
  const single = progressBar({ ...shareRound, ownCommitment: null })
  for (const count of ['2', '7', '250']) {
    const bar = progressBar({ ...shareRound, summary: { ...shareRound.summary, participantCount: count } })
    const segments = barSegments(bar)
    assert.deepEqual(segments.map(segment => segment.props['data-segment']), ['others', 'own'], count)
    const fill = findElement(bar, node => node.props?.children && barSegments(node).length === 2 && node !== bar)
    assert.equal(fill.props.style.width, single.props.children.props.style.width)
    assert.equal(fill.props.style.width, '25%')
    assert.equal(segments[1].props.style.width, 'max(4px, 20%)')
  }
  const adminRound = { ...targetSnapshot, participants: [...others, { name: 'Admin', email: 'admin@example.test', commitment: ownActive }] }
  const adminProgress = dashboardWith({ ...adminOverview, currentVersion: '1', ownCommitment: ownActive }, adminRound)
  const adminBar = findElement(adminProgress.type(adminProgress.props), node => node.props?.role === 'progressbar')
  assert.deepEqual(barSegments(adminBar).map(segment => segment.props['data-segment']), ['others', 'own'])
  const markup = renderToStaticMarkup(adminBar)
  for (const marker of ['US$123,456.78', '₹2,76,54,321', '123456', '2765432', 'Synthetic Member', '@example.test', 'title=', 'US$']) assert.equal(markup.includes(marker), false, marker)
})
test('with no commitment, or after a withdrawal, the bar is one segment and no "Yours" line is shown', () => {
  const withdrawnShare = { ...shareRound, ownCommitment: { status: 'withdrawn', currency: null, amountMinor: null, version: '2', createdAt: '2026-10-03T00:02:00.000Z' } }
  for (const overview of [{ ...shareRound, ownCommitment: null }, withdrawnShare]) {
    const segments = barSegments(progressBar(overview))
    assert.deepEqual(segments.map(segment => segment.props['data-segment']), ['total'])
    assert.equal(segments[0].props.style.width, '25%')
    for (const html of [renderToStaticMarkup(React.createElement(progress.RoundProgress, { overview })), renderStage('summary', overview).match(/<section aria-label="Round progress">[\s\S]*?<\/section>/)[0]]) {
      for (const marker of ['Yours', 'Your commitment', 'of the target', 'data-own-swatch']) assert.equal(html.includes(marker), false, marker)
    }
  }
})
test('a very small share still shows as a visible sliver without overstating the total', () => {
  const tiny = { ...shareRound, ownCommitment: { ...ownActive, amountMinor: '100' } }
  assert.equal(money.ownBasisPoints(money.activeCommitmentMoney(tiny), tiny.config), 0n)
  const bar = progressBar(tiny)
  const own = barSegments(bar).find(segment => segment.props['data-segment'] === 'own')
  assert.equal(own.props.style.width, 'max(4px, 0%)')
  assert.ok(findElement(bar, node => node.props?.style?.width === '25%' && /overflow-hidden/.test(node.props.className)))
  assert.equal(bar.props['aria-valuenow'], 25)
})
test('the bar keeps its accessible progress value and the viewer share is also stated in text', () => {
  const bar = progressBar(shareRound)
  assert.equal(bar.props.role, 'progressbar')
  assert.equal(bar.props['aria-valuemin'], 0); assert.equal(bar.props['aria-valuemax'], 100)
  assert.equal(bar.props['aria-valuenow'], 25); assert.equal(bar.props['aria-valuetext'], '25% committed')
  const html = renderToStaticMarkup(React.createElement(progress.RoundProgress, { overview: shareRound }))
  const text = visibleText(html)
  for (const marker of ['Your commitment', 'US$100,000', '5% of the target']) assert.ok(text.includes(marker), marker)
  assert.ok(/<span[^>]*data-own-swatch[^>]*aria-hidden="true"|<span[^>]*aria-hidden="true"[^>]*data-own-swatch/.test(html))
})
test('the admin overview shows the "Yours" line with the amount and percent of the target', () => {
  const element = dashboardWith({ ...adminOverview, currentVersion: '1', ownCommitment: ownActive }, targetSnapshot)
  const html = renderToStaticMarkup(element)
  const text = visibleText(html)
  for (const marker of ['Yours', 'Your commitment', 'US$100,000', '5% of the target']) assert.ok(text.includes(marker), marker)
  assert.ok(html.includes('data-own-swatch'))
  assert.equal(renderToStaticMarkup(dashboardWith(adminOverview, targetSnapshot)).includes('of the target'), false)
})

// Admin letter preview: the admin can read each welcome letter as a member in that state would, without writing anything.
test('one derivation names the letter variant, including history without an active or withdrawn commitment', () => {
  assert.equal(flow.letterVariant(roundFixture), 'new')
  assert.equal(flow.letterVariant(savedUsd), 'returning')
  assert.equal(flow.letterVariant(withdrawn), 'withdrawn')
  assert.equal(flow.letterVariant({ ...roundFixture, currentVersion: '1' }), 'returning')
  assert.equal(flow.letterVariant({ ...roundFixture, ownCommitment: { status: 'active' } }), 'returning')
  for (const overview of [roundFixture, savedUsd, withdrawn, ...historyFixtures]) assert.equal(flow.letterVariant(overview) !== 'new', flow.hasMemberHistory(overview))
  // History without a recorded or withdrawn commitment keeps the short thank-you note.
  const bare = renderStage('welcome', { ...roundFixture, currentVersion: '1' })
  assert.ok(bare.includes('Welcome back.')); assert.ok(bare.includes('Thank you for coming back'))
  for (const marker of ['is recorded', 'You withdrew']) assert.equal(bare.includes(marker), false, marker)
})
// Walk into function components too, so controls rendered inside the letter can be pressed.
function findDeep(node, predicate) {
  if (Array.isArray(node)) { for (const child of node) { const match = findDeep(child, predicate); if (match) return match } return undefined }
  if (!node || typeof node !== 'object') return undefined
  if (typeof node.type === 'function') return findDeep(node.type(node.props), predicate)
  if (predicate(node)) return node
  return findDeep(node.props?.children, predicate)
}
function previewHarness(overview) {
  let stage; let mounted = false; const slots = []; let cursor = 0; const dispatched = []
  const hooks = {
    useReducer: (reducer, arg, init) => { if (!mounted) { stage = init ? init(arg) : arg; mounted = true } return [stage, event => { dispatched.push(event); stage = reducer(stage, event) }] },
    useState: initial => { const index = cursor++; if (!(index in slots)) slots[index] = typeof initial === 'function' ? initial() : initial; return [slots[index], next => { slots[index] = typeof next === 'function' ? next(slots[index]) : next }] },
  }
  const component = loadMember({ react: hooks })
  const props = { ...memberProps, overview, memberName: 'Admin Example' }
  const button = name => { cursor = 0; return findDeep(component.MemberRound(props), node => node.type === 'button' && node.props.children === name) }
  return {
    html: () => { cursor = 0; return renderToStaticMarkup(React.createElement(component.MemberRound, props)) },
    button, press: name => button(name).props.onClick(), dispatched, get stage() { return stage },
  }
}
const previewLabels = ['New', 'Returning', 'Withdrawn']
const adminWith = overview => ({ ...overview, capabilities: { canViewParticipants: true, canManageRound: true } })
test('a member who cannot manage the round never sees the letter preview links', () => {
  for (const overview of [roundFixture, savedUsd, withdrawn, { ...roundFixture, capabilities: { canViewParticipants: true, canManageRound: false } }]) {
    const state = previewHarness(overview)
    for (const name of previewLabels) assert.equal(state.button(name), undefined, name)
    const html = state.html()
    assert.equal(html.includes('Preview the letter'), false)
    for (const name of previewLabels) assert.equal(html.includes(`>${name}</button>`), false, name)
  }
})
test('the admin sees New, Returning and Withdrawn on the welcome letter, with the real state selected', () => {
  for (const [overview, real] of [[adminOverview, 'New'], [adminWith(savedUsd), 'Returning'], [adminWith(withdrawn), 'Withdrawn']]) {
    const state = previewHarness(overview)
    const html = state.html()
    assert.ok(html.includes('Preview the letter'))
    for (const name of previewLabels) {
      assert.ok(html.includes(`>${name}</button>`), name)
      assert.equal(state.button(name).props['aria-pressed'], name === real, `${real}: ${name}`)
    }
  }
  assertNoRoundTotals(previewHarness(adminWith(savedUsd)).html())
  // The links reveal on hover of their own corner and on keyboard focus only, so a mouse click never leaves them showing.
  const group = previewHarness(adminOverview).html().match(/<div role="group" aria-label="Preview the letter as" class="([^"]*)"/)[1].split(' ')
  for (const name of ['hover:opacity-100', 'has-focus-visible:opacity-100']) assert.ok(group.includes(name), name)
  assert.equal(group.some(name => name.startsWith('group-hover:') || name.startsWith('focus-within:')), false)
})
test('pressing New shows the first-time letter even when the admin has history', () => {
  const state = previewHarness(adminWith(savedUsd))
  assert.ok(state.html().includes('Welcome back.'))
  state.press('New')
  const html = state.html()
  assert.ok(html.includes('Thank you for being here.')); assert.ok(html.includes('It means the world to me'))
  assert.equal(html.includes('Welcome back.'), false)
  assert.equal(state.button('New').props['aria-pressed'], true)
  assert.equal(state.button('Returning').props['aria-pressed'], false)
})
test('pressing Returning shows the recorded-commitment line, with the admin amount or a sample one', () => {
  const own = previewHarness(adminWith(withdrawn)); own.press('Returning')
  assert.ok(own.html().includes('Welcome back.'))
  assert.ok(own.html().includes('Your commitment of ₹5,00,000 is recorded.'))
  assert.equal(own.html().includes('You withdrew'), false)
  const fresh = previewHarness(adminOverview); fresh.press('Returning')
  assert.ok(fresh.html().includes('Your commitment of ₹5,00,000 is recorded.'))
  const saved = previewHarness(adminWith(savedUsd)); saved.press('New'); saved.press('Returning')
  assert.ok(saved.html().includes('Your commitment of US$50 is recorded.'))
})
test('pressing Withdrawn shows the withdrew line without any amount', () => {
  for (const overview of [adminOverview, adminWith(savedUsd)]) {
    const state = previewHarness(overview); state.press('Withdrawn')
    const html = state.html()
    assert.ok(html.includes('Welcome back.'))
    assert.ok(html.includes('You withdrew your commitment, and that is completely fine. You are always welcome here.'))
    for (const marker of ['is recorded', 'It means the world to me']) assert.equal(html.includes(marker), false, marker)
  }
})
test('Next after a preview follows the admin real history and sends the real overview, writing nothing', () => {
  const fresh = adminOverview
  const state = previewHarness(fresh); state.press('Withdrawn'); state.press('Next')
  assert.equal(state.stage, 'amount')
  assert.equal(state.dispatched.length, 1); assert.equal(state.dispatched[0].overview, fresh)
  const saved = adminWith(savedUsd)
  const back = previewHarness(saved); back.press('New'); back.press('Next')
  assert.equal(back.stage, 'summary')
  assert.equal(back.dispatched[0].overview, saved)
})
