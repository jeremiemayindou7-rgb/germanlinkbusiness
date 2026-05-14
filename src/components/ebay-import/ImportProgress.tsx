// ─── GermanLink Business – Import Progress Component ─────────────────────────

import { ImportStatus } from "./types";

interface ImportProgressProps {
  status: ImportStatus;
  progress: number;
}

const STEPS: { key: ImportStatus; label: string; icon: React.ReactNode }[] = [
  {
    key: "fetching",
    label: "eBay-Daten abrufen",
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
      </svg>
    ),
  },
  {
    key: "translating",
    label: "Übersetzen (DE · FR · LN)",
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="m10.5 21 5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 0 1-3.827-5.802" />
      </svg>
    ),
  },
  {
    key: "done",
    label: "Import abgeschlossen",
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
      </svg>
    ),
  },
];

function getStepState(stepKey: ImportStatus, currentStatus: ImportStatus) {
  const order: ImportStatus[] = ["idle", "fetching", "translating", "done"];
  const stepIdx = order.indexOf(stepKey);
  const currentIdx = order.indexOf(currentStatus);
  if (currentStatus === "error") return "error";
  if (currentIdx > stepIdx) return "done";
  if (currentIdx === stepIdx) return "active";
  return "pending";
}

export function ImportProgress({ status, progress }: ImportProgressProps) {
  if (status === "idle") return null;

  return (
    <div className="glb-progress">
      <div className="glb-progress__bar-wrap">
        <div
          className={`glb-progress__bar ${status === "done" ? "glb-progress__bar--done" : ""} ${status === "error" ? "glb-progress__bar--error" : ""}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="glb-progress__steps">
        {STEPS.map((step) => {
          const state = getStepState(step.key, status);
          return (
            <div
              key={step.key}
              className={`glb-progress__step glb-progress__step--${state}`}
            >
              <span className="glb-progress__step-icon">
                {state === "done" ? (
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                ) : state === "active" ? (
                  <span className="glb-progress__pulse" />
                ) : (
                  step.icon
                )}
              </span>
              <span className="glb-progress__step-label">{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
