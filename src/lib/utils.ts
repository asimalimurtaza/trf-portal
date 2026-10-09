import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency in Pakistani Rupees (PKR)
 * e.g. 1400 => "PKR 1,400"
 */
export function formatPKR(amount: number, includePrefix = true): string {
  const formatted = new Intl.NumberFormat('en-PK', {
    maximumFractionDigits: 0,
  }).format(Math.round(amount || 0));

  return includePrefix ? `PKR ${formatted}` : formatted;
}

/**
 * Format short date (e.g., Oct 12, 2026)
 */
export function formatDate(dateString?: string): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Calculate days remaining until next birthday
 * Takes optional referenceDate to prevent prerender hydration/dynamic clock errors during Next.js builds
 */
export function getBirthdayCountdown(birthDateString: string, referenceDate?: Date): {
  daysLeft: number;
  nextBirthdayDate: Date;
  isToday: boolean;
} {
  // Use provided reference date or fallback to static build date
  const today = referenceDate ? new Date(referenceDate) : new Date(2026, 9, 9);
  today.setHours(0, 0, 0, 0);

  // birthDate can be "YYYY-MM-DD" or "MM-DD"
  const parts = birthDateString.split('-');
  let month = 0;
  let day = 1;

  if (parts.length === 3) {
    month = parseInt(parts[1], 10) - 1;
    day = parseInt(parts[2], 10);
  } else if (parts.length === 2) {
    month = parseInt(parts[0], 10) - 1;
    day = parseInt(parts[1], 10);
  }

  const currentYear = today.getFullYear();
  let nextBday = new Date(currentYear, month, day);

  if (nextBday < today) {
    nextBday = new Date(currentYear + 1, month, day);
  }

  const diffTime = nextBday.getTime() - today.getTime();
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const isToday = daysLeft === 0;

  return { daysLeft, nextBirthdayDate: nextBday, isToday };
}

/**
 * Export data array to CSV file download
 */
export function exportToCSV(filename: string, rows: Record<string, unknown>[]) {
  if (!rows || !rows.length) return;
  const separator = ',';
  const keys = Object.keys(rows[0]);
  
  const csvContent =
    keys.join(separator) +
    '\n' +
    rows
      .map((row) => {
        return keys
          .map((k) => {
            const raw = row[k];
            let cellStr = raw === null || raw === undefined ? '' : raw instanceof Date ? raw.toLocaleString() : String(raw);
            cellStr = cellStr.replace(/"/g, '""');
            if (cellStr.search(/("|,|\n)/g) >= 0) {
              cellStr = `"${cellStr}"`;
            }
            return cellStr;
          })
          .join(separator);
      })
      .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
