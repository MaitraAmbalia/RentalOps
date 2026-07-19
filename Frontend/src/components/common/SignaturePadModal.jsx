import { useState, useRef, useEffect } from 'react';
import { X, CheckCircle, RefreshCw, FileText, Shield, PenTool, Upload, Image } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function SignaturePadModal({ isOpen, onClose, agreementData, onSignSuccess, readOnly = false }) {
  const { success, error: toastError, warning } = useToast();
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [signMode, setSignMode] = useState('DRAW'); // 'DRAW' | 'UPLOAD'
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [uploadedSignature, setUploadedSignature] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [acceptedCheckbox, setAcceptedCheckbox] = useState(false);

  useEffect(() => {
    if (isOpen && canvasRef.current && !readOnly && signMode === 'DRAW') {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
      ctx.scale(2, 2);
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#2563eb';
    }
  }, [isOpen, readOnly, signMode]);

  if (!isOpen || !agreementData) return null;

  // Mouse / Touch Event Handlers
  const startDrawing = (e) => {
    if (readOnly) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
    setHasSignature(true);
  };

  const draw = (e) => {
    if (!isDrawing || readOnly) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (readOnly) return;
    if (signMode === 'DRAW' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasSignature(false);
    } else {
      setUploadedSignature(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      warning('Please upload a valid image file (PNG, JPG, SVG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedSignature(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const isSignatureReady = signMode === 'DRAW' ? hasSignature : !!uploadedSignature;

  const handleSubmit = async () => {
    if (!readOnly && (!isSignatureReady || !acceptedCheckbox)) {
      warning('Please read terms, check acceptance, and provide your signature.');
      return;
    }

    setSubmitting(true);
    try {
      let dataUrl = '';
      if (signMode === 'DRAW') {
        dataUrl = canvasRef.current.toDataURL('image/png');
      } else {
        dataUrl = uploadedSignature;
      }
      await onSignSuccess(dataUrl);
    } catch (err) {
      console.error(err);
      toastError('Failed to save signature.');
    } finally {
      setSubmitting(false);
    }
  };

  const {
    orderNumber,
    vendorName,
    clientName,
    rentalPeriod,
    items = [],
    financialSummary = {},
    clauses = [],
    signatureDetails = {}
  } = agreementData;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 font-sans text-xs text-text-muted">
      <div className="bg-bg-card border border-border-main rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-border-main flex justify-between items-center bg-bg-main/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-primary/10 border border-primary/20 rounded-xl text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-black text-text-main text-base">Rental Agreement Contract</h2>
              <p className="text-[10px] text-text-muted">Order Ref: #{orderNumber} • {vendorName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-text-muted hover:text-text-main hover:bg-bg-main rounded-xl">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Dynamic Contract Document View */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 bg-bg-main/30">
          
          {/* Header Summary Card */}
          <div className="bg-bg-card p-4 rounded-2xl border border-border-main space-y-2">
            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <div>
                <span className="text-text-muted block text-[9px] uppercase font-bold">Lessee / Client</span>
                <strong className="text-text-main">{clientName}</strong>
              </div>
              <div>
                <span className="text-text-muted block text-[9px] uppercase font-bold">Rental Schedule</span>
                <strong className="text-text-main">{rentalPeriod}</strong>
              </div>
            </div>

            <div className="pt-2 border-t border-border-main flex justify-between items-center text-[11px]">
              <span className="text-text-muted font-semibold">Security Deposit Held:</span>
              <strong className="text-emerald-400 font-extrabold">₹{Number(financialSummary.securityDepositAmount || 0).toFixed(2)}</strong>
            </div>
          </div>

          {/* Rented Equipment Manifest */}
          <div className="space-y-2">
            <h3 className="font-extrabold text-text-main text-xs uppercase tracking-wider flex items-center space-x-1.5">
              <Shield className="h-4 w-4 text-primary" />
              <span>Rented Equipment Manifest</span>
            </h3>

            <div className="bg-bg-card rounded-xl border border-border-main overflow-hidden">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-bg-main text-text-muted uppercase text-[9px] font-bold border-b border-border-main">
                  <tr>
                    <th className="p-2.5">Item Name</th>
                    <th className="p-2.5 text-center">Qty</th>
                    <th className="p-2.5 text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-main">
                  {items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="p-2.5 font-bold text-text-main">{it.productName}</td>
                      <td className="p-2.5 text-center text-text-muted font-semibold">{it.quantity}</td>
                      <td className="p-2.5 text-right font-bold text-text-main">₹{Number(it.totalPrice || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Legal Terms & Clauses */}
          <div className="space-y-3 pt-2">
            <h3 className="font-extrabold text-text-main text-xs uppercase tracking-wider">Standard Legal Terms</h3>
            <div className="space-y-3 text-[11px] text-text-muted leading-relaxed">
              {clauses.map((c, idx) => (
                <div key={idx} className="bg-bg-card p-3 rounded-xl border border-border-main space-y-1">
                  <h4 className="font-bold text-text-main text-xs">{c.title}</h4>
                  <p>{c.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* E-Signature Verification Box */}
          <div className="space-y-3 pt-3 border-t border-border-main">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-text-main text-xs uppercase tracking-wider flex items-center space-x-1.5">
                <PenTool className="h-4 w-4 text-primary" />
                <span>E-Signature Verification</span>
              </h3>
              {!readOnly && isSignatureReady && (
                <button onClick={clearCanvas} className="text-rose-400 hover:underline flex items-center space-x-1 text-[10px]">
                  <RefreshCw className="h-3 w-3" />
                  <span>Clear Signature</span>
                </button>
              )}
            </div>

            {readOnly || signatureDetails.signatureData ? (
              <div className="bg-bg-card p-4 rounded-2xl border border-border-main text-center space-y-2">
                <p className="text-[10px] text-text-muted font-semibold uppercase">Digitally Authenticated Signature</p>
                <div className="h-24 bg-white rounded-xl p-2 flex items-center justify-center border border-border-main">
                  <img src={signatureDetails.signatureData || agreementData.signatureData} alt="Client Signature" className="max-h-full object-contain" />
                </div>
                <div className="text-[9px] text-text-muted flex justify-around pt-1">
                  <span>Signed Date: {new Date(signatureDetails.signedAt || Date.now()).toLocaleString()}</span>
                  <span>Audit IP: {signatureDetails.signedIp || 'Authenticated Session'}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">

                {/* Tab Switcher: Draw vs Upload */}
                <div className="flex border-b border-border-main space-x-4">
                  <button
                    type="button"
                    onClick={() => setSignMode('DRAW')}
                    className={`pb-2 text-xs font-bold flex items-center space-x-1.5 transition-colors border-b-2 ${
                      signMode === 'DRAW'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-text-muted hover:text-text-main'
                    }`}
                  >
                    <PenTool className="h-3.5 w-3.5" />
                    <span>Draw Signature</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSignMode('UPLOAD')}
                    className={`pb-2 text-xs font-bold flex items-center space-x-1.5 transition-colors border-b-2 ${
                      signMode === 'UPLOAD'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-text-muted hover:text-text-main'
                    }`}
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>Upload Image File</span>
                  </button>
                </div>

                {signMode === 'DRAW' ? (
                  <div className="relative bg-bg-card border-2 border-dashed border-primary/40 rounded-2xl overflow-hidden shadow-inner cursor-crosshair">
                    <canvas
                      ref={canvasRef}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="w-full h-32 touch-none block"
                    />
                    {!hasSignature && (
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-text-muted/40 font-bold text-xs uppercase tracking-widest">
                        Draw E-Signature Here
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-bg-card border-2 border-dashed border-primary/40 rounded-2xl p-4 text-center space-y-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    {uploadedSignature ? (
                      <div className="space-y-2">
                        <div className="h-28 bg-white rounded-xl p-2 flex items-center justify-center border border-border-main mx-auto max-w-sm">
                          <img src={uploadedSignature} alt="Uploaded Signature" className="max-h-full object-contain" />
                        </div>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-xs text-primary font-bold hover:underline"
                        >
                          Change Image File
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="py-6 cursor-pointer space-y-2 hover:bg-bg-main/50 rounded-xl transition-colors"
                      >
                        <Image className="h-8 w-8 text-primary/60 mx-auto" />
                        <div>
                          <span className="font-extrabold text-text-main block text-xs">Click to Upload Signature Image</span>
                          <span className="text-[10px] text-text-muted">Supports PNG, JPG, SVG image formats</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <label className="flex items-start space-x-2.5 cursor-pointer bg-bg-card p-3 rounded-xl border border-border-main">
                  <input
                    type="checkbox"
                    checked={acceptedCheckbox}
                    onChange={(e) => setAcceptedCheckbox(e.target.checked)}
                    className="rounded bg-bg-main border-border-main text-primary w-4 h-4 mt-0.5"
                  />
                  <span className="text-[11px] text-text-main font-semibold leading-snug">
                    I confirm that I am {clientName}, and I accept all dynamic rental terms, return dates, and security deposit deductions as detailed in this binding agreement.
                  </span>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-border-main bg-bg-main/50 flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-bg-card hover:bg-bg-main text-text-main font-bold text-xs border border-border-main">
            {readOnly ? 'Close View' : 'Cancel'}
          </button>
          {!readOnly && (
            <button
              onClick={handleSubmit}
              disabled={submitting || !isSignatureReady || !acceptedCheckbox}
              className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-primary/20 flex items-center space-x-2 disabled:opacity-50"
            >
              {submitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              <span>Submit & Bind Agreement</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
