import { addDays, isWeekend, setHours, setMinutes, format, addMinutes } from 'date-fns';

export interface ScheduleConfig {
    startDate: string; // YYYY-MM-DD
    startTime: string; // HH:MM
    timeIntervalMinutes: number;
    candidatesPerBatch: number;
    meetingVenueUrl: string;
    recruiterName: string;
    recruiterEmail: string;
}

export interface Candidate {
    id: string;
    name: string;
    email: string;
    [key: string]: any;
}

export interface ScheduledCandidate extends Candidate {
    batch_number: number;
    interview_date: string;
    interview_time_slot: string;
    meeting_venue_url: string;
    recruiter_name: string;
    recruiter_email: string;
    status: string;
}

/**
 * Helper to find the next working day (skips weekends)
 */
function getNextWorkingDay(date: Date): Date {
    let nextDay = addDays(date, 1);
    while (isWeekend(nextDay)) {
        nextDay = addDays(nextDay, 1);
    }
    return nextDay;
}

/**
 * Smart Scheduler Algorithm
 * Ported from n8n workflow
 */
export function scheduleInterviews(
    candidates: Candidate[],
    config: ScheduleConfig
): ScheduledCandidate[] {
    const {
        startDate,
        startTime,
        timeIntervalMinutes,
        candidatesPerBatch,
        meetingVenueUrl,
        recruiterName,
        recruiterEmail
    } = config;

    // Parse start time
    const [startHour, startMinute] = startTime.split(':').map(Number);

    // Initialize master trackers
    let scheduledCandidates: ScheduledCandidate[] = [];
    let currentBatchNum = 1;
    let candidatesInCurrentBatch = 0;

    // Initialize master clock
    let currentInterviewDate = new Date(startDate);
    // If start date is a weekend, move to next working day
    if (isWeekend(currentInterviewDate)) {
        currentInterviewDate = getNextWorkingDay(currentInterviewDate);
    }

    let currentInterviewTime = setMinutes(setHours(new Date(currentInterviewDate), startHour), startMinute);

    for (const candidate of candidates) {
        // Check if batch is full
        if (candidatesInCurrentBatch >= candidatesPerBatch) {
            // Move to next batch
            currentBatchNum++;
            candidatesInCurrentBatch = 0;

            // Move to next working day
            currentInterviewDate = getNextWorkingDay(currentInterviewDate);

            // Reset time to start of day
            currentInterviewTime = setMinutes(setHours(new Date(currentInterviewDate), startHour), startMinute);
        }

        // Format time slot
        const timeSlot = format(currentInterviewTime, 'hh:mm a');

        // Add to scheduled list
        scheduledCandidates.push({
            ...candidate,
            batch_number: currentBatchNum,
            interview_date: format(currentInterviewDate, 'yyyy-MM-dd'),
            interview_time_slot: timeSlot,
            meeting_venue_url: meetingVenueUrl,
            recruiter_name: recruiterName,
            recruiter_email: recruiterEmail,
            status: 'Scheduled'
        });

        // Increment counters
        candidatesInCurrentBatch++;
        currentInterviewTime = addMinutes(currentInterviewTime, timeIntervalMinutes);
    }

    return scheduledCandidates;
}
