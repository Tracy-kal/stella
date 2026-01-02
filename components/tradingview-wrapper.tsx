"use client"

import { TradingViewWidget } from "./tradingview-widget"

export function TradingViewWidgetWrapper() {
    return (
        <div className="h-[500px] w-full">
            <TradingViewWidget symbol="BINANCE:BTCUSDT" height="500px" />
        </div>
    )
}
