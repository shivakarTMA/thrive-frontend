import React from 'react'

const AlreadyExistLead = ({ user, onClose}) => {

    if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999]">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 className="text-xl font-semibold mb-4">User Already Exists</h2>
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Contact:</strong> {user.contact}</p>
        <p><strong>Company:</strong> {user.company}</p>
        <div className="mt-6 text-right">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default AlreadyExistLead