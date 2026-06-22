# 3Commas: Comprehensive App Understanding Report

3Commas is a robust cryptocurrency trading automation platform designed to bridge the gap between manual trading and full algorithmic execution. It provides a unified dashboard to manage multiple exchange accounts, deploy automated trading bots, and utilize advanced manual trading tools.

## 1. Core Modules and Interface
The 3Commas interface is structured to provide both a high-level overview and granular control over trading activities.

### **The Dashboard**
The central hub of the application, offering:
*   **Portfolio Overview:** Real-time tracking of total balance across all connected exchanges.
*   **Asset Distribution:** A breakdown of holdings by token and exchange.
*   **Quick Actions:** Direct buttons to create DCA, Grid, or Signal bots.
*   **Account Toggling:** Seamless switching between **Real** and **Demo (Paper Trading)** accounts.

### **Navigation & Menus**
*   **Side Menu:** Provides access to specialized modules like SmartTrade, DCA Bots, Grid Bots, and Portfolios.
*   **User Menu:** Contains account settings, subscription management, API access, and the **Trader’s Diary** for historical review.

---

## 2. Automated Trading Bots
3Commas is primarily known for its diverse range of automated bots tailored for different market conditions.

| Bot Type | Primary Strategy | Ideal Market Condition |
| :--- | :--- | :--- |
| **DCA Bot** | Dollar-Cost Averaging; buys more as price drops to lower average entry. | Trending or Volatile |
| **Grid Bot** | Buys and sells within a predefined price range (grid). | Side-ways / Ranging |
| **Signal Bot** | Executes trades based on external triggers (e.g., TradingView, 3rd party). | Strategy-Dependent |
| **SmartTrade** | Manual trading with advanced features like concurrent TP/SL and trailing. | Manual / Precision |

### **Key Bot Features**
*   **Trailing Take Profit/Stop Loss:** Automatically adjusts exit points as the price moves in a favorable direction to maximize gains or minimize losses.
*   **Multi-Pair Support:** Bots can monitor and trade dozens of pairs simultaneously.
*   **Backtesting:** Allows users to test strategies against historical data before deploying capital.

---

## 3. Portfolio Management
The platform offers sophisticated tools for long-term asset management:
*   **Portfolio Rebalancing:** Automatically adjusts coin ratios to maintain a target allocation.
*   **Quick Convert:** One-click conversion of small balances ("dust") into BNB or other major assets.
*   **Analytics:** Deep insights into profit/loss metrics, risk levels, and historical performance.

---

## 4. Connectivity and Integration
3Commas acts as a middleware layer, connecting to major global exchanges.
*   **Supported Exchanges:** Includes Binance, Bybit, OKX, KuCoin, Kraken, Coinbase, and Gate.io.
*   **Fast Connect:** A secure, API-less connection method for supported exchanges (e.g., Binance, OKX).
*   **API Access:** Developers can use the 3Commas API to build custom integrations or external dashboards.

---

## 5. Subscription and Pricing Structure
3Commas uses a tiered subscription model based on the number of active trades and advanced features required.

| Feature | Starter | Pro | Expert |
| :--- | :--- | :--- | :--- |
| **Price (Monthly)** | ~$20 | ~$50 | ~$200 |
| **Active Accounts** | 1 | 3 | 15 |
| **DCA Bots** | 5 | 20 | 1000 |
| **Signal Bots** | No | 20 | 1000 |
| **Grid Bots** | 2 | 10 | 1000 |
| **API Access** | Read-only | Read-only | Read & Write |

> **Note:** A **Free Plan** is available but is limited to portfolio tracking and does not support automated trading.

---

## 6. Security and Reliability
*   **Non-Custodial:** 3Commas does not hold user funds; all assets remain on the user's exchange.
*   **API Permissions:** Users are advised to disable "Withdrawal" permissions on their API keys for maximum security.
*   **Notifications:** Real-time alerts via Telegram, Email, and Mobile Push for all trade events.
