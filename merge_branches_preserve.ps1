# Merge all branches into a temp branch while preserving specific protected files from lakmana-dev
# Usage: Run from repository root in PowerShell: .\merge_branches_preserve.ps1

Set-StrictMode -Version Latest

$protectedPatterns = @('orders','customerorderviewer','brightbuy.sql')
$repoRoot = (git rev-parse --show-toplevel) 2>$null
if (-not $repoRoot) {
    Write-Error "Not a git repository (run this script from inside the repo)."
    exit 1
}

Push-Location $repoRoot

function Get-ProtectedFiles {
    # find files in the repo matching the patterns
    $files = git ls-files | Where-Object {
        $f = $_.ToLower()
        foreach ($p in $protectedPatterns) {
            if ($f -match [regex]::Escape($p.ToLower())) { return $true }
        }
        return $false
    }
    return $files
}

$protectedFiles = Get-ProtectedFiles
Write-Host "Protected files found:`n$($protectedFiles -join "`n")"

$currBranch = git rev-parse --abbrev-ref HEAD
if ($currBranch -ne 'lakmana-dev') {
    Write-Host "Checking out lakmana-dev..."
    git checkout lakmana-dev
}

$tempBranch = 'merge-lakmana-temp'
# Delete temp if exists
if (git show-ref --verify --quiet "refs/heads/$tempBranch") {
    Write-Host "Deleting existing temp branch $tempBranch"
    git branch -D $tempBranch
}

Write-Host "Creating temp branch $tempBranch from lakmana-dev"
git checkout -b $tempBranch

# Build list of branches (local and remote) to merge
$allBranches = git for-each-ref --format='%(refname:short)' refs/heads refs/remotes | Where-Object {
    $_ -notmatch 'HEAD$' -and $_ -ne 'lakmana-dev' -and $_ -ne "origin/lakmana-dev"
}

Write-Host "Branches to attempt merge:`n$($allBranches -join "`n")"

$mergedBranches = @()
$skippedBranches = @()

foreach ($b in $allBranches) {
    # skip if same as current
    if ($b -eq $tempBranch -or $b -eq 'merge-lakmana-temp') { continue }

    Write-Host "---\nAttempting merge of '$b' into $tempBranch"

    # Try merge with recursive -X theirs to favor incoming changes on conflicts
    $mergeCmd = "git merge --no-commit -s recursive -X theirs --no-edit $b"
    Write-Host "Running: $mergeCmd"
    $mergeResult = & git merge --no-commit -s recursive -X theirs --no-edit $b 2>&1
    $mergeExit = $LASTEXITCODE
    Write-Host $mergeResult

    # After merge attempt, restore protected files from lakmana-dev to keep lakmana-dev versions
    if ($protectedFiles.Count -gt 0) {
        Write-Host "Restoring protected files from lakmana-dev..."
        foreach ($pf in $protectedFiles) {
            Write-Host "Restoring: $pf"
            & git checkout lakmana-dev -- $pf 2>$null
        }
        # Stage the protected files so they remain as lakmana-dev's version
        & git add -- $protectedFiles 2>$null
    }

    # Stage all changes to commit
    & git add -A 2>$null

    # Commit the merge. If there is nothing to commit (e.g., already merged), skip.
    try {
        git commit -m "Merge branch '$b' into $tempBranch (preserving protected files)" 2>&1 | Write-Host
        if ($LASTEXITCODE -eq 0) {
            $mergedBranches += $b
            Write-Host "Merged $b successfully"
        } else {
            Write-Host "Nothing to commit or merge produced no changes for $b. Skipping commit."
            git merge --abort 2>$null
            $skippedBranches += $b
        }
    } catch {
        Write-Host "Commit failed for branch $b. Attempting to abort merge and record skip. Error: $_"
        git merge --abort 2>$null
        $skippedBranches += $b
    }
}

Write-Host "---\nMerging temp branch into lakmana-dev"
# Checkout lakmana-dev and merge temp
git checkout lakmana-dev
$mergeIntoMain = & git merge --no-ff $tempBranch -m "Merge merged branches into lakmana-dev (preserving protected files)" 2>&1
Write-Host $mergeIntoMain

# Delete temp branch
Write-Host "Deleting temp branch $tempBranch"
git branch -D $tempBranch 2>$null

Write-Host "---\nSummary"
Write-Host "Merged branches:`n$($mergedBranches -join "`n")"
Write-Host "Skipped/No-op branches:`n$($skippedBranches -join "`n")"
Write-Host "Protected files preserved:`n$($protectedFiles -join "`n")"

Pop-Location

Write-Host "Done. NOTE: No pushes to remote were performed. Review and push when ready."
