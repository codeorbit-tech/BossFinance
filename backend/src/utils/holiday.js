const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Checks if a given date is a holiday or Sunday.
 * @param {Date} date - The date to check.
 * @returns {Promise<boolean>}
 */
async function isHolidayOrSunday(date) {
  // Check if it's Sunday
  if (date.getDay() === 0) return true;

  // Check if it's a holiday in the database
  const holiday = await prisma.holiday.findUnique({
    where: { 
      date: new Date(date.getFullYear(), date.getMonth(), date.getDate()) 
    }
  });

  return !!holiday;
}

/**
 * Calculates the next working day for a due date.
 * @param {Date} date - The proposed due date.
 * @returns {Promise<Date>}
 */
async function getNextWorkingDay(date) {
  let nextDay = new Date(date);
  while (await isHolidayOrSunday(nextDay)) {
    nextDay.setDate(nextDay.getDate() + 1);
  }
  return nextDay;
}

/**
 * Calculates the next due date based on frequency and holiday rules.
 * @param {Date} lastDueDate - The current/last due date.
 * @param {string} frequency - DAILY, WEEKLY, MONTHLY.
 * @returns {Promise<Date>}
 */
async function calculateNextDueDate(lastDueDate, frequency) {
  let nextDate = new Date(lastDueDate || Date.now());
  
  const frequencyDays = { 
    DAILY: 1, 
    WEEKLY: 7, 
    MONTHLY: 30 
  };
  
  const daysToAdd = frequencyDays[frequency] || 30;
  nextDate.setDate(nextDate.getDate() + daysToAdd);
  
  // Only Daily loans shift for Sundays/Holidays based on the PROJECT.md rules?
  // "If a daily loan payment due date falls on a Sunday OR a listed public holiday: shift due date"
  if (frequency === 'DAILY') {
    return await getNextWorkingDay(nextDate);
  }
  
  return nextDate;
}

module.exports = {
  isHolidayOrSunday,
  getNextWorkingDay,
  calculateNextDueDate
};
