import React, { useState } from 'react';
import { Lock, Delete, X } from 'lucide-react';
import { StaffUser } from '@coffee-pos/shared-types';
import { loginWithPin } from '../services/api';

interface PinLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: StaffUser) => void;
}

export const PinLoginModal: React.FC<PinLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleKeyPress = async (val: string) => {
    if (pin.length < 6) {
      const nextPin = pin + val;
      setPin(nextPin);
      setError(null);

      // Auto submit on 4 digits
      if (nextPin.length === 4) {
        submitPin(nextPin);
      }
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError(null);
  };

  const handleClear = () => {
    setPin('');
    setError(null);
  };

  const submitPin = async (inputPin: string) => {
    setLoading(true);
    setError(null);
    try {
      const user = await loginWithPin(inputPin);
      onLoginSuccess(user);
      setPin('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'PIN Kasir salah');
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#241C16]/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#EAE2D3] border border-[#D5CBB8] rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden p-6 animate-in fade-in zoom-in duration-150">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 bg-[#241C16] rounded-full text-[#8ABFF8]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-[#241C16]">Otorisasi <span className="italic font-normal">PIN Kasir</span></h2>
              <p className="text-xs text-[#6E6258]">Masukkan 4 digit PIN staff</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[#E0D6C5] text-[#6E6258]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PIN Indicators */}
        <div className="flex justify-center items-center space-x-3 my-4">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
                pin.length > idx
                  ? 'bg-[#8ABFF8] border-[#241C16] scale-110'
                  : 'bg-[#F7F3EB] border-[#D5CBB8]'
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-center text-xs font-bold text-red-700 mb-2">
            {error}
          </p>
        )}

        {/* Quick Hint */}
        <div className="text-[11px] text-center text-[#241C16] mb-3 bg-[#F7F3EB] border border-[#D5CBB8] py-1.5 rounded-full">
          Default PIN: Kasir (<b>1234</b>) • Barista (<b>2345</b>) • Mgr (<b>8888</b>) • Owner (<b>9999</b>)
        </div>

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2.5">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num)}
              disabled={loading}
              className="h-14 rounded-2xl bg-[#F7F3EB] border border-[#D5CBB8] shadow-sm text-xl font-bold text-[#241C16] hover:bg-[#E0D6C5] active:bg-[#8ABFF8] active:text-[#241C16] transition flex items-center justify-center"
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleClear}
            className="h-14 rounded-2xl bg-[#E0D6C5] border border-[#D5CBB8] text-xs font-bold text-[#241C16] hover:bg-[#D5CBB8] transition"
          >
            HAPUS
          </button>
          <button
            onClick={() => handleKeyPress('0')}
            disabled={loading}
            className="h-14 rounded-2xl bg-[#F7F3EB] border border-[#D5CBB8] shadow-sm text-xl font-bold text-[#241C16] hover:bg-[#E0D6C5] active:bg-[#8ABFF8] active:text-[#241C16] transition flex items-center justify-center"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="h-14 rounded-2xl bg-[#E0D6C5] border border-[#D5CBB8] text-[#241C16] hover:bg-[#D5CBB8] transition flex items-center justify-center"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

