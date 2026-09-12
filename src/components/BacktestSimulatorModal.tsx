import React, { useState, useMemo } from 'react';
import {
  X,
  TrendingUp,
  Sliders,
  Shield,
  Target,
  Calendar,
  Layers,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Award,
  AlertTriangle,
  Flame,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  LineChart as LineChartIcon,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { BacktestConfig, BacktestSummary, RebalanceCadence, TrailingStopRule } from '../types';
import { runQuantMomentumBacktest } from '../utils/backtestEngine';

interface BacktestSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStopLoss?: number;
  initialTargetGain?: number;
}

export const BacktestSimulatorModal: React.FC<BacktestSimulatorModalProps> = ({
  isOpen,
  onClose,
  initialStopLoss = 8,
  initialTargetGain = 25,
}) => {
  // Configurable backtest parameters
  const [config, setConfig] = useState<BacktestConfig>({
    initialCapital: 1000000, // ₹10 Lakhs
    portfolioSize: 10,
    stopLossPct: initialStopLoss,
    targetGainPct: initialTargetGain,
    trailingRule: 'none',
    rebalanceCadence: 'first_day_monthly',
    enforce52WHigh: true,
    maxDistance52WHighPct: 5,
    startYear: 2015,
    endYear: 2024,
  });

  const [activeChartTab, setActiveChartTab] = useState<'equity' | 'drawdown' | 'yearly'>('equity');
  const [tradeFilter, setTradeFilter] = useState<'all' | 'winners' | 'multibaggers' | 'stops' | 'rank_drop'>('all');
  const [showRationaleGuide, setShowRationaleGuide] = useState<boolean>(false);
  const [selectedBenchmarks, setSelectedBenchmarks] = useState<{
    nifty500: boolean;
    nifty50: boolean;
    gold: boolean;
  }>({
    nifty500: true,
    nifty50: true,
    gold: true,
  });

  // Synchronize initial values if changed from parent
  React.useEffect(() => {
    if (initialStopLoss !== undefined) {
      setConfig((prev) => ({ ...prev, stopLossPct: initialStopLoss }));
    }
    if (initialTargetGain !== undefined) {
      setConfig((prev) => ({ ...prev, targetGainPct: initialTargetGain }));
    }
  }, [initialStopLoss, initialTargetGain]);

  // Compute backtest results reactively
  const summary: BacktestSummary = useMemo(() => {
    return runQuantMomentumBacktest(config);
  }, [config]);

  if (!isOpen) return null;

  // Filtered sample trades
  const filteredTrades = summary.sampleTrades.filter((t) => {
    if (tradeFilter === 'winners') return t.status === 'WIN';
    if (tradeFilter === 'multibaggers') return t.returnPct >= 40;
    if (tradeFilter === 'stops') return t.exitReason === 'Stop Loss Triggered';
    if (tradeFilter === 'rank_drop') return t.exitReason === 'Rank Dropped Below Cutoff';
    return true;
  });

  const formatLakhs = (val: number) => {
    const lakhs = val / 100000;
    return `₹${lakhs.toFixed(1)}L`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-6xl w-full max-h-[94vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-start justify-between bg-gradient-to-r from-slate-50 via-indigo-50/30 to-slate-50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  10-Year Quantitative Strategy Backtester (2015 – 2024)
                </h2>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 border border-indigo-200">
                  Moneta OS Lab
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Stress-test Stop Loss (-8%), Profit Targets (+25%), Trailing Rules, and Rebalance Cadences against Nifty 500 TRI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRationaleGuide((prev) => !prev)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
              title="Why SL=-8% and Profit=25%?"
            >
              <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Why SL &amp; Target Rules?</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-6">
          {/* Collapsible Strategy Rationale Guide */}
          {showRationaleGuide && (
            <div className="p-4 sm:p-5 rounded-xl bg-indigo-50/70 border border-indigo-200/80 text-xs space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                <h3 className="font-bold text-indigo-950 flex items-center gap-1.5 text-sm">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Quantitative Rationale: How Did We Arrive at SL = -8% and Profit = +25%?
                </h3>
                <button
                  onClick={() => setShowRationaleGuide(false)}
                  className="text-indigo-400 hover:text-indigo-700 text-xs font-semibold"
                >
                  Dismiss
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-700">
                <div className="bg-white p-3 rounded-lg border border-indigo-100 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-rose-500" />
                    1. Why -8% Stop Loss?
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Indian large- and mid-caps have an average 20-day daily volatility (ATR) of ~1.8% to 2.5%. An 8% drop equals ~3× ATR. Beyond 8%, it is no longer routine daily noise—institutional demand has failed.
                  </p>
                </div>

                <div className="bg-white p-3 rounded-lg border border-indigo-100 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1">
                    <Target className="w-3.5 h-3.5 text-emerald-500" />
                    2. Why +25% Target?
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Provides a classic <strong>3:1 Asymmetric Risk-to-Reward Ratio</strong> (25% / 8% = 3.125). With a 3:1 payoff, a strategy only requires a <strong>32% win rate</strong> to be profitable.
                  </p>
                </div>

                <div className="bg-white p-3 rounded-lg border border-indigo-100 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                    3. Rebalance Cadence Impact
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Rebalancing on the <strong>1st Wednesday</strong> avoids Monday morning liquidity gaps and monthly Thursday F&amp;O expiry rollovers. Alternatively, <strong>Daily Watchdog</strong> cuts losers on the same day they breach rank.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Controls Bar: Interactive Sliders & Options */}
          <div className="bg-slate-50/80 rounded-xl border border-slate-200 p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Adjust Strategy Rules &amp; R:R Parameters
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  setConfig({
                    initialCapital: 1000000,
                    portfolioSize: 10,
                    stopLossPct: 8,
                    targetGainPct: 25,
                    trailingRule: 'none',
                    rebalanceCadence: 'first_day_monthly',
                    enforce52WHigh: true,
                    maxDistance52WHighPct: 5,
                    startYear: 2015,
                    endYear: 2024,
                  })
                }
                className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-900 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Defaults (SL: -8%, Target: +25%)
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 1. Stop Loss Parameter */}
              <div className="bg-white p-3 rounded-lg border border-slate-200/80 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-rose-500" />
                    Stop Loss Rule
                  </label>
                  <span className="font-mono text-xs font-bold text-rose-600">
                    {config.stopLossPct === 0 ? 'No Stop (0%)' : `-${config.stopLossPct}%`}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="1"
                    value={config.stopLossPct}
                    onChange={(e) => setConfig({ ...config, stopLossPct: Number(e.target.value) })}
                    className="w-full accent-rose-600 cursor-pointer"
                  />
                </div>

                <div className="flex flex-wrap gap-1 text-[10px]">
                  {[0, 5, 8, 10, 12, 15].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setConfig({ ...config, stopLossPct: val })}
                      className={`px-1.5 py-0.5 rounded font-mono ${
                        config.stopLossPct === val
                          ? 'bg-rose-600 text-white font-bold'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {val === 0 ? 'None' : `-${val}%`}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Profit / Target Parameter */}
              <div className="bg-white p-3 rounded-lg border border-slate-200/80 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                    <Target className="w-3.5 h-3.5 text-emerald-500" />
                    Profit Target Rule
                  </label>
                  <span className="font-mono text-xs font-bold text-emerald-600">
                    {config.targetGainPct === 0 ? 'Let Winners Run (∞)' : `+${config.targetGainPct}%`}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={config.targetGainPct}
                    onChange={(e) => setConfig({ ...config, targetGainPct: Number(e.target.value) })}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>

                <div className="flex flex-wrap gap-1 text-[10px]">
                  {[0, 20, 25, 40, 50, 100].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setConfig({ ...config, targetGainPct: val })}
                      className={`px-1.5 py-0.5 rounded font-mono ${
                        config.targetGainPct === val
                          ? 'bg-emerald-600 text-white font-bold'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {val === 0 ? 'Let Run' : `+${val}%`}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Trailing Stop Rule */}
              <div className="bg-white p-3 rounded-lg border border-slate-200/80 shadow-2xs space-y-2">
                <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  Trailing Exit Rule
                </label>
                <select
                  value={config.trailingRule}
                  onChange={(e) => setConfig({ ...config, trailingRule: e.target.value as TrailingStopRule })}
                  className="w-full text-xs font-medium bg-white border border-slate-200 rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                >
                  <option value="none">Static SL (from entry price)</option>
                  <option value="trail_from_high">Trail from Peak High (-8% from top)</option>
                  <option value="breakeven_then_trail">Breakeven at +15% → Trail 8% at +20% Gate</option>
                  <option value="dma50_trend">50-DMA Trend Line Filter</option>
                </select>
                <p className="text-[10px] text-slate-400">
                  {config.trailingRule === 'none'
                    ? 'Exits strictly at initial entry SL'
                    : config.trailingRule === 'breakeven_then_trail'
                    ? 'At +15%: SL locks at Cost (0% risk). At +20% gate: Trails 8% below peak'
                    : 'Protects floating open profit as stock ascends'}
                </p>
              </div>

              {/* 4. Rebalance Cadence & Review Frequency */}
              <div className="bg-white p-3 rounded-lg border border-slate-200/80 shadow-2xs space-y-2">
                <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                  Rebalancing &amp; Review Schedule
                </label>
                <select
                  value={config.rebalanceCadence}
                  onChange={(e) => setConfig({ ...config, rebalanceCadence: e.target.value as RebalanceCadence })}
                  className="w-full text-xs font-medium bg-white border border-slate-200 rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                >
                  <option value="first_day_monthly">1st Trading Day of Month (Classic)</option>
                  <option value="first_wednesday_monthly">1st Wednesday of Month (Avoids Expiry)</option>
                  <option value="daily_continuous">Daily Watchdog (Exit on Rank Drop)</option>
                  <option value="biweekly">Bi-Weekly (Every 2 Weeks)</option>
                  <option value="quarterly">Quarterly (Every 3 Months)</option>
                </select>
                <p className="text-[10px] text-slate-400">
                  {config.rebalanceCadence === 'daily_continuous'
                    ? 'Check daily: replace stock immediately when rank slips'
                    : 'Re-screens universe at scheduled intervals'}
                </p>
              </div>
            </div>

            {/* Secondary Controls: Portfolio Concentration & 52W High */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs border-t border-slate-200/60">
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-semibold text-slate-600">Portfolio Size:</span>
                {[10, 15, 20, 25].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setConfig({ ...config, portfolioSize: n })}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                      config.portfolioSize === n
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Top {n} ({((100 / n)).toFixed(0)}% each)
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.enforce52WHigh}
                    onChange={(e) => setConfig({ ...config, enforce52WHigh: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-[11px] font-medium text-slate-700">
                    Enforce 52-Week High Rule (within 5%)
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Key Metric Scorecard Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* 1. Strategy CAGR */}
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-50 to-white border border-indigo-200/80 shadow-2xs">
              <div className="text-[11px] font-semibold text-indigo-900 flex items-center justify-between">
                <span>Strategy CAGR</span>
                <Award className="w-3.5 h-3.5 text-indigo-600" />
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-bold font-mono text-indigo-950">
                  {summary.strategyCagr}%
                </span>
              </div>
              <div className="text-[10px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" />
                +{(summary.strategyCagr - summary.benchmarkCagr).toFixed(1)}% vs Nifty 500
              </div>
            </div>

            {/* 2. Portfolio Final Capital */}
            <div className="p-3.5 rounded-xl bg-slate-900 text-white shadow-2xs">
              <div className="text-[11px] font-semibold text-slate-400">
                ₹10L Compounded
              </div>
              <div className="mt-1 text-xl sm:text-2xl font-bold font-mono text-emerald-400">
                {formatLakhs(summary.finalStrategyCapital)}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 flex flex-col gap-0.5">
                <span>Nifty 500: {formatLakhs(summary.finalBenchmarkCapital)}</span>
                <span className="text-amber-400/90">Gold: {formatLakhs(summary.finalGoldCapital ?? 3600000)}</span>
              </div>
            </div>

            {/* 3. Max Drawdown */}
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-rose-50 to-white border border-rose-200/80 shadow-2xs">
              <div className="text-[11px] font-semibold text-rose-900 flex items-center justify-between">
                <span>Max Drawdown</span>
                <Shield className="w-3.5 h-3.5 text-rose-500" />
              </div>
              <div className="mt-1 text-xl sm:text-2xl font-bold font-mono text-rose-700">
                {summary.strategyMaxDrawdown}%
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Nifty 500: {summary.benchmarkMaxDrawdown}%
              </div>
            </div>

            {/* 4. Sharpe & Sortino with Explanatory Popover */}
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs group relative cursor-help">
              <div className="text-[11px] font-semibold text-slate-600 flex items-center justify-between">
                <span>Sharpe / Sortino</span>
                <Info className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
              </div>
              <div className="mt-1 text-xl sm:text-2xl font-bold font-mono text-slate-900">
                {summary.sharpeRatio} <span className="text-xs font-normal text-slate-400">/ {summary.sortinoRatio}</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Risk-adjusted return
              </div>

              {/* Hover Tooltip Popup */}
              <div className="absolute top-full left-0 mt-1 hidden group-hover:block z-50 w-64 p-3 bg-slate-900 text-white rounded-lg shadow-xl text-[11px] font-sans pointer-events-none">
                <p className="font-bold text-indigo-300 mb-1">Risk-Adjusted Efficiency</p>
                <p className="mb-1.5 text-slate-300">
                  <strong className="text-white">Sharpe ({summary.sharpeRatio}):</strong> Excess return per unit of total volatility over 6.5% risk-free rate. (&gt;1.0 is good, &gt;1.5 is excellent).
                </p>
                <p className="text-slate-300">
                  <strong className="text-white">Sortino ({summary.sortinoRatio}):</strong> Excess return penalizing <em>only downside volatility & drawdowns</em>. Higher Sortino indicates smooth upward compounding without gut-wrenching drawdowns.
                </p>
              </div>
            </div>

            {/* 5. Win Rate */}
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <div className="text-[11px] font-semibold text-slate-600">
                Win Rate
              </div>
              <div className="mt-1 text-xl sm:text-2xl font-bold font-mono text-slate-900">
                {summary.winRate}%
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Profit Factor: {summary.profitFactor}x
              </div>
            </div>

            {/* 6. Avg Win vs Loss Payoff */}
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <div className="text-[11px] font-semibold text-slate-600">
                Avg Win / Avg Loss
              </div>
              <div className="mt-1 text-base sm:text-lg font-bold font-mono text-emerald-600 flex items-center gap-1">
                <span>+{summary.avgWinPct}%</span>
                <span className="text-slate-300">/</span>
                <span className="text-rose-600">-{Math.abs(summary.avgLossPct)}%</span>
              </div>
              <div className="text-[10px] text-indigo-600 font-semibold mt-0.5">
                {(summary.avgWinPct / (Math.abs(summary.avgLossPct) || 1)).toFixed(1)}:1 Payoff Ratio
              </div>
            </div>
          </div>

          {/* Interactive Chart Section with Tabs */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Visual Historical Simulation Performance
                </h3>

                {/* Benchmark Selector Pills */}
                {activeChartTab === 'equity' && (
                  <div className="flex items-center gap-2 text-xs bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Compare:</span>
                    <label className="flex items-center gap-1 cursor-pointer text-slate-600 hover:text-slate-900 text-[11px]">
                      <input
                        type="checkbox"
                        checked={selectedBenchmarks.nifty500}
                        onChange={(e) =>
                          setSelectedBenchmarks((prev) => ({ ...prev, nifty500: e.target.checked }))
                        }
                        className="rounded text-indigo-600 focus:ring-indigo-500 h-3 w-3"
                      />
                      <span>Nifty 500 ({summary.benchmarkCagr}%)</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer text-slate-600 hover:text-slate-900 text-[11px]">
                      <input
                        type="checkbox"
                        checked={selectedBenchmarks.nifty50}
                        onChange={(e) =>
                          setSelectedBenchmarks((prev) => ({ ...prev, nifty50: e.target.checked }))
                        }
                        className="rounded text-sky-600 focus:ring-sky-500 h-3 w-3"
                      />
                      <span>Nifty 50 ({summary.nifty50Cagr ?? 14.1}%)</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer text-amber-700 hover:text-amber-900 text-[11px]">
                      <input
                        type="checkbox"
                        checked={selectedBenchmarks.gold}
                        onChange={(e) =>
                          setSelectedBenchmarks((prev) => ({ ...prev, gold: e.target.checked }))
                        }
                        className="rounded text-amber-500 focus:ring-amber-500 h-3 w-3"
                      />
                      <span>Gold ETF ({summary.goldCagr ?? 12.3}%)</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Chart Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setActiveChartTab('equity')}
                  className={`px-3 py-1 rounded-md font-medium transition-colors ${
                    activeChartTab === 'equity'
                      ? 'bg-white text-indigo-900 font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Compounded Growth (₹10L)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveChartTab('drawdown')}
                  className={`px-3 py-1 rounded-md font-medium transition-colors ${
                    activeChartTab === 'drawdown'
                      ? 'bg-white text-indigo-900 font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Underwater Drawdown (%)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveChartTab('yearly')}
                  className={`px-3 py-1 rounded-md font-medium transition-colors ${
                    activeChartTab === 'yearly'
                      ? 'bg-white text-indigo-900 font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Year-by-Year Alpha
                </button>
              </div>
            </div>

            {/* Chart Canvas */}
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                {activeChartTab === 'equity' ? (
                  <AreaChart data={summary.equityCurve} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="strategyGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="benchGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(d) => d.slice(0, 4)}
                      interval={24}
                      tick={{ fontSize: 11, fill: '#64748b' }}
                    />
                    <YAxis
                      tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      domain={['auto', 'auto']}
                    />
                    <Tooltip
                      formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, '']}
                      labelFormatter={(label) => `Month: ${label}`}
                      contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Area
                      type="monotone"
                      dataKey="strategyEquity"
                      name="Moneta OS Momentum Strategy"
                      stroke="#4f46e5"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#strategyGrad)"
                    />
                    {selectedBenchmarks.nifty500 && (
                      <Area
                        type="monotone"
                        dataKey="benchmarkEquity"
                        name="Nifty 500 TRI (Broad Market)"
                        stroke="#94a3b8"
                        strokeWidth={1.5}
                        strokeDasharray="4 4"
                        fillOpacity={1}
                        fill="url(#benchGrad)"
                      />
                    )}
                    {selectedBenchmarks.nifty50 && (
                      <Area
                        type="monotone"
                        dataKey="nifty50Equity"
                        name="Nifty 50 (Largecap Core)"
                        stroke="#0284c7"
                        strokeWidth={1.5}
                        strokeDasharray="2 2"
                        fill="none"
                      />
                    )}
                    {selectedBenchmarks.gold && (
                      <Area
                        type="monotone"
                        dataKey="goldEquity"
                        name="Domestic Gold ETF"
                        stroke="#d97706"
                        strokeWidth={1.5}
                        strokeDasharray="3 3"
                        fillOpacity={1}
                        fill="url(#goldGrad)"
                      />
                    )}
                  </AreaChart>
                ) : activeChartTab === 'drawdown' ? (
                  <AreaChart data={summary.equityCurve} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(d) => d.slice(0, 4)}
                      interval={24}
                      tick={{ fontSize: 11, fill: '#64748b' }}
                    />
                    <YAxis
                      tickFormatter={(v) => `${v}%`}
                      domain={[-45, 0]}
                      tick={{ fontSize: 11, fill: '#64748b' }}
                    />
                    <Tooltip
                      formatter={(val: any) => [`${val}%`, '']}
                      labelFormatter={(label) => `Date: ${label}`}
                      contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Area
                      type="monotone"
                      dataKey="strategyDrawdown"
                      name="Strategy Drawdown (%)"
                      stroke="#e11d48"
                      strokeWidth={2}
                      fill="#ffe4e6"
                    />
                    <Area
                      type="monotone"
                      dataKey="benchmarkDrawdown"
                      name="Nifty 500 Benchmark Drawdown (%)"
                      stroke="#94a3b8"
                      strokeWidth={1.5}
                      strokeDasharray="3 3"
                      fill="#f1f5f9"
                    />
                  </AreaChart>
                ) : (
                  <BarChart data={summary.yearlyPerformance} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip
                      formatter={(val: any) => [`${val}%`, '']}
                      contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="strategyReturn" name="Strategy Return (%)" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="benchmarkReturn" name="Nifty 500 TRI (%)" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Year-by-Year Historical Breakdown Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Year-by-Year Performance Audit (10-Year Track Record)
              </h3>
              <span className="text-[11px] text-slate-500">
                10-Year Net Alpha: <strong className="text-emerald-700">+{((summary.strategyTotalReturn - summary.benchmarkTotalReturn)).toFixed(1)}%</strong>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase">
                    <th className="py-2.5 px-3 text-left">Year</th>
                    <th className="py-2.5 px-3 text-right">Strategy Return</th>
                    <th className="py-2.5 px-3 text-right">Nifty 500 TRI</th>
                    <th className="py-2.5 px-3 text-right">Net Alpha</th>
                    <th className="py-2.5 px-3 text-right">Max Drawdown</th>
                    <th className="py-2.5 px-3 text-right">Win Rate</th>
                    <th className="py-2.5 px-3 text-left">Market Regime Context</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {summary.yearlyPerformance.map((y) => {
                    const isAlphaPositive = y.alpha >= 0;
                    let context = '';
                    if (y.year === 2015) context = 'Commodities & emerging markets slump';
                    else if (y.year === 2016) context = 'Demonetization & US elections volatility';
                    else if (y.year === 2017) context = 'Historic Midcap momentum super-cycle';
                    else if (y.year === 2018) context = 'IL&FS NBFC crisis; SL protected capital';
                    else if (y.year === 2019) context = 'Polarized rally; corporate tax rate cut';
                    else if (y.year === 2020) context = 'March COVID crash (-38%) & V-shape recovery';
                    else if (y.year === 2021) context = 'Unprecedented liquidity & momentum expansion';
                    else if (y.year === 2022) context = 'Global rate hikes & Ukraine war sideways';
                    else if (y.year === 2023) context = 'Broad PSU, defense, manufacturing breakout';
                    else if (y.year === 2024) context = 'Elections year, largecap/midcap momentum';

                    return (
                      <tr key={y.year} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2 px-3 font-bold text-slate-900">{y.year}</td>
                        <td className={`py-2 px-3 text-right font-bold ${y.strategyReturn >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {y.strategyReturn >= 0 ? '+' : ''}{y.strategyReturn}%
                        </td>
                        <td className={`py-2 px-3 text-right ${y.benchmarkReturn >= 0 ? 'text-slate-700' : 'text-rose-600'}`}>
                          {y.benchmarkReturn >= 0 ? '+' : ''}{y.benchmarkReturn}%
                        </td>
                        <td className={`py-2 px-3 text-right font-bold ${isAlphaPositive ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {isAlphaPositive ? '+' : ''}{y.alpha}%
                        </td>
                        <td className="py-2 px-3 text-right text-rose-600 font-bold">
                          {y.maxDrawdown}%
                        </td>
                        <td className="py-2 px-3 text-right text-slate-700 font-sans">
                          {y.winRate}%
                        </td>
                        <td className="py-2 px-3 text-left font-sans text-slate-500 text-[11px]">
                          {context}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Representative Trades Log with Exit Reason Filters */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs space-y-2">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/60">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Representative Simulated Trades Audit Log ({filteredTrades.length} Trades)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Inspect how Stop Loss (-{config.stopLossPct}%), Target Gain (+{config.targetGainPct}%), and Rank-Drop rules triggered exits
                </p>
              </div>

              {/* Trade Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => setTradeFilter('all')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    tradeFilter === 'all'
                      ? 'bg-slate-900 text-white font-bold'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  All Trades
                </button>
                <button
                  type="button"
                  onClick={() => setTradeFilter('multibaggers')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    tradeFilter === 'multibaggers'
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Runners (&gt;40%)
                </button>
                <button
                  type="button"
                  onClick={() => setTradeFilter('stops')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    tradeFilter === 'stops'
                      ? 'bg-rose-600 text-white font-bold'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Stops Executed (SL)
                </button>
                <button
                  type="button"
                  onClick={() => setTradeFilter('rank_drop')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    tradeFilter === 'rank_drop'
                      ? 'bg-amber-600 text-white font-bold'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Rank-Drop Exits
                </button>
              </div>
            </div>

            <div className="overflow-x-auto max-h-72">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-slate-100 border-b border-slate-200 text-[10px] font-bold text-slate-600 uppercase">
                  <tr>
                    <th className="py-2 px-3 text-left">Stock</th>
                    <th className="py-2 px-3 text-left">Sector</th>
                    <th className="py-2 px-3 text-left">Holding Period</th>
                    <th className="py-2 px-3 text-right">Entry → Exit Price</th>
                    <th className="py-2 px-3 text-right">Return (%)</th>
                    <th className="py-2 px-3 text-left">Exit Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTrades.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2 px-3">
                        <div className="font-bold text-slate-900">{t.ticker}</div>
                        <div className="text-[10px] text-slate-400">{t.name}</div>
                      </td>
                      <td className="py-2 px-3 text-slate-600">{t.sector}</td>
                      <td className="py-2 px-3 text-slate-500 font-mono text-[11px]">
                        {t.entryDate} → {t.exitDate} ({t.holdingDays}d)
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-slate-700">
                        ₹{t.entryPrice.toFixed(0)} → ₹{t.exitPrice.toFixed(0)}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <span
                          className={`font-mono font-bold ${
                            t.returnPct >= 0 ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {t.returnPct >= 0 ? '+' : ''}{t.returnPct}%
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${
                            t.exitReason === 'Stop Loss Triggered'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : t.exitReason === 'Target Gain Achieved'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : t.exitReason === 'Trailing Stop Breached'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          }`}
                        >
                          {t.exitReason}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 rounded-b-2xl">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>
              10-Year Quantitative Simulation Engine • Moneta OS Quantitative Research
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors"
          >
            Close Backtest
          </button>
        </div>
      </div>
    </div>
  );
};
