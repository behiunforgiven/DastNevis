/**
 * Interactive Persian Calendar UI
 * Renders the Solar Hijri month grid, handles navigation, and triggers
 * the Gregorian date inspection modal/popover upon clicking any day.
 */

const CalendarUI = (() => {
  let currentYear;
  let currentMonth;
  let selectedDayDetails = null;
  let initialized = false;

  function init() {
    const today = Jalali.getToday();
    currentYear = today.jy;
    currentMonth = today.jm;
    selectedDayDetails = today;

    renderCalendar();
    if (!initialized) {
      setupListeners();
      initialized = true;
    }
  }

  function setupListeners() {
    const prevBtn = document.getElementById('cal-prev-btn');
    const nextBtn = document.getElementById('cal-next-btn');
    const todayBtn = document.getElementById('cal-today-btn');
    const dateConverterBtn = document.getElementById('btn-date-converter');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 1) {
          currentMonth = 12;
          currentYear--;
        }
        renderCalendar();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 12) {
          currentMonth = 1;
          currentYear++;
        }
        renderCalendar();
      });
    }

    if (todayBtn) {
      todayBtn.addEventListener('click', () => {
        const today = Jalali.getToday();
        currentYear = today.jy;
        currentMonth = today.jm;
        selectedDayDetails = today;
        renderCalendar();
        showDayPopup(today);
      });
    }

    if (dateConverterBtn) {
      dateConverterBtn.addEventListener('click', () => {
        openConverterModal();
      });
    }

    // Day detail modal close events
    const modalClose = document.getElementById('day-modal-close');
    const modalBackdrop = document.getElementById('day-modal-backdrop');
    if (modalClose) {
      modalClose.addEventListener('click', closeDayModal);
    }
    if (modalBackdrop) {
      modalBackdrop.addEventListener('click', closeDayModal);
    }

    // Date converter modal close events & input listeners
    const convClose = document.getElementById('date-converter-modal-close');
    const convBackdrop = document.getElementById('date-converter-modal-backdrop');
    if (convClose) {
      convClose.addEventListener('click', closeConverterModal);
    }
    if (convBackdrop) {
      convBackdrop.addEventListener('click', closeConverterModal);
    }

    const jyInput = document.getElementById('conv-jy');
    const jmInput = document.getElementById('conv-jm');
    const jdInput = document.getElementById('conv-jd');
    if (jyInput) jyInput.addEventListener('input', updateConvertedDates);
    if (jmInput) jmInput.addEventListener('change', updateConvertedDates);
    if (jdInput) jdInput.addEventListener('input', updateConvertedDates);
  }

  function renderCalendar() {
    const today = Jalali.getToday();
    const gridData = Jalali.getMonthGrid(currentYear, currentMonth);

    // Update Header
    const titleEl = document.getElementById('cal-month-title');
    const subtitleEl = document.getElementById('cal-sub-title');

    if (titleEl) {
      titleEl.textContent = `${gridData.monthName} ${Jalali.toPersianDigits(currentYear)}`;
    }
    if (subtitleEl) {
      subtitleEl.textContent = `${gridData.hijriSpan} | ${gridData.gregorianSpan}`;
    }

    // Render Grid Days
    const gridContainer = document.getElementById('cal-days-grid');
    if (!gridContainer) return;
    gridContainer.innerHTML = '';

    gridData.cells.forEach(cell => {
      const btn = document.createElement('button');
      btn.className = 'cal-day-cell';
      btn.setAttribute('type', 'button');

      const isToday = cell.jy === today.jy && cell.jm === today.jm && cell.jd === today.jd;
      const isSelected = selectedDayDetails &&
                         cell.jy === selectedDayDetails.jy &&
                         cell.jm === selectedDayDetails.jm &&
                         cell.jd === selectedDayDetails.jd;

      if (!cell.isCurrentMonth) {
        btn.classList.add('other-month');
      }
      if (cell.details.isFriday) {
        btn.classList.add('friday');
      }
      if (cell.details.isHoliday) {
        btn.classList.add('holiday');
      }
      if (isToday) {
        btn.classList.add('today');
      }
      if (isSelected) {
        btn.classList.add('selected');
      }

      btn.innerHTML = `
        <span class="day-number">${Jalali.toPersianDigits(cell.jd)}</span>
        ${cell.details.occasion ? '<span class="day-dot" title="' + cell.details.occasion + '"></span>' : ''}
      `;

      btn.addEventListener('click', () => {
        selectedDayDetails = cell.details;
        document.querySelectorAll('.cal-day-cell.selected').forEach(el => el.classList.remove('selected'));
        btn.classList.add('selected');
        showDayPopup(cell.details);
      });

      gridContainer.appendChild(btn);
    });
  }

  /**
   * Displays the popup/modal with Gregorian & Hijri date details when user clicks a day
   */
  function showDayPopup(details) {
    const modal = document.getElementById('day-detail-modal');
    if (!modal) return;

    // Populate Persian Info
    document.getElementById('modal-persian-date').textContent = details.persianFull;
    
    // Populate Gregorian Info (The core requirement!)
    document.getElementById('modal-gregorian-date').textContent = details.gregorian.formatted;
    document.getElementById('modal-gregorian-short').textContent = details.gregorian.short;
    document.getElementById('modal-gregorian-fa').textContent = details.gregorian.faFormatted;

    // Populate Lunar Hijri Info
    document.getElementById('modal-hijri-date').textContent = details.hijri.formatted || 'تقویم قمری';

    // Occasion / Holiday status
    const occasionEl = document.getElementById('modal-occasion-box');
    if (details.occasion) {
      occasionEl.style.display = 'flex';
      document.getElementById('modal-occasion-text').textContent = details.occasion;
      if (details.isHoliday) {
        occasionEl.classList.add('is-holiday');
      } else {
        occasionEl.classList.remove('is-holiday');
      }
    } else {
      occasionEl.style.display = 'none';
    }

    // Add To-Do Quick Button
    const addNoteBtn = document.getElementById('btn-add-todo-for-day');
    if (addNoteBtn) {
      addNoteBtn.onclick = () => {
        closeDayModal();
        if (window.App && window.App.openNewTaskModalWithDate) {
          window.App.openNewTaskModalWithDate(details.persianShort);
        }
      };
    }

    // Copy Button
    const copyBtn = document.getElementById('btn-copy-gregorian');
    if (copyBtn) {
      copyBtn.onclick = () => {
        navigator.clipboard.writeText(details.gregorian.formatted);
        copyBtn.textContent = 'کپی شد! ✓';
        setTimeout(() => {
          copyBtn.textContent = 'کپی تاریخ میلادی';
        }, 1500);
      };
    }

    modal.classList.add('active');
  }

  function closeDayModal() {
    const modal = document.getElementById('day-detail-modal');
    if (modal) modal.classList.remove('active');
  }

  function closeConverterModal() {
    const convModal = document.getElementById('date-converter-modal');
    if (convModal) convModal.classList.remove('active');
  }

  /**
   * Converter Modal logic (تبدیل تاریخ)
   */
  function openConverterModal() {
    const convModal = document.getElementById('date-converter-modal');
    if (!convModal) return;
    convModal.classList.add('active');

    const today = Jalali.getToday();
    const jyInput = document.getElementById('conv-jy');
    const jmInput = document.getElementById('conv-jm');
    const jdInput = document.getElementById('conv-jd');

    if (jyInput && jmInput && jdInput) {
      jyInput.value = today.jy;
      jmInput.value = today.jm;
      jdInput.value = today.jd;
      updateConvertedDates();
    }
  }

  function updateConvertedDates() {
    const jy = parseInt(document.getElementById('conv-jy').value) || 1405;
    const jm = parseInt(document.getElementById('conv-jm').value) || 1;
    const jd = parseInt(document.getElementById('conv-jd').value) || 1;

    try {
      const details = Jalali.getDateDetails(jy, jm, jd);
      document.getElementById('conv-res-gregorian').textContent = details.gregorian.formatted;
      document.getElementById('conv-res-hijri').textContent = details.hijri.formatted;
      document.getElementById('conv-res-persian').textContent = details.persianFull;
    } catch {
      // invalid date handling
    }
  }

  return {
    init,
    renderCalendar,
    showDayPopup,
    openConverterModal,
    closeConverterModal,
    updateConvertedDates,
    closeDayModal
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CalendarUI;
}
