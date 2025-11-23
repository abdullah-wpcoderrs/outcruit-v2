# N8N Talent Sorting Workflow Fix

## Issues Fixed

### 1. Auto-Download Prevention ✅
- Modified `/api/files/[id]` to only download when `?download=1` is in the URL
- Updated history page to add `?download=1` when download button is clicked
- Preview now works without triggering download

### 2. Table Data Fetching ✅
- Fixed SQL parameter placeholders in `/api/talent-lists/[id]/candidates`
- Changed from `${idx}` to `$${idx}` for proper PostgreSQL parameterized queries
- Fixed LIMIT/OFFSET parameter references

## N8N Workflow Changes Needed

Your current n8n "Code Construct Payload for neon DB" node has a small issue. The `application_sheet_id` field should contain just the **Sheet ID**, not the full URL.

### Current Code (INCORRECT):
```javascript
return {
  row_no: data.row_number,
  name: data.Name,
  // ... other fields ...
  application_sheet_id: dynamicSheetUrl  // ❌ This is the full URL
};
```

### Fixed Code (CORRECT):
```javascript
return {
  row_no: data.row_number,
  name: data.Name,
  email: data.Email,
  phone_number: data['Phone number'],
  academic_qualification: data['Academic Qualification'],
  grade: data.Grade,
  age: data.Age,
  residential_address: data['Residential Address'],
  location: data.Location,
  marital_status: data['Marital Status'],
  gender: data.Gender,
  role_applying_for: data['Role Applying For'],
  cv_url: data.CV,
  status: "Passed",
  ai_rationale: "Qualified based on role criteria",
  candidate_tracker: "Unscheduled",
  application_sheet_id: sheetData.sheetId  // ✅ Just the sheet ID
};
```

### Complete Fixed JavaScript Code for n8n Node:

```javascript
// --- 1. DYNAMIC GLOBAL VARIABLES ---
const jobNode = $('Set Sheet URL').first();
const dynamicJobName = jobNode ? jobNode.json.jobName : "Default Job Name"; 

const uploadNode = $('upload sheet csv file to neon db').first();
const dynamicFileId = uploadNode ? uploadNode.json.id : null;

const sheetNode = $('Create \'Passed\' Sheet Tab').first();
const sheetData = sheetNode ? sheetNode.json : {};
const dynamicSheetUrl = `https://docs.google.com/spreadsheets/d/${sheetData.spreadsheetId}/edit?gid=${sheetData.sheetId}`;

// --- 2. DYNAMIC CANDIDATE LIST ---
const dynamicCandidates = items.map(item => {
  const data = item.json;
  
  return {
    row_no: data.row_number,
    name: data.Name,
    email: data.Email,
    phone_number: data['Phone number'],
    academic_qualification: data['Academic Qualification'],
    grade: data.Grade,
    age: data.Age,
    residential_address: data['Residential Address'],
    location: data.Location,
    marital_status: data['Marital Status'],
    gender: data.Gender,
    role_applying_for: data['Role Applying For'],
    cv_url: data.CV,
    status: "Passed",
    ai_rationale: "Qualified based on role criteria",
    candidate_tracker: "Unscheduled",
    application_sheet_id: sheetData.sheetId  // ✅ FIXED: Use sheetId instead of full URL
  };
});

// --- 3. DYNAMIC OUTPUT ---
return {
  json: {
    jobTitle: dynamicJobName,
    fileId: dynamicFileId,
    candidateCount: dynamicCandidates.length,
    recruiterEmail: "abdul@mail.com",
    sheetUrl: dynamicSheetUrl,
    applicationSheetId: sheetData.sheetId,
    candidates: dynamicCandidates
  }
};
```

## Testing

After updating the n8n workflow:

1. Run the workflow with test data
2. Check the History > Talent Sorting > Table view
3. Verify candidates appear in the table
4. Test the preview modal - it should NOT auto-download
5. Click the Download button - it SHOULD download

## Summary

- ✅ Preview modal no longer auto-downloads files
- ✅ Download button explicitly triggers download
- ✅ SQL queries fixed with proper parameter placeholders
- ⚠️ Update n8n workflow to use `sheetData.sheetId` instead of `dynamicSheetUrl` for `application_sheet_id`
