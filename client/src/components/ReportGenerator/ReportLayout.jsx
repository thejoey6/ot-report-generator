import React from "react";

const ReportPageLayout = ({
  title,
  children,
  onNext,
  onPrev,
  prevStepTitle,
  nextStepTitle,
  isFirst,
  isLast,
}) => {
  return (
    <div className="report-layout">

      <div className="step-preview-bar">
        {!isFirst && prevStepTitle && (
          <button className="step-preview prev-step" onClick={onPrev}>
            <span className="step-label">Prev:</span> {prevStepTitle}
          </button>
        )}
        <span className="current-step-title">{title}</span>
        {!isLast && nextStepTitle && (
          <button className="step-preview next-step" onClick={onNext}>
            <span className="step-label">Next:</span> {nextStepTitle}
          </button>
        )}
      </div>

      <div className="report-content">{children}</div>

      <div className="bottom-nav">
        {!isFirst && (
          <button className="back-btn" onClick={onPrev}>
            Back
          </button>
        )}
        <button
          className="save-continue-btn"
          onClick={onNext}
          disabled={isLast}
        >
          {isLast ? "Finish" : "Save and Continue"}
        </button>
      </div>
    </div>
  );
};

export default ReportPageLayout;

