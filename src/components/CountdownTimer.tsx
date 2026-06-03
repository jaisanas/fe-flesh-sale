import { memo, useEffect, useState } from 'react';

interface CountdownTimerProps {
  targetDate: string;
  label?: string;
  variant?: 'inline' | 'banner';
  tone?: 'red' | 'green';
}

interface Parts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

function computeParts(target: string): Parts {
  const total = Math.max(
    0,
    Math.floor((new Date(target).getTime() - Date.now()) / 1000)
  );
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
    total,
  };
}

function pad(value: number): string {
  return value.toString().padStart(2, '0');
}

function CountdownTimer({
  targetDate,
  label,
  variant = 'inline',
  tone = 'red',
}: CountdownTimerProps) {
  const [parts, setParts] = useState<Parts>(() => computeParts(targetDate));

  useEffect(() => {
    setParts(computeParts(targetDate));
    const id = window.setInterval(() => {
      setParts(computeParts(targetDate));
    }, 1000);
    return () => window.clearInterval(id);
  }, [targetDate]);

  if (parts.total <= 0) {
    return (
      <div className={`countdown countdown-${variant} tone-${tone}`}>
        {label && <span className="countdown-label">{label}</span>}
        <span className="countdown-ended">Ended</span>
      </div>
    );
  }

  return (
    <div
      className={`countdown countdown-${variant} tone-${tone}`}
      role="timer"
      aria-live="polite"
    >
      {label && <span className="countdown-label">{label}</span>}
      <div className="countdown-boxes">
        {parts.days > 0 && (
          <>
            <span className="countdown-box">{pad(parts.days)}</span>
            <span className="countdown-sep">:</span>
          </>
        )}
        <span className="countdown-box">{pad(parts.hours)}</span>
        <span className="countdown-sep">:</span>
        <span className="countdown-box">{pad(parts.minutes)}</span>
        <span className="countdown-sep">:</span>
        <span className="countdown-box">{pad(parts.seconds)}</span>
      </div>
    </div>
  );
}

export default memo(CountdownTimer);
