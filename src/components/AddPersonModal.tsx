import { useRef, useState } from 'react'
import type { Person } from '../types'

interface AddPersonModalProps {
  open: boolean
  onClose: () => void
  onAdd: (name: string, photoUrl: string | null) => void
  editPerson?: Person | null
  onUpdate?: (id: string, name: string, photoUrl: string | null) => void
}

export function AddPersonModal({
  open,
  onClose,
  onAdd,
  editPerson,
  onUpdate,
}: AddPersonModalProps) {
  const nameRef = useRef<HTMLInputElement>(null)
  const photoRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(editPerson?.photoUrl ?? null)

  if (!open) return null

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPreviewUrl(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const name = nameRef.current?.value.trim()
    if (!name) return

    if (editPerson && onUpdate) {
      onUpdate(editPerson.id, name, previewUrl)
    } else {
      onAdd(name, previewUrl)
    }
    setPreviewUrl(null)
    onClose()
  }

  const displayPhoto = previewUrl ?? editPerson?.photoUrl

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-surface rounded-lg border border-border w-full max-w-md p-6">
        <h2 className="text-lg font-semibold text-white uppercase tracking-wide mb-4">
          {editPerson ? 'Redigera gäst' : 'Lägg till gäst'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center gap-3">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-surface-light border border-dashed border-border">
              {displayPhoto ? (
                <img src={displayPhoto} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-600 text-sm">
                  Bild
                </div>
              )}
            </div>
            <label className="cursor-pointer text-sm text-crayfish font-medium uppercase tracking-wide hover:underline">
              Ladda upp bild
              <input
                ref={photoRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </label>
          </div>
          <input
            ref={nameRef}
            type="text"
            placeholder="Namn"
            defaultValue={editPerson?.name ?? ''}
            className="w-full px-4 py-3 rounded-md bg-surface-light border border-border text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-crayfish/50 focus:border-crayfish/50"
            autoFocus
          />
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-md border border-border text-neutral-400 font-medium uppercase tracking-wide hover:bg-surface-light"
            >
              Avbryt
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-md bg-crayfish text-white font-medium uppercase tracking-wide hover:bg-crayfish-dark transition-colors"
            >
              {editPerson ? 'Spara' : 'Lägg till'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
