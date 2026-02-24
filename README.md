# 🏗️ AI Interview Intelligence System

Texas A&M University – Mays Business School Hackathon  
Built using AWS Serverless + Generative AI

---

## 🚀 Overview

The AI Interview Intelligence System generates structured, high-quality interview preparation materials from company research.

Users enter a company name and optionally upload documents.  
The system processes the request and generates:

- 📄 Interviewer Brief
- 📘 Pre-Interview Packet for the Interviewee

The entire workflow is powered by AWS serverless infrastructure and Amazon Bedrock.

---

## 🧠 Problem

Preparing for executive interviews requires:
- Manual research
- Competitive analysis
- Structuring intelligent questions
- Identifying assumptions to validate

This system automates that process using AI.

---

## 🏗️ Architecture (Actual Stack Used)

Frontend:
- AWS Amplify (React)

Backend:
- API Gateway (REST endpoints)
- AWS Lambda (Python 3.12)

Storage:
- Amazon S3 (raw input + generated outputs)
- DynamoDB (session metadata + status tracking)

AI:
- Amazon Bedrock (Claude model)

Security:
- IAM roles with least-privilege access

---

## 🔄 End-to-End Workflow

1️⃣ User submits company name (+ optional files) via Amplify frontend  
2️⃣ API Gateway triggers Lambda  
3️⃣ Lambda:
   - Stores metadata in DynamoDB
   - Stores documents in S3
   - Constructs structured prompt
   - Calls Amazon Bedrock  
4️⃣ Bedrock generates:
   - Interviewer Brief
   - Pre-Interview Packet  
5️⃣ Outputs saved to S3  
6️⃣ DynamoDB updated to COMPLETE  
7️⃣ Frontend polls status and enables download  

---

## 📄 Output Structure

### Interviewer Brief
- Company Overview
- Market Context
- AI Assumptions to Verify
- 8–10 Structured Interview Questions
- Suggested Conversation Flow

### Pre-Interview Packet
- Summary of findings
- Areas AI may be wrong
- 6–8 question menu options

---

## 🛠️ Tech Stack

| Layer | Tool |
|-------|------|
| Frontend | AWS Amplify + React |
| API | Amazon API Gateway |
| Compute | AWS Lambda |
| Database | DynamoDB |
| Storage | Amazon S3 |
| AI Model | Amazon Bedrock |
| Security | IAM |

---

