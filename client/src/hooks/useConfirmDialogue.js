import { useState } from "react";

export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [resolver, setResolver] = useState(null);

  const confirm = (msg) =>
    new Promise((resolve) => {
      setMessage(msg);
      setResolver(() => resolve);
      setIsOpen(true);
    });

  const handleConfirm = (choice) => {
    setIsOpen(false);
    if (resolver) resolver(choice);
  };

  const ConfirmDialog = () =>
    isOpen ? (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm animate-fadeIn">
          <h2 className="text-lg font-semibold mb-2 text-gray-900">Confirm</h2>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => handleConfirm(false)}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800 transition"
            >
              Cancel
            </button>
            <button
              onClick={() => handleConfirm(true)}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    ) : null;

  return { confirm, ConfirmDialog };
}
