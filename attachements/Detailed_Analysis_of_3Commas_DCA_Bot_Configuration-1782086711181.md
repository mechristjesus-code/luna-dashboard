# Detailed Analysis of 3Commas DCA Bot Configuration (ETH/USDT)

This report provides a comprehensive breakdown of the specified 3Commas Dollar-Cost Averaging (DCA) bot configuration for the ETH/USDT trading pair. It will cover the bot's execution logic, mathematical progression of orders, risk management, and overall capital utilization.

## 1. Bot Overview and Initial Setup

**Bot Name:** ETH/USDT Classic trading
**Exchange:** Not connected (requires connection to a cryptocurrency exchange)
**Pair:** ETH/USDT

This bot is configured to trade the ETH/USDT pair, indicating a strategy focused on accumulating or trading Ethereum against Tether (a stablecoin). The 'Not connected' status implies that the bot is currently in a setup phase and needs to be linked to an active exchange account via API keys to commence live trading.

## 2. Order Execution Logic and Averaging Strategy

The core of a DCA bot lies in its ability to place multiple orders at different price levels to average down the entry price during market downturns. This configuration utilizes a base order and several averaging (safety) orders.

### **2.1. Base Order**

*   **Base order size:** 20 USDT

This is the initial order the bot will place when a new trade starts. It will buy 20 USDT worth of ETH.

### **2.2. Averaging (Safety) Orders**

Safety orders are designed to buy more ETH at lower prices if the market moves against the initial base order. This bot is configured with the following parameters:

*   **Deviation to open first averaging order:** 1%
*   **Averaging order size:** 15 USDT
*   **Deviation step multiplier:** 4
*   **Order size multiplier:** 1.7
*   **Averaging orders per trade:** 3
*   **Limit averaging orders placed on exchange:** 0 (This means all 3 averaging orders will be placed as limit orders on the exchange once triggered, rather than being held off-exchange by 3Commas until closer to execution.)
*   **Averaging orders min. price calculation mode:** From base order

Let's break down the mathematical progression of these orders. Assuming an initial ETH price (for the base order) of `P_base`, the subsequent safety orders will be placed at decreasing price levels and with increasing sizes.

#### **Order Progression Calculation**

To illustrate, let's assume an initial ETH price of 1348.88 USDT (as indicated in the configuration summary for the last order price, though this is likely a dynamic value). We will use this as a reference point for price deviations.

| Order Type | Deviation from Base Price (%) | Price (approx. if Base Price = 1348.88 USDT) | Order Size (USDT) | Cumulative Volume (USDT) | Average Price (approx.) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Base Order** | 0% | 1348.88 | 20.00 | 20.00 | 1348.88 |
| **Safety Order 1** | 1% | 1335.40 | 15.00 | 35.00 | 1342.91 |
| **Safety Order 2** | 1% + (1% * 4) = 5% | 1281.44 | 15.00 * 1.7 = 25.50 | 60.50 | 1317.06 |
| **Safety Order 3** | 5% + (4% * 4) = 21% | 1065.62 | 25.50 * 1.7 = 43.35 | 103.85 | 1209.80 |

*   **Deviation Calculation:** The `Deviation to open first averaging order` is 1%. The `Deviation step multiplier` of 4 means that each subsequent deviation step is 4 times larger than the *previous step*. So, the first step is 1%, the second step is 1% * 4 = 4%, and the third step is 4% * 4 = 16%. These steps are added to the initial deviation. Therefore, the total deviations are 1%, 1%+4%=5%, and 5%+16%=21%.
*   **Order Size Calculation:** The `Averaging order size` starts at 15 USDT. The `Order size multiplier` of 1.7 means each subsequent safety order will be 1.7 times larger than the *previous safety order*. So, the sizes are 15 USDT, 15 * 1.7 = 25.50 USDT, and 25.50 * 1.7 = 43.35 USDT.

If all orders are filled, the bot will have invested a total of 103.85 USDT (20 + 15 + 25.50 + 43.35) and will hold ETH at an average price significantly lower than the initial base order price.

### **2.3. Trade Start Condition**

*   **Condition:** Open new trade immediately
*   **Technical Analysis start conditions:** RSI (7, 15 minutes) Less Than 30

This bot is configured to open a new trade immediately upon activation if the technical analysis conditions are met. The condition specifies that the Relative Strength Index (RSI) for the 15-minute timeframe, calculated over 7 periods, must be below 30. An RSI below 30 typically indicates that the asset is oversold, suggesting a potential upward price reversal, which is a common entry signal for long strategies.

## 3. Take Profit Settings

*   **Take profit type:** Percentage from average price
*   **Target profit:** 2.4%
*   **Reinvest Profit:** 100%
*   **Trailing:** 0%

Once a trade is active and all or some orders are filled, the bot will calculate the average entry price of the ETH held. It will then set a take profit target at 2.4% above this average price. The `Reinvest Profit` setting at 100% means that upon successful completion of a trade (hitting the take profit target), the entire profit will be used to open a new trade, effectively compounding gains. The `Trailing` is set to 0%, meaning there is no dynamic adjustment of the take profit level; it's a fixed 2.4% above the average price.

## 4. Stop Loss Settings

*   **Stop Loss:** 26% (approx. 1263.51 USDT, likely relative to the base order price)
*   **Stop Loss action:** Close trade
*   **Stop Loss timeout:** 300 Sec
*   **Stop Loss Breakeven:** Move to BE (Breakeven)
*   **Risk reduction:** 100%
*   **Trailing stop loss:** Not enabled (implied by lack of explicit trailing setting)

