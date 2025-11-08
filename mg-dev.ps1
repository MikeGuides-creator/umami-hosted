<#  mg-dev.ps1 — MikeGuides helper
    Safe wrapper around the 5 git things you actually need.
#>

function Die($msg){ Write-Host "`nERROR: $msg" -ForegroundColor Red; exit 1 }

# 0) Must be inside a git repo
$inside = (& git rev-parse --is-inside-work-tree 2>$null)
if ($LASTEXITCODE -ne 0 -or "$inside" -ne "true") {
  Die "Not inside a git repo. Open the repo folder first (e.g., C:\Users\Diamo\Documents\mikeguides-blog-v3)."
}

# 1) Repo facts
$root     = (& git rev-parse --show-toplevel).Trim()
$branch   = (& git rev-parse --abbrev-ref HEAD).Trim()
$remote   = (& git remote 2>$null) -join ', '
$tracking = (& git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>$null)

Write-Host "Repo: $root" -ForegroundColor Cyan
Write-Host "Branch: $branch" -ForegroundColor Cyan
Write-Host "Remote(s): $remote" -ForegroundColor Cyan
if ($tracking) { Write-Host "Tracking: $tracking" -ForegroundColor Cyan } else { Write-Host "Tracking: (none)" -ForegroundColor Yellow }

function Menu {
@"
Choose:
  [1] Where am I? (status & remotes)
  [2] Safe Sync (fetch → rebase → push)
  [3] Fix Stuck Rebase (continue/abort, with guidance)
  [4] Show Remotes & Default Branch
  [5] New Blog Post Scaffold (static HTML)
  [Q] Quit
"@
}

function WhereAmI {
  Write-Host "`n=== STATUS ===" -ForegroundColor Green
  git status
}

function SafeSync {
  Write-Host "`n=== FETCH ===" -ForegroundColor Green
  git fetch origin

  # figure default remote branch
  $default = (& git symbolic-ref refs/remotes/origin/HEAD 2>$null) -replace '^refs/remotes/origin/',''
  if (-not $default) { $default = "main" } # fallback

  Write-Host "Rebasing onto origin/$default ..." -ForegroundColor Green
  git pull --rebase origin $default
  if ($LASTEXITCODE -ne 0) {
    Write-Host "Rebase hit conflicts. Run option [3] to resolve." -ForegroundColor Yellow
    return
  }

  Write-Host "`n=== PUSH ===" -ForegroundColor Green
  git push
}

function FixRebase {
  Write-Host "`n=== REBASE FIX ===" -ForegroundColor Green
  Write-Host "Current rebase state:" -ForegroundColor Yellow
  git status

  Write-Host @"
Steps if conflicted:
  a) Open the file(s) marked 'both modified', resolve markers <<<<<<< ======= >>>>>>>.
  b) git add <file> for each fixed file.
  c) git rebase --continue
If you want to bail out completely:
  git rebase --abort
"@ -ForegroundColor Gray
}

function ShowRemotes {
  Write-Host "`n=== REMOTES ===" -ForegroundColor Green
  git remote -v
  $head = (& git symbolic-ref refs/remotes/origin/HEAD 2>$null) -replace '^refs/remotes/origin/',''
  if ($head) { Write-Host "origin default branch: $head" -ForegroundColor Cyan }
}

function NewPost {
  $slug = Read-Host "Slug (letters-dashes, e.g., my-first-post)"
  if (-not $slug) { Write-Host "Cancelled."; return }
  $title = Read-Host "Title"
  if (-not $title) { $title = $slug -replace '-', ' ' }

  $postsDir = Join-Path $root "posts"
  if (-not (Test-Path $postsDir)) { New-Item -ItemType Directory -Path $postsDir | Out-Null }

  $d = Get-Date -Format "yyyy-MM-dd"
  $file = Join-Path $postsDir "$d-$slug.html"
  @"
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>$title – MikeGuides Blog</title>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <link rel="stylesheet" href="./../assets/css/site.css">
</head>
<body>
  <header class="site-header">
    <a class="brand" href="./../">Blog Home</a>
    <nav><a href="https://mikeguides.co" target="_blank" rel="noopener">Main Site</a></nav>
  </header>
  <main id="content" class="container">
    <article class="post">
      <h1>$title</h1>
      <p class="text-slate-600">Published $d</p>
      <p>Write your post here…</p>
    </article>
  </main>
</body>
</html>
"@ | Set-Content -Encoding UTF8 $file

  Write-Host "Created: $file" -ForegroundColor Green
  Write-Host "Next: git add -A; git commit -m 'Post: $title'; git push" -ForegroundColor Gray
}

while ($true) {
  Menu
  $choice = Read-Host "Select"
  switch ($choice.ToUpper()) {
    '1' { WhereAmI }
    '2' { SafeSync }
    '3' { FixRebase }
    '4' { ShowRemotes }
    '5' { NewPost }
    'Q' { break }
    default { Write-Host "Invalid choice." -ForegroundColor Yellow }
  }
}
