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
const config = { minAmountMinor: '1', maxAmountMinor: '1000000000000', inrPerUsd: '95', targetUsdMinor: '200000000' }
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
    assert.equal(money.selectedMoney(canonical, 'USD', '95').amountMinor, '10526316')
    assert.equal(money.selectedMoney(canonical, 'INR', '95').amountMinor, '1000000001')
  }
})
test('save uses selected currency and validates converted bounds, including tiny INR to zero USD', () => {
  assert.equal(money.selectedMoney({ currency: 'INR', amountMinor: '9500' }, 'USD', '95').currency, 'USD')
  assert.equal(money.selectedMoney({ currency: 'INR', amountMinor: '9500' }, 'USD', '95').amountMinor, '100')
  assert.ok(money.amountError(money.selectedMoney({ currency: 'INR', amountMinor: '1' }, 'USD', '95').amountMinor, config))
  assert.ok(money.amountError(money.selectedMoney({ currency: 'USD', amountMinor: config.maxAmountMinor }, 'INR', '95').amountMinor, config))
  assert.equal(money.convertMinor({ currency: 'INR', amountMinor: '47' }, 'USD', '95'), 0n)
  assert.equal(money.convertMinor({ currency: 'INR', amountMinor: '48' }, 'USD', '95'), 1n)
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
const moneyEditor = load('src/features/friends-family/MoneyEditor.tsx', { react: React, 'react/jsx-runtime': jsxRuntime, './money': money })
const inertApi = load('src/features/friends-family/api.ts', { '../../services/api': { API_URL: '' } }, { AbortSignal, crypto: { randomUUID: () => 'synthetic-operation' } })
const panel = load('src/features/friends-family/CommitmentPanel.tsx', { react: React, 'react/jsx-runtime': jsxRuntime, '@tanstack/react-query': { useQueryClient: () => ({}) }, './api': inertApi, './money': money, './MoneyEditor': moneyEditor })
const progress = load('src/features/friends-family/RoundProgress.tsx', { 'react/jsx-runtime': jsxRuntime, './money': money })
const member = load('src/features/friends-family/MemberRound.tsx', {
  react: React, 'react/jsx-runtime': jsxRuntime, './CommitmentPanel': panel, './RoundProgress': progress,
  './money': money, './MoneyEditor': moneyEditor, './participants': participantHelpers, './memberFlow': flow,
})
const memberProps = { overview: roundFixture, queryKey: ['private-friends-family', 'overview', 'synthetic-member'], refresh: async () => roundFixture, onUnauthorized: () => {}, refreshFailed: false }
function renderStage(stage, overview = roundFixture) {
  return renderToStaticMarkup(React.createElement(member.MemberRoundContent, { ...memberProps, overview, stage, onNext: () => {}, onSaveConfirmed: () => {} }))
}
function assertNoRoundTotals(html) {
  for (const marker of ['Round progress', 'progressbar', 'US$2,000,000', 'US$1,000', 'of the target', 'People committed', 'Remaining']) assert.equal(html.includes(marker), false, marker)
}
test('new accounts start at welcome, while any active or withdrawn history starts at management', () => {
  assert.equal(flow.initialMemberStage(roundFixture), 'welcome')
  assert.equal(flow.initialMemberStage({ ...roundFixture, currentVersion: '1' }), 'summary')
  assert.equal(flow.initialMemberStage({ ...roundFixture, ownCommitment: { status: 'withdrawn' } }), 'summary')
  assert.equal(flow.initialMemberStage({ ...roundFixture, ownCommitment: { status: 'active' } }), 'summary')
})
test('next opens amount entry; only confirmed-save event opens summary', () => {
  assert.equal(flow.memberFlowReducer('welcome', 'next'), 'amount')
  assert.equal(flow.memberFlowReducer('amount', 'next'), 'amount')
  assert.equal(flow.memberFlowReducer('amount', 'save-confirmed'), 'summary')
  assert.equal(flow.memberFlowReducer('summary', 'next'), 'summary')
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
  for (const marker of ['Round progress', 'US$2,000,000', 'US$50', 'of the target', 'Remaining', 'US$1,999,000', 'People committed', 'Change commitment']) assert.ok(html.includes(marker), marker)
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
  const testPanel = load('src/features/friends-family/CommitmentPanel.tsx', { react: hooks, 'react/jsx-runtime': jsxRuntime, '@tanstack/react-query': { useQueryClient: () => ({ cancelQueries: async () => {}, setQueryData: (...args) => cache.push(args) }) }, './api': api, './money': money, './MoneyEditor': moneyEditor })
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
const targetComponents = load('src/features/friends-family/RoundTargetEditor.tsx', { react: React, 'react/jsx-runtime': jsxRuntime, './api': inertApi, './money': money, './MoneyEditor': moneyEditor, './roundTarget': targetHelpers })
const targetSnapshot = { config: roundFixture.config, round: { version: '1', updatedAt: '2026-10-03T00:00:00.000Z' }, summary: { ...roundFixture.summary, totalUsdMinor: '50000000', totalInrMinor: '4750000000', progressBasisPoints: '2500', participantCount: '2' }, participants: [] }
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
  assert.equal(requests[0].url, 'http://localhost:8080/friends-and-family/admin/round-target')
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
  const component = load('src/features/friends-family/RoundTargetEditor.tsx', { react: hooks, 'react/jsx-runtime': jsxRuntime, './api': api, './money': money, './MoneyEditor': moneyEditor, './roundTarget': targetHelpers })
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

const views = load('src/features/friends-family/RoundViews.tsx', { react: React, 'react/jsx-runtime': jsxRuntime, './MemberRound': member, './AdminDashboard': { AdminDashboard: () => { throw Error('Dashboard must be explicitly opened') } }, './MoneyEditor': moneyEditor })
const adminOverview = { ...roundFixture, capabilities: { canViewParticipants: true, canManageRound: true } }
function pageHarness(user, overview) {
  const queries = []
  const page = load('src/pages/FriendsAndFamily.tsx', {
    react: React, 'react/jsx-runtime': jsxRuntime,
    '@tanstack/react-query': { useQueryClient: () => ({}), useQuery: (options) => { queries.push(options); return { data: options.queryKey[1] === 'session' ? { user } : overview, isPending: false, isError: false } } },
    '../components/ThemeToggle': { ThemeToggle: () => null }, '../services/api': { API_URL: 'https://example.com' },
    '../features/friends-family/api': inertApi, '../features/friends-family/RoundViews': views, '../features/friends-family/MoneyEditor': moneyEditor,
  })
  const html = renderToStaticMarkup(React.createElement(page.default))
  return { html, queries }
}
test('admin first load uses the regular welcome and owner overview without fetching participant data', () => {
  const state = pageHarness({ authId: 'admin-subject', name: 'Admin Example', email: 'admin@example.test' }, adminOverview)
  assert.ok(state.html.includes('Thank you for being here.'))
  assert.ok(state.html.includes('Admin View'))
  assertNoRoundTotals(state.html)
  assert.equal(state.queries.length, 2)
  assert.equal(state.queries[1].queryKey[2], 'admin-subject')
  assert.equal(state.queries.some(query => query.queryKey[1] === 'participants'), false)
})
test('ordinary members have the same welcome and no Admin View action', () => {
  const state = pageHarness({ authId: 'member-subject', name: 'Member Example', email: 'member@example.test' }, roundFixture)
  assert.ok(state.html.includes('Thank you for being here.'))
  assert.equal(state.html.includes('Admin View'), false)
})
function viewsHarness(overview = adminOverview) {
  const slots = []; let cursor = 0
  const hooks = { useState: (initial) => { const index = cursor++; if (!(index in slots)) slots[index] = initial; return [slots[index], next => { slots[index] = typeof next === 'function' ? next(slots[index]) : next }] } }
  const dashboard = { AdminDashboard: function Dashboard() {} }
  const component = load('src/features/friends-family/RoundViews.tsx', { react: hooks, 'react/jsx-runtime': jsxRuntime, './MemberRound': member, './AdminDashboard': dashboard, './MoneyEditor': moneyEditor })
  const render = () => { cursor = 0; return component.RoundViews({ ...memberProps, overview, authId: 'admin-subject', login: () => {} }) }
  return { render, dashboard: dashboard.AdminDashboard, setOverview: next => { overview = next } }
}
function toggleViews(state, label) { findElement(state.render(), node => node.type === 'button' && node.props.children === label).props.onClick() }
test('only explicit Admin View mounts dashboard; returning removes it and retains member subtree position', () => {
  const state = viewsHarness()
  const before = state.render()
  const initialMember = findElement(before, node => node.type === member.MemberRound)
  assert.ok(initialMember); assert.equal(findElement(before, node => node.type === state.dashboard), undefined)
  toggleViews(state, 'Admin View')
  let tree = state.render()
  assert.ok(findElement(tree, node => node.type === state.dashboard))
  const retainedMember = findElement(tree, node => node.type === member.MemberRound)
  assert.equal(retainedMember.type, initialMember.type)
  assert.equal(retainedMember.key, initialMember.key)
  assert.equal(retainedMember.props.queryKey, initialMember.props.queryKey)
  assert.equal(React.Children.toArray(tree.props.children)[1].props.hidden, true)
  toggleViews(state, 'FnF View')
  tree = state.render()
  assert.equal(findElement(tree, node => node.type === state.dashboard), undefined)
  assert.equal(React.Children.toArray(tree.props.children)[1].props.hidden, false)
})
test('target drafts and uncertain results block FnF return until editor confirms save or cancellation', () => {
  const state = viewsHarness(); toggleViews(state, 'Admin View')
  findElement(state.render(), node => node.type === state.dashboard).props.onExitLockChange(true)
  let tree = state.render()
  const back = findElement(tree, node => node.type === 'button' && node.props.children === 'FnF View')
  assert.equal(back.props.disabled, true)
  assert.ok(renderToStaticMarkup(findElement(tree, node => node.props?.id === 'round-view-lock')).includes('retry the same change first'))
  back.props.onClick(); assert.ok(findElement(state.render(), node => node.type === state.dashboard))
  findElement(state.render(), node => node.type === state.dashboard).props.onExitLockChange(false)
  toggleViews(state, 'FnF View'); assert.equal(findElement(state.render(), node => node.type === state.dashboard), undefined)
})
test('capability removal immediately hides dashboard and restoration stays in FnF; a new account defaults to FnF', () => {
  const state = viewsHarness(); toggleViews(state, 'Admin View')
  state.setOverview(roundFixture)
  assert.equal(findElement(state.render(), node => node.type === state.dashboard), undefined)
  state.setOverview(adminOverview)
  assert.equal(findElement(state.render(), node => node.type === state.dashboard), undefined)
  assert.ok(findElement(state.render(), node => node.type === 'button' && node.props.children === 'Admin View'))
  assert.equal(findElement(viewsHarness().render(), node => node.type === state.dashboard), undefined)
})
test('the actual page keys the shared experience by authenticated subject when accounts change', () => {
  for (const authId of ['admin-one', 'admin-two']) {
    const hooks = { useState: initial => [initial, () => {}] }
    const page = load('src/pages/FriendsAndFamily.tsx', { react: hooks, 'react/jsx-runtime': jsxRuntime, '@tanstack/react-query': { useQueryClient: () => ({}), useQuery: options => ({ data: options.queryKey[1] === 'session' ? { user: { authId } } : adminOverview, isPending: false, isError: false }) }, '../components/ThemeToggle': { ThemeToggle: () => null }, '../services/api': { API_URL: '' }, '../features/friends-family/api': inertApi, '../features/friends-family/RoundViews': views, '../features/friends-family/MoneyEditor': moneyEditor })
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
    const page = load('src/pages/FriendsAndFamily.tsx', { react: hooks, 'react/jsx-runtime': jsxRuntime, '@tanstack/react-query': { useQueryClient: () => ({ cancelQueries: () => Promise.resolve(), removeQueries: () => {} }), useQuery: options => ({ data: options.queryKey[1] === 'session' ? { user } : roundFixture, isPending: false, isError: false }) }, '../components/ThemeToggle': { ThemeToggle: () => null }, '../services/api': { API_URL: 'https://api.example.test' }, '../features/friends-family/api': inertApi, '../features/friends-family/RoundViews': views, '../features/friends-family/MoneyEditor': moneyEditor }, { window })
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
  const dashboard = load('src/features/friends-family/AdminDashboard.tsx', { react: hooks, 'react/jsx-runtime': jsxRuntime, '@tanstack/react-query': { useQueryClient: () => ({ cancelQueries: options => { calls.push(['cancel', options.queryKey]); return Promise.resolve() }, removeQueries: options => calls.push(['remove', options.queryKey]) }), useQuery: options => { calls.push(['query', options.queryKey]); return { data: targetSnapshot, dataUpdatedAt: 1 } } }, './api': inertApi, './RoundProgress': progress, './money': money, './participants': participantHelpers, './ParticipantList': { ParticipantList: () => null }, './RoundTargetEditor': targetComponents, './roundTarget': targetHelpers, './MoneyEditor': moneyEditor })
  dashboard.AdminDashboard({ overview: adminOverview, authId: 'admin-subject', login: () => {} })
  assert.deepEqual(Array.from(calls[0][1]), ['private-friends-family', 'participants', 'admin-subject'])
  for (const cleanup of cleanups) cleanup()
  assert.equal(calls[1][0], 'cancel'); assert.equal(calls[2][0], 'remove')
  assert.deepEqual(Array.from(calls[2][1]), ['private-friends-family', 'participants', 'admin-subject'])
})
test('revoking target management permits FnF return even when participant viewing remains allowed', () => {
  const state = viewsHarness(); toggleViews(state, 'Admin View')
  findElement(state.render(), node => node.type === state.dashboard).props.onExitLockChange(true)
  state.setOverview({ ...adminOverview, capabilities: { canViewParticipants: true, canManageRound: false } })
  const back = findElement(state.render(), node => node.type === 'button' && node.props.children === 'FnF View')
  assert.equal(back.props.disabled, false)
  back.props.onClick()
  assert.equal(findElement(state.render(), node => node.type === state.dashboard), undefined)
  state.setOverview(adminOverview)
  toggleViews(state, 'Admin View')
  assert.equal(findElement(state.render(), node => node.type === 'button' && node.props.children === 'FnF View').props.disabled, false)
  toggleViews(state, 'FnF View')
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
