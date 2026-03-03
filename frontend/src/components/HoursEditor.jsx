import React, { useState, useEffect } from 'react';
import { Edit2, Clock, Check, X } from 'lucide-react';
import styles from './HoursEditor.module.css';

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
  sunday: 'Sunday',
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday'
};

export default function HoursEditor({ value, onChange }) {
  const [hours, setHours] = useState({});
  const [showEditor, setShowEditor] = useState(false);
  const [editingDay, setEditingDay] = useState(null);
  const [tempFrom, setTempFrom] = useState('');
  const [tempTo, setTempTo] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    // Parse hours from string or object
    if (typeof value === 'string') {
      try {
        setHours(JSON.parse(value));
      } catch {
        setHours({});
      }
    } else if (typeof value === 'object' && value !== null) {
      setHours(value);
    } else {
      setHours({});
    }
  }, [value]);

  const parseTimeString = (timeStr) => {
    // Handle various formats: "9:00 AM - 5:00 PM", "09:00-17:00", "Closed", etc.
    if (!timeStr || timeStr === 'Closed' || timeStr === 'Open 24 hours') {
      return null;
    }

    // Try to extract time range
    const match = timeStr.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM|am|pm)?\s*[-–—]\s*(\d{1,2}):?(\d{2})?\s*(AM|PM|am|pm)?/i);
    if (match) {
      const fromTime = match[1] + (match[2] ? ':' + match[2] : ':00') + (match[3] ? ' ' + match[3].toUpperCase() : '');
      const toTime = match[4] + (match[5] ? ':' + match[5] : ':00') + (match[6] ? ' ' + match[6].toUpperCase() : '');
      return { from: fromTime, to: toTime };
    }

    return null;
  };

  const normalizeTimeInput = (input) => {
    if (!input) return '';

    // Remove extra spaces
    let cleaned = input.trim().toLowerCase();

    // Match various time patterns
    let match = cleaned.match(/^(\d{1,2}):?(\d{2})?\s*(am|pm)?$/);

    if (!match) {
      // Try 4-digit military time: 0900, 1730
      match = cleaned.match(/^(\d{2})(\d{2})$/);
      if (match) {
        let hour = parseInt(match[1]);
        const minute = match[2];
        const period = hour >= 12 ? 'PM' : 'AM';
        if (hour > 12) hour -= 12;
        if (hour === 0) hour = 12;
        return `${hour}:${minute} ${period}`;
      }
      return input; // Return original if can't parse
    }

    let hour = parseInt(match[1]);
    const minute = match[2] || '00';
    let period = match[3] ? match[3].toUpperCase() : '';

    // Auto-detect AM/PM if not specified
    if (!period) {
      if (hour >= 1 && hour <= 11) {
        period = 'AM';
      } else if (hour === 12) {
        period = 'PM';
      } else if (hour >= 13 && hour <= 23) {
        period = 'PM';
        hour = hour - 12;
      } else if (hour === 0) {
        hour = 12;
        period = 'AM';
      } else {
        period = 'AM';
      }
    }

    return `${hour}:${minute} ${period}`;
  };

  const validateTimes = (from, to) => {
    const fromNorm = normalizeTimeInput(from);
    const toNorm = normalizeTimeInput(to);

    if (!fromNorm || !toNorm) {
      return 'Please enter valid times';
    }

    // Convert to comparable format
    const timeToMinutes = (timeStr) => {
      const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (!match) return -1;

      let hour = parseInt(match[1]);
      const minute = parseInt(match[2]);
      const period = match[3].toUpperCase();

      if (period === 'PM' && hour !== 12) hour += 12;
      if (period === 'AM' && hour === 12) hour = 0;

      return hour * 60 + minute;
    };

    const fromMinutes = timeToMinutes(fromNorm);
    const toMinutes = timeToMinutes(toNorm);

    if (fromMinutes === -1 || toMinutes === -1) {
      return 'Invalid time format';
    }

    if (toMinutes <= fromMinutes) {
      return 'Closing time must be after opening time';
    }

    return '';
  };

  const handleDayEdit = (day) => {
    const currentHours = hours[day];
    const parsed = parseTimeString(currentHours);

    if (parsed) {
      setTempFrom(parsed.from);
      setTempTo(parsed.to);
    } else {
      setTempFrom('');
      setTempTo('');
    }

    setEditingDay(day);
    setValidationError('');
  };

  const handleSaveDay = () => {
    const error = validateTimes(tempFrom, tempTo);
    if (error) {
      setValidationError(error);
      return;
    }

    const fromNormalized = normalizeTimeInput(tempFrom);
    const toNormalized = normalizeTimeInput(tempTo);

    const formattedTime = `${fromNormalized} - ${toNormalized}`;
    const newHours = {
      ...hours,
      [editingDay]: formattedTime
    };
    setHours(newHours);
    onChange({ target: { name: 'hours', value: JSON.stringify(newHours) } });
    setEditingDay(null);
    setValidationError('');
    setTempFrom('');
    setTempTo('');
  };

  const handleCancelEdit = () => {
    setEditingDay(null);
    setValidationError('');
    setTempFrom('');
    setTempTo('');
  };

  const setClosed = (day) => {
    const newHours = {
      ...hours,
      [day]: 'Closed'
    };
    setHours(newHours);
    onChange({ target: { name: 'hours', value: JSON.stringify(newHours) } });
  };

  const set24Hours = (day) => {
    const newHours = {
      ...hours,
      [day]: 'Open 24 hours'
    };
    setHours(newHours);
    onChange({ target: { name: 'hours', value: JSON.stringify(newHours) } });
  };

  const applyToAll = (from, to) => {
    const formattedTime = `${from} - ${to}`;
    const newHours = {};
    DAYS.forEach(day => {
      newHours[day] = formattedTime;
    });
    setHours(newHours);
    onChange({ target: { name: 'hours', value: JSON.stringify(newHours) } });
  };

  const applyToWeekdays = (from, to) => {
    const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    const formattedTime = `${from} - ${to}`;
    const newHours = { ...hours };
    weekdays.forEach(day => {
      newHours[day] = formattedTime;
    });
    setHours(newHours);
    onChange({ target: { name: 'hours', value: JSON.stringify(newHours) } });
  };

  const applyToWeekend = (type) => {
    const weekend = ['saturday', 'sunday'];
    const newHours = { ...hours };
    weekend.forEach(day => {
      newHours[day] = type === 'closed' ? 'Closed' : '10:00 AM - 2:00 PM';
    });
    setHours(newHours);
    onChange({ target: { name: 'hours', value: JSON.stringify(newHours) } });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <label className={styles.label}>
          <Clock size={16} />
          Hours of Operation
        </label>
        <button
          type="button"
          onClick={() => setShowEditor(!showEditor)}
          className={styles.toggleBtn}
        >
          {showEditor ? 'Hide Editor' : 'Show Editor'}
        </button>
      </div>

      {showEditor && (
        <div className={styles.editor}>
          {/* Quick Actions */}
          <div className={styles.quickActions}>
            <button
              type="button"
              onClick={() => applyToAll('9:00 AM', '5:00 PM')}
              className={styles.quickBtn}
            >
              Set All: 9 AM - 5 PM
            </button>
            <button
              type="button"
              onClick={() => applyToWeekdays('9:00 AM', '5:00 PM')}
              className={styles.quickBtn}
            >
              Mon-Fri: 9 AM - 5 PM
            </button>
            <button
              type="button"
              onClick={() => applyToWeekend('closed')}
              className={styles.quickBtn}
            >
              Weekend: Closed
            </button>
          </div>

          {/* Format Helper */}
          <div className={styles.formatHelper}>
            <strong>Tip:</strong> Enter times like: 9am, 9:30am, 5pm, 17:00, or 1730
          </div>

          {/* Days List */}
          <div className={styles.daysList}>
            {DAYS.map(day => (
              <div key={day} className={styles.dayRow}>
                <div className={styles.dayLabel}>{DAY_LABELS[day]}</div>

                {editingDay === day ? (
                  <div className={styles.editRow}>
                    <div className={styles.timeInputRow}>
                      <div className={styles.timeInputGroup}>
                        <label className={styles.timeLabel}>From:</label>
                        <input
                          type="text"
                          value={tempFrom}
                          onChange={(e) => setTempFrom(e.target.value)}
                          placeholder="9:00 AM"
                          className={styles.timeInput}
                          autoFocus
                        />
                      </div>

                      <div className={styles.timeInputGroup}>
                        <label className={styles.timeLabel}>To:</label>
                        <input
                          type="text"
                          value={tempTo}
                          onChange={(e) => setTempTo(e.target.value)}
                          placeholder="5:00 PM"
                          className={styles.timeInput}
                        />
                      </div>
                    </div>

                    {validationError && (
                      <div className={styles.validationError}>
                        ⚠️ {validationError}
                      </div>
                    )}

                    <div className={styles.editActions}>
                      <button
                        type="button"
                        onClick={handleSaveDay}
                        className={styles.saveBtn}
                        title="Save"
                      >
                        <Check size={16} />
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className={styles.cancelBtn}
                        title="Cancel"
                      >
                        <X size={16} />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={styles.hoursDisplay}>
                    <span className={styles.hoursText}>
                      {hours[day] || 'Not set'}
                    </span>
                    <div className={styles.dayActions}>
                      <button
                        type="button"
                        onClick={() => handleDayEdit(day)}
                        className={styles.iconBtn}
                        title="Edit hours"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => set24Hours(day)}
                        className={styles.textBtn}
                        title="Open 24 hours"
                      >
                        24hr
                      </button>
                      <button
                        type="button"
                        onClick={() => setClosed(day)}
                        className={styles.textBtn}
                        title="Closed"
                      >
                        Closed
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current Value Display */}
      <div className={styles.currentValue}>
        <small className={styles.helperText}>
          <strong>Saved:</strong> <HoursPreview hours={hours} />
        </small>
      </div>
    </div>
  );
}

// Helper component to display saved hours in readable format
function HoursPreview({ hours }) {
  if (!hours || Object.keys(hours).length === 0) {
    return <span>Not set</span>;
  }

  // Group consecutive days with same hours
  const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const DAY_LABELS = {
    sunday: 'Sun',
    monday: 'Mon',
    tuesday: 'Tue',
    wednesday: 'Wed',
    thursday: 'Thu',
    friday: 'Fri',
    saturday: 'Sat'
  };

  const groupedHours = [];
  let currentGroup = null;

  DAYS.forEach((day) => {
    const dayHours = hours[day] || 'Not set';

    if (currentGroup && currentGroup.hours === dayHours) {
      currentGroup.endDay = day;
    } else {
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

  if (currentGroup) {
    groupedHours.push(currentGroup);
  }

  const formatDayRange = (startDay, endDay) => {
    if (startDay === endDay) {
      return DAY_LABELS[startDay];
    }
    return `${DAY_LABELS[startDay]}-${DAY_LABELS[endDay]}`;
  };

  return (
    <span>
      {groupedHours.map((group, index) => (
        <span key={index}>
          {index > 0 && ', '}
          {formatDayRange(group.startDay, group.endDay)}: {group.hours}
        </span>
      ))}
    </span>
  );
}
