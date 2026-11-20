---
"@elgato/utils": patch
---

Fixed `FileTarget` throwing when a log entry cannot be written, for example because the disk is full or the log file is read-only; the entry is now dropped, and the number of dropped entries is written to the log file once writing succeeds again.
