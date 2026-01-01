import React from "react";
import { ChevronLeft, ChevronRight, Save, Download } from 'lucide-react';

const ReportLayout = ({
  title,
  children,
  onNext,
  onPrev,
  prevStepTitle,
  nextStepTitle,
  isFirst,
  isLast,
  onFinish,
  loading,
  error,
}) => {
  const handleNext = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    onNext();
  };

  const handlePrev = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    onPrev();
  };

  return (
    <div className="report-layout">
      <div className="step-preview-bar">
        {!isFirst && prevStepTitle && (
          <button className="step-preview prev-step" onClick={handlePrev}>
            <ChevronLeft size={18} />
            <span>
              <span className="step-label">Prev: </span>
              {prevStepTitle}
            </span>
          </button>
        )}
        
        <span className="current-step-title">{title}</span>
        
        {!isLast && nextStepTitle && (
          <button className="step-preview next-step" onClick={handleNext}>
            <span>
              <span className="step-label">Next: </span>
              {nextStepTitle}
            </span>
            <ChevronRight size={18} />
          </button>
        )}
      </div>

      <div >
        {error && <p className="error-msg">{error}</p>}
        {children}
      </div>

      <div className="bottom-nav">
        {!isFirst && (
          <button className="back-btn" onClick={handlePrev}>
            <ChevronLeft size={18} />
            Back
          </button>
        )}
        <button
          className="save-continue-btn"
          onClick={isLast ? onFinish : handleNext}
          disabled={isLast && loading}
        >
          {isLast ? (
            loading ? (
              <>Generating Document...</>
            ) : (
              <>
                <Download size={18} />
                Generate & Download
              </>
            )
          ) : (
            <>
              Save & Continue
              <ChevronRight size={18} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ReportLayout;