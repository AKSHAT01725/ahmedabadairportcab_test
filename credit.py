
import os
import re

website_folder = r"C:\Users\AKSHAT\Desktop\workwithakshat\Git Uploads\ahmedabadairportcab_test"

# Match the developer credit regardless of whether the name is
# inside <a>, <strong>, <b>, or other HTML formatting.
pattern = re.compile(
    r'Developed\s+by\b.*?Akshat\s+Shah.*?(?=All\s+rights\s+reserved)',
    re.IGNORECASE | re.DOTALL
)

total_html = 0
files_with_credit = 0
files_changed = 0
occurrences_removed = 0
changed_files = []

for root, dirs, files in os.walk(website_folder):
    for filename in files:
        if not filename.lower().endswith((".html", ".htm")):
            continue

        total_html += 1
        path = os.path.join(root, filename)

        try:
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()

            matches = list(pattern.finditer(content))

            if not matches:
                continue

            files_with_credit += 1
            updated, count = pattern.subn("", content)

            if updated != content:
                with open(path, "w", encoding="utf-8", newline="") as f:
                    f.write(updated)

                files_changed += 1
                occurrences_removed += count
                changed_files.append(
                    os.path.relpath(path, website_folder)
                )

        except (OSError, UnicodeError) as e:
            print(f"ERROR: {path}: {e}")

print("\n========== FOOTER UPDATE REPORT ==========")
print(f"Total HTML files scanned: {total_html}")
print(f"Files containing matching credit: {files_with_credit}")
print(f"Files changed: {files_changed}")
print(f"Occurrences removed: {occurrences_removed}")

print("\n========== CHANGED FILES ==========")
for filename in changed_files:
    print(f"[CHANGED] {filename}")

print("\nCompleted.")
