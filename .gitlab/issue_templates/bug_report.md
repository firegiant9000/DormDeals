---
name: Bug Report
about: Create a report to help us improve DormDeals
title: '[BUG] '
labels: 'bug'
assignees: ''
---

## 🐛 Bug Report

### Bug Information
- **Bug ID**: BUG-YYYY-MM-DD-XXX
- **Date Reported**: [Date]
- **Reporter**: [Your Name]
- **Severity**: [ ] Critical [ ] High [ ] Medium [ ] Low
- **Priority**: [ ] Critical [ ] High [ ] Medium [ ] Low
- **Component**: [ ] Frontend [ ] Backend [ ] Database [ ] UI/UX
- **Browser**: [Browser and version, e.g., Chrome 120.0.6099.109]
- **Device**: [Device type and screen size, e.g., Desktop 1920x1080, iPhone 12 390x844]
- **Operating System**: [e.g., Windows 11, macOS 14.1, Ubuntu 22.04]

### Bug Description
**Brief Summary**: 
[One-line description of the bug]

**Detailed Description**:
[Detailed description of what the bug is and how it affects the user experience]

### Test Case Information
**Test Case ID**: TC-[COMPONENT]-[NUMBER]
**Test Case Name**: [Name of the test case that failed]
**Test Type**: [ ] Functional [ ] UI [ ] Performance [ ] Security [ ] Integration

### Steps to Reproduce
1. [Step 1 - Be specific about what you did]
2. [Step 2 - Include any data entered]
3. [Step 3 - Include any clicks or interactions]
4. [Step 4 - Continue until the bug occurs]

### Expected Result
[Describe what should happen when following the steps above]

### Actual Result
[Describe what actually happens instead]

### Environment Details
- **Application Version**: [Version number]
- **Frontend URL**: [e.g., http://localhost:5173]
- **Backend URL**: [e.g., http://localhost:3001]
- **Database**: [Database type and version]
- **Node.js Version**: [Version]
- **npm Version**: [Version]

### Screenshots/Videos
**Screenshots**:
<!-- Drag and drop screenshots here or use the image upload -->
- [ ] Screenshot 1: [Description of what the screenshot shows]
- [ ] Screenshot 2: [Description of what the screenshot shows]

**Videos**:
<!-- Attach video files if the bug involves animations or complex interactions -->
- [ ] Video 1: [Description of what the video shows]

### Console Logs
**Browser Console Errors**:
```
[Paste any console errors here]
```

**Network Tab Issues**:
```
[Paste any failed network requests here]
```

### Additional Information
**Frequency**: [ ] Always [ ] Sometimes [ ] Rarely [ ] Once
**Workaround**: [Is there a way to work around this issue?]
**Related Issues**: [Link to any related issues]
**User Impact**: [How does this affect users?]

### Test Data Used
**Test User**: [If applicable, which test user account was used]
**Test Items**: [If applicable, which test items were used]
**Test Data**: [Any specific data that was entered]

### Regression Testing
**Was this working before?**: [ ] Yes [ ] No [ ] Unknown
**When did it last work?**: [Date or version]
**Recent Changes**: [Any recent changes that might have caused this]

### Acceptance Criteria
**Definition of Done**:
- [ ] Bug is reproduced consistently
- [ ] Root cause is identified
- [ ] Fix is implemented
- [ ] Fix is tested
- [ ] No regression in related functionality
- [ ] Documentation is updated (if needed)

### Labels
<!-- Add relevant labels -->
- [ ] bug
- [ ] frontend
- [ ] backend
- [ ] ui-ux
- [ ] critical
- [ ] high-priority
- [ ] medium-priority
- [ ] low-priority
- [ ] needs-investigation
- [ ] needs-design-review
- [ ] needs-dev-review

### Assignees
<!-- Assign to appropriate team members -->
- **QA Lead**: [Name]
- **Developer**: [Name]
- **Designer**: [Name] (if UI/UX related)

### Checklist
Before submitting this bug report, please ensure:
- [ ] I have searched for existing issues to avoid duplicates
- [ ] I have provided clear steps to reproduce the issue
- [ ] I have included relevant screenshots or videos
- [ ] I have tested this on multiple browsers/devices (if applicable)
- [ ] I have checked the browser console for errors
- [ ] I have provided all required information

### Additional Notes
[Any other information that might be helpful for developers to understand and fix the bug]

---

## 📋 Test Case Format Reference

### Standard Test Case Template
```
Test Case ID: TC-XXX-XXX
Test Case Name: [Brief description of what is being tested]
Priority: [High/Medium/Low]
Component: [Frontend/Backend/Database/Integration]
Test Type: [Functional/UI/Performance/Security]

Preconditions:
- [List any setup requirements]

Test Steps:
1. [Step 1]
2. [Step 2]
3. [Step 3]

Expected Result:
[What should happen]

Actual Result:
[What actually happened - to be filled during testing]

Status: [Pass/Fail/Blocked]
Notes: [Any additional observations]
```

### Example Test Case
```
Test Case ID: TC-AUTH-001
Test Case Name: User Login with Valid Credentials
Priority: High
Component: Frontend
Test Type: Functional

Preconditions:
- User account exists in database
- Application is running
- User is on login page

Test Steps:
1. Enter valid email address
2. Enter valid password
3. Click "Login" button

Expected Result:
- User is redirected to dashboard
- Welcome message is displayed
- User session is established

Actual Result:
[To be filled during testing]

Status: [Pass/Fail/Blocked]
Notes: [Any additional observations]
```

---

**Note**: This bug report template should be used for all bug reports to ensure consistency and completeness. Please fill out all relevant sections and provide as much detail as possible to help the development team understand and fix the issue.
