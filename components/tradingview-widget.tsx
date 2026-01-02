"use client"

import { useEffect, useRef, memo } from 'react'
import { useTheme } from 'next-themes'

interface TradingViewWidgetProps {
    symbol?: string
    height?: string
}

function TradingViewWidgetComponent({ symbol = "BINANCE:BTCUSDT", height = "500px" }: TradingViewWidgetProps) {
    const container = useRef<HTMLDivElement>(null)
    const { theme } = useTheme()

    useEffect(() => {
        if (!container.current) return

        // Clear previous widget
        container.current.innerHTML = ''

        const script = document.createElement("script")
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"
        script.type = "text/javascript"
        script.async = true
        script.innerHTML = JSON.stringify({
            allow_symbol_change: true,
            calendar: false,
            details: false,
            hide_side_toolbar: true,
            hide_top_toolbar: false,
            hide_legend: false,
            hide_volume: false,
            hotlist: false,
            interval: "D",
            locale: "en",
            save_image: true,
            style: "1",
            symbol: symbol,
            theme: theme === 'dark' ? 'dark' : 'light',
            timezone: "Etc/UTC",
            backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0)' : 'rgba(255, 255, 255, 0)',
            gridColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(46, 46, 46, 0.06)',
            watchlist: [],
            withdateranges: false,
            compareSymbols: [],
            studies: [],
            autosize: true
        })

        const widgetContainer = document.createElement('div')
        widgetContainer.className = 'tradingview-widget-container'
        widgetContainer.style.height = '100%'
        widgetContainer.style.width = '100%'

        const widgetInner = document.createElement('div')
        widgetInner.className = 'tradingview-widget-container__widget'
        widgetInner.style.height = '100%'
        widgetInner.style.width = '100%'

        widgetContainer.appendChild(widgetInner)
        widgetContainer.appendChild(script)
        container.current.appendChild(widgetContainer)

        return () => {
            if (container.current) {
                container.current.innerHTML = ''
            }
        }
    }, [symbol, theme])

    return (
        <div ref={container} style={{ height, width: '100%' }} />
    )
}

export const TradingViewWidget = memo(TradingViewWidgetComponent)
