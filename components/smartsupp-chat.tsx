"use client"

import { useEffect } from "react"

declare global {
    interface Window {
        smartsupp: any
        _smartsupp: any
    }
}

export function SmartSuppChat() {
    useEffect(() => {
        // Initialize Smartsupp
        window._smartsupp = window._smartsupp || {}
        window._smartsupp.key = '8812cf4cfcb6332d972d2fbcaedabe418946d050'

        const initSmartsupp = (d: Document) => {
            const s = d.getElementsByTagName('script')[0]
            const c = d.createElement('script')
            c.type = 'text/javascript'
            c.charset = 'utf-8'
            c.async = true
            c.src = 'https://www.smartsuppchat.com/loader.js?'
            s.parentNode?.insertBefore(c, s)
        }

        // Only initialize once
        if (!window.smartsupp) {
            window.smartsupp = function () {
                window.smartsupp._.push(arguments)
            }
            window.smartsupp._ = []
            initSmartsupp(document)
        }
    }, [])

    return null
}
