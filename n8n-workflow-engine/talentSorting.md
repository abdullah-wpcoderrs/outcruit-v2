## Workflow Overview

# This workflow is triggered by a webhook when a user clicks on the "Sort" button in the talent sorting page.

# Workflow Nodes

{
  "nodes": [
    {
      "parameters": {
        "content": "           ## Outsourcing Applicant Ingestion Workflow Agent\n\n         **Runs on a Schedule and collects data from the Applicant Brief and Loops through Applications.** ",
        "height": 864,
        "width": 3088,
        "color": 4
      },
      "type": "n8n-nodes-base.stickyNote",
      "position": [
        288,
        -1232
      ],
      "typeVersion": 1,
      "id": "d39f5342-df89-4291-936f-d7bf1b318ec2",
      "name": "Sticky Note2"
    },
    {
      "parameters": {
        "workflowId": {
          "__rl": true,
          "value": "xik9SIyoY33HHh4C",
          "mode": "list",
          "cachedResultUrl": "/workflow/xik9SIyoY33HHh4C",
          "cachedResultName": "Outsourcing Candidate Qualifier Engine Subworkflow {LV 2.1a Talent Qualifier Workflow }"
        },
        "workflowInputs": {
          "mappingMode": "defineBelow",
          "value": {},
          "matchingColumns": [],
          "schema": [],
          "attemptToConvertTypes": false,
          "convertFieldsToString": true
        },
        "options": {
          "waitForSubWorkflow": true
        }
      },
      "type": "n8n-nodes-base.executeWorkflow",
      "typeVersion": 1.3,
      "position": [
        2384,
        -816
      ],
      "id": "bf7c39fb-ed82-4787-ad62-52efd8547717",
      "name": "Call 'Workflow Qualifier AGENt'"
    },
    {
      "parameters": {
        "options": {}
      },
      "type": "n8n-nodes-base.splitInBatches",
      "typeVersion": 3,
      "position": [
        1680,
        -960
      ],
      "id": "a627c48c-e136-4ad1-8736-0dede65392c2",
      "name": "Loop Over Applicants1"
    },
    {
      "parameters": {
        "operation": "appendOrUpdate",
        "documentId": {
          "__rl": true,
          "value": "={{ $('Code in JavaScript').item.json.Application_Sheet_ID }}",
          "mode": "id"
        },
        "sheetName": {
          "__rl": true,
          "value": "={{ $('Outsourcing package Applicants + JD Rules1').item.json.responseFormID }}",
          "mode": "id"
        },
        "columns": {
          "mappingMode": "defineBelow",
          "value": {
            "Timestamp": "={{ $json.applicantData.Timestamp }}",
            "Status": "Checked",
            "AI_Rationale": "Role not found"
          },
          "matchingColumns": [
            "Timestamp"
          ],
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
              "removed": true
            },
            {
              "id": "Email",
              "displayName": "Email",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true,
              "removed": true
            },
            {
              "id": "Phone number",
              "displayName": "Phone number",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true,
              "removed": true
            },
            {
              "id": "Academic Qualification",
              "displayName": "Academic Qualification",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true,
              "removed": true
            },
            {
              "id": "Grade",
              "displayName": "Grade",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true,
              "removed": true
            },
            {
              "id": "Age",
              "displayName": "Age",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true,
              "removed": true
            },
            {
              "id": "Residential Address",
              "displayName": "Residential Address",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true,
              "removed": true
            },
            {
              "id": "Location",
              "displayName": "Location",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true,
              "removed": true
            },
            {
              "id": "Marital Status",
              "displayName": "Marital Status",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true,
              "removed": true
            },
            {
              "id": "Gender",
              "displayName": "Gender",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true,
              "removed": true
            },
            {
              "id": "Role Applying For",
              "displayName": "Role Applying For",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true,
              "removed": true
            },
            {
              "id": "CV",
              "displayName": "CV",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true,
              "removed": true
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
              "id": "AI_Rationale",
              "displayName": "AI_Rationale",
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
        2128,
        -560
      ],
      "id": "861d2d94-299d-4bde-8c95-933af88de891",
      "name": "Update Applicant Status",
      "credentials": {
        "googleSheetsOAuth2Api": {
          "id": "9m6Hp7Bm8FkCftB5",
          "name": "Ousourcing Google Sheets"
        }
      }
    },
    {
      "parameters": {
        "jsCode": "// --- Helper function to lowercase all keys ---\n// This turns { \"Role Applying For\": \"Dev\" } into { \"role applying for\": \"Dev\" }\nfunction cleanKeys(obj) {\n  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;\n  return Object.keys(obj).reduce((acc, key) => {\n    acc[key.toLowerCase().trim()] = obj[key];\n    return acc;\n  }, {});\n}\n// ---------------------------------------------\n\n// 1. Get the \"Master List\" of rules\nconst allActiveJobRules = $items(\"Get ALL Active Job Rules\"); \n\n// 2. Get and clean the applicant's data\n// We clean the keys of the applicant data from the input\nconst applicantData = cleanKeys($json); \n\n// 3. Get the applicant's role (using the lowercase key AND lowercase value)\nconst applicantRoleName = (applicantData['role applying for'] || \"\").toLowerCase();\n\n// 4. Find the *one* matching rule from the \"Master List\"\nconst matchingRule = allActiveJobRules.find(item => {\n  // Clean the rule's keys, too\n  const cleanRule = cleanKeys(item.json); \n  \n  // Get the rule's role name (lowercase key AND lowercase value)\n  const ruleRoleName = (cleanRule['role_name'] || \"\").toLowerCase();\n  \n  if (ruleRoleName && applicantRoleName) {\n    // Check if the applicant's role starts with the rule's role name\n    return applicantRoleName.startsWith(ruleRoleName);\n  }\n  return false;\n});\n\n// 5. Assign the rules, or null if no match\nlet roleRules = null;\nif (matchingRule) {\n  roleRules = matchingRule.json; // Pass the ORIGINAL rule object\n}\n\n// 6. Return the packaged object\nreturn {\n  json: {\n    applicantData: $json, // Pass the ORIGINAL applicant data\n    roleRules: roleRules,\n    responseFormID: $('Code in JavaScript').first().json.Application_Sheet_GID\n  }\n};"
      },
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        1936,
        -800
      ],
      "id": "ad8651f5-a6dc-4654-ab95-5ff7a6f51ee3",
      "name": "Outsourcing package Applicants + JD Rules1"
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "f66e2fe7-9139-456b-9cb5-e0c34e0dd0b6",
              "name": "jobName",
              "value": "={{ $json.body.jobName }}",
              "type": "string"
            },
            {
              "id": "ebd20a34-8743-49ec-bcd7-13bb224bd16c",
              "name": "RecruiterName",
              "value": "={{ $json.body.recruiterName }}",
              "type": "string"
            },
            {
              "id": "180463db-d79a-4ffe-85b0-d7bbf6d96acc",
              "name": "applicantSheetUrl",
              "value": "={{ $json.body.responseSheetUrl }}",
              "type": "string"
            },
            {
              "id": "a6349ad4-6795-4f38-a9bf-90ad238fc910",
              "name": "recruiterEmail",
              "value": "={{ $json.body.recruiterEmail }}",
              "type": "string"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        656,
        -960
      ],
      "id": "8cad2e49-427c-45b5-bde7-0832910ca60e",
      "name": "Set Sheet URL"
    },
    {
      "parameters": {
        "jsCode": "const url = $json.applicantSheetUrl || \"\";\nlet fileId = '';\nlet gid = ''; // 1. Add a variable for the GID\n\n// Regex to find the File ID\nconst fileIdRegex = /spreadsheets\\/d\\/([a-zA-Z0-9_-]+)/;\nconst fileIdMatch = url.match(fileIdRegex);\n\nif (fileIdMatch) {\n  fileId = fileIdMatch[1];\n}\n\n// 2. Regex to find the GID (sheet number)\n// This looks for \"gid=\" followed by one or more numbers\nconst gidRegex = /gid=([0-9]+)/;\nconst gidMatch = url.match(gidRegex);\n\nif (gidMatch) {\n  gid = gidMatch[1]; // Get the captured group (the numbers)\n}\n\n// 3. Return *both* the ID and the GID\nreturn {\n  json: {\n    Application_Sheet_ID: fileId,\n    Application_Sheet_GID: gid\n  }\n};"
      },
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        880,
        -960
      ],
      "id": "e65f07f7-4161-4b34-a6a0-da791eeaa6b5",
      "name": "Code in JavaScript"
    },
    {
      "parameters": {
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
          "cachedResultUrl": "https://docs.google.com/spreadsheets/d/1rKEFayy4YR2IflqyheuXAO10H1W_HycqAAED0VuuSG4/edit#gid=0"
        },
        "filtersUI": {
          "values": [
            {
              "lookupColumn": "Status",
              "lookupValue": "Active"
            },
            {
              "lookupColumn": "Recruitment_Type",
              "lookupValue": "Outsourcing Recruitment"
            },
            {
              "lookupColumn": "Application_Sheet_ID",
              "lookupValue": "={{ $json.Application_Sheet_ID }}"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 4.7,
      "position": [
        1120,
        -960
      ],
      "id": "5c31c8c8-5fbb-4b83-a454-9d24d166a973",
      "name": "Get ALL Active Job Rules",
      "credentials": {
        "googleSheetsOAuth2Api": {
          "id": "9m6Hp7Bm8FkCftB5",
          "name": "Ousourcing Google Sheets"
        }
      }
    },
    {
      "parameters": {
        "documentId": {
          "__rl": true,
          "value": "={{ $json.Application_Sheet_ID }}",
          "mode": "id"
        },
        "sheetName": {
          "__rl": true,
          "value": "={{ $('Code in JavaScript').item.json.Application_Sheet_GID }}",
          "mode": "id"
        },
        "filtersUI": {
          "values": [
            {
              "lookupColumn": "Status",
              "lookupValue": "Not Checked"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 4.7,
      "position": [
        1360,
        -960
      ],
      "id": "184c295a-958d-4c31-b55f-9683c3fe42d0",
      "name": "Get Applicants List2",
      "alwaysOutputData": true,
      "credentials": {
        "googleSheetsOAuth2Api": {
          "id": "9m6Hp7Bm8FkCftB5",
          "name": "Ousourcing Google Sheets"
        }
      },
      "onError": "continueRegularOutput"
    },
    {
      "parameters": {
        "conditions": {
          "options": {
            "caseSensitive": true,
            "leftValue": "",
            "typeValidation": "strict",
            "version": 2
          },
          "conditions": [
            {
              "id": "d1861f26-7e6d-4bc1-8379-38c93598e8f9",
              "leftValue": "={{ $json.roleRules }}",
              "rightValue": "",
              "operator": {
                "type": "object",
                "operation": "notEmpty",
                "singleValue": true
              }
            }
          ],
          "combinator": "and"
        },
        "options": {}
      },
      "type": "n8n-nodes-base.if",
      "typeVersion": 2.2,
      "position": [
        2112,
        -800
      ],
      "id": "3f14f3d3-acd4-45bb-a4b1-d1a158afb230",
      "name": "Did We Find Rules"
    },
    {
      "parameters": {
        "operation": "create",
        "documentId": {
          "__rl": true,
          "value": "={{ $items('Code in JavaScript')[0].json.Application_Sheet_ID }}",
          "mode": "id"
        },
        "title": "=Qualified Candidate Tracker {{$now.toFormat(\"yyyy-MM-dd - hh:mm a\")}}",
        "options": {
          "tabColor": "0aa55c"
        }
      },
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 4.7,
      "position": [
        1952,
        -1072
      ],
      "id": "3de8db1a-eaf3-46d8-87ef-abb8a3b41e35",
      "name": "Create 'Passed' Sheet Tab",
      "alwaysOutputData": true,
      "credentials": {
        "googleSheetsOAuth2Api": {
          "id": "9m6Hp7Bm8FkCftB5",
          "name": "Ousourcing Google Sheets"
        }
      },
      "onError": "continueRegularOutput"
    },
    {
      "parameters": {
        "documentId": {
          "__rl": true,
          "value": "={{ $items('Code in JavaScript')[0].json.Application_Sheet_ID }}",
          "mode": "id"
        },
        "sheetName": {
          "__rl": true,
          "value": "={{ $('Code in JavaScript').item.json.Application_Sheet_GID }}",
          "mode": "id"
        },
        "filtersUI": {
          "values": [
            {
              "lookupColumn": "AI_Rationale",
              "lookupValue": "Passed"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 4.7,
      "position": [
        2128,
        -1072
      ],
      "id": "ed0991f5-4eec-4655-a92c-0ff1c4636d5d",
      "name": "Get All Passed Candidates",
      "alwaysOutputData": true,
      "credentials": {
        "googleSheetsOAuth2Api": {
          "id": "9m6Hp7Bm8FkCftB5",
          "name": "Ousourcing Google Sheets"
        }
      },
      "onError": "continueRegularOutput"
    },
    {
      "parameters": {
        "operation": "appendOrUpdate",
        "documentId": {
          "__rl": true,
          "value": "={{ $('Create \\'Passed\\' Sheet Tab').item.json.spreadsheetId }}",
          "mode": "id"
        },
        "sheetName": {
          "__rl": true,
          "value": "={{ $('Create \\'Passed\\' Sheet Tab').item.json.sheetId }}",
          "mode": "id"
        },
        "columns": {
          "mappingMode": "autoMapInputData",
          "value": {},
          "matchingColumns": [
            "Timestamp"
          ],
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
              "id": "Academic Qualification",
              "displayName": "Academic Qualification",
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
              "id": "Residential Address",
              "displayName": "Residential Address",
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
              "id": "Marital Status",
              "displayName": "Marital Status",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true,
              "removed": false
            },
            {
              "id": "Gender",
              "displayName": "Gender",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true,
              "removed": false
            },
            {
              "id": "Role Applying For",
              "displayName": "Role Applying For",
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
            },
            {
              "id": "Status",
              "displayName": "Status",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true,
              "removed": false
            },
            {
              "id": "AI_Rationale",
              "displayName": "AI_Rationale",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true,
              "removed": false
            },
            {
              "id": "Candidate Tracker",
              "displayName": "Candidate Tracker",
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
        2528,
        -1072
      ],
      "id": "4aff6e9c-7b9b-4475-b9eb-1e136734a72b",
      "name": "Append or update row in sheet1",
      "credentials": {
        "googleSheetsOAuth2Api": {
          "id": "9m6Hp7Bm8FkCftB5",
          "name": "Ousourcing Google Sheets"
        }
      }
    },
    {
      "parameters": {
        "sendTo": "=workforcerecruitment@zonetechpark.com",
        "subject": "={{ $('Set Sheet URL').item.json.jobName }} - Qualified Candidates Sheet",
        "message": "=Hey Recruiter,\n<br><br>\n\nHere is the url to the Qualified Candidates on your list.\n\n<br><br>\n\nhttps://docs.google.com/spreadsheets/d/{{ $('Create \\'Passed\\' Sheet Tab').item.json.spreadsheetId }}/edit?gid={{ $('Create \\'Passed\\' Sheet Tab').item.json.sheetId }}\n\n<br><br>\n\nYou can now proceed with the next line of action!\n\nWarm Regards,\n<br>\nAutomation Team.",
        "options": {
          "appendAttribution": false,
          "ccList": "abdullah.ajibowu@workforcegroup.com"
        }
      },
      "type": "n8n-nodes-base.gmail",
      "typeVersion": 2.1,
      "position": [
        2880,
        -1072
      ],
      "id": "725bcfdc-3e25-4636-8e5a-9c7651983158",
      "name": "Send a message",
      "webhookId": "7f69f7a5-898f-4bbd-87bf-8aef2e4afcd6",
      "credentials": {
        "gmailOAuth2": {
          "id": "0nqfVeAnwHQfWjkn",
          "name": "Gmail account"
        }
      }
    },
    {
      "parameters": {
        "aggregate": "aggregateAllItemData",
        "options": {}
      },
      "type": "n8n-nodes-base.aggregate",
      "typeVersion": 1,
      "position": [
        2704,
        -1072
      ],
      "id": "3e580863-a6da-418f-a2c9-0abeab0995b7",
      "name": "Aggregate"
    },
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "bfd4d01a-6644-4749-a583-f16fe7ce25cc",
        "options": {}
      },
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 2.1,
      "position": [
        400,
        -960
      ],
      "id": "8446833b-9440-4e6a-9451-8bdce5188f5d",
      "name": "Talent Sorting Webhook",
      "webhookId": "bfd4d01a-6644-4749-a583-f16fe7ce25cc"
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
              "value": "talent-sorting"
            },
            {
              "name": "message",
              "value": "={{ $('Set Sheet URL').item.json.jobName }} Qualified candidates list is ready."
            },
            {
              "name": "jobName",
              "value": "=Talent Sorting"
            },
            {
              "name": "status",
              "value": "success"
            },
            {
              "name": "recruiterName",
              "value": "={{ $('Set Sheet URL').item.json.RecruiterName }} sorted {{ $('Set Sheet URL').item.json.jobName }} Applicants"
            },
            {
              "name": "recruiterEmail",
              "value": "={{ $('Talent Sorting Webhook').item.json.body.recruiterEmail }}"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [
        3136,
        -1072
      ],
      "id": "bb43129f-aecd-465b-8284-2f13166a3feb",
      "name": "Applicant Sorting HTTP Request"
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "9982746c-f397-4d85-a879-0834aa2fcb7f",
              "name": "row_number",
              "value": "={{ $json.row_number }}",
              "type": "number"
            },
            {
              "id": "18101ee6-ee0e-46e9-a658-ac1cc4dd6c89",
              "name": "Timestamp",
              "value": "={{ $json.Timestamp }}",
              "type": "string"
            },
            {
              "id": "56ae0b7b-01ea-4eeb-980e-f4def44e7032",
              "name": "Name",
              "value": "={{ $json.Name }}",
              "type": "string"
            },
            {
              "id": "3faec27d-d54c-433a-8cf0-065c0f2419c3",
              "name": "Email",
              "value": "={{ $json.Email }}",
              "type": "string"
            },
            {
              "id": "dd19d0c5-7555-49f3-9b7c-17d02cad76ea",
              "name": "Phone number",
              "value": "={{ $json['Phone number'] }}",
              "type": "string"
            },
            {
              "id": "0dfaddc5-94c0-48e5-8338-bb4186caeac1",
              "name": "Academic Qualification",
              "value": "={{ $json['Academic Qualification'] }}",
              "type": "string"
            },
            {
              "id": "552fe340-abaa-4dab-8f2f-ff3cdd3f7eff",
              "name": "Grade",
              "value": "={{ $json.Grade }}",
              "type": "string"
            },
            {
              "id": "2b9e6cda-bd08-42d7-8883-fa31ae35baea",
              "name": "Age",
              "value": "={{ $json.Age }}",
              "type": "number"
            },
            {
              "id": "c345d945-a2f4-4131-8026-fcd65e237297",
              "name": "Residential Address",
              "value": "={{ $json['Residential Address'] }}",
              "type": "string"
            },
            {
              "id": "c6220e28-7401-466b-9ba2-7647a11522a2",
              "name": "Location",
              "value": "={{ $json.Location }}",
              "type": "string"
            },
            {
              "id": "23a56b5e-ad5f-470b-a7e0-7a9fa3cb1eb8",
              "name": "Marital Status",
              "value": "={{ $json['Marital Status'] }}",
              "type": "string"
            },
            {
              "id": "2c39e7fc-5a84-4f64-9680-f14b36f46db5",
              "name": "Gender",
              "value": "={{ $json.Gender }}",
              "type": "string"
            },
            {
              "id": "ddbe64e5-db61-4bbc-bdae-910fb280dd70",
              "name": "Role Applying For",
              "value": "={{ $json['Role Applying For'] }}",
              "type": "string"
            },
            {
              "id": "59f3c9b2-6832-41bc-9b59-1e94c7af40aa",
              "name": "CV",
              "value": "={{ $json.CV }}",
              "type": "string"
            },
            {
              "id": "6907c56f-95cc-4394-9d56-a4cdea408d28",
              "name": "Status",
              "value": "={{ $json.Status }}",
              "type": "string"
            },
            {
              "id": "52356733-0814-40bd-8577-39f606b297d2",
              "name": "Candidate Tracker",
              "value": "Unscheduled",
              "type": "string"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        2336,
        -1072
      ],
      "id": "eaaf5cb7-f856-46f1-8f52-da29c45458f8",
      "name": "Edit Fields"
    }
  ],
  "connections": {
    "Call 'Workflow Qualifier AGENt'": {
      "main": [
        [
          {
            "node": "Loop Over Applicants1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Loop Over Applicants1": {
      "main": [
        [
          {
            "node": "Create 'Passed' Sheet Tab",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Outsourcing package Applicants + JD Rules1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Update Applicant Status": {
      "main": [
        [
          {
            "node": "Loop Over Applicants1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Outsourcing package Applicants + JD Rules1": {
      "main": [
        [
          {
            "node": "Did We Find Rules",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Set Sheet URL": {
      "main": [
        [
          {
            "node": "Code in JavaScript",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Code in JavaScript": {
      "main": [
        [
          {
            "node": "Get ALL Active Job Rules",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Get ALL Active Job Rules": {
      "main": [
        [
          {
            "node": "Get Applicants List2",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Get Applicants List2": {
      "main": [
        [
          {
            "node": "Loop Over Applicants1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Did We Find Rules": {
      "main": [
        [
          {
            "node": "Call 'Workflow Qualifier AGENt'",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Update Applicant Status",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Create 'Passed' Sheet Tab": {
      "main": [
        [
          {
            "node": "Get All Passed Candidates",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Get All Passed Candidates": {
      "main": [
        [
          {
            "node": "Edit Fields",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Append or update row in sheet1": {
      "main": [
        [
          {
            "node": "Aggregate",
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
            "node": "Applicant Sorting HTTP Request",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Aggregate": {
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
    "Talent Sorting Webhook": {
      "main": [
        [
          {
            "node": "Set Sheet URL",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Edit Fields": {
      "main": [
        [
          {
            "node": "Append or update row in sheet1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "pinData": {
    "Talent Sorting Webhook": [
      {
        "headers": {
          "host": "smart-nocode.app.n8n.cloud",
          "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
          "content-length": "243",
          "accept": "*/*",
          "accept-encoding": "gzip, br",
          "accept-language": "en-US,en;q=0.9",
          "cdn-loop": "cloudflare; loops=1; subreqs=1",
          "cf-connecting-ip": "102.88.108.253",
          "cf-ew-via": "15",
          "cf-ipcountry": "NG",
          "cf-ray": "99d664d634387747-LHR",
          "cf-visitor": "{\"scheme\":\"https\"}",
          "cf-worker": "n8n.cloud",
          "content-type": "application/json",
          "origin": "https://outcruit.vercel.app",
          "priority": "u=1, i",
          "referer": "https://outcruit.vercel.app/",
          "sec-ch-ua": "\"Chromium\";v=\"142\", \"Google Chrome\";v=\"142\", \"Not_A Brand\";v=\"99\"",
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": "\"Windows\"",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "cross-site",
          "x-forwarded-for": "102.88.108.253, 172.70.85.162",
          "x-forwarded-host": "smart-nocode.app.n8n.cloud",
          "x-forwarded-port": "443",
          "x-forwarded-proto": "https",
          "x-forwarded-server": "traefik-prod-users-gwc-14-5654dfbc89-9dcx2",
          "x-is-trusted": "yes",
          "x-real-ip": "102.88.108.253"
        },
        "params": {},
        "query": {},
        "body": {
          "recruiterName": "Abdullah",
          "recruiterEmail": "abdul@workforcegroup.com",
          "jobName": "Sarafina Scents Inc.",
          "responseSheetUrl": "https://docs.google.com/spreadsheets/d/1ohLVPWaiEY3O51wG7HxTJHj48lzIu2jAf23I2J2g-84/edit?gid=645573159#gid=645573159"
        },
        "webhookUrl": "https://smart-nocode.app.n8n.cloud/webhook/bfd4d01a-6644-4749-a583-f16fe7ce25cc",
        "executionMode": "production"
      }
    ]
  },
  "meta": {
    "templateCredsSetupCompleted": true,
    "instanceId": "5eda6253cf6e15be736e2ee9c71a35a758e29078db7d9b6b887daf232e440c90"
  }
}

## Subworkflow

{
  "nodes": [
    {
      "parameters": {
        "inputSource": "passthrough"
      },
      "type": "n8n-nodes-base.executeWorkflowTrigger",
      "typeVersion": 1.1,
      "position": [
        -1520,
        -848
      ],
      "id": "153e72a8-653c-4ef8-bc27-927f54401938",
      "name": "When Executed by Another Workflow"
    },
    {
      "parameters": {
        "jsCode": "// --- Helper function to lowercase all keys ---\n// This turns { \"Role Applying For\": \"Dev\" } into { \"role applying for\": \"Dev\" }\nfunction cleanKeys(obj) {\n  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;\n  return Object.keys(obj).reduce((acc, key) => {\n    acc[key.toLowerCase().trim()] = obj[key];\n    return acc;\n  }, {});\n}\n// ---------------------------------------------\n\n// 1. Get the original data and CLEAN THE KEYS for both\nconst applicant = cleanKeys($json.applicantData);\nconst rules = cleanKeys($json.roleRules);\nlet failedOn = [];\n\n// 2. Location Check (now uses lowercase keys)\nconst locRules = (rules['location_reqs'] || \"\").toLowerCase().split(',')\n    .map(r => r.trim()).filter(r => r.length > 0); \n\nif (locRules.length > 0) {\n    // Check all possible location fields, just in case\n    const appState = (applicant['state of residence'] || \"\").toLowerCase().trim();\n    const appLocation = (applicant['location'] || \"\").toLowerCase().trim();\n    const appAddress = (applicant['residential address'] || \"\").toLowerCase().trim();\n    \n    // Combine them all into one string to search\n    const combinedAppLocation = appState + \" \" + appLocation + \" \" + appAddress; \n    \n    const passedLocation = locRules.some(rule => combinedAppLocation.includes(rule));\n    if (!passedLocation) {\n        failedOn.push('Location');\n    }\n}\n\n// 3. Age Check (now uses lowercase keys)\n// This checks for 'min_age' and also 'max_age' or 'age' (as a fallback)\nconst minAge = parseInt(rules['min_age']) || 18;\nconst maxAge = parseInt(rules['max_age'] || rules['age']) || 65; \nconst appAge = parseInt(applicant['age']) || 0;\n\nif (appAge < minAge || appAge > maxAge) {\n    failedOn.push('Age');\n}\n\n// 4. Academic Qualification Check (now uses lowercase keys)\nconst ruleQuals = (rules['education_level'] || \"\").toLowerCase()\n    .replace('/', ',')\n    .split(',')\n    .map(q => q.trim()).filter(q => q.length > 0); \n    \n// Checks all common variations for the applicant's qualification\nconst appQual = (\n    applicant['qualifications'] || \n    applicant['academic qualification'] || \n    applicant['academic qualifications'] || \n    \"\"\n).toLowerCase(); \n\nif (ruleQuals.length > 0 && !ruleQuals.some(q => appQual.includes(q))) {\n    failedOn.push('Qualification');\n}\n\n// 5. Grade Check (now uses lowercase keys)\nconst ruleGrades = (rules['grade'] || \"\").toLowerCase().split(',')\n    .map(g => g.trim()).filter(g => g.length > 0);\n    \nconst appGrade = (applicant['grade'] || \"\").toLowerCase(); \n\nif (ruleGrades.length > 0 && appGrade.length > 0) {\n    // Check: Does the rule string (g) *contain* the applicant's grade (appGrade)?\n    const passedGrade = ruleGrades.some(g => g.includes(appGrade));\n    if (!passedGrade) {\n        failedOn.push('Grade');\n    }\n} else if (ruleGrades.length > 0 && appGrade.length === 0) {\n    // Fail if rules exist but applicant provided no grade\n    failedOn.push('Grade');\n}\n\n// Final Result\nreturn {\n    json: {\n        ...$json, // Pass all original data\n        hardFilterResult: {\n            passed: failedOn.length === 0,\n            failedOn: failedOn\n        }\n    }\n};"
      },
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        -1200,
        -848
      ],
      "id": "75000b35-cc82-445f-a82c-40bc9e541dcd",
      "name": "Run Non-Negotiable Filters"
    },
    {
      "parameters": {
        "conditions": {
          "options": {
            "caseSensitive": true,
            "leftValue": "",
            "typeValidation": "strict",
            "version": 2
          },
          "conditions": [
            {
              "id": "b11ba530-7fc3-4110-ac6d-f1a193f65623",
              "leftValue": "={{ $json.hardFilterResult.passed }}",
              "rightValue": "",
              "operator": {
                "type": "boolean",
                "operation": "true",
                "singleValue": true
              }
            }
          ],
          "combinator": "and"
        },
        "options": {}
      },
      "type": "n8n-nodes-base.if",
      "typeVersion": 2.2,
      "position": [
        -992,
        -848
      ],
      "id": "8f7e5d1b-0638-4f02-b4e2-dc3e8c992c88",
      "name": "Passed Hard Filters"
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "3553d89c-536f-4b17-b0af-64261729d839",
              "name": "Status",
              "value": "Passed",
              "type": "string"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        -704,
        -1008
      ],
      "id": "19771183-6c9f-403b-8bcf-77d3aee189d2",
      "name": "Set Status: Passed"
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "3553d89c-536f-4b17-b0af-64261729d839",
              "name": "Status",
              "value": "Not Qualified",
              "type": "string"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        -688,
        -736
      ],
      "id": "5476952f-1565-4ad1-b87d-fc5068ae4d3e",
      "name": "Set Status: Failed"
    },
    {
      "parameters": {},
      "type": "n8n-nodes-base.merge",
      "typeVersion": 3.2,
      "position": [
        -416,
        -864
      ],
      "id": "1a592c52-2abf-46bf-bde2-0525d9ca36fc",
      "name": "Merge Status Path"
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "803a50dc-fbe4-4eac-9364-adf57f237b6e",
              "name": "Timestamp",
              "value": "={{ $('When Executed by Another Workflow').item.json.applicantData.Timestamp }}",
              "type": "string"
            },
            {
              "id": "b5056a9b-47c3-4faf-aff2-97f5d4a347fa",
              "name": "Status",
              "value": "=Checked",
              "type": "string"
            },
            {
              "id": "1d8342c7-2a63-49c7-a14f-489fdbdd588e",
              "name": "AI_Rationale",
              "value": "={{ $json.Status }}",
              "type": "string"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        -208,
        -864
      ],
      "id": "b1ac6eb4-5a16-402b-9e90-c17ecc8bf1d1",
      "name": "Prepare Final Data"
    },
    {
      "parameters": {
        "operation": "appendOrUpdate",
        "documentId": {
          "__rl": true,
          "value": "={{ $('When Executed by Another Workflow').item.json.roleRules.Application_Sheet_ID }}",
          "mode": "id"
        },
        "sheetName": {
          "__rl": true,
          "value": "={{ $('When Executed by Another Workflow').item.json.responseFormID }}",
          "mode": "id"
        },
        "columns": {
          "mappingMode": "autoMapInputData",
          "value": {},
          "matchingColumns": [
            "Timestamp"
          ],
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
              "canBeUsedToMatch": true
            },
            {
              "id": "Email",
              "displayName": "Email",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true
            },
            {
              "id": "Phone number",
              "displayName": "Phone number",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true
            },
            {
              "id": "Academic Qualification",
              "displayName": "Academic Qualification",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true
            },
            {
              "id": "Grade",
              "displayName": "Grade",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true
            },
            {
              "id": "Age",
              "displayName": "Age",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true
            },
            {
              "id": "Residential Address",
              "displayName": "Residential Address",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true
            },
            {
              "id": "Location",
              "displayName": "Location",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true
            },
            {
              "id": "Marital Status",
              "displayName": "Marital Status",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true
            },
            {
              "id": "Gender",
              "displayName": "Gender",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true
            },
            {
              "id": "Role Applying For",
              "displayName": "Role Applying For",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true
            },
            {
              "id": "CV",
              "displayName": "CV",
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
              "id": "AI_Rationale",
              "displayName": "AI_Rationale",
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
        0,
        -864
      ],
      "id": "5bab2288-2ead-47c3-b6f9-0f9bee0143d7",
      "name": "Update Applicant Status",
      "credentials": {
        "googleSheetsOAuth2Api": {
          "id": "9m6Hp7Bm8FkCftB5",
          "name": "Ousourcing Google Sheets"
        }
      },
      "onError": "continueRegularOutput"
    }
  ],
  "connections": {
    "When Executed by Another Workflow": {
      "main": [
        [
          {
            "node": "Run Non-Negotiable Filters",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Run Non-Negotiable Filters": {
      "main": [
        [
          {
            "node": "Passed Hard Filters",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Passed Hard Filters": {
      "main": [
        [
          {
            "node": "Set Status: Passed",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Set Status: Failed",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Set Status: Passed": {
      "main": [
        [
          {
            "node": "Merge Status Path",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Set Status: Failed": {
      "main": [
        [
          {
            "node": "Merge Status Path",
            "type": "main",
            "index": 1
          }
        ]
      ]
    },
    "Merge Status Path": {
      "main": [
        [
          {
            "node": "Prepare Final Data",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Prepare Final Data": {
      "main": [
        [
          {
            "node": "Update Applicant Status",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "pinData": {
    "When Executed by Another Workflow": [
      {
        "applicantData": {
          "row_number": 2,
          "Timestamp": "11/4/2025 10:31:37",
          "Name": "Omowaire Modupe",
          "Email": "hopetomisin68@gmail.com",
          "Phone number": "09161812438",
          "Academic Qualification": "Hnd",
          "Grade": "Lower Credit",
          "Age": 24,
          "Residential Address": "10, kadiri street, Jibowu Yaba",
          "Location": "Lagos",
          "Marital Status": "Single",
          "Gender": "Male",
          "Role Applying For": "Service Associate",
          "CV": "",
          "Status": "Not Checked"
        },
        "roleRules": {
          "row_number": 2,
          "Brief_Name": "Tola Inc. & Co.",
          "Status": "Active",
          "Recruiter_Email": "sage@mail.com",
          "Role_Name": "Service Associate",
          "Required_Skills": "Microsoft Office (Word, Excel, PowerPoint), Excellent verbal communication skills, Strong interpersonal and relationship-building skills, Customer-service orientation",
          "Education_Level": "BSC/HND",
          "Location_Reqs": "Lagos",
          "Recruitment_Type": "Outsourcing",
          "Age": 27,
          "Grade": "Minimum of Second Class Lower (2:2) for BSC or Lower Credit for HND",
          "AI_Brief_Text": "This role is a dynamic combination of a Bank Teller and a Customer Service Officer. As a Service Associate under Alt Banking, you will be the first point of contact for customers, responsible for handling their financial transactions and ensuring they receive excellent service. Duties include processing financial transactions accurately and efficiently, managing client inquiries and complaints, building client relationships, assisting with onboarding and account processes, collaborating with internal teams, conducting client satisfaction check-ins, and keeping records of interactions.",
          "Application_Sheet_ID": "1QpXLktwd8SyCGdFaQELqUrg8pZ7eaW1CSObl2B-FlQI",
          "Additional_Requirements": ""
        },
        "responseFormID": "2115811796"
      }
    ]
  },
  "meta": {
    "templateCredsSetupCompleted": true,
    "instanceId": "5eda6253cf6e15be736e2ee9c71a35a758e29078db7d9b6b887daf232e440c90"
  }
}