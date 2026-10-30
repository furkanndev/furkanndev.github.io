import tempfile, os, sys, json

sys.path.insert(0, os.path.abspath("repos/furkanndev.github.io/scripts"))
import sync_versions

test_html = os.path.abspath("repos/furkanndev.github.io/index.html")
with tempfile.NamedTemporaryFile("w", delete=False, suffix=".html", encoding="utf-8") as tf:
    with open(test_html, "r", encoding="utf-8") as f:
        tf.write(f.read())
    temp_path = tf.name

try:
    mock_data = {
        "updated_at": "2026-10-30T00:00:00Z",
        "user": {"login": "furkanndev", "public_repos": 22, "followers": 5},
        "repos": {
            "AuraPDF": {
                "repo": "AuraPDF",
                "latest_version": "v2.3.0",
                "download_url": "https://github.com/furkanndev/AuraPDF/releases/download/v2.3.0/AuraPDF_Pro.v2.3.0.exe"
            },
            "KeyStone": {
                "repo": "KeyStone",
                "latest_version": "v2.1.0",
                "download_url": "https://github.com/furkanndev/KeyStone/releases/download/v2.1.0/Keystone.exe"
            },
            "Social-Saver": {
                "repo": "Social-Saver",
                "latest_version": "v1.1",
                "download_url": "https://github.com/furkanndev/Social-Saver/releases/download/v1.1/SocialSaver.zip"
            },
            "DirectoryChangeMonitorService": {
                "repo": "DirectoryChangeMonitorService",
                "latest_version": "v1.0.0",
                "download_url": "https://github.com/furkanndev/DirectoryChangeMonitorService/releases/tag/v1.0.0"
            }
        }
    }

    updated = sync_versions.update_static_html(temp_path, mock_data)
    assert updated, "Expected update_static_html to return True"

    with open(temp_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Verify AuraPDF v2.3.0
    assert "● CH 01 &middot; AURAPDF PRO v2.3.0 &middot; LIVE INTERFACE" in content, "frame-osd failed"
    assert "&bull; AURA PDF PRO v2.3.0 RELEASED" in content, "aurapdf ticker failed"
    assert "AuraPDF Pro v2.3.0 &mdash;" in content, "aurapdf now failed"
    assert "release v2.3.0 pro &bull; win x64" in content, "aurapdf badge failed"
    assert "download v2.3.0 &darr;" in content, "aurapdf download button failed"
    assert "AuraPDF_Pro.v2.3.0.exe" in content, "aurapdf download url failed"
    assert "Desktop Workstation &bull; Python &amp; PyQt6 &bull; v2.3.0" in content, "monitor tag failed"
    assert "DOWNLOAD V2.3.0 &darr;" in content, "monitor download button failed"

    # Verify KeyStone v2.1.0
    assert "KEYSTONE WORKSTATION DEPLOYMENT SUITE v2.1.0" in content, "keystone ticker failed"
    assert "Keystone Platform v2.1.0 &mdash;" in content, "keystone now failed"
    assert "release v2.1.0 &bull; win x64" in content, "keystone badge failed"
    assert "download v2.1.0 &darr;" in content, "keystone download button failed"

    # Verify Social-Saver v1.1
    assert "Social-Saver Pipeline v1.1 &mdash;" in content, "social-saver now failed"
    assert 'data-repo-tag="Social-Saver">v1.1</span>' in content, "social-saver tag pill failed"

    # Verify DirectoryChangeMonitorService v1.0.0 dynamic tag insertion
    assert 'data-repo-tag="DirectoryChangeMonitorService">v1.0.0</span>' in content, "DirectoryChangeMonitorService dynamic tag pill insertion failed"

    # Verify telemetry
    assert '<b data-telemetry="repos">22</b>' in content, "telemetry repos count failed"

    print("[TEST PASSED] All multi-repo updates and dynamic tag insertions verified successfully!")
finally:
    if os.path.exists(temp_path):
        os.remove(temp_path)
