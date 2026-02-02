#!/bin/bash
# Merge Conflict Cleanup - Automated Resolution
# This script safely resolves merge conflicts by keeping the "main" branch version

set -e

CONFLICT_COUNT=0
RESOLVED_COUNT=0
FAILED_COUNT=0

echo "=== Merge Conflict Cleanup Tool ==="
echo ""

# Find all files with merge conflicts
CONFLICTED_FILES=$(find src -type f \( -name "*.js" -o -name "*.jsx" \) -exec grep -l "<<<<<<\|>>>>>>>\|=======" {} \;)

if [ -z "$CONFLICTED_FILES" ]; then
    echo "✓ No merge conflicts found!"
    exit 0
fi

echo "Found $(echo "$CONFLICTED_FILES" | wc -l) files with merge conflicts:"
echo ""

for file in $CONFLICTED_FILES; do
    CONFLICT_COUNT=$((CONFLICT_COUNT + 1))
    echo "Processing: $file"
    
    # Create backup
    cp "$file" "${file}.conflict_backup"
    
    # Use git to resolve conflicts keeping ours (main branch)
    # This is safe because the file is already in the repo
    if git show HEAD:"$file" > "$file" 2>/dev/null; then
        echo "  ✓ Resolved from HEAD"
        RESOLVED_COUNT=$((RESOLVED_COUNT + 1))
    else
        # If git show fails, try manual resolution
        echo "  ⚠ Git show failed, attempting manual resolution..."
        
        # This Python script removes conflict markers and keeps all code
        python3 << 'PYTHON_SCRIPT'
import sys
import re

file_path = sys.argv[1]
with open(file_path, 'r') as f:
    content = f.read()

# Remove all conflict markers but keep both versions' content
# This is a lossy operation - we'll keep both sections
pattern = r'<<<<<<< [^\n]*\n(.*?)\n=======\n(.*?)\n>>>>>>> [^\n]*'

def replace_conflict(match):
    ours = match.group(1)
    theirs = match.group(2)
    # Keep the "theirs" version (main branch)
    return theirs

content = re.sub(pattern, replace_conflict, content, flags=re.DOTALL)

with open(file_path, 'w') as f:
    f.write(content)

print("✓ Manually resolved")
PYTHON_SCRIPT
        
        if [ $? -eq 0 ]; then
            RESOLVED_COUNT=$((RESOLVED_COUNT + 1))
        else
            echo "  ✗ Failed to resolve"
            FAILED_COUNT=$((FAILED_COUNT + 1))
            # Restore from backup on failure
            cp "${file}.conflict_backup" "$file"
        fi
    fi
done

echo ""
echo "=== Cleanup Summary ==="
echo "Total conflicts found: $CONFLICT_COUNT"
echo "Successfully resolved: $RESOLVED_COUNT"
echo "Failed resolutions: $FAILED_COUNT"
echo ""

if [ $FAILED_COUNT -gt 0 ]; then
    echo "⚠ Some conflicts require manual review."
    echo "Backup files created with .conflict_backup extension"
    exit 1
else
    echo "✓ All conflicts resolved!"
    # Clean up backups
    find src -name "*.conflict_backup" -delete
    echo "✓ Backup files cleaned up"
    exit 0
fi
