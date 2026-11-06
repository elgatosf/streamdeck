---
"@elgato/utils": patch
---

Fixed `FileTarget` throwing when a log entry cannot be written:

- A log entry that cannot be written, for example because the disk is full or the log file is read-only, is now dropped instead of throwing; the number of dropped entries is written to the log file once writing succeeds again.
- A failure to rotate the log files, for example when a log file is held open by another process, no longer throws; entries continue to be appended to the current log file, and rotation is retried once the maximum size has been written again.
