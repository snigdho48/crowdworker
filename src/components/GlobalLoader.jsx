import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  startGlobalLoading,
  stopGlobalLoading,
  subscribeGlobalLoading,
} from '../lib/loaderBus'

export function GlobalLoader() {
  const [visible, setVisible] = useState(false)
  const location = useLocation()
  const routeLoadingRef = useRef(false)

  useEffect(() => subscribeGlobalLoading(setVisible), [])

  useEffect(() => {
    routeLoadingRef.current = true
    startGlobalLoading()
    const timer = setTimeout(() => {
      if (routeLoadingRef.current) {
        routeLoadingRef.current = false
        stopGlobalLoading()
      }
    }, 320)

    return () => {
      clearTimeout(timer)
      if (routeLoadingRef.current) {
        routeLoadingRef.current = false
        stopGlobalLoading()
      }
    }
  }, [location.pathname])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          role="status"
          aria-live="polite"
          aria-label="Loading"
        >
          <motion.div
            className="flex min-w-52 items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/85 px-5 py-4 shadow-2xl"
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 8, opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <motion.span
              className="h-6 w-6 rounded-full border-2 border-indigo-300/25 border-t-indigo-300"
              animate={{ rotate: 360 }}
              transition={{
                duration: 0.85,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-100">
                Loading data
              </span>
              <span className="text-xs text-slate-400">
                Please wait a moment...
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

