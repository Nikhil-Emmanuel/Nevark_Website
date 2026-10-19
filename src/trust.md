---
layout: layouts/legal.njk
permalink: /trust.html
title: Trust & Security
heroEyebrow: Trust Center
description: How Nevark Technologies protects client data, the providers we rely on, our compliance position and how to report a security issue.
updated: 2026-10-19
breadcrumbs: [{ name: "Home", url: "/" }, { name: "Trust & Security", url: "/trust" }]
---
Our clients trust us with live plant data, project IP and personal information. This page explains, plainly, how we look after it.

## How We Protect Data

- **Encryption in Transit** – every page and form on nevark.in is served over HTTPS with HTTP Strict Transport Security.
- **Hardened Website** – a strict Content Security Policy, no third-party scripts beyond privacy-preserving traffic statistics, and protection against clickjacking and content sniffing.
- **Restricted Access** – project data is kept in controlled environments and is accessible only to the internal team working on that engagement.
- **Data Minimisation** – our forms ask only for what we need to reply, and we don't sell or share personal data.
- **Confidentiality** – client data, documents and ideas are handled with strict confidentiality, as set out in our [Terms](/terms-condition).

## Service Providers

| Provider | What It Does for Us |
| --- | --- |
| Netlify | Hosts this website |
| Cloudflare | Content delivery, DDoS protection, cookie-free traffic statistics |
| FormSubmit | Delivers website form submissions to our inbox |
| Google Workspace / Forms | Business email and the custom PC build request form |

## Compliance

- **Recognised by DPIIT** under the Government of India's Startup India initiative{% if site.legal.dpiitCertificate %} (certificate {{ site.legal.dpiitCertificate }}){% endif %}.
- Registered as a Limited Liability Partnership with the Ministry of Corporate Affairs{% if site.legal.llpin %} (LLPIN {{ site.legal.llpin }}){% endif %}.
- Personal data is handled in line with the **Digital Personal Data Protection Act, 2023**. Read our [Privacy Policy](/privacy).

<h2 id="disclosure">Responsible Disclosure</h2>


If you believe you've found a security vulnerability on nevark.in or in a Nevark product, please email **[{{ site.securityContact }}](mailto:{{ site.securityContact }}?subject=Security%20report)** with the details and steps to reproduce. We will acknowledge your report, keep you updated, and credit you if you wish. Please give us reasonable time to fix the issue before disclosing it, and don't access or modify data that isn't yours. Our machine-readable contact is at [/.well-known/security.txt](/.well-known/security.txt).

## Questions

Procurement or security questionnaire? Email [{{ site.email }}](mailto:{{ site.email }}) and we'll get back to you promptly.
