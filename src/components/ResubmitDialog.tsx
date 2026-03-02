interface ResubmitDialogProps {
    onConfirm: () => void;
    onCancel: () => void;
}

const ResubmitDialog = ({ onConfirm, onCancel }: ResubmitDialogProps) => {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-fade-up"
                role="dialog"
                aria-modal="true"
                aria-labelledby="resubmit-title"
            >
                {/* Top accent bar */}
                <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 to-red-700" />

                <div className="p-6">
                    {/* Icon */}
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 mx-auto mb-4">
                        <svg
                            className="w-6 h-6 text-amber-600"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2.2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                            <line x1="12" y1="9" x2="12" y2="13" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                    </div>

                    {/* Heading */}
                    <h2
                        id="resubmit-title"
                        className="text-center text-base font-semibold text-gray-800 mb-1"
                    >
                        Confirm Form Resubmission
                    </h2>

                    {/* Body */}
                    <p className="text-center text-sm text-gray-500 mb-6 leading-relaxed">
                        This page was the result of a previous form submission. Resubmitting
                        will register the same story again. Do you want to continue?
                    </p>

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium
                         text-gray-600 bg-white hover:bg-gray-50 transition-colors duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white
                         bg-gradient-to-r from-amber-500 to-red-700
                         hover:opacity-90 transition-opacity duration-200
                         shadow-md shadow-amber-500/30"
                        >
                            Resubmit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResubmitDialog;
