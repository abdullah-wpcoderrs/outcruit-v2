## Workflow Overview

# This workflow helps recruiter to extract job details from job brief document and record it into a JD tracker. Making the job role ready to use for processing by the Talent qualifier Agent.

## Workflow Steps

1. Extract Text from Job Brief Document
2. Extract Job Facts
3. Structured Parser - Job Info
4. Create tarcker for the Job role

## Workflow Nodes

{
  "nodes": [
    {
      "parameters": {
        "model": {
          "__rl": true,
          "mode": "list",
          "value": "gpt-4.1-mini"
        },
        "options": {}
      },
      "type": "@n8n/n8n-nodes-langchain.lmChatOpenAi",
      "typeVersion": 1.2,
      "position": [
        -848,
        1872
      ],
      "id": "d6dc7046-fe86-42b2-97c7-bfcde78a9f97",
      "name": "OpenAI Chat Model2",
      "credentials": {
        "openAiApi": {
          "id": "1rriMfbqdBYEU9E7",
          "name": "OpenAi account 2"
        }
      }
    },
    {
      "parameters": {
        "operation": "pdf",
        "binaryPropertyName": "Upload_JD",
        "options": {
          "joinPages": true
        }
      },
      "type": "n8n-nodes-base.extractFromFile",
      "typeVersion": 1,
      "position": [
        -1296,
        1616
      ],
      "id": "57e3a62a-c640-4b1d-b570-2a36fae90b37",
      "name": "Extract Text from Job Brief Document1"
    },
    {
      "parameters": {
        "text": "=You are an HR analyst. Read the following job brief. The brief may contain *one or more* distinct job roles. For *each* role you find, extract the criteria. Respond *only* in a JSON array format.\n\nBrief Text:\n{{ $('Extract Text from Job Brief Document1').item.json.text }}\n\nExample Output:\n[\n  { \"Role_Name\": \"Senior Developer\", \"Min_Years_Exp\": 5, \"Required_Skills\": \"Python,AWS\", \"Education_Level\": \"BSc\", \"Location_Reqs\": \"Lagos\", \"Industry_Exp_Req\": \"Yes\", \"AI_Brief_Text\": \"Full brief for the senior dev role...\" },\n  { \"Role_Name\": \"Junior Developer\", \"Min_Years_Exp\": 1, \"Required_Skills\": \"Python,JavaScript\", \"Education_Level\": \"BSc\", \"Location_Reqs\": \"Lagos\", \"Industry_Exp_Req\": \"No\", \"AI_Brief_Text\": \"Full brief for the junior dev role...\", \"Age\": 24, \"Grade\": \"Second Class Upper\" }\n]",
        "schemaType": "manual",
        "inputSchema": "[\n  { \"Role_Name\": \"Senior Developer\", \"Min_Years_Exp\": 5, \"Required_Skills\": \"Python,AWS\", \"Education_Level\": \"BSc\", \"Location_Reqs\": \"Lagos\", \"Industry_Exp_Req\": \"Yes\", \"AI_Brief_Text\": \"Full brief for the senior dev role...\" },\n  { \"Role_Name\": \"Junior Developer\", \"Min_Years_Exp\": 1, \"Required_Skills\": \"Python,JavaScript\", \"Education_Level\": \"BSc\", \"Location_Reqs\": \"Lagos\", \"Industry_Exp_Req\": \"No\", \"AI_Brief_Text\": \"Full brief for the junior dev role...\",\n\"Max_Age\": 24, \"Grade\": \"Second Class Upper\" \n  }\n]",
        "options": {}
      },
      "type": "@n8n/n8n-nodes-langchain.informationExtractor",
      "typeVersion": 1.2,
      "position": [
        -976,
        1616
      ],
      "id": "b838ee49-9b38-46f8-9c09-f0c3dd5311c8",
      "name": "Extract Qualification logic1"
    },
    {
      "parameters": {
        "sendTo": "={{ $items('recruitersInfo')[0].json['Recruiter Email'] }}",
        "subject": "=Hey {{ $('getDocument').item.json.recruiterName }},  {{ $('recruitersInfo').item.json['Name of  Job'] }} JD is Now Being Tracked!",
        "message": "=Hello,<br><br>The job brief has been processed. Here is the new Application Google Sheet created for your Job Brief. Please use this URL link to create and link your Google Forms to it for Appliaction Response Form. <br><br>\n\n<strong> Application Spreadsheet Name </strong>: <span style=\"font-family: 'Courier New', monospace; color: green; \"> {{ $json.Application_Form_Name }} </span>\n<br><br>\n\n<strong>Spreadsheet URL </strong> : {{ $json['Form Response spreadsheet'] }}\n\n<br><br>\n\nPlease you are to use and attach this spreadsheet to the Application form you will be creating for this Job application.\n\n<br><br>\n\nSigned:\n<br>\n<strong> Workforce Group Automation Team © 2025. </strong>",
        "options": {
          "appendAttribution": false,
          "bccList": "=abdullah.ajibowu@workforcegroup.com, workforcerecruitment@zonetechpark.com",
          "senderName": "Recruitment Automation"
        }
      },
      "type": "n8n-nodes-base.gmail",
      "typeVersion": 2.1,
      "position": [
        832,
        1504
      ],
      "id": "32f24a0a-4184-4adf-9e20-7297efa16434",
      "name": "Send a message",
      "webhookId": "ae5e3afe-dbb3-458c-ab09-4813439b6735",
      "credentials": {
        "gmailOAuth2": {
          "id": "0nqfVeAnwHQfWjkn",
          "name": "Gmail account"
        }
      }
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "29c159fc-5444-4294-a6e6-51049f96b3fa",
              "name": "Name of  Job",
              "value": "={{ $('JD Tracker Webhook').item.json.body.jobName }}",
              "type": "string"
            },
            {
              "id": "e0d938ad-7b19-4af1-afce-ccab1ae2dc62",
              "name": "Additional Requirements",
              "value": "={{ $('JD Tracker Webhook').item.json.body.additionalLogic }}",
              "type": "string"
            },
            {
              "id": "77143b93-f062-45f4-b857-d89ac21ef5c7",
              "name": "Recruiter Email",
              "value": "={{ $('JD Tracker Webhook').item.json.body.recruiterEmail }}",
              "type": "string"
            },
            {
              "id": "64d96f51-f6b4-41cc-9cc1-76062c99c3d1",
              "name": "Recruitment Type",
              "value": "={{ $('JD Tracker Webhook').item.json.body.recruitment_type }}",
              "type": "string"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        -1120,
        1616
      ],
      "id": "81bd523e-cd8f-48b8-abfb-b7c964e942c5",
      "name": "recruitersInfo"
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "48244091-f057-4cc9-95e2-d3f5ce321e03",
              "name": "Job Form Spreadsheet URL",
              "value": "={{ $('Create Response Form Sheet').item.json.spreadsheetUrl }}",
              "type": "string"
            },
            {
              "id": "251a1d49-da45-42f4-b5a2-09b45d9b6243",
              "name": "Application Form Sheet ID",
              "value": "={{ $('Create Response Form Sheet').item.json.spreadsheetId }}",
              "type": "string"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        -320,
        1616
      ],
      "id": "94f55883-df72-43ff-b5dd-2ff4ec2972e1",
      "name": "Set job data"
    },
    {
      "parameters": {
        "operation": "append",
        "documentId": {
          "__rl": true,
          "value": "={{ $('Create Response Form Sheet').item.json.spreadsheetId }}",
          "mode": "id"
        },
        "sheetName": {
          "__rl": true,
          "value": "={{ $('Create Response Form Sheet').item.json.sheets[0].properties.sheetId }}",
          "mode": "id"
        },
        "columns": {
          "mappingMode": "autoMapInputData",
          "value": {},
          "matchingColumns": [],
          "schema": [
            {
              "id": "Timestamp",
              "displayName": "Timestamp",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true,
              "removed": false
            },
            {
              "id": "Name",
              "displayName": "Name",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true,
              "removed": false
            },
            {
              "id": "Email",
              "displayName": "Email",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true,
              "removed": false
            },
            {
              "id": "Phone number",
              "displayName": "Phone number",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true,
              "removed": false
            },
            {
              "id": "Qualifications",
              "displayName": "Qualifications",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true,
              "removed": false
            },
            {
              "id": "Age:",
              "displayName": "Age:",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true,
              "removed": false
            },
            {
              "id": "State of residence",
              "displayName": "State of residence",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true,
              "removed": false
            },
            {
              "id": "Location",
              "displayName": "Location",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true,
              "removed": false
            },
            {
              "id": "Industry Experience",
              "displayName": "Industry Experience",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true,
              "removed": false
            },
            {
              "id": "Role applying for",
              "displayName": "Role applying for",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true,
              "removed": false
            },
            {
              "id": "Years of Experience",
              "displayName": "Years of Experience",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true,
              "removed": false
            },
            {
              "id": "CV",
              "displayName": "CV",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true,
              "removed": false
            }
          ],
          "attemptToConvertTypes": false,
          "convertFieldsToString": false
        },
        "options": {}
      },
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 4.7,
      "position": [
        -320,
        1840
      ],
      "id": "33956b29-d73e-44cf-884d-9de6c938646d",
      "name": "Create Headers in Job Response form",
      "credentials": {
        "googleSheetsOAuth2Api": {
          "id": "9m6Hp7Bm8FkCftB5",
          "name": "Ousourcing Google Sheets"
        }
      }
    },
    {
      "parameters": {
        "resource": "spreadsheet",
        "title": "={{ $('recruitersInfo').item.json['Name of  Job'] }} - Recruitment Batch",
        "sheetsUi": {
          "sheetValues": [
            {
              "title": "Sample Template"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 4.7,
      "position": [
        -688,
        1616
      ],
      "id": "da25d374-1fa1-4d7a-b1e3-1aef5bf0e80d",
      "name": "Create Response Form Sheet",
      "credentials": {
        "googleSheetsOAuth2Api": {
          "id": "9m6Hp7Bm8FkCftB5",
          "name": "Ousourcing Google Sheets"
        }
      }
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "e9bb4d06-8ed8-42ac-b21a-fb24cb92b295",
              "name": "Application_Form_Name",
              "value": "={{ $json.Application_Form_Name }}",
              "type": "string"
            },
            {
              "id": "55dd57c6-3eef-4b75-94a0-f0a427726cd0",
              "name": "Form Response spreadsheet",
              "value": "={{ $json['Form Response spreadsheet'] }}",
              "type": "string"
            },
            {
              "id": "055edbd6-ba8b-4b7e-b7c4-06f877bc1581",
              "name": "Application Form Sheet ID",
              "value": "={{ $('Set job data').item.json['Application Form Sheet ID'] }}",
              "type": "string"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        384,
        1504
      ],
      "id": "a1de12e3-143e-4514-b81c-6310f73f7e35",
      "name": "Edit Fields2"
    },
    {
      "parameters": {
        "options": {}
      },
      "type": "n8n-nodes-base.removeDuplicates",
      "typeVersion": 2,
      "position": [
        592,
        1504
      ],
      "id": "e8fbbab7-5f57-4e2c-a3d3-ea7bcbe78f2c",
      "name": "Remove Duplicates"
    },
    {
      "parameters": {
        "mode": "raw",
        "jsonOutput": "{\n  \"Timestamp\": null,\n  \"Name\": \"Amanda Rachel\",\n  \"Email\": \"amada@mail.com\",\n  \"Phone number\": \"+234\",\n  \"Academic Qualification\": \"HND\",\n  \"Grade\": \"Lower Credit\",\n  \"Age\": 24,\n  \"Residential Address\": \"1, The Zone\",\n  \"Location\": \"Lagos\",\n  \"Marital status\": \"Single\",\n  \"Gender\": \"Female\",\n  \"Role applying for\": \"Contact Centre\",\n  \"CV\": null,\n  \"Status\": \"Not Checked\",\n  \"AI_Rationale\": null,\n  \"Candidate Tracker\": \"Unscheduled\"\n}",
        "options": {}
      },
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        -624,
        1840
      ],
      "id": "a6629e20-b0fc-466f-93aa-05216342ac7b",
      "name": "Set Sample Form Headers"
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "65e827ee-12d7-4610-9142-fb42bb32bd59",
              "name": "output",
              "value": "={{ $('Extract Qualification logic1').item.json.output }}",
              "type": "array"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        -176,
        1616
      ],
      "id": "de355941-6a24-4fef-9629-427b64ff69fc",
      "name": "Set filter logic from JD"
    },
    {
      "parameters": {
        "fieldToSplitOut": "output",
        "options": {}
      },
      "type": "n8n-nodes-base.splitOut",
      "typeVersion": 1,
      "position": [
        -32,
        1616
      ],
      "id": "42fec2d5-0865-4a36-b776-a4b7001c0385",
      "name": "Split Out JD",
      "alwaysOutputData": false
    },
    {
      "parameters": {
        "options": {
          "reset": false
        }
      },
      "type": "n8n-nodes-base.splitInBatches",
      "typeVersion": 3,
      "position": [
        160,
        1616
      ],
      "id": "92c54bb1-f682-41c0-ba10-b6e1c9d38938",
      "name": "Loop Over JD's",
      "notesInFlow": true,
      "notes": "Loop over the JD if there're multiple roles in the JD"
    },
    {
      "parameters": {
        "operation": "append",
        "documentId": {
          "__rl": true,
          "value": "1rKEFayy4YR2IflqyheuXAO10H1W_HycqAAED0VuuSG4",
          "mode": "list",
          "cachedResultName": "Recruitment JD Upload Tracker - Dashboard",
          "cachedResultUrl": "https://docs.google.com/spreadsheets/d/1rKEFayy4YR2IflqyheuXAO10H1W_HycqAAED0VuuSG4/edit?usp=drivesdk"
        },
        "sheetName": {
          "__rl": true,
          "value": "gid=0",
          "mode": "list",
          "cachedResultName": "Sheet1",
          "cachedResultUrl": "https://docs.google.com/spreadsheets/d/17pvaAKIHmlpiD2uP4FsgucCNvz3VTGC9-tPL9KCDnlg/edit#gid=0"
        },
        "columns": {
          "mappingMode": "defineBelow",
          "value": {
            "Brief_Name": "={{ $('recruitersInfo').item.json['Name of  Job'] }}",
            "Status": "Active",
            "Recruiter_Email": "={{ $('recruitersInfo').item.json['Recruiter Email'] }}",
            "Additional_Requirements": "={{ $('recruitersInfo').item.json['Additional Requirements'] }}",
            "Role_Name": "={{ $json.Role_Name }}",
            "Required_Skills": "={{ $json.Required_Skills }}",
            "Education_Level": "={{ $json.Education_Level }}",
            "Location_Reqs": "={{ $json.Location_Reqs }}",
            "AI_Brief_Text": "={{ $json.AI_Brief_Text }}",
            "Application_Sheet_ID": "={{ $('Set job data').item.json['Application Form Sheet ID'] }}",
            "Recruitment_Type": "={{ $('recruitersInfo').item.json['Recruitment Type'] }}",
            "Grade": "={{ $json.Grade }}",
            "Age": "={{ $json.Age }}"
          },
          "matchingColumns": [],
          "schema": [
            {
              "id": "Brief_Name",
              "displayName": "Brief_Name",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true
            },
            {
              "id": "Status",
              "displayName": "Status",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true
            },
            {
              "id": "Recruiter_Email",
              "displayName": "Recruiter_Email",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true
            },
            {
              "id": "Role_Name",
              "displayName": "Role_Name",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true
            },
            {
              "id": "Required_Skills",
              "displayName": "Required_Skills",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true
            },
            {
              "id": "Education_Level",
              "displayName": "Education_Level",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true
            },
            {
              "id": "Location_Reqs",
              "displayName": "Location_Reqs",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true
            },
            {
              "id": "Recruitment_Type",
              "displayName": "Recruitment_Type",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true,
              "removed": false
            },
            {
              "id": "Age",
              "displayName": "Age",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true,
              "removed": false
            },
            {
              "id": "Grade",
              "displayName": "Grade",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true,
              "removed": false
            },
            {
              "id": "AI_Brief_Text",
              "displayName": "AI_Brief_Text",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true
            },
            {
              "id": "Application_Sheet_ID",
              "displayName": "Application_Sheet_ID",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true
            },
            {
              "id": "Additional_Requirements",
              "displayName": "Additional_Requirements",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true
            }
          ],
          "attemptToConvertTypes": false,
          "convertFieldsToString": false
        },
        "options": {}
      },
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 4.7,
      "position": [
        368,
        1712
      ],
      "id": "8f8f3204-125a-46b9-aceb-e57123de8be7",
      "name": "Append JD logic to tracker",
      "credentials": {
        "googleSheetsOAuth2Api": {
          "id": "9m6Hp7Bm8FkCftB5",
          "name": "Ousourcing Google Sheets"
        }
      }
    },
    {
      "parameters": {
        "content": " ## JD Ingestion Workflow  \n\n**This Workflow Allows recruiters to upload their JD to the engine so it can recognize the JD they want to track and it can have the filtering logic stored in them.**\n\n**Use the Production form for Live Usage.**",
        "height": 336,
        "width": 496,
        "color": 3
      },
      "type": "n8n-nodes-base.stickyNote",
      "position": [
        -2256,
        1536
      ],
      "typeVersion": 1,
      "id": "6b705da7-3aa1-4031-a1df-f1923ef29dcb",
      "name": "Sticky Note"
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "b041d678-96ff-4a5a-9bef-54cba2a8aa28",
              "name": "Application_Form_Name",
              "value": "={{ $('recruitersInfo').item.json['Name of  Job'] }} Response Form ",
              "type": "string"
            },
            {
              "id": "288a3670-286f-40af-8876-8636e46afd94",
              "name": "Form Response spreadsheet",
              "value": "={{ $('Set job data').item.json['Job Form Spreadsheet URL'] }}",
              "type": "string"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        592,
        1712
      ],
      "id": "f4d2d716-96b3-46c9-87a3-7d7ad9345108",
      "name": "Aggregates Form Response Sheet URL"
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "7a4cddd4-a86a-427c-b537-8c537638e313",
              "name": "Upload_JD",
              "value": "jdFile",
              "type": "binary"
            },
            {
              "id": "bcb43423-9423-4e6f-9eb1-f9423bc29ed9",
              "name": "recruiterName",
              "value": "={{ $json.body.recruiterName }}",
              "type": "string"
            },
            {
              "id": "733a4eb6-396c-4333-8316-ec781173abfb",
              "name": "jobName",
              "value": "={{ $json.body.jobName }}",
              "type": "string"
            },
            {
              "id": "678a1cce-edcf-4c12-9430-6929ae05147e",
              "name": "recruiterEmail",
              "value": "={{ $json.body.recruiterEmail }}",
              "type": "string"
            },
            {
              "id": "460acc69-31ff-4d2b-9e29-91637991e825",
              "name": "additionalLogic",
              "value": "={{ $json.body.additionalLogic }}",
              "type": "string"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        -1568,
        1728
      ],
      "id": "3a3436aa-09c9-4c02-850c-fd1a342bdf66",
      "name": "getDocument"
    },
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "dbfeddf2-0f12-4737-a631-7bd366246b36",
        "options": {}
      },
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 2.1,
      "position": [
        -1776,
        1728
      ],
      "id": "dc6436ee-3569-4bad-9981-4a17b672dd73",
      "name": "JD Tracker Webhook",
      "webhookId": "dbfeddf2-0f12-4737-a631-7bd366246b36"
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://outcruit.vercel.app/api/webhooks/notifications",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "type",
              "value": "jd-tracker"
            },
            {
              "name": "message",
              "value": "={{ $('recruitersInfo').item.json['Name of  Job'] }} Brief is successfully Uploaded to the JD Tracker."
            },
            {
              "name": "jobName",
              "value": "=JD Tracker Upload"
            },
            {
              "name": "status",
              "value": "success"
            },
            {
              "name": "recruiterName",
              "value": "={{ $('JD Tracker Webhook').item.json.body.recruiterName }} Uploaded {{ $('recruitersInfo').item.json['Name of  Job'] }}"
            },
            {
              "name": "recruiterEmail",
              "value": "={{ $('JD Tracker Webhook').item.json.body.recruiterEmail }}"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [
        1088,
        1504
      ],
      "id": "28aced0b-c5fa-4a4f-876b-13453bca3deb",
      "name": "JD tracker HTTP Request"
    }
  ],
  "connections": {
    "OpenAI Chat Model2": {
      "ai_languageModel": [
        [
          {
            "node": "Extract Qualification logic1",
            "type": "ai_languageModel",
            "index": 0
          }
        ]
      ]
    },
    "Extract Text from Job Brief Document1": {
      "main": [
        [
          {
            "node": "recruitersInfo",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Extract Qualification logic1": {
      "main": [
        [
          {
            "node": "Create Response Form Sheet",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Send a message": {
      "main": [
        [
          {
            "node": "JD tracker HTTP Request",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "recruitersInfo": {
      "main": [
        [
          {
            "node": "Extract Qualification logic1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Set job data": {
      "main": [
        [
          {
            "node": "Set filter logic from JD",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Create Headers in Job Response form": {
      "main": [
        [
          {
            "node": "Set job data",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Create Response Form Sheet": {
      "main": [
        [
          {
            "node": "Set Sample Form Headers",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Edit Fields2": {
      "main": [
        [
          {
            "node": "Remove Duplicates",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Remove Duplicates": {
      "main": [
        [
          {
            "node": "Send a message",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Set Sample Form Headers": {
      "main": [
        [
          {
            "node": "Create Headers in Job Response form",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Set filter logic from JD": {
      "main": [
        [
          {
            "node": "Split Out JD",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Split Out JD": {
      "main": [
        [
          {
            "node": "Loop Over JD's",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Loop Over JD's": {
      "main": [
        [
          {
            "node": "Edit Fields2",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Append JD logic to tracker",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Append JD logic to tracker": {
      "main": [
        [
          {
            "node": "Aggregates Form Response Sheet URL",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Aggregates Form Response Sheet URL": {
      "main": [
        [
          {
            "node": "Loop Over JD's",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "getDocument": {
      "main": [
        [
          {
            "node": "Extract Text from Job Brief Document1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "JD Tracker Webhook": {
      "main": [
        [
          {
            "node": "getDocument",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "pinData": {
    "JD Tracker Webhook": [
      {
        "headers": {
          "host": "smart-nocode.app.n8n.cloud",
          "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
          "content-length": "86588",
          "accept": "*/*",
          "accept-encoding": "gzip, br",
          "accept-language": "en-US,en;q=0.9",
          "cdn-loop": "cloudflare; loops=1; subreqs=1",
          "cf-connecting-ip": "102.88.110.13",
          "cf-ew-via": "15",
          "cf-ipcountry": "NG",
          "cf-ray": "99acd3af51c979b9-LHR",
          "cf-visitor": "{\"scheme\":\"https\"}",
          "cf-worker": "n8n.cloud",
          "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryB12VufL61pm3pxfy",
          "origin": "https://outcruit.vercel.app",
          "priority": "u=1, i",
          "referer": "https://outcruit.vercel.app/",
          "sec-ch-ua": "\"Chromium\";v=\"142\", \"Google Chrome\";v=\"142\", \"Not_A Brand\";v=\"99\"",
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": "\"Windows\"",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "cross-site",
          "x-forwarded-for": "102.88.110.13, 172.69.194.245",
          "x-forwarded-host": "smart-nocode.app.n8n.cloud",
          "x-forwarded-port": "443",
          "x-forwarded-proto": "https",
          "x-forwarded-server": "traefik-prod-users-gwc-14-5654dfbc89-9dcx2",
          "x-is-trusted": "yes",
          "x-real-ip": "102.88.110.13"
        },
        "params": {},
        "query": {},
        "body": {
          "jobName": "Sarafina Scents Inc.",
          "jdFileName": "Service Associate JD Brief.pdf",
          "additionalLogic": "",
          "recruiterName": "Sarafina",
          "recruiterEmail": "sarafina@workforcegroup.com",
          "recruitment_type": "Outsourcing Recruitment"
        },
        "webhookUrl": "https://smart-nocode.app.n8n.cloud/webhook/dbfeddf2-0f12-4737-a631-7bd366246b36",
        "executionMode": "production"
      }
    ]
  },
  "meta": {
    "templateCredsSetupCompleted": true,
    "instanceId": "5eda6253cf6e15be736e2ee9c71a35a758e29078db7d9b6b887daf232e440c90"
  }
}

