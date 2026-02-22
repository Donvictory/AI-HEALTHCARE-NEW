---
description: Steps executed when generating and downloading a health report
---

1. **Context Retrieval**: System fetches user `profile`, last 7-day `checkIns`, and current `driftResult`.
2. **String Interpolation**: Pass data into `generateHealthReport` utility to create a formatted ASCII/Plaintext report.
3. **Blob Creation**: Create a new `Blob` with type `text/plain` from the report string.
4. **URL Generation**: Call `URL.createObjectURL(blob)` to create a temporary download link.
5. **DOM Injection**: Create a virtual `<a>` element, set `href` to the blob URL, and set `download` filename.
6. **Trigger Download**: Programmatically call `a.click()`.
7. **Confirmation**: Trigger `toast.success("Health report downloaded")`.
