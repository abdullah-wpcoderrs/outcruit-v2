## Workflow Overview

# This workflow helps recruiter to extract job details from job brief document and create a job ad.

## Workflow Steps

1. Extract Text from Job Brief Document
2. Extract Job Facts
3. Structured Parser - Job Info
4. Create Job Ad
5. Send Job Ad to Job Board

## Workflow Nodes

{
  "nodes": [
    {
      "parameters": {
        "promptType": "define",
        "text": "={{ $json.text_JD }}\n\n\n{{ $('Edit Fields1').item.json.jdName }}",
        "hasOutputParser": true,
        "options": {
          "systemMessage": "=Extract all job posting information from the client brief. Extract: job title(s)/role(s), company name, location, job type (full-time/part-time/contract), salary range, required skills, experience level, job description, responsibilities, qualifications, benefits, and any other relevant details. If information is missing, mark it as null.\n\nIf it's a multiple role brief, All the information should be extracted for each role.\n\nOutput ONLY a valid JSON array of job objects. Do not include any other text, markdown, or explanation.\n\n "
        }
      },
      "id": "95813302-0377-418e-8e4f-f5a617f619d5",
      "name": "Extract Job Facts",
      "type": "@n8n/n8n-nodes-langchain.agent",
      "typeVersion": 2.2,
      "position": [
        -368,
        1056
      ]
    },
    {
      "parameters": {
        "jsonSchemaExample": "[\n  {\n    \"jobTitle\": \"Senior Software Engineer\",\n    \"companyName\": \"Tech Corp\",\n    \"location\": \"Remote\",\n    \"jobType\": \"Full-time\",\n    \"salaryRange\": \"$120k-$150k\",\n    \"requiredSkills\": [\"JavaScript\", \"React\", \"Node.js\"],\n    \"experienceLevel\": \"5+ years\",\n    \"jobDescription\": \"We are looking for...\",\n    \"responsibilities\": [\"Develop features\", \"Code reviews\"],\n    \"qualifications\": [\"Bachelor's degree\", \"5+ years experience\"],\n    \"benefits\": [\"Health insurance\", \"401k\"],\n    \"additionalInfo\": null\n  }\n]",
        "autoFix": true
      },
      "id": "1faf43f2-4ecb-4707-84ae-288ed48ecaad",
      "name": "Structured Parser - Job Info",
      "type": "@n8n/n8n-nodes-langchain.outputParserStructured",
      "typeVersion": 1.3,
      "position": [
        -304,
        1296
      ]
    },
    {
      "parameters": {
        "promptType": "define",
        "text": "=Create a compelling job posting ad copy for a job board like Linkedin Jobs and Upwork, based on the following information:\n\n\nJob Data:\nJob Title: {{ $json.jobTitle }}\nCompany: {{ $json.companyName }}\nLocation: {{ $json.location }}\nJob Type: {{ $json.jobType }}\nExperience Level: {{ $json.experienceLevel }}\nSalary Range: {{ $json.salaryRange }}\nJob Description: {{ $json.jobDescription || 'N/A' }}\nResponsibilities: {{ $json.responsibilities ? $json.responsibilities.join('; ') : 'Not specified' }}\nRequired Skills: {{ $json.requiredSkills ? $json.requiredSkills.join(', ') : 'Not specified' }}\nQualifications: {{ $json.qualifications ? $json.qualifications.join('; ') : 'Not specified' }}\nBenefits: {{ $json.benefits ? $json.benefits.join(', ') : 'Competitive benefits package' }}\nAdditional Info: {{ $json.additionalInfo || 'Proactive, innovative, results-oriented mindset required. Must actively man their position.' }}\n\n\nI want a longform Job Ad that is ready to post on Linkedin Jobs, Upwork and other Job Board platforms.\n\n\n",
        "hasOutputParser": true,
        "options": {
          "systemMessage": "=Role\n\nYou are a professional recruitment copywriter AI. Your task is to transform structured job data into a well-formatted, long-form job advert that is ready for Google Docs upload — with clear headings, subheadings, bullet points, and spacing exactly as a human would format it for job boards or internal HR documents.\n\nYour tone should be professional yet human, inclusive, and persuasive, encouraging candidates to apply. Use **British English** throughout.\n\n⚠️ STRICT FORMATTING RULES — VIOLATIONS WILL BE REJECTED ⚠️\n\n- DO NOT USE ANY MARKDOWN SYNTAX (NO **asterisks**, NO #hashes, NO `backticks`, NO ---dashes for headers).\n- Headings must be in TITLE CASE or Sentence Case — NEVER bolded, italicised, or wrapped in symbols.\n- Use double line breaks between sections.\n- Use bullet points with • or - — never with *.\n- No code blocks, no fenced blocks, no HTML tags.\n- Never include “**” or “##” or “>” or any other formatting symbol.\n- Output must be plain text only — suitable for direct paste into Google Docs or Word.\n\nFollow this exact structure:\n\nJOB TITLE AND COMPANY HEADER  \nJOB ROLE- {{ $json.jobTitle }} — {{ $json.companyName}} ({{ $json.location}})  \nJOB TYPE: {{ $json.jobType}} | \nEXPERIENCE: {{ $json.experienceLevel}} | \nSALARY: {{ $json.salaryRange}}\n\nOPENING HOOK  \n(2–3 inspiring sentences about WDCL and the impact of this role.)\n\nABOUT THE ROLE  \n(100–150 words: purpose, scope, reporting, strategic value.)\n\nKEY RESPONSIBILITIES  \n• [Action verb] …  \n• [Action verb] …  \n(3–5 bullets. Infer if missing.)\n\nSKILLS AND QUALIFICATIONS  \n• [Combined from skills + qualifications]\n\nWHAT WE’RE LOOKING FOR  \n(2–3 sentences on mindset: proactive, ownership-driven, innovative.)\n\n\nINCLUSION AND ACCESSIBILITY STATEMENT  \nWestern Development Company Limited (WDCL) is an equal opportunity employer. We welcome applications from all qualified candidates and are committed to providing reasonable adjustments during the recruitment process.\n\nHOW TO APPLY  \nTo apply, please submit your CV and a brief note about your most relevant experience. Applications are reviewed on a rolling basis.\n\n-------------------------------------\n\nSample LINKEDIN JOB POST COPY  Format\n#URGENT #HIRE  \n\nJOB ROLE: {{ $json.jobTitle }}\nINDUSTRY:  \nLOCATION: {{ $json.location }}\nRENUMERATION:  {{ $json.salaryRange }}\nEXPERIENCE:  {{ $json.experienceLevel }}\nREQUIREMENTS: Bachelor’s degree in relevant field  \n\n[200 word compelling summary: highlight impact, key skills, and mission. End with CTA.]\n\n📩 How to Apply: Kindly click on the link below to apply \n\n[Enter Application URL here....] \n\nOnly qualified candidate(s) will be contacted\n\n\nExpected Final Output\n\nJob Board Ad :\n\nLinkedin Job Post Copy :",
          "batching": {
            "batchSize": 1
          }
        }
      },
      "id": "c1d07054-852a-478b-86d4-9be8c06b20c3",
      "name": "Generate Base Ad Copy",
      "type": "@n8n/n8n-nodes-langchain.agent",
      "typeVersion": 2.2,
      "position": [
        384,
        1056
      ]
    },
    {
      "parameters": {
        "jsonSchemaExample": "{\n  \"jobBoardAd\": \"california\",\n  \"linkedinPost\": \"toronto\"\n}"
      },
      "type": "@n8n/n8n-nodes-langchain.outputParserStructured",
      "typeVersion": 1.3,
      "position": [
        448,
        1328
      ],
      "id": "991bd284-b600-4018-829a-c1ab6e15941f",
      "name": "Structured Output Parser"
    },
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
        -144,
        1504
      ],
      "id": "543efe19-172f-4860-9015-a22fd27d9970",
      "name": "OpenAI Chat Model",
      "credentials": {
        "openAiApi": {
          "id": "p7wmXwqQawyZSLdk",
          "name": "OpenAi account"
        }
      }
    },
    {
      "parameters": {
        "folderId": "default",
        "title": "={{ $json['doc name'] }}  Job Post"
      },
      "type": "n8n-nodes-base.googleDocs",
      "typeVersion": 2,
      "position": [
        1200,
        1056
      ],
      "id": "a31bea32-05a9-494f-a920-5a71ff81f8f2",
      "name": "Create a document",
      "credentials": {
        "googleDocsOAuth2Api": {
          "id": "SA8cpxgO4reTGf1Y",
          "name": "Ousourcing Google Docs API"
        }
      }
    },
    {
      "parameters": {
        "operation": "update",
        "documentURL": "={{ $json.id }}",
        "actionsUi": {
          "actionFields": [
            {
              "action": "insert",
              "text": "={{ $('Code in JavaScript').item.json.cleanJobAds }}"
            }
          ]
        }
      },
      "type": "n8n-nodes-base.googleDocs",
      "typeVersion": 2,
      "position": [
        1440,
        1056
      ],
      "id": "83e05c15-20ad-4387-9d7e-00a63ca54127",
      "name": "Update a document",
      "credentials": {
        "googleDocsOAuth2Api": {
          "id": "SA8cpxgO4reTGf1Y",
          "name": "Ousourcing Google Docs API"
        }
      }
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "78964da9-a64f-49b4-92eb-3c1d13a65989",
              "name": "doc name",
              "value": "={{ $('Edit Fields1').item.json.jdName }}",
              "type": "string"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        1024,
        1056
      ],
      "id": "2e1a8b9f-21e6-422f-9cd9-8c32152c9118",
      "name": "Edit Fields"
    },
    {
      "parameters": {
        "operation": "pdf",
        "binaryPropertyName": "Upload_JD",
        "options": {}
      },
      "type": "n8n-nodes-base.extractFromFile",
      "typeVersion": 1,
      "position": [
        -352,
        832
      ],
      "id": "341d840c-3e7a-45a1-897e-685a5b160a78",
      "name": "Extract from File"
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "d9236edc-5dac-433d-a4a3-13970cdbfdfe",
              "name": "text_JD",
              "value": "={{ $json.text }}",
              "type": "string"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        -144,
        832
      ],
      "id": "28bdd15b-9a9a-4914-b8d5-03c6ad4c2457",
      "name": "get text from JD"
    },
    {
      "parameters": {
        "fieldToSplitOut": "output",
        "options": {}
      },
      "type": "n8n-nodes-base.splitOut",
      "typeVersion": 1,
      "position": [
        -16,
        1056
      ],
      "id": "2ee4c6d6-3242-4cb7-b17c-66538afd716a",
      "name": "Split Out"
    },
    {
      "parameters": {
        "fieldsToAggregate": {
          "fieldToAggregate": [
            {
              "fieldToAggregate": "output",
              "renameField": true,
              "outputFieldName": "JobAd"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.aggregate",
      "typeVersion": 1,
      "position": [
        736,
        1056
      ],
      "id": "250dde6a-ee7e-4fcf-9222-8ff97557d397",
      "name": "Aggregate Job Adcopy"
    },
    {
      "parameters": {
        "jsCode": "// Input: array of items from Aggregate node\n// Each item should have a \"jobBoardAd\" and \"linkedinPost\" field\n\nconst aggregatedItems = $input.first().json.JobAd;\n\n// Extract and join all jobBoardAd texts\nconst fullDocText = aggregatedItems\n  .map((item, i) => {\n    const ad = item.jobBoardAd || '';\n    const linkedin = item.linkedinPost || '';\n    return `${ad}\\n\\n---\\n\\n${linkedin}\\n\\n${'='.repeat(80)}\\n`;\n  })\n  .join('\\n\\n');\n\nreturn { json: { cleanJobAds: fullDocText } };"
      },
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        896,
        1056
      ],
      "id": "d82a09d5-4248-4db0-8566-3c3b2564b557",
      "name": "Code in JavaScript"
    },
    {
      "parameters": {
        "model": {
          "__rl": true,
          "value": "claude-opus-4-20250514",
          "mode": "list",
          "cachedResultName": "Claude Opus 4"
        },
        "options": {}
      },
      "type": "@n8n/n8n-nodes-langchain.lmChatAnthropic",
      "typeVersion": 1.3,
      "position": [
        240,
        1264
      ],
      "id": "7f1e1ddb-4018-4582-8475-217eb5ac21f1",
      "name": "Anthropic Chat Model",
      "credentials": {
        "anthropicApi": {
          "id": "BSt912Zp4EHEjwIQ",
          "name": "Anthropic account"
        }
      }
    },
    {
      "parameters": {
        "content": "## Version 1 - .Production Workflow for Outsourcing Job Type\n\n**This version creates individual Job Ads based on difference in roles in a JD.**",
        "height": 1040,
        "width": 3488,
        "color": 6
      },
      "type": "n8n-nodes-base.stickyNote",
      "position": [
        -1072,
        672
      ],
      "typeVersion": 1,
      "id": "17862980-5d88-47e4-83ee-c4fc40e55b2a",
      "name": "Sticky Note"
    },
    {
      "parameters": {
        "sendTo": "={{ $('Edit Fields1').item.json.recruiterEmail }}",
        "subject": "Job AdCopy Generated",
        "emailType": "text",
        "message": "=Hey Recruiter!\n\nYour Job Ad is ready. \n\nYour Linkedin Post Copy:\n\n{{ $json.result.caption }}",
        "options": {
          "appendAttribution": false,
          "attachmentsUi": {
            "attachmentsBinary": [
              {}
            ]
          },
          "ccList": "=abdullah.ajibowu@workforcegroup.com, workforcerecruitment@zonetechpark.com",
          "senderName": "Recruitment Automation"
        }
      },
      "type": "n8n-nodes-base.gmail",
      "typeVersion": 2.1,
      "position": [
        1824,
        1056
      ],
      "id": "22641a49-6480-42ad-9b62-c86532c453b5",
      "name": "Email Alert Notification on Usage of Automation",
      "webhookId": "a5f4fc50-55ab-4dd9-8ef5-e5a7b5eb044f",
      "credentials": {
        "gmailOAuth2": {
          "id": "0nqfVeAnwHQfWjkn",
          "name": "Gmail account"
        }
      }
    },
    {
      "parameters": {
        "operation": "download",
        "fileId": {
          "__rl": true,
          "value": "={{ $('Create a document').item.json.id }}",
          "mode": "id"
        },
        "options": {
          "googleFileConversion": {
            "conversion": {
              "docsToFormat": "application/pdf"
            }
          },
          "fileName": "={{ $('Create a document').item.json.name }}.pdf"
        }
      },
      "type": "n8n-nodes-base.googleDrive",
      "typeVersion": 3,
      "position": [
        1632,
        1056
      ],
      "id": "d2289154-1c4e-4482-8b8c-0adeaf2340da",
      "name": "Download file4",
      "credentials": {
        "googleDriveOAuth2Api": {
          "id": "AS5QSBqowar4xZpH",
          "name": "Ousourcing Google Drive API"
        }
      }
    },
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "70c7fd8d-9888-4e4e-8441-7350696be3d9",
        "options": {}
      },
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 2.1,
      "position": [
        -736,
        832
      ],
      "id": "461208b6-b781-4375-bfc9-5cf4441e2d7e",
      "name": "Create Job  Ads Webhook",
      "webhookId": "70c7fd8d-9888-4e4e-8441-7350696be3d9"
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
              "id": "58ff6e67-86a5-4c20-be24-723676a0695f",
              "name": "jdName",
              "value": "={{ $json.body.jdName }}",
              "type": "string"
            },
            {
              "id": "75556670-8d11-4709-b603-442865b769e6",
              "name": "recruiterName",
              "value": "={{ $json.body.recruiterName }}",
              "type": "string"
            },
            {
              "id": "0a946408-7a19-45bc-80b0-111306145231",
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
        -560,
        832
      ],
      "id": "56b4a8ce-0046-492b-9b75-35cd5074670c",
      "name": "Edit Fields1"
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
              "value": "job-ads"
            },
            {
              "name": "message",
              "value": "={{ $('Edit Fields1').item.json.jdName }} Job Ad copy is ready."
            },
            {
              "name": "jobName",
              "value": "=Job-Ads Posted"
            },
            {
              "name": "status",
              "value": "success"
            },
            {
              "name": "recruiterName",
              "value": "={{ $('Edit Fields1').item.json.recruiterName }} Created  Job Ads copy"
            },
            {
              "name": "recruiterEmail",
              "value": "={{ $('Create Job  Ads Webhook').item.json.body.recruiterEmail }}"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [
        2032,
        1056
      ],
      "id": "447e7c0c-408e-4494-ab33-c75460b6f84d",
      "name": "Job Ad Copy HTTP Request"
    }
  ],
  "connections": {
    "Extract Job Facts": {
      "main": [
        [
          {
            "node": "Split Out",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Structured Parser - Job Info": {
      "ai_outputParser": [
        [
          {
            "node": "Extract Job Facts",
            "type": "ai_outputParser",
            "index": 0
          }
        ]
      ]
    },
    "Generate Base Ad Copy": {
      "main": [
        [
          {
            "node": "Aggregate Job Adcopy",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Structured Output Parser": {
      "ai_outputParser": [
        [
          {
            "node": "Generate Base Ad Copy",
            "type": "ai_outputParser",
            "index": 0
          }
        ]
      ]
    },
    "OpenAI Chat Model": {
      "ai_languageModel": [
        [
          {
            "node": "Extract Job Facts",
            "type": "ai_languageModel",
            "index": 0
          },
          {
            "node": "Structured Parser - Job Info",
            "type": "ai_languageModel",
            "index": 0
          }
        ]
      ]
    },
    "Create a document": {
      "main": [
        [
          {
            "node": "Update a document",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Update a document": {
      "main": [
        [
          {
            "node": "Download file4",
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
            "node": "Create a document",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Extract from File": {
      "main": [
        [
          {
            "node": "get text from JD",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "get text from JD": {
      "main": [
        [
          {
            "node": "Extract Job Facts",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Split Out": {
      "main": [
        [
          {
            "node": "Generate Base Ad Copy",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Aggregate Job Adcopy": {
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
            "node": "Edit Fields",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Anthropic Chat Model": {
      "ai_languageModel": [
        [
          {
            "node": "Generate Base Ad Copy",
            "type": "ai_languageModel",
            "index": 0
          }
        ]
      ]
    },
    "Email Alert Notification on Usage of Automation": {
      "main": [
        [
          {
            "node": "Job Ad Copy HTTP Request",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Download file4": {
      "main": [
        [
          {
            "node": "Email Alert Notification on Usage of Automation",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Create Job  Ads Webhook": {
      "main": [
        [
          {
            "node": "Edit Fields1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Edit Fields1": {
      "main": [
        [
          {
            "node": "Extract from File",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "pinData": {
    "Create Job  Ads Webhook": [
      {
        "headers": {
          "host": "smart-nocode.app.n8n.cloud",
          "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
          "content-length": "86357",
          "accept": "*/*",
          "accept-encoding": "gzip, br",
          "accept-language": "en-US,en;q=0.9",
          "cdn-loop": "cloudflare; loops=1; subreqs=1",
          "cf-connecting-ip": "102.88.115.3",
          "cf-ew-via": "15",
          "cf-ipcountry": "NG",
          "cf-ray": "99b1987fa5eb416d-LHR",
          "cf-visitor": "{\"scheme\":\"https\"}",
          "cf-worker": "n8n.cloud",
          "content-type": "multipart/form-data; boundary=----WebKitFormBoundary8fGZZRFkgKwtQDAV",
          "origin": "http://localhost:3001",
          "priority": "u=1, i",
          "referer": "http://localhost:3001/",
          "sec-ch-ua": "\"Chromium\";v=\"142\", \"Google Chrome\";v=\"142\", \"Not_A Brand\";v=\"99\"",
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": "\"Windows\"",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "cross-site",
          "x-forwarded-for": "102.88.115.3, 172.70.90.130",
          "x-forwarded-host": "smart-nocode.app.n8n.cloud",
          "x-forwarded-port": "443",
          "x-forwarded-proto": "https",
          "x-forwarded-server": "traefik-prod-users-gwc-14-5654dfbc89-pkd5r",
          "x-is-trusted": "yes",
          "x-real-ip": "102.88.115.3"
        },
        "params": {},
        "query": {},
        "body": {
          "jdName": "Stella Creations Inc.",
          "jdFileName": "Service Associate JD Brief.pdf",
          "recruiterName": "Abdullah",
          "recruiterEmail": "abdul@workforcegroup.com"
        },
        "webhookUrl": "https://smart-nocode.app.n8n.cloud/webhook/70c7fd8d-9888-4e4e-8441-7350696be3d9",
        "executionMode": "production"
      }
    ]
  },
  "meta": {
    "templateCredsSetupCompleted": true,
    "instanceId": "5eda6253cf6e15be736e2ee9c71a35a758e29078db7d9b6b887daf232e440c90"
  }
}