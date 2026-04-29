import { useState, useRef } from "react";
import { Upload, FileCheck, Loader2, ArrowRight, ArrowLeft, Tag, Smartphone, CheckCircle2, Hash, ImageUp, XCircle, Info } from "lucide-react";

interface StepTwoProps {
  promoApplied: boolean;
  studentName: string;
  onBack: () => void;
  onSubmit: (transactionId: string, screenshotFile: File) => void;
  isSubmitting: boolean;
  direction: "forward" | "backward";
}

const StepTwo = ({
  promoApplied,
  studentName,
  onBack,
  onSubmit,
  isSubmitting,
  direction,
}: StepTwoProps) => {
  const [transactionId, setTransactionId] = useState("");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [screenshotError, setScreenshotError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canSubmit = transactionId.trim().length >= 4 && screenshotFile !== null;

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setScreenshotError("");
    if (!file) return;

    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setScreenshotError("Please upload a JPG, PNG, or WebP image.");
      e.target.value = "";
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setScreenshotError("Screenshot must be under 10 MB.");
      e.target.value = "";
      return;
    }

    setScreenshotFile(file);
    const reader = new FileReader();
    reader.onload = () => setScreenshotPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeScreenshot = () => {
    setScreenshotFile(null);
    setScreenshotPreview(null);
    setScreenshotError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = () => {
    if (!canSubmit || !screenshotFile) return;
    onSubmit(transactionId.trim(), screenshotFile);
  };

  return (
    <div className={direction === "forward" ? "animate-slide-left" : "animate-slide-right"}>
      <h2 className="text-lg font-semibold text-foreground mb-1">Payment</h2>
      <p className="text-xs text-muted-foreground mb-6">
        Scan the QR code, complete payment, then upload your payment screenshot below
      </p>

      <div className="space-y-5">
        {/* Promo banner */}
        {promoApplied && (
          <div className="opacity-0 animate-fade-up stagger-1 flex items-center gap-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-300 rounded-xl px-4 py-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
              <Tag className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-800">Promo Code Applied! 🎉</p>
              <p className="text-xs text-blue-700">You're getting a discounted registration price.</p>
            </div>
          </div>
        )}

        {/* QR Code card */}
        <div className="opacity-0 animate-fade-up stagger-2">
          <div className={`rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
            promoApplied
              ? "border-blue-400 shadow-[0_0_30px_rgba(37,99,235,0.2)]"
              : "border-border shadow-lg"
          }`}>
            {/* Card header */}
            <div className={`px-6 py-4 text-center ${
              promoApplied
                ? "bg-gradient-to-r from-blue-600 to-purple-600"
                : "bg-gradient-to-r from-slate-800 to-blue-900"
            }`}>
              <p className="text-xs font-bold uppercase tracking-widest text-white/80 mb-0.5">
                {promoApplied ? "✦ Promo Applied ✦" : "Standard Registration"}
              </p>
              <div className="flex items-center justify-center gap-2 mt-1">
                {promoApplied ? (
                  <>
                    <span className="text-white/60 line-through text-sm font-medium">₹599</span>
                    <span className="text-white text-xl font-bold">₹299</span>
                  </>
                ) : (
                  <span className="text-white text-xl font-bold">₹599</span>
                )}
              </div>
            </div>

            {/* QR Image */}
            <div className="bg-white p-6 flex flex-col items-center gap-4">
              <img
                src={promoApplied ? "/qr-discounted.png" : "/qr-regular.png"}
                alt={promoApplied ? "Scan to pay ₹299" : "Scan to pay ₹599"}
                className="w-56 h-56 object-contain rounded-xl border border-gray-100 shadow-sm p-2"
              />
              <div className="text-center w-full mt-2">
                <p className="text-sm font-medium text-gray-800">
                  Hi, <span className="text-primary font-semibold">{studentName || "Student"}</span>!
                </p>
                <p className="text-xs text-gray-500 mt-1 mb-5">
                  {promoApplied
                    ? "Scan with GPay/PhonePe/Paytm to pay ₹299"
                    : "Scan with GPay/PhonePe/Paytm to pay ₹599"}
                </p>
                
                {/* Mobile Pay Button */}
                <a
                  href={promoApplied 
                    ? "upi://pay?pa=8838571152@okbizaxis&pn=Storyseedsstudio&am=299&cu=INR"
                    : "upi://pay?pa=8838571152@okbizaxis&pn=Storyseedsstudio&am=599&cu=INR"
                  }
                  className="sm:hidden flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 active:scale-[0.98] transition-all"
                >
                  <Smartphone className="w-4 h-4" />
                  Tap to Pay via UPI App
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="opacity-0 animate-fade-up stagger-3 relative flex items-center py-1">
          <div className="flex-grow border-t border-border" />
          <span className="mx-3 text-xs text-muted-foreground font-medium bg-card px-2">
            After payment, fill in the details below
          </span>
          <div className="flex-grow border-t border-border" />
        </div>

        {/* ── Transaction ID ── */}
        <div className="opacity-0 animate-fade-up stagger-3">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
            Transaction / UTR ID <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
              <Hash className="w-4 h-4" />
            </div>
            <input
              type="text"
              id="transactionId"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="e.g. 4289100204812"
              maxLength={50}
              className="txn-input"
            />
          </div>
          <p className="text-[11px] text-muted-foreground mt-1 pl-1">
            Find this in your UPI app — the 12-digit UTR or transaction reference number
          </p>
        </div>

        {/* ── Screenshot Upload ── */}
        <div className="opacity-0 animate-fade-up stagger-4">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
            Payment Screenshot <span className="text-destructive">*</span>
          </label>

          {!screenshotFile ? (
            <label className="block cursor-pointer group">
              <div className="border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300
                border-border hover:border-accent hover:bg-accent/5">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3
                  group-hover:bg-accent/20 transition-colors duration-300">
                  <ImageUp className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
                </div>
                <p className="text-sm font-medium text-foreground">Upload Payment Screenshot</p>
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP · Max 10 MB</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleScreenshotChange}
                className="hidden"
              />
            </label>
          ) : (
            <div className="rounded-xl border border-border overflow-hidden">
              {/* Preview */}
              <div className="relative bg-muted/40">
                <img
                  src={screenshotPreview!}
                  alt="Payment screenshot preview"
                  className="w-full max-h-64 object-contain"
                />
                {/* Remove button */}
                <button
                  type="button"
                  onClick={removeScreenshot}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-destructive/90 flex items-center justify-center
                    text-white hover:bg-destructive transition-colors shadow-md"
                  title="Remove screenshot"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
              <div className="px-4 py-2.5 bg-success/5 border-t border-success/20 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                <p className="text-xs font-medium text-success">
                  {screenshotFile.name} · {(screenshotFile.size / 1024).toFixed(0)} KB
                </p>
              </div>
            </div>
          )}

          {screenshotError && (
            <p className="text-xs text-destructive mt-1.5 flex items-center gap-1">
              <XCircle className="w-3 h-3" /> {screenshotError}
            </p>
          )}
        </div>

        {/* Info notice */}
        <div className="opacity-0 animate-fade-up stagger-5 flex items-start gap-2.5 bg-muted/50 rounded-xl px-4 py-3">
          <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your transaction ID and screenshot will be verified by our team. 
            Registration is confirmed only after successful verification.
          </p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 mt-8 opacity-0 animate-fade-up stagger-5">
        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="btn-secondary-soft flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Confirm button — only active when both fields are filled */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          className={`btn-premium flex-1 flex items-center justify-center gap-2 transition-all duration-300 ${
            !canSubmit ? "opacity-40 cursor-not-allowed" : ""
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting…
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Confirm Registration
            </>
          )}
        </button>
      </div>

      {/* Helper text when button is disabled */}
      {!canSubmit && !isSubmitting && (
        <p className="text-center text-xs text-muted-foreground mt-3 opacity-0 animate-fade-up stagger-5">
          Please enter your Transaction ID and upload a payment screenshot to continue
        </p>
      )}
    </div>
  );
};

export default StepTwo;
