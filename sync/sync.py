import os
import yaml # type: ignore
import requests # type: ignore
import hashlib
import json
import re
from pathlib import Path
from typing import Dict, Any, Tuple, Optional, cast, List
from dotenv import load_dotenv # type: ignore

load_dotenv(Path(__file__).parent.parent / ".env.sync")

CONTENT_DIR = Path(os.getenv("CONTENT_DIR", "./content")).expanduser()
API_BASE = os.getenv("WORKERS_API_BASE", "http://localhost:8787")
JWT_TOKEN = os.getenv("ADMIN_JWT_TOKEN") 

def parse_markdown_with_frontmatter(file_path: Path) -> Tuple[Dict[str, Any], str]:
    if not file_path.exists():
        return {}, ""
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content: str = f.read()
    
    match = re.search(r'^---\s*\n(.*?)\n---\s*\n', content, re.DOTALL)
    if match:
        frontmatter_raw = match.group(1)
        try:
            metadata = yaml.safe_load(frontmatter_raw)
            if not isinstance(metadata, dict):
                metadata = {}
        except Exception:
            metadata = {}
            
        # Use full string functions to avoid Pyright indexing errors
        parts = content.split('---', 2)
        if len(parts) >= 3:
             body = parts[2].strip()
        else:
             body = ""
             
        return cast(Dict[str, Any], metadata), str(body)
    
    return {}, content.strip()

def find_assets(text: str) -> List[str]:
    return re.findall(r'!\[.*?\]\((?!http)(.*?)\)', text)

def upload_generic_asset(file_path: Path, key: str) -> bool:
    if not file_path.exists():
        return False
        
    filename = file_path.name
    with open(file_path, 'rb') as f:
        print(f"  📤 Uploading generic asset: {filename} to {key}...")
        try:
            res = requests.post(
                f"{API_BASE}/admin/upload",
                files={'file': (filename, f)},
                data={'key': key},
                headers={"Cookie": f"token={JWT_TOKEN}"},
                timeout=60
            )
            return res.status_code == 200
        except Exception:
            return False

def upload_asset(course_slug: str, file_path: Path, session_slug: Optional[str] = None, is_parent: bool = False) -> bool:
    filename = file_path.name
    if is_parent:
        key = f"courses/{course_slug}/{filename}"
    elif session_slug:
        key = f"courses/{course_slug}/{session_slug}/{filename}"
    else:
        key = f"courses/{course_slug}/{filename}"
    
    with open(file_path, 'rb') as f:
        print(f"  📤 Uploading asset: {file_path.name} to {key}...")
        try:
            res = requests.post(
                f"{API_BASE}/admin/upload",
                files={'file': (filename, f)},
                data={'key': key},
                headers={"Cookie": f"token={JWT_TOKEN}"},
                timeout=60
            )
            return res.status_code == 200
        except Exception:
            return False

def sync_course(course_path: Path):
    index_path = course_path / "index.md"
    meta_path = course_path / "meta.yaml"
    
    course_meta: Dict[str, Any] = {}
    description_body = ""

    if index_path.exists():
        course_meta, description_body = parse_markdown_with_frontmatter(index_path)
    elif meta_path.exists():
        with open(meta_path, 'r', encoding='utf-8') as f:
            course_meta = cast(Dict[str, Any], yaml.safe_load(f) or {})

    if not course_meta:
        return

    slug = course_path.name
    course_meta['slug'] = slug
    course_meta['description_md'] = description_body
    
    assets = find_assets(description_body)
    for asset_path_str in assets:
        if asset_path_str.startswith('../'):
            rel_path = asset_path_str.replace('../', '', 1)
            asset_file = (course_path.parent / rel_path).resolve()
            if asset_file.exists():
                upload_asset(slug, asset_file, is_parent=True)
        else:
            asset_file = (course_path / asset_path_str).resolve()
            if asset_file.exists():
                upload_asset(slug, asset_file)

    sessions: List[Dict[str, Any]] = []
    for session_dir in sorted(course_path.iterdir()):
        if session_dir.is_dir():
            s_content_path = session_dir / "content.md"
            s_meta_path = session_dir / "meta.yaml"
            s_meta: Dict[str, Any] = {}
            content_body = ""
            
            if s_content_path.exists():
                s_meta, content_body = parse_markdown_with_frontmatter(s_content_path)
            elif s_meta_path.exists():
                with open(s_meta_path, 'r', encoding='utf-8') as f:
                    s_meta = cast(Dict[str, Any], yaml.safe_load(f) or {})

            if s_meta or content_body:
                s_meta['slug'] = session_dir.name
                s_meta['content_md'] = content_body
                s_assets = find_assets(content_body)
                for s_asset_path_str in s_assets:
                    if s_asset_path_str.startswith('../'):
                        rel_path = s_asset_path_str.replace('../', '', 1)
                        asset_file = (session_dir.parent / rel_path).resolve()
                        if asset_file.exists():
                            upload_asset(slug, asset_file, is_parent=True)
                    else:
                        asset_file = (session_dir / s_asset_path_str).resolve()
                        if asset_file.exists():
                            upload_asset(slug, asset_file, session_slug=session_dir.name)
                sessions.append(s_meta)

    title = str(course_meta.get('title', slug))
    print(f"🚀 Syncing: {title} ({slug})...")
    try:
        requests.post(
            f"{API_BASE}/admin/sync",
            json={"course": course_meta, "sessions": sessions},
            headers={"Cookie": f"token={JWT_TOKEN}"},
            timeout=30
        )
    except Exception:
        pass

def sync():
    if not CONTENT_DIR.exists():
        return
    favicon_path = CONTENT_DIR / "favicon.png"
    if favicon_path.exists():
        upload_generic_asset(favicon_path, "favicon.png")
    for subdir in ["courses", "downloads"]:
        d_path = CONTENT_DIR / subdir
        if d_path.exists():
            for d in sorted(d_path.iterdir()):
                if d.is_dir():
                    sync_course(d)

if __name__ == "__main__":
    sync()
