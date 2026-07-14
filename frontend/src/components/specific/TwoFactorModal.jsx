import React, { useState } from 'react';
import apiClient from '../../utils/apiClient';
import Button from '../common/Button';
import Input from '../common/Input';

const TwoFactorModal = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState('INIT'); 
  const [qrCode, setQrCode] = useState(null);
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleInit2FA = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.post('/auth/2fa/generate');
      setQrCode(res.data.qrCodeUrl); 
      setStep('VERIFY');
    } catch (err) {
      alert('Failed to initialize 2FA. Ensure backend server is reachable.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await apiClient.post('/auth/2fa/verify', { token });
      alert('2FA successfully enabled! Your account is now secured.');
      onSuccess();
      onClose();
    } catch (err) {
      alert('Invalid code. Please ensure your authenticator app is synced.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl border border-gray-100 flex flex-col gap-6">
        
        <div className="text-center">
          <h2 className="text-xl font-black text-premium-dark">Secure Your Account</h2>
          <p className="text-xs text-gray-500 mt-2">Add an extra layer of protection to your escrow funds and project access.</p>
        </div>

        {step === 'INIT' ? (
          <div className="flex flex-col gap-4">
            <Button variant="primary" size="md" onClick={handleInit2FA} disabled={isLoading}>
              {isLoading ? 'Generating QR...' : 'Enable 2FA Protection'}
            </Button>
            <Button variant="outline" size="md" onClick={onClose}>Cancel</Button>
          </div>
        ) : (
          <form onSubmit={handleVerify2FA} className="flex flex-col gap-4">
            <div className="p-4 bg-gray-50 rounded-2xl flex justify-center">
              <img src={qrCode} alt="2FA QR Code" className="w-40 h-40" />
            </div>
            <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest">
              Scan with Google Authenticator
            </p>
            <Input
              label="Enter 6-digit code"
              placeholder="000000"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
            />
            <Button type="submit" variant="primary" size="md" disabled={isLoading}>
              {isLoading ? 'Verifying...' : 'Verify & Enable'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default TwoFactorModal;