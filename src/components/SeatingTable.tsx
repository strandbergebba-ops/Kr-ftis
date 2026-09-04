import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import type { Person, Table } from '../types'
import { getRectangleSeatPositions } from '../utils/seatLayout'
import { Seat } from './Seat'

interface SeatingTableProps {
  table: Table
  getPersonAtSeat: (seatIndex: number) => Person | null
  onAssignSeat: (seatIndex: number, personId: string | null) => void
  selectedPersonId: string | null
  onSelectPerson: (id: string | null) => void
}

const TABLE_WIDTH = 420
const TABLE_HEIGHT = 180
const SEAT_OFFSET = 62

export function SeatingTable({
  table,
  getPersonAtSeat,
  onAssignSeat,
  selectedPersonId,
  onSelectPerson,
}: SeatingTableProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [fitZoom, setFitZoom] = useState(1)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const isDragging = useRef(false)
  const hasInteracted = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })

  const seatPositions = getRectangleSeatPositions(TABLE_WIDTH, TABLE_HEIGHT, SEAT_OFFSET)
  const canvasWidth = TABLE_WIDTH + SEAT_OFFSET * 2 + 120
  const canvasHeight = TABLE_HEIGHT + SEAT_OFFSET * 2 + 120

  const minZoom = Math.min(0.6, fitZoom)
  const maxZoom = 2.5

  useLayoutEffect(() => {
    const el = canvasRef.current
    if (!el) return

    const recomputeFit = () => {
      const { width, height } = el.getBoundingClientRect()
      const nextFit = Math.min(1, (width - 24) / canvasWidth, (height - 24) / canvasHeight)
      setFitZoom(nextFit)
      if (!hasInteracted.current) setZoom(nextFit)
    }

    recomputeFit()
    const observer = new ResizeObserver(recomputeFit)
    observer.observe(el)
    return () => observer.disconnect()
  }, [canvasWidth, canvasHeight])

  const handleZoomIn = () => {
    hasInteracted.current = true
    setZoom((z) => Math.min(maxZoom, z + 0.2))
  }
  const handleZoomOut = () => {
    hasInteracted.current = true
    setZoom((z) => Math.max(minZoom, z - 0.2))
  }
  const handleReset = () => {
    hasInteracted.current = false
    setZoom(fitZoom)
    setPan({ x: 0, y: 0 })
  }

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault()
      hasInteracted.current = true
      const delta = e.deltaY > 0 ? -0.08 : 0.08
      setZoom((z) => Math.min(maxZoom, Math.max(minZoom, z + delta)))
    },
    [minZoom, maxZoom],
  )

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true
    lastPos.current = { x: e.clientX, y: e.clientY }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return
    const dx = e.clientX - lastPos.current.x
    const dy = e.clientY - lastPos.current.y
    lastPos.current = { x: e.clientX, y: e.clientY }
    setPan((p) => ({ x: p.x + dx, y: p.y + dy }))
  }

  const handlePointerUp = () => {
    isDragging.current = false
  }

  const handleSeatClick = (seatIndex: number) => {
    if (selectedPersonId) {
      onAssignSeat(seatIndex, selectedPersonId)
      onSelectPerson(null)
    } else {
      const person = getPersonAtSeat(seatIndex)
      if (person) onAssignSeat(seatIndex, null)
    }
  }

  return (
    <div className="relative bg-surface rounded-lg border border-border flex-1 flex flex-col h-full min-h-[480px] overflow-hidden">
      <div
        ref={canvasRef}
        className="flex-1 overflow-hidden relative touch-none"
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{ cursor: zoom > 1 ? 'grab' : 'default' }}
      >
        <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1 bg-surface border border-border rounded-md p-1 shadow-lg">
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoom <= minZoom}
            className="w-8 h-8 rounded flex items-center justify-center text-neutral-400 hover:text-white hover:bg-surface-light disabled:opacity-30 transition-colors"
            title="Zooma ut"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <span className="text-xs font-mono text-neutral-500 w-9 text-center tabular-nums">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoom >= maxZoom}
            className="w-8 h-8 rounded flex items-center justify-center text-neutral-400 hover:text-white hover:bg-surface-light disabled:opacity-30 transition-colors"
            title="Zooma in"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <div className="w-px h-4 bg-border mx-0.5" />
          <button
            type="button"
            onClick={handleReset}
            className="px-2 h-8 rounded text-xs uppercase tracking-wide text-neutral-400 hover:text-white hover:bg-surface-light transition-colors"
          >
            Reset
          </button>
        </div>

        <div
          className="absolute inset-0 pointer-events-none opacity-[0.035]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isDragging.current ? 'none' : 'transform 80ms ease-out',
          }}
        >
          <div className="relative" style={{ width: canvasWidth, height: canvasHeight }}>
            {/* Rectangular long table */}
            <div
              className="absolute rounded-md bg-[#181818] border border-[#2f2f2f]"
              style={{
                width: TABLE_WIDTH,
                height: TABLE_HEIGHT,
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            >
              {/* Brand accent rule */}
              <div className="absolute top-0 left-4 right-4 h-[2px] bg-crayfish rounded-full" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                <span className="text-xl">🦞</span>
                <span className="text-neutral-300 font-medium text-sm uppercase tracking-wide">
                  {table.name}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-600">
                  {seatPositions.length} platser
                </span>
              </div>
            </div>

            {seatPositions.map((pos, i) => (
              <Seat
                key={i}
                seatIndex={i}
                person={getPersonAtSeat(i)}
                x={pos.x}
                y={pos.y}
                zoom={zoom}
                selectedPersonId={selectedPersonId}
                onSeatClick={handleSeatClick}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 py-2 border-t border-border text-center text-[11px] font-mono uppercase tracking-wider text-neutral-600">
        {selectedPersonId
          ? 'Klicka på en ledig plats för att placera gästen'
          : 'Scrolla för att zooma · Dra för att panorera · Klicka på gäst för att ta bort plats'}
      </div>
    </div>
  )
}