This configuration includes a significant stop loss at 26%. If the price drops 26% from the initial base order price (or potentially the average price, depending on the exact implementation), the bot will `Close trade`, selling all ETH to prevent further losses. The `Stop Loss timeout` of 300 seconds (5 minutes) suggests that if the stop loss level is hit, the bot will attempt to close the trade within this timeframe. The `Move to BE (Breakeven)` feature is crucial: once the price moves a certain percentage in profit, the stop loss will automatically adjust to the average entry price, ensuring that the trade, at minimum, breaks even. `Risk reduction` at 100% means that if the stop loss is triggered, the entire position will be closed.

## 5. Other Trade Management Settings

*   **Auto-close trade after:** 72 Hrs (3 days)

This setting acts as a time-based stop. If a trade remains open for 72 hours without hitting either the take profit or stop loss, the bot will automatically close the trade. This helps prevent trades from being stuck indefinitely in unfavorable market conditions.

*   **Max trade iterations:** Not specified (implies unlimited or default)
*   **Cooldown between trades:** 0 Sec

With a 0-second cooldown, the bot will immediately look for a new trade opportunity after the current one closes (either by take profit, stop loss, or auto-close), assuming the start conditions are met.

*   **Simultaneous trades per same pair:** 1
*   **Max active trades:** 1

This indicates that the bot will only manage one active trade for the ETH/USDT pair at any given time. It will not open a new trade until the current one is fully closed.

*   **Min price to open trade:** Not specified
*   **Max price to open trade:** Not specified
*   **Min daily volume:** 0 BTC

These settings allow for price and volume filters, but they are not configured in this instance, meaning the bot will open trades regardless of the current price range or daily trading volume (as long as it's above 0 BTC).

*   **Profit currency:** Quote (USDT)

Profits generated by the bot will be realized in USDT.

## 6. Summary of Capital Usage

*   **Balance:** 1000 USDT
*   **Max amount for bot usage:** 103.85 USDT
*   **Max averaging order price deviation:** 21%
*   **% of available balance to be used by the bot:** 10.39%

This summary confirms the total capital that the bot is configured to use if all safety orders are filled (103.85 USDT). This represents 10.39% of the available 1000 USDT balance, leaving a significant portion of the capital unallocated for other trading activities or to withstand larger drawdowns if this bot is part of a larger portfolio strategy. The `Max averaging order price deviation` of 21% aligns with our calculation for the deepest safety order level.

---

**Disclaimer:** This analysis is based solely on the provided configuration. Actual trading performance can vary significantly due to market volatility, exchange fees, slippage, and other unforeseen factors. Past performance is not indicative of future results. It is crucial to understand the risks involved in cryptocurrency trading before deploying any automated strategies.

## 7. Risk Profile and Capital Efficiency Analysis

### **7.1. Risk Profile**

*   **Stop Loss at 26%:** The 26% stop loss is a critical risk management parameter. It means that if the price of ETH drops by 26% from the initial base order price (or the calculated average entry price, depending on the exact trigger), the bot will exit the trade. This limits potential losses on a single trade. However, a 26% drop is substantial and can result in a significant loss of capital if triggered.
*   **Averaging Orders:** The use of 3 averaging orders, with increasing sizes and deviations, helps to reduce the average entry price during a downtrend. This strategy is effective in volatile markets, allowing the bot to recover faster when the price rebounds. The maximum deviation of 21% for the last safety order means the bot is designed to withstand a significant price drop before all capital is deployed into the trade.
*   **Auto-close after 72 hours:** This acts as a time-based risk management. If the market remains stagnant or continues to move unfavorably without hitting the stop loss or take profit, the trade will be closed after 3 days, freeing up capital.
*   **Simultaneous trades per pair (1):** Limiting to one simultaneous trade per pair reduces exposure to a single asset and prevents over-leveraging within that pair.

### **7.2. Capital Efficiency**

*   **Max amount for bot usage (103.85 USDT):** Out of a 1000 USDT balance, the bot is configured to use a maximum of 103.85 USDT per trade. This means approximately 10.39% of the total balance is allocated to this specific bot. This conservative allocation suggests that the user might be running multiple bots, or prefers to keep a large portion of their capital liquid or for other investment opportunities.
*   **Reinvest Profit (100%):** This setting significantly enhances capital efficiency by compounding profits. Every successful trade will increase the capital available for subsequent trades, leading to exponential growth over time if the strategy is consistently profitable.
*   **Cooldown between trades (0 Sec):** A zero-second cooldown ensures that the bot is always looking for new opportunities, maximizing the utilization of capital by immediately re-entering trades if conditions are met.

### **7.3. Considerations**

*   **Market Volatility:** While the DCA strategy is designed for volatile markets, extreme and prolonged downtrends can still lead to significant drawdowns, especially with a 26% stop loss. The effectiveness of the bot heavily relies on price reversals within the configured deviation range.
*   **Exchange Fees:** The configuration does not explicitly account for exchange trading fees (0.1% fee rate is mentioned in the summary, but not directly in the bot settings). These fees can eat into profits, especially with frequent trading, and should be factored into the overall profitability calculation.
*   **RSI Condition:** The RSI < 30 condition is a good entry signal for oversold conditions. However, in strong downtrends, an asset can remain oversold for extended periods, leading to delayed entries or further price drops after entry.

---
