import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirmar Acción',
    message = '¿Estás seguro de que deseas realizar esta acción?',
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed z-50 inset-0 overflow-y-auto bg-black bg-opacity-60 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 shadow-xl w-full max-w-md mx-auto my-4 sm:p-8">
                <div className="flex justify-center mb-4">
                    <FaExclamationTriangle className="text-red-600" size={40} />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center">{title}</h2>
                <p className="text-gray-600 mb-6 text-center">{message}</p>
                <div className="flex justify-center sm:justify-end space-x-4">
                    <button
                        type="button"
                        className="px-4 py-2 sm:px-6 sm:py-3 bg-gray-300 rounded-md hover:bg-gray-400 transition-colors"
                        onClick={onClose}
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        className="px-4 py-2 sm:px-6 sm:py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;