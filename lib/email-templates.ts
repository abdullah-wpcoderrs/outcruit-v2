import { format } from 'date-fns';

export interface EmailTemplateData {
    candidateName: string;
    roleApplyingFor: string;
    jobName: string;
    recruiterName: string;
    recruiterEmail: string;
    interviewDate?: string;
    interviewTimeSlot?: string;
    meetingVenueUrl?: string;
}

export const emailTemplates = {
    interview_schedule: (data: EmailTemplateData) => {
        const formattedDate = data.interviewDate
            ? format(new Date(data.interviewDate), 'EEEE, MMMM do, yyyy')
            : 'TBD';

        return {
            subject: `Interview Schedule: ${data.jobName}`,
            html: `
        <p>Dear ${data.candidateName},</p>
        <p>Trust this email finds you well.</p>
        <p>Sequel to your application for the role of <b>${data.roleApplyingFor}</b>, kindly note that you have been scheduled for a first level virtual interview session with Workforce Group with the details below.</p>
        <p>
          <b>DATE:</b> ${formattedDate}<br>
          <b>TIME:</b> ${data.interviewTimeSlot}<br>
          <b>VENUE/MEETING LINK:</b> Zoho Meeting App ${data.meetingVenueUrl}
        </p>
        <p>Please download the Zoho App. Then at the specified time, click the link above.</p>
        <br>
        <p>Best regards,</p>
        <p><b>${data.recruiterName}</b></p>
        <p>© Workforce Outsourcing Recruitment Team.</p>
      `
        };
    },

    congratulatory: (data: EmailTemplateData) => ({
        subject: `Congratulations! You Have Been Shortlisted for - ${data.jobName}`,
        html: `
      <p>Dear ${data.candidateName},</p>
      <p>We hope this email finds you in good health and spirits.</p>
      <p style="font-size: 1.2em;"><b>Congratulations!</b></p>
      <p>We are pleased to inform you that you successfully passed your recent interview for the <b>${data.roleApplyingFor}</b> role with <b>${data.jobName}</b>. You have now advanced to the final interview stage.</p>
      <p>The final interview date will be communicated shortly.</p>
      <p>Kindly click on the link below to join the new WhatsApp group for updates:</p>
      <p><a href="https://chat.whatsapp.com/C31IgGvHEtlHaObf1N7DDq" style="font-size: 1.1em; color: #006600; text-decoration: none;"><b>Join the WhatsApp Group for Updates</b></a></p>
      <p>Once again, <b>Congratulations!</b></p>
      <br>
      <p>Best regards,</p>
      <p><b>${data.recruiterName}</b></p>
      <p>© Workforce Outsourcing Recruitment Team.</p>
    `
    }),

    rejection: (data: EmailTemplateData) => ({
        subject: `Update on Your Application for ${data.jobName}`,
        html: `
      <p>Dear <b>${data.candidateName}</b>,</p>
      <p>Trust this email finds you well.</p>
      <p>Sequel to your recent interview for the <b>${data.roleApplyingFor}</b> role with <b>${data.jobName}</b>, we have had the opportunity to review your application and interview feedback.</p>
      <p>We regret to inform you that your interview was not successful, and you will not be proceeding to the next stage at this time.</p>
      <p>Please note that you can re-apply after six months if you are still within the age bracket.</p>
      <p>However, you can always look out for other job opportunities on all our social media platforms.</p>
      <p>We wish you the best in your career search.</p>
      <br>
      <p>Best Regards,</p>
      <p><b>${data.recruiterName}</b></p>
      <p>© Workforce Outsourcing Recruitment Team.</p>
    `
    })
};
