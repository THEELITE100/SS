import React, { useState } from 'react';
import apiClient from '../../utils/apiClient';
import Button from '../common/Button';

const DisputeModal = ({ isOpen, onClose, gigId, paymentId, onSuccess }) => {

  const [reason, setReason] = useState('POOR_QUALITY');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await apiClient.post('/disputes', {
        gigId,
        paymentId,
        reason,
        description,
      });
      setIsSubmitting(false);
      onSuccess();
      onClose();
    } catch (err) {
      setIsSubmitting(false);
      setError(err.response?.data?.message || 'Failed to file dispute.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-gray-100">
        
        <div className="flex items-start justify-between border-b border-gray-100 pb-4 mb-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-red-600">
              Emergency Mediation
            </span>
            <h2 className="text-xl font-extrabold text-premium-dark mt-0.5">
              Freeze Escrow & File Dispute
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-100">✕</button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-premium-muted">
              Primary Dispute Reason
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-gray-200 text-sm font-medium text-premium-dark outline-none focus:border-red-500"
            >
              <option value="POOR_QUALITY">Substandard Deliverable Quality</option>
              <option value="MISSED_DEADLINE">Severe Deadline Breach</option>
              <option value="UNRESPONSIVE">Freelancer / Client Unresponsive</option>
              <option value="SCOPE_CREEP">Unfair Scope Creep Demands</option>
              <option value="PAYMENT_ISSUE">Escrow Release Refusal</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-premium-muted">
              Incident Statement <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              placeholder="Provide exact dates, missing requirements, or breach details. Escrow funds will be frozen immediately upon submission..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-4 rounded-xl border border-gray-200 text-sm outline-none focus:border-red-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="outline" size="md" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary" size="md" disabled={isSubmitting} className="!bg-red-600 hover:!bg-red-700">
              {isSubmitting ? 'Freezing Funds...' : 'Initiate Dispute Freeze'}
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default DisputeModal;