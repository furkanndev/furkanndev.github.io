#!/usr/bin/env python3
"""
sync_versions.py - Autonomous Repository & Release Synchronizer
==============================================================
Fetches the latest release tags, release assets, and repository telemetry
from GitHub API for furkanndev repositories. Updates:
  1. data/versions.json (machine-readable snapshot for static cache)
  2. index.html (bakes latest versions into static DOM for zero-JS / SEO)

Runs autonomously via GitHub Actions (.github/workflows/sync-releases.yml)
or manually via CLI.
"""

import os
import re
import sys
import json
import urllib.request
import urllib.error
from datetime import datetime, timezone

GITHUB_USER = "furkanndev"
REPO_OWNER = "furkanndev"

FEATURED_REPOS = [
    "AuraPDF",
    "KeyStone",
    "Social-Saver",
    "DirectoryChangeMonitorService",
    "NavalStrike",
    "HiddenObjectsGame",
    "MatrixManipulator",
    "DealerDistribution",
    "BusPassengerAllocation",
    "IEEE754-Converter"
]

def make_request(url: str, token: str = None):
    headers = {
        "User-Agent": "furkanndev-portfolio-sync/1.0",
        "Accept": "application/vnd.github.v3+json"
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return json.loads(resp.read().decode("utf-8")), resp.headers
    except urllib.error.HTTPError as e:
        if e.code in (403, 404):
            print(f"    [-] HTTP {e.code} for {url} ({e.reason})")
            return None, e.headers
        raise
    except Exception as e:
        print(f"    [-] Request failed for {url}: {e}")
        return None, {}

def fetch_repo_data(existing_data: dict = None, token: str = None):
    print(f"[*] Fetching telemetry for user: {GITHUB_USER}")
    user_info, _ = make_request(f"https://api.github.com/users/{GITHUB_USER}", token)

    prev_repos = existing_data.get("repos", {}) if existing_data else {}
    prev_user = existing_data.get("user", {}) if existing_data else {}
    
    versions_data = {
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "user": {
            "login": GITHUB_USER,
            "public_repos": (user_info.get("public_repos") if user_info else None) or prev_user.get("public_repos", 20),
            "followers": (user_info.get("followers") if user_info else None) or prev_user.get("followers", 2)
        },
        "repos": {}
    }

    # Baseline defaults if completely fresh with no network
    defaults = {
        "AuraPDF": {
            "latest_version": "v2.2.4",
            "release_name": "AuraPDF Pro v2.2.4",
            "download_url": "https://github.com/furkanndev/AuraPDF/releases/download/v2.2.4/AuraPDF_Pro.v2.2.4.exe",
            "asset_name": "AuraPDF_Pro.v2.2.4.exe"
        },
        "KeyStone": {
            "latest_version": "v2.0.1",
            "release_name": "Keystone v2.0.1",
            "download_url": "https://github.com/furkanndev/KeyStone/releases/download/v2.0.1/Keystone.exe",
            "asset_name": "Keystone.exe"
        },
        "Social-Saver": {
            "latest_version": "v1.0",
            "release_name": "Social-Saver v1.0",
            "download_url": "https://github.com/furkanndev/Social-Saver/releases/tag/v1.0",
            "asset_name": None
        }
    }

    for repo_name in FEATURED_REPOS:
        print(f"[*] Checking releases for {repo_name}...")
        prev_entry = prev_repos.get(repo_name, {})
        default_entry = defaults.get(repo_name, {})

        repo_entry = {
            "repo": repo_name,
            "has_release": prev_entry.get("has_release", False),
            "latest_version": prev_entry.get("latest_version") or default_entry.get("latest_version"),
            "release_name": prev_entry.get("release_name") or default_entry.get("release_name"),
            "release_url": prev_entry.get("release_url", f"https://github.com/{REPO_OWNER}/{repo_name}"),
            "download_url": prev_entry.get("download_url") or default_entry.get("download_url"),
            "asset_name": prev_entry.get("asset_name") or default_entry.get("asset_name"),
            "published_at": prev_entry.get("published_at")
        }

        # Try latest release
        try:
            rel, _ = make_request(f"https://api.github.com/repos/{REPO_OWNER}/{repo_name}/releases/latest", token)
            if rel and "tag_name" in rel:
                repo_entry["has_release"] = True
                repo_entry["latest_version"] = rel.get("tag_name")
                repo_entry["release_name"] = rel.get("name") or rel.get("tag_name")
                repo_entry["release_url"] = rel.get("html_url")
                repo_entry["published_at"] = rel.get("published_at")
                
                assets = rel.get("assets", [])
                if assets:
                    first_asset = assets[0]
                    repo_entry["download_url"] = first_asset.get("browser_download_url")
                    repo_entry["asset_name"] = first_asset.get("name")
                else:
                    repo_entry["download_url"] = rel.get("html_url")
        except Exception as e:
            print(f"    [-] Releases query error: {e}")

        # If no formal release found, check git tags
        if not repo_entry["latest_version"]:
            try:
                tags, _ = make_request(f"https://api.github.com/repos/{REPO_OWNER}/{repo_name}/tags", token)
                if tags and len(tags) > 0:
                    latest_tag = tags[0].get("name")
                    repo_entry["latest_version"] = latest_tag
                    repo_entry["release_name"] = f"{repo_name} {latest_tag}"
                    repo_entry["release_url"] = f"https://github.com/{REPO_OWNER}/{repo_name}/releases/tag/{latest_tag}"
            except Exception as e:
                print(f"    [-] Tags query error: {e}")

        versions_data["repos"][repo_name] = repo_entry
        ver = repo_entry["latest_version"] or "none"
        print(f"    [+] Result: {repo_name} => {ver}")

    return versions_data

def update_static_html(html_path: str, versions_data: dict) -> bool:
    """Updates index.html static markup with the latest discovered versions."""
    if not os.path.isfile(html_path):
        print(f"[!] File not found: {html_path}")
        return False

    with open(html_path, "r", encoding="utf-8") as f:
        content = f.read()

    orig_content = content
    repos = versions_data.get("repos", {})

    # AuraPDF updates
    aurapdf = repos.get("AuraPDF", {})
    aurapdf_ver = aurapdf.get("latest_version") or "v2.2.4"
    print(f"[*] Applying AuraPDF version: {aurapdf_ver}")

    # Regex replaces
    # 1. frame-osd: AURAPDF PRO v2.2.x
    content = re.sub(
        r'(<div class="frame-osd"[^>]*>● CH 01 &middot; AURAPDF PRO )v[0-9]+(\.[0-9]+)+',
        rf'\g<1>{aurapdf_ver}',
        content
    )
    # 2. ticker: AURA PDF PRO v2.2.x RELEASED
    content = re.sub(
        r'(&bull; AURA PDF PRO )v[0-9]+(\.[0-9]+)+( RELEASED)',
        rf'\g<1>{aurapdf_ver}\g<3>',
        content
    )
    # 3. now section: AuraPDF Pro v2.2.x &mdash;
    content = re.sub(
        r'(<div class="nt"[^>]*>AuraPDF Pro )v[0-9]+(\.[0-9]+)+',
        rf'\g<1>{aurapdf_ver}',
        content
    )
    # 4. flag card badge: release v2.2.x pro &bull;
    content = re.sub(
        r'(<span class="badge-flag"[^>]*>release )v[0-9]+(\.[0-9]+)+( pro &bull;)',
        rf'\g<1>{aurapdf_ver}\g<3>',
        content
    )
    # 5. repo-tag for AuraPDF
    content = re.sub(
        r'(<span class="repo-ver-tag"[^>]*data-repo-tag="AuraPDF"[^>]*>)v[0-9]+(\.[0-9]+)+',
        rf'\g<1>{aurapdf_ver}',
        content
    )
    # 6. download button for AuraPDF
    content = re.sub(
        r'(<a class="btn"[^>]*data-repo-download="AuraPDF"[^>]*>)download v[0-9]+(\.[0-9]+)+',
        rf'\g<1>download {aurapdf_ver}',
        content
    )
    if aurapdf.get("download_url"):
        content = re.sub(
            r'(<a class="btn"[^>]*href=")[^"]*("[^>]*data-repo-download="AuraPDF")',
            rf'\g<1>{aurapdf["download_url"]}\g<2>',
            content
        )

    # KeyStone updates
    keystone = repos.get("KeyStone", {})
    keystone_ver = keystone.get("latest_version") or "v2.0.1"
    print(f"[*] Applying KeyStone version: {keystone_ver}")

    # 1. flag card badge: version 1.0 / version v2.0.1
    content = re.sub(
        r'(<span class="badge-flag cyan"[^>]*>)(?:version [0-9]+(\.[0-9]+)*|release v[0-9]+(\.[0-9]+)*)',
        rf'\g<1>version {keystone_ver}',
        content
    )
    # 2. now section for Keystone
    content = re.sub(
        r'(<div class="nt"[^>]*>Keystone Platform )(?:v[0-9]+(\.[0-9]+)+ )?',
        rf'\g<1>{keystone_ver} ',
        content
    )
    # 3. ticker for Keystone
    content = re.sub(
        r'(KEYSTONE WORKSTATION DEPLOYMENT SUITE)(?: v[0-9]+(\.[0-9]+)+)?',
        rf'\g<1> {keystone_ver}',
        content
    )
    # 4. repo-tag for KeyStone
    content = re.sub(
        r'(<span class="repo-ver-tag"[^>]*data-repo-tag="KeyStone"[^>]*>)v[0-9]+(\.[0-9]+)+',
        rf'\g<1>{keystone_ver}',
        content
    )
    # 5. download button for KeyStone
    content = re.sub(
        r'(<a class="btn"[^>]*data-repo-download="KeyStone"[^>]*>)download v[0-9]+(\.[0-9]+)+',
        rf'\g<1>download {keystone_ver}',
        content
    )
    if keystone.get("download_url"):
        content = re.sub(
            r'(<a class="btn"[^>]*href=")[^"]*("[^>]*data-repo-download="KeyStone")',
            rf'\g<1>{keystone["download_url"]}\g<2>',
            content
        )

    if content != orig_content:
        with open(html_path, "w", encoding="utf-8") as f:
            f.write(content)
        print("[+] index.html successfully updated with new versions!")
        return True
    else:
        print("[*] index.html is already up-to-date.")
        return False

def main():
    token = os.environ.get("GITHUB_TOKEN")
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    data_dir = os.path.join(base_dir, "data")
    os.makedirs(data_dir, exist_ok=True)
    json_path = os.path.join(data_dir, "versions.json")
    html_path = os.path.join(base_dir, "index.html")

    existing_data = None
    if os.path.isfile(json_path):
        try:
            with open(json_path, "r", encoding="utf-8") as f:
                existing_data = json.load(f)
        except Exception:
            pass

    print(f"[*] Starting Repository & Release Synchronization in {base_dir}")
    versions_data = fetch_repo_data(existing_data, token)

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(versions_data, f, indent=2, ensure_ascii=False)
    print(f"[+] Snapshot written to {json_path}")

    update_static_html(html_path, versions_data)
    print("[+] All synchronizations completed successfully.")

if __name__ == "__main__":
    main()
