import React from 'react';
import { Clock } from 'lucide-react';
import styles from './HoursDisplay.module.css';

const DAYS = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday'
];

const DAY_LABELS = {
  sunday: 'Sun',
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat'
};

export default function HoursDisplay({ hours, compact = false }) {
  // Parse hours if it's a string
  let hoursObj = {};
  if (typeof hours === 'string') {
    try {
      hoursObj = JSON.parse(hours);
    } catch {
      // If it's a simple string like "Mon-Fri: 9-5", just display it
      return <span className={styles.simple}>{hours}</span>;
    }
  } else if (typeof hours === 'object' && hours !== null) {
    hoursObj = hours;
  } else {
    return <span className={styles.notSet}>Hours not set</span>;
  }

  // Group consecutive days with same hours
  const groupedHours = [];
  let currentGroup = null;

  DAYS.forEach((day, index) => {
    const dayHours = hoursObj[day] || 'Not set';

    if (currentGroup && currentGroup.hours === dayHours) {
      // Extend current group
      currentGroup.endDay = day;
    } else {
      // Start new group
      if (currentGroup) {
        groupedHours.push(currentGroup);
      }
      currentGroup = {
        startDay: day,
        endDay: day,
        hours: dayHours
      };
    }
  });

  // Push last group
  if (currentGroup) {
    groupedHours.push(currentGroup);
  }

  const formatDayRange = (startDay, endDay) => {
    if (startDay === endDay) {
      return DAY_LABELS[startDay];
    }
    return `${DAY_LABELS[startDay]}-${DAY_LABELS[endDay]}`;
  };

  if (compact) {
    // Compact view for cards
    return (
      <div className={styles.compact}>
        {groupedHours.map((group, index) => (
          <div key={index} className={styles.compactRow}>
            <span className={styles.compactDays}>
              {formatDayRange(group.startDay, group.endDay)}:
            </span>
            <span className={styles.compactHours}>{group.hours}</span>
          </div>
        ))}
      </div>
    );
  }

  // Full view for detail modal
  return (
    <div className={styles.full}>
      <div className={styles.header}>
        <Clock size={16} />
        <span>Hours</span>
      </div>
      <div className={styles.hoursGrid}>
        {groupedHours.map((group, index) => (
          <div key={index} className={styles.hourRow}>
            <span className={styles.days}>
              {formatDayRange(group.startDay, group.endDay)}
            </span>
            <span className={styles.hours}>{group.hours}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
