/**
 * Jalali (Solar Hijri) Calendar & Date Engine
 * Precise bidirectional conversion between Solar Hijri, Gregorian, and Hijri dates.
 */

const Jalali = (() => {
  const PERSIAN_MONTHS = [
    'فروردین', 'اردیبهشت', 'خرداد',
    'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر',
    'دی', 'بهمن', 'اسفند'
  ];

  const PERSIAN_WEEKDAYS = [
    'شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'
  ];

  const PERSIAN_WEEKDAYS_SHORT = [
    'ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'
  ];

  const GREGORIAN_MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const GREGORIAN_MONTHS_FA = [
    'ژانویه', 'فوریه', 'مارس', 'آوریل', 'مه', 'ژوئن',
    'ژوئیه', 'اوت', 'سپتامبر', 'اکتبر', 'نوامبر', 'دسامبر'
  ];

  const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

  // Famous Iranian occasions and events by month and day (Solar Hijri)
  const OCCASIONS = {
    '1-1': { title: 'جشن نوروز / آغاز سال نو', isHoliday: true },
    '1-2': { title: 'عید نوروز', isHoliday: true },
    '1-3': { title: 'عید نوروز', isHoliday: true },
    '1-4': { title: 'عید نوروز', isHoliday: true },
    '1-12': { title: 'روز جمهوری اسلامی', isHoliday: true },
    '1-13': { title: 'جشن سیزده‌بدر (روز طبیعت)', isHoliday: true },
    '1-18': { title: 'روز سلامتی (روز جهانی بهداشت)', isHoliday: false },
    '1-25': { title: 'روز بزرگداشت عطار نیشابوری', isHoliday: false },
    '1-29': { title: 'روز ارتش جمهوری اسلامی', isHoliday: false },

    '2-1': { title: 'روز بزرگداشت سعدی شیرازی', isHoliday: false },
    '2-2': { title: 'جشن اردیبهشتگان / روز زمین پاک', isHoliday: false },
    '2-10': { title: 'روز ملی خلیج فارس', isHoliday: false },
    '2-12': { title: 'روز معلم (شهادت استاد مطهری)', isHoliday: false },
    '2-15': { title: 'جشن بهاربد / روز شیراز', isHoliday: false },
    '2-25': { title: 'روز بزرگداشت فردوسی و زبان فارسی', isHoliday: false },
    '2-28': { title: 'روز بزرگداشت حکیم عمر خیام', isHoliday: false },

    '3-1': { title: 'روز بزرگداشت ملاصدرا', isHoliday: false },
    '3-3': { title: 'فتح خرمشهر در عملیات بیت‌المقدس', isHoliday: false },
    '3-14': { title: 'رحلت امام خمینی', isHoliday: true },
    '3-15': { title: 'قیام خونین ۱۵ خرداد', isHoliday: true },
    '3-20': { title: 'روز جهانی صنایع دستی', isHoliday: false },
    '3-29': { title: 'درگذشت دکتر علی شریعتی', isHoliday: false },
    '3-31': { title: 'شهادت دکتر مصطفی چمران', isHoliday: false },

    '4-1': { title: 'جشن آب‌پاشونک / روز اصناف', isHoliday: false },
    '4-7': { title: 'شهادت آیت‌الله بهشتی و ۷۲ تن', isHoliday: false },
    '4-10': { title: 'روز صنعت و معدن', isHoliday: false },
    '4-14': { title: 'روز قلم', isHoliday: false },
    '4-25': { title: 'روز بهزیستی و تامین اجتماعی', isHoliday: false },

    '5-8': { title: 'روز بزرگداشت شیخ شهاب‌الدین سهروردی', isHoliday: false },
    '5-14': { title: 'صدور فرمان مشروطیت', isHoliday: false },
    '5-17': { title: 'روز خبرنگار', isHoliday: false },
    '5-28': { title: 'کودتای ۲۸ مرداد علیه دکتر مصدق', isHoliday: false },

    '6-1': { title: 'روز پزشک (بزرگداشت بوعلی سینا)', isHoliday: false },
    '6-4': { title: 'روز کارمند / جشن شهریورگان', isHoliday: false },
    '6-5': { title: 'روز داروسازی (بزرگداشت زکریای رازی)', isHoliday: false },
    '6-13': { title: 'روز بزرگداشت ابوریحان بیرونی', isHoliday: false },
    '6-21': { title: 'روز ملی سینما', isHoliday: false },
    '6-27': { title: 'روز شعر و ادب فارسی (بزرگداشت شهریار)', isHoliday: false },
    '6-31': { title: 'آغاز هفته دفاع مقدس', isHoliday: false },

    '7-1': { title: 'آغاز سال تحصیلی جدید', isHoliday: false },
    '7-7': { title: 'روز آتش‌نشانی و ایمنی', isHoliday: false },
    '7-8': { title: 'روز بزرگداشت شمس تبریزی', isHoliday: false },
    '7-9': { title: 'روز بزرگداشت مولوی', isHoliday: false },
    '7-10': { title: 'جشن مهرگان', isHoliday: false },
    '7-16': { title: 'روز جهانی کودک', isHoliday: false },
    '7-20': { title: 'روز بزرگداشت حافظ شیرازی', isHoliday: false },

    '8-1': { title: 'روز آمار و برنامه‌ریزی', isHoliday: false },
    '8-7': { title: 'روز بزرگداشت کوروش بزرگ', isHoliday: false },
    '8-13': { title: 'روز دانش‌آموز', isHoliday: false },
    '8-24': { title: 'روز کتاب و کتابخوانی', isHoliday: false },

    '9-9': { title: 'جشن آذرگان', isHoliday: false },
    '9-16': { title: 'روز دانشجو', isHoliday: false },
    '9-25': { title: 'روز پژوهش', isHoliday: false },
    '9-30': { title: 'شب یلدا (جشن چله)', isHoliday: false },

    '10-1': { title: 'جشن خرم‌روز / آغاز زمستان', isHoliday: false },
    '10-10': { title: 'جشن دیگان', isHoliday: false },
    '10-14': { title: 'روز جهاد کشاورزی', isHoliday: false },

    '11-12': { title: 'بازگشت امام خمینی به ایران', isHoliday: false },
    '11-22': { title: 'پیروزی انقلاب اسلامی', isHoliday: true },
    '11-29': { title: 'جشن سپندارمذگان (روز عشق ایرانی)', isHoliday: false },

    '12-5': { title: 'روز مهندسی (بزرگداشت خواجه نصیر)', isHoliday: false },
    '12-15': { title: 'روز درختکاری و آغاز هفته منابع طبیعی', isHoliday: false },
    '12-24': { title: 'چهارشنبه‌سوری (سه‌شنبه شب آخر سال)', isHoliday: false },
    '12-29': { title: 'روز ملی شدن صنعت نفت ایران', isHoliday: true }
  };

  /**
   * Converts English digits to Persian digits
   */
  function toPersianDigits(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/[0-9]/g, w => PERSIAN_DIGITS[+w]);
  }

  /**
   * Converts Persian digits to English digits
   */
  function toEnglishDigits(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/[۰-۹]/g, w => PERSIAN_DIGITS.indexOf(w))
      .replace(/[٠-٩]/g, w => '٠١٢٣٤٥٦٧٨٩'.indexOf(w));
  }

  /**
   * Converts Gregorian date to Jalali (Solar Hijri)
   */
  function gregorianToJalali(gy, gm, gd) {
    const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    const gy2 = (gm > 2) ? (gy + 1) : gy;
    let days = 355666 + (365 * gy) + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) + Math.floor((gy2 + 399) / 400) + gd + g_d_m[gm - 1];
    let jy = -1595 + (33 * Math.floor(days / 12053));
    days %= 12053;
    jy += 4 * Math.floor(days / 1461);
    days %= 1461;
    if (days > 365) {
      jy += Math.floor((days - 1) / 365);
      days = (days - 1) % 365;
    }
    const jm = (days < 186) ? (1 + Math.floor(days / 31)) : (7 + Math.floor((days - 186) / 30));
    const jd = (days < 186) ? (1 + (days % 31)) : (1 + ((days - 186) % 30));
    return { jy, jm, jd };
  }

  /**
   * Converts Jalali (Solar Hijri) date to Gregorian
   */
  function jalaliToGregorian(jy, jm, jd) {
    let gy;
    const jy2 = jy - 979;
    let days = 365 * jy2 + Math.floor(jy2 / 33) * 8 + Math.floor(((jy2 % 33) + 3) / 4);
    for (let i = 0; i < jm - 1; ++i) {
      days += (i < 6) ? 31 : 30;
    }
    days += jd - 1;
    let g_days = days + 79;
    gy = 1600 + 400 * Math.floor(g_days / 146097);
    let leap = true;
    g_days %= 146097;
    if (g_days >= 36525) {
      g_days--;
      gy += 100 * Math.floor(g_days / 36524);
      g_days %= 36524;
      if (g_days >= 365) g_days++;
      else leap = false;
    }
    gy += 4 * Math.floor(g_days / 1461);
    g_days %= 1461;
    if (g_days >= 366) {
      leap = false;
      g_days--;
      gy += Math.floor(g_days / 365);
      g_days %= 365;
    }
    const g_d_m = [0, 31, (leap ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let gm = 0, gd = 0;
    for (let m = 1; m <= 12; m++) {
      if (g_days < g_d_m[m]) {
        gm = m;
        gd = g_days + 1;
        break;
      }
      g_days -= g_d_m[m];
    }
    return { gy, gm, gd };
  }

  /**
   * Determines if a Jalali year is a leap year
   */
  function isJalaliLeapYear(jy) {
    const g1 = jalaliToGregorian(jy, 1, 1);
    const g2 = jalaliToGregorian(jy + 1, 1, 1);
    const d1 = new Date(g1.gy, g1.gm - 1, g1.gd);
    const d2 = new Date(g2.gy, g2.gm - 1, g2.gd);
    return Math.round((d2 - d1) / (1000 * 60 * 60 * 24)) === 366;
  }

  /**
   * Returns the number of days in a Jalali month
   */
  function getJalaliMonthDays(jy, jm) {
    if (jm <= 6) return 31;
    if (jm <= 11) return 30;
    return isJalaliLeapYear(jy) ? 30 : 29;
  }

  /**
   * Gets the Persian weekday index (0 = Shanbeh, 6 = Jom'eh)
   */
  function getPersianWeekday(jy, jm, jd) {
    const g = jalaliToGregorian(jy, jm, jd);
    const date = new Date(g.gy, g.gm - 1, g.gd);
    const jsDay = date.getDay(); // 0 is Sunday, 6 is Saturday
    return (jsDay + 1) % 7;
  }

  /**
   * Returns detailed representation of today's date
   */
  function getToday() {
    const now = new Date();
    const j = gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
    return getDateDetails(j.jy, j.jm, j.jd);
  }

  /**
   * Returns comprehensive info for any Jalali date
   */
  function getDateDetails(jy, jm, jd) {
    const g = jalaliToGregorian(jy, jm, jd);
    const gDate = new Date(g.gy, g.gm - 1, g.gd);
    const weekdayIndex = getPersianWeekday(jy, jm, jd);
    const weekdayName = PERSIAN_WEEKDAYS[weekdayIndex];
    const isFriday = weekdayIndex === 6;

    // Gregorian strings
    const gWeekday = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][gDate.getDay()];
    const gMonthName = GREGORIAN_MONTHS[g.gm - 1];
    const gMonthNameFa = GREGORIAN_MONTHS_FA[g.gm - 1];
    const gregorianFormatted = `${gWeekday}, ${gMonthName} ${g.gd}, ${g.gy}`;
    const gregorianShort = `${g.gy}-${String(g.gm).padStart(2, '0')}-${String(g.gd).padStart(2, '0')}`;
    const gregorianFaFormatted = `${g.gd} ${gMonthNameFa} ${g.gy}`;

    // Hijri date approximation via Intl
    let hijriFormatted = '';
    try {
      hijriFormatted = new Intl.DateTimeFormat('fa-IR-u-ca-islamic-umalqura', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(gDate);
    } catch {
      hijriFormatted = 'تقویم قمری';
    }

    // Occasion
    const occasionKey = `${jm}-${jd}`;
    const occasion = OCCASIONS[occasionKey] || null;
    const isHoliday = isFriday || (occasion && occasion.isHoliday);

    return {
      jy,
      jm,
      jd,
      monthName: PERSIAN_MONTHS[jm - 1],
      weekdayIndex,
      weekdayName,
      persianFull: `${weekdayName}، ${toPersianDigits(jd)} ${PERSIAN_MONTHS[jm - 1]} ${toPersianDigits(jy)}`,
      persianShort: `${toPersianDigits(jd)} ${PERSIAN_MONTHS[jm - 1]}`,
      gregorian: {
        gy: g.gy,
        gm: g.gm,
        gd: g.gd,
        weekday: gWeekday,
        monthName: gMonthName,
        monthNameFa: gMonthNameFa,
        formatted: gregorianFormatted,
        short: gregorianShort,
        faFormatted: gregorianFaFormatted
      },
      hijri: {
        formatted: hijriFormatted
      },
      isFriday,
      isHoliday: Boolean(isHoliday),
      occasion: occasion ? occasion.title : null
    };
  }

  /**
   * Generates calendar grid cells for a given Jalali month
   */
  function getMonthGrid(jy, jm) {
    const totalDays = getJalaliMonthDays(jy, jm);
    const firstDayWeekday = getPersianWeekday(jy, jm, 1); // 0 (Shanbeh) to 6 (Jom'eh)
    
    // Days in previous month
    let prevY = jy;
    let prevM = jm - 1;
    if (prevM < 1) {
      prevM = 12;
      prevY--;
    }
    const prevMonthDays = getJalaliMonthDays(prevY, prevM);

    const cells = [];

    // Leading days from previous month
    for (let i = firstDayWeekday - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      cells.push({
        jy: prevY,
        jm: prevM,
        jd: d,
        isCurrentMonth: false,
        isPrevMonth: true,
        details: getDateDetails(prevY, prevM, d)
      });
    }

    // Current month days
    for (let d = 1; d <= totalDays; d++) {
      cells.push({
        jy,
        jm,
        jd: d,
        isCurrentMonth: true,
        details: getDateDetails(jy, jm, d)
      });
    }

    // Trailing days to fill standard 35 or 42 grid cells
    let nextY = jy;
    let nextM = jm + 1;
    if (nextM > 12) {
      nextM = 1;
      nextY++;
    }

    const totalCells = cells.length > 35 ? 42 : 35;
    const remaining = totalCells - cells.length;
    for (let d = 1; d <= remaining; d++) {
      cells.push({
        jy: nextY,
        jm: nextM,
        jd: d,
        isCurrentMonth: false,
        isNextMonth: true,
        details: getDateDetails(nextY, nextM, d)
      });
    }

    // Secondary Gregorian span for header (e.g. "Aug - Sep 2022")
    const startG = jalaliToGregorian(jy, jm, 1);
    const endG = jalaliToGregorian(jy, jm, totalDays);
    const gStartMonth = GREGORIAN_MONTHS[startG.gm - 1].slice(0, 3);
    const gEndMonth = GREGORIAN_MONTHS[endG.gm - 1].slice(0, 3);
    const gregorianSpan = (gStartMonth === gEndMonth) 
      ? `${gStartMonth} ${endG.gy}` 
      : `${gStartMonth} - ${gEndMonth} ${endG.gy}`;

    // Hijri span
    const d1 = new Date(startG.gy, startG.gm - 1, startG.gd);
    const d2 = new Date(endG.gy, endG.gm - 1, endG.gd);
    let hijriSpan = '';
    try {
      const h1Parts = new Intl.DateTimeFormat('fa-IR-u-ca-islamic-umalqura', { month: 'long' }).format(d1);
      const h2Parts = new Intl.DateTimeFormat('fa-IR-u-ca-islamic-umalqura', { month: 'long', year: 'numeric' }).format(d2);
      hijriSpan = `${h1Parts} - ${h2Parts}`;
    } catch {
      hijriSpan = 'قمری';
    }

    return {
      jy,
      jm,
      monthName: PERSIAN_MONTHS[jm - 1],
      totalDays,
      firstDayWeekday,
      cells,
      gregorianSpan,
      hijriSpan
    };
  }

  return {
    PERSIAN_MONTHS,
    PERSIAN_WEEKDAYS,
    PERSIAN_WEEKDAYS_SHORT,
    GREGORIAN_MONTHS,
    GREGORIAN_MONTHS_FA,
    OCCASIONS,
    toPersianDigits,
    toEnglishDigits,
    gregorianToJalali,
    jalaliToGregorian,
    isJalaliLeapYear,
    getJalaliMonthDays,
    getPersianWeekday,
    getToday,
    getDateDetails,
    getMonthGrid
  };
})();

// Export if in module environment, else available as window.Jalali
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Jalali;
}
