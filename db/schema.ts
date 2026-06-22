// LUNA Dashboard — Drizzle Schema (all 17 entities)
// Note: This schema is for reference / future DB migration.
// Phase 1 uses in-memory simulated data via API routes.

import { pgTable, text, integer, real, boolean, timestamp, jsonb, serial } from 'drizzle-orm/pg-core';

// ── V1–V3: Cognition Layer ─────────────────────────────────────────
export const agents = pgTable('agents', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  version: text('version').notNull(),
  layer: text('layer').notNull(),
  status: text('status').notNull().default('idle'),
  lastCommand: text('last_command'),
  lastOutput: text('last_output'),
  agentType: text('agent_type').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const memoryEntries = pgTable('memory_entries', {
  id: serial('id').primaryKey(),
  key: text('key').notNull(),
  value: text('value').notNull(),
  layer: text('layer').notNull(),
  createdDate: timestamp('created_date').defaultNow(),
});

export const toolExecutions = pgTable('tool_executions', {
  id: serial('id').primaryKey(),
  toolName: text('tool_name').notNull(),
  input: text('input'),
  output: text('output'),
  status: text('status').notNull(),
  durationMs: integer('duration_ms'),
  timestamp: timestamp('timestamp').defaultNow(),
});

// ── V4–V6: Agent Layer ─────────────────────────────────────────────
export const tradingStrategies = pgTable('trading_strategies', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  signalConditions: jsonb('signal_conditions'),
  portfolioRules: jsonb('portfolio_rules'),
  executionLogic: text('execution_logic'),
  riskParams: jsonb('risk_params'),
  status: text('status').notNull().default('draft'),
  simulationResults: jsonb('simulation_results'),
  createdDate: timestamp('created_date').defaultNow(),
});

// ── Activity & Chat ────────────────────────────────────────────────
export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  eventType: text('event_type').notNull(),
  layer: text('layer').notNull(),
  message: text('message').notNull(),
  severity: text('severity').notNull().default('info'),
  timestamp: timestamp('timestamp').defaultNow(),
});

export const chatMessages = pgTable('chat_messages', {
  id: serial('id').primaryKey(),
  role: text('role').notNull(),
  content: text('content').notNull(),
  layerTarget: text('layer_target'),
  timestamp: timestamp('timestamp').defaultNow(),
});

// ── V7–V9: Economy Layer ───────────────────────────────────────────
export const monetizationSignals = pgTable('monetization_signals', {
  id: serial('id').primaryKey(),
  signalType: text('signal_type').notNull(),
  description: text('description'),
  classification: text('classification'),
  status: text('status').notNull().default('pending'),
  reliabilityScore: integer('reliability_score'),
  marketDemandScore: integer('market_demand_score'),
  alphaScore: integer('alpha_score'),
  createdDate: timestamp('created_date').defaultNow(),
});

export const companies = pgTable('companies', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  companyType: text('company_type').notNull(),
  status: text('status').notNull().default('active'),
  simulatedRevenue: real('simulated_revenue').default(0),
  createdDate: timestamp('created_date').defaultNow(),
});

export const services = pgTable('services', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  companyId: integer('company_id').references(() => companies.id),
  apiKey: text('api_key'),
  status: text('status').notNull().default('active'),
  usageCount: integer('usage_count').default(0),
  tier: text('tier').notNull().default('free'),
});

export const deploymentChecklists = pgTable('deployment_checklists', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id),
  authReady: boolean('auth_ready').default(false),
  dbReady: boolean('db_ready').default(false),
  billingReady: boolean('billing_ready').default(false),
  cicdReady: boolean('cicd_ready').default(false),
  cloudReady: boolean('cloud_ready').default(false),
  productionScore: integer('production_score').default(0),
});

// ── V10–V11: SaaS Layer ────────────────────────────────────────────
export const subscriptionTiers = pgTable('subscription_tiers', {
  id: serial('id').primaryKey(),
  serviceId: integer('service_id').references(() => services.id),
  tierName: text('tier_name').notNull(),
  priceSimulated: real('price_simulated').notNull(),
  userCountSimulated: integer('user_count_simulated').default(0),
});

// ── V12: Ecosystem Layer ───────────────────────────────────────────
export const ecosystemEvents = pgTable('ecosystem_events', {
  id: serial('id').primaryKey(),
  eventType: text('event_type').notNull(),
  companyId: integer('company_id').references(() => companies.id),
  description: text('description'),
  timestamp: timestamp('timestamp').defaultNow(),
});

// ── Crypto Intelligence ────────────────────────────────────────────
export const cryptoSignals = pgTable('crypto_signals', {
  id: serial('id').primaryKey(),
  coinPair: text('coin_pair').notNull(),
  indicator: text('indicator').notNull(),
  value: real('value').notNull(),
  threshold: real('threshold').notNull(),
  triggered: boolean('triggered').default(false),
  severity: text('severity').notNull().default('info'),
  timestamp: timestamp('timestamp').defaultNow(),
});

export const alertRules = pgTable('alert_rules', {
  id: serial('id').primaryKey(),
  coinPair: text('coin_pair').notNull(),
  indicator: text('indicator').notNull(),
  threshold: real('threshold').notNull(),
  condition: text('condition').notNull().default('above'),
  active: boolean('active').default(true),
});

// ── Trading Bots ───────────────────────────────────────────────────
export const tradingBots = pgTable('trading_bots', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  coinPair: text('coin_pair').notNull(),
  strategyId: integer('strategy_id').references(() => tradingStrategies.id),
  mode: text('mode').notNull().default('simulation'),
  status: text('status').notNull().default('stopped'),
  virtualBalance: real('virtual_balance').default(10000),
  totalPnl: real('total_pnl').default(0),
  tradeCount: integer('trade_count').default(0),
  createdDate: timestamp('created_date').defaultNow(),
});

export const botTrades = pgTable('bot_trades', {
  id: serial('id').primaryKey(),
  botId: integer('bot_id').references(() => tradingBots.id),
  type: text('type').notNull(),
  coinPair: text('coin_pair').notNull(),
  price: real('price').notNull(),
  quantity: real('quantity').notNull(),
  pnl: real('pnl').default(0),
  mode: text('mode').notNull().default('simulation'),
  timestamp: timestamp('timestamp').defaultNow(),
});
