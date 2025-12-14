# 🔐 Trust, Privacy, and Platform Considerations

**Aurora OS**

Aurora OS is built on a non-negotiable principle:

> **Your files, your data, your life — always belong to you.**

This document outlines the **technical, ethical, and platform requirements** Aurora must follow to earn and maintain user trust, especially within the Apple ecosystem.

This is not marketing copy.
This is an internal and external contract.

---

## 1. Core Trust Principles (Non-Negotiable)

### 1.1 Local-First by Default

* All user data is stored **locally on the user’s Mac**
* Aurora does **not** require an account to function
* No cloud sync is enabled by default
* No remote servers process user data

If a future feature requires cloud sync, it must be:

* **explicitly opt-in**
* **clearly explained**
* **separately permissioned**

---

### 1.2 User-Owned Data

* Users choose exactly which folders Aurora can access
* Aurora never scans outside user-approved locations
* Users can revoke access at any time via macOS permissions
* Deleting Aurora deletes its local database completely

No dark patterns.
No hidden persistence.

---

### 1.3 Minimal Data Collection

Aurora only stores what it needs to function:

* file paths
* filenames
* timestamps
* lightweight user metadata (quests completed, widget layout)

Aurora **does not** store:

* file contents
* keystrokes
* screenshots
* clipboard data
* application usage outside Aurora
* browser history
* system telemetry unrelated to Aurora

---

## 2. macOS & Apple Platform Requirements

### 2.1 Sandbox Compliance

When distributed via the Mac App Store / TestFlight:

* Aurora runs inside the macOS sandbox
* File access is granted via:

  * folder pickers
  * security-scoped bookmarks
* No blanket filesystem access without user action

Full Disk Access, if ever supported:

* must be optional
* must be clearly labeled as “Advanced”
* must explain *why* it is needed

---

### 2.2 Permission Transparency

Aurora must clearly explain **before requesting permissions**:

* what is being accessed
* why it’s needed
* what is *not* being accessed

Example (acceptable):

> “Aurora indexes the folders you select to help you visually find and resurface files.
> Your files never leave your Mac.”

Unacceptable:

* vague permission requests
* surprise prompts
* technical jargon without explanation

---

### 2.3 App Store Review Safety

Aurora must:

* avoid any behavior that resembles surveillance
* avoid background monitoring unrelated to user action
* avoid ambiguous file access patterns
* avoid hidden analytics or tracking

If Apple reviewers cannot easily understand:

* what Aurora does
* what data it touches
* where that data lives

**The app should not ship.**

---

## 3. No Surveillance, Ever

Aurora is **not**:

* an employee monitoring tool
* a productivity tracker that reports to others
* a behavioral analytics platform
* a “manager dashboard”

Aurora does **not**:

* log activity for third parties
* expose behavior data to employers
* score or rank users
* compare users to each other

Any future enterprise features must:

* be opt-in
* operate locally per user
* never surface personal behavior data to managers by default

---

## 4. Widget & Customization Safety

### 4.1 Widgets Are Read-Only by Default

Widgets:

* display summaries
* surface shortcuts
* prompt small actions

They do **not**:

* execute destructive actions automatically
* batch-modify files
* rename, delete, or move files without confirmation

---

### 4.2 No Implicit Automation

Aurora avoids:

* “smart” actions that guess intent
* auto-organizing files without consent
* background cleanup or restructuring

Every meaningful action requires:

* visibility
* confirmation
* reversibility where possible

---

## 5. Logging, Debugging, and Crash Reports

### 5.1 Safe Logging

Logs must:

* never include file contents
* never include full file paths in plaintext (hash or redact)
* never include user text input verbatim

Logs are for:

* debugging Aurora
* improving stability
* diagnosing crashes

Not for profiling users.

---

### 5.2 Crash Reporting

If crash reporting is enabled:

* it must be opt-in
* it must clearly state what is included
* logs must be reviewable by the user before sending

---

## 6. Emotional & Behavioral Safety

Aurora is intentionally designed to avoid harm.

### 6.1 No Shame Loops

Aurora must not:

* scold users
* use punitive language
* display “failure” states
* weaponize streaks or metrics

Heat maps and quests are:

* informational
* encouraging
* optional

---

### 6.2 ADHD-Safe Design

Aurora avoids:

* excessive notifications
* infinite dashboards
* overwhelming configuration
* pressure-based gamification

Support features prioritize:

* choice
* gentleness
* consent
* reversibility

---

## 7. Security Basics (Must Be Followed)

* Use up-to-date dependencies
* Avoid unsafe Rust patterns
* Validate all file paths
* Never eval or execute user file contents
* Sanitize all inputs crossing JS ↔ Rust boundary
* Keep SQLite local and unexposed

---

## 8. Transparency With Users

Aurora should always provide:

* a clear Privacy & Trust page
* plain-language explanations
* visible controls for permissions
* an easy way to ask questions or report concerns

Trust is not assumed.
It is continuously earned.

---

## 9. Final Principle

Aurora OS exists to **support people**, not extract from them.

If a feature:

* compromises trust
* confuses users about data access
* prioritizes cleverness over clarity
* risks accidental exposure of personal information

**It does not belong in Aurora.**

