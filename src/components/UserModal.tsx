import { useState, useEffect, memo } from "react"
import type { User } from "@/utils/generateUsers"

interface UserModalProps {
  user: User
  onClose: () => void
  onUpdate: (user: User) => void
}

// simulates API call with random failure
const simulateApiUpdate = (user: User): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 30% chance of failure to test rollback
      if (Math.random() < 0.3) {
        reject(new Error("Failed to update user. Please try again."))
      } else {
        resolve(user)
      }
    }, 1000)
  })
}

const UserModal = memo(({ user, onClose, onUpdate }: UserModalProps) => {
  const [editedUser, setEditedUser] = useState<User>(user)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // reset state when user changes
  useEffect(() => {
    setEditedUser(user)
    setError(null)
    setSuccess(false)
  }, [user])

  const handleChange = (field: keyof User, value: string | number) => {
    setEditedUser(prev => ({
      ...prev,
      [field]: value,
    }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    // store original user for rollback
    const originalUser = user

    try {
      // optimistic update - update UI immediately
      onUpdate(editedUser)

      // simulate API call
      await simulateApiUpdate(editedUser)

      // sucess
      setSuccess(true)
      
      // close modal after short delay
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (err) {
      // rollback on failure
      onUpdate(originalUser)
      setEditedUser(originalUser)
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>

      {/* overlay */}
      <div onClick={onClose} className="fixed w-screen h-screen top-0 left-0 bg-black/25 z-[99]"></div>

      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[999] bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">User Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* ID (read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User ID
            </label>
            <input
              type="text"
              value={editedUser.id}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={editedUser.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={editedUser.email}
              onChange={(e) => handleChange("email", e.target.value)}
              required
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Age */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Age <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={editedUser.age}
              onChange={(e) => handleChange("age", parseInt(e.target.value))}
              required
              min="18"
              max="100"
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role <span className="text-red-500">*</span>
            </label>
            <select
              value={editedUser.role}
              onChange={(e) => handleChange("role", e.target.value)}
              required
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-50 disabled:cursor-not-allowed"
            >
              <option value="admin">Admin</option>
              <option value="user">User</option>
              <option value="manager">Manager</option>
            </select>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Success message */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start gap-2">
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">User updated successfully!</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  <span>Saving...</span>
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  )
})

export default UserModal