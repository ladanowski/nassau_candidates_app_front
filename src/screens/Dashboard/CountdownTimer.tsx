// import React, { useEffect, useState } from 'react';
// import { View, Text, StyleSheet } from 'react-native';
// import { Colors } from '../../constants/colors';

// interface CountdownTimerProps {
//     targetDate: Date;
//     label: string;
// }

// const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDate, label }) => {
//     const [timeLeft, setTimeLeft] = useState(getTimeLeft());

//     function getTimeLeft() {
//         const now = new Date();
//         const diff = targetDate.getTime() - now.getTime();
//         const totalSeconds = Math.max(0, Math.floor(diff / 1000));
//         const days = Math.floor(totalSeconds / (24 * 3600));
//         const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
//         const minutes = Math.floor((totalSeconds % 3600) / 60);
//         const seconds = totalSeconds % 60;
//         return { days, hours, minutes, seconds, totalSeconds };
//     }

//     useEffect(() => {
//         const timer = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
//         return () => clearInterval(timer);
//     }, []);

//     let displayValue = '';
//     let displayLabel = '';

//     if (timeLeft.days >= 1) {
//         displayValue = timeLeft.days.toString().padStart(2, '0');
//         displayLabel = 'Days';
//     } else if (timeLeft.hours >= 1) {
//         displayValue = timeLeft.hours.toString().padStart(2, '0');
//         displayLabel = 'Hours';
//     } else if (timeLeft.minutes >= 1) {
//         displayValue = timeLeft.minutes.toString().padStart(2, '0');
//         displayLabel = 'Min';
//     } else {
//         displayValue = timeLeft.seconds.toString().padStart(2, '0');
//         displayLabel = 'Sec';
//     }
//     //console.log("displayValue: ",displayValue);

//     //console.log("DISPLAYLABEL: ",displayLabel);

//     return (
//         <View style={styles.timerContainer}>
//             <View style={styles.circle}>
//                 <Text style={styles.time}>{displayValue}</Text>
//             </View>

//             {(displayLabel === 'Sec' && displayValue === '00') ? (
//                 <Text style={styles.label}> </Text>
//             ) : (
//                 <Text style={styles.label}>{displayLabel}</Text>
//             )}

//             <Text style={styles.timerLabel}>{label}</Text>
//         </View>
//     );
// };

// export default CountdownTimer;

// const styles = StyleSheet.create({
//     timerContainer: {
//         alignItems: 'center',
//         marginHorizontal: 8,
//     },
//     circle: {
//         width: 56,
//         height: 56,
//         borderRadius: 28,
//         backgroundColor: Colors.light.background,
//         borderWidth: 5,
//         borderColor: Colors.light.secondary,
//         justifyContent: 'center',
//         alignItems: 'center',
//         marginHorizontal: 4,
//         shadowColor: Colors.light.primary,
//         shadowOffset: { width: 5, height: 10 },
//         shadowOpacity: 0.18,
//         shadowRadius: 10,
//         elevation: 6,
//     },
//     time: {
//         fontSize: 22,
//         fontFamily: 'MyriadPro-Bold',
//         color: Colors.light.secondary,
//     },
//     label: {
//         textAlign: 'center',
//         fontSize: 10,
//         color: Colors.light.primary,
//         fontFamily: 'MyriadPro-Bold',
//         paddingTop: 8,
//     },
//     timerLabel: {
//         fontSize: 8,
//         color: Colors.light.primary,
//         fontFamily: 'MyriadPro-Regular',
//         paddingTop: 4,
//         textAlign: 'center',
//         width: 80,
//     },
// });


import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

interface CountdownTimerProps {
  targetDate: Date;
  label: string;
}

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
};

function calcTimeLeft(targetDate: Date): TimeLeft {
  const targetMs = targetDate?.getTime?.();
  if (typeof targetMs !== 'number' || Number.isNaN(targetMs)) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 };
  }

  const nowMs = Date.now();
  const diffMs = targetMs - nowMs;

  const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
  const days = Math.floor(totalSeconds / (24 * 3600));
  const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds, totalSeconds };
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDate, label }) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calcTimeLeft(targetDate));

  // Recompute immediately when targetDate changes (important!)
  useEffect(() => {
    setTimeLeft(calcTimeLeft(targetDate));
  }, [targetDate]);

  // Tick every second, tied to current targetDate
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calcTimeLeft(targetDate));
    }, 1000);
    

    return () => clearInterval(timer);
  }, [targetDate]);

  const { displayValue, displayLabel } = useMemo(() => {
    if (timeLeft.days >= 1) {
      return { displayValue: String(timeLeft.days).padStart(2, '0'), displayLabel: 'Days' };
    }
    if (timeLeft.hours >= 1) {
      return { displayValue: String(timeLeft.hours).padStart(2, '0'), displayLabel: 'Hours' };
    }
    if (timeLeft.minutes >= 1) {
      return { displayValue: String(timeLeft.minutes).padStart(2, '0'), displayLabel: 'Min' };
    }
    return { displayValue: String(timeLeft.seconds).padStart(2, '0'), displayLabel: 'Sec' };
  }, [timeLeft]);

  return (
    <View style={styles.timerContainer}>
      <View style={styles.circle}>
        <Text style={styles.time}>{displayValue}</Text>
      </View>

      {(displayLabel === 'Sec' && displayValue === '00') ? (
        <Text style={styles.label}> </Text>
      ) : (
        <Text style={styles.label}>{displayLabel}</Text>
      )}

      <Text style={styles.timerLabel}>{label}</Text>
    </View>
  );
};

export default CountdownTimer;

const styles = StyleSheet.create({
  timerContainer: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  circle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.background,
    borderWidth: 5,
    borderColor: Colors.light.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 5, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 6,
  },
  time: {
    fontSize: 22,
    fontFamily: 'MyriadPro-Bold',
    color: Colors.light.secondary,
  },
  label: {
    textAlign: 'center',
    fontSize: 10,
    color: Colors.light.primary,
    fontFamily: 'MyriadPro-Bold',
    paddingTop: 8,
  },
  timerLabel: {
    fontSize: 8,
    color: Colors.light.primary,
    fontFamily: 'MyriadPro-Regular',
    paddingTop: 4,
    textAlign: 'center',
    width: 80,
  },
});
