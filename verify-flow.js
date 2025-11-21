// Using native fetch (Node 18+)

const BASE_URL = 'http://localhost:3000';

async function runVerification() {
    console.log('🚀 Starting Verification...');

    // 1. Fetch Job Trackers
    console.log('\n1. Fetching Job Trackers...');
    const trackersRes = await fetch(`${BASE_URL}/api/job-trackers`);
    if (!trackersRes.ok) {
        const errText = await trackersRes.text();
        throw new Error(`Failed to fetch trackers: ${trackersRes.status} ${trackersRes.statusText} - ${errText}`);
    }
    const trackers = await trackersRes.json();

    if (trackers.length === 0) {
        console.error('❌ No job trackers found. Please create one in the dashboard first.');
        return;
    }
    const trackerId = trackers[0].id;
    console.log(`✅ Found ${trackers.length} trackers. Using ID: ${trackerId}`);

    // 2. Create Candidate
    console.log('\n2. Creating Test Candidate...');
    const candidateData = {
        job_tracker_id: trackerId,
        name: 'Test Candidate',
        email: `test-${Date.now()}@example.com`,
        role_applying_for: 'Developer',
        status: 'Unscheduled'
    };

    const createRes = await fetch(`${BASE_URL}/api/candidates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(candidateData)
    });

    if (!createRes.ok) {
        const err = await createRes.text();
        throw new Error(`Failed to create candidate: ${err}`);
    }
    const newCandidate = await createRes.json();
    console.log(`✅ Created Candidate: ${newCandidate.name} (${newCandidate.id})`);

    // 3. Schedule Interview
    console.log('\n3. Scheduling Interview...');
    const scheduleConfig = {
        startDate: new Date().toISOString().split('T')[0],
        startTime: '10:00',
        timeIntervalMinutes: 30,
        candidatesPerBatch: 5,
        meetingVenueUrl: 'http://meet.google.com/abc-defg-hij'
    };

    const scheduleRes = await fetch(`${BASE_URL}/api/candidates/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            jobTrackerId: trackerId,
            config: scheduleConfig
        })
    });

    if (!scheduleRes.ok) {
        const err = await scheduleRes.text();
        throw new Error(`Failed to schedule: ${err}`);
    }
    const scheduleResult = await scheduleRes.json();
    console.log(`✅ Scheduled ${scheduleResult.count} candidates.`);

    // 4. Send Email
    console.log('\n4. Sending Interview Email...');
    const emailRes = await fetch(`${BASE_URL}/api/candidates/communicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            jobTrackerId: trackerId,
            jobName: 'Test Job',
            emailType: 'interview_schedule'
        })
    });

    if (!emailRes.ok) {
        const err = await emailRes.text();
        throw new Error(`Failed to send email: ${err}`);
    }
    const emailResult = await emailRes.json();
    console.log(`✅ Emails Processed: ${emailResult.successCount} sent.`);

    console.log('\n✨ Verification Complete! All systems go.');
}

runVerification().catch(err => {
    console.error('\n❌ Verification Failed:', err);
});
