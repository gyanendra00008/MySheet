import os
import re
import json

SOURCE_DIR = r"A:\Sheet"
OUTPUT_SRC_META = r"A:\projects\GSheetDSA\src\data\dsa_sheet_metadata.json"
OUTPUT_PUBLIC_META = r"A:\projects\GSheetDSA\public\data\dsa_sheet_metadata.json"
OUTPUT_SOLUTIONS_DIR = r"A:\projects\GSheetDSA\public\data\solutions"
OUTPUT_FULL_SRC = r"A:\projects\GSheetDSA\src\data\dsa_sheet_data.json"

IGNORE_DIRS = {".git", ".vscode", "node_modules", "public", "src", "dist"}
IGNORE_EXTS = {".png", ".jpg", ".jpeg", ".gif", ".svg", ".txt", ".exe", ".pdf", ".zip"}


def slugify(text):
    text = text.lower()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text)
    return text.strip("-")

def clean_title(filename):
    name = os.path.splitext(filename)[0] if filename.endswith(".cpp") else filename
    name = re.sub(r"\s+", " ", name).strip()
    return name

def parse_metadata_from_code(content):
    meta = {
        "leetcodeUrl": None,
        "gfgUrl": None,
        "youtubeUrl": None,
        "companyTags": [],
        "timeComplexity": None,
        "spaceComplexity": None,
        "hasCpp": True,
        "hasJava": False
    }

    # Leetcode link
    lc_match = re.search(r"https?://(?:www\.)?leetcode\.com/problems/[a-zA-Z0-9_-]+/?", content)
    if lc_match:
        meta["leetcodeUrl"] = lc_match.group(0).rstrip("/")
    else:
        alt_lc = re.search(r"https?://(?:www\.)?leetcode\.com/[^\s*\"'<>]+", content)
        if alt_lc:
            meta["leetcodeUrl"] = alt_lc.group(0).rstrip("/")

    # GFG link
    gfg_match = re.search(r"https?://(?:www\.)?(?:practice\.)?geeksforgeeks\.org/[^\s*\"'<>]+", content)
    if gfg_match:
        meta["gfgUrl"] = gfg_match.group(0).rstrip("/")

    # Youtube link
    yt_match = re.search(r"https?://(?:www\.)?(?:youtube\.com/watch\?v=[a-zA-Z0-9_-]+|youtu\.be/[a-zA-Z0-9_-]+)", content)
    if yt_match:
        meta["youtubeUrl"] = yt_match.group(0)

    # Company tags
    comp_match = re.search(r"Company Tags\s*:\s*([^\r\n*]+)", content, re.I)
    if comp_match:
        raw_tags = comp_match.group(1).strip()
        tags = [t.strip() for t in re.split(r"[,;|]+", raw_tags) if t.strip()]
        cleaned_tags = []
        for t in tags:
            t = re.sub(r"[\(\)]", "", t).strip()
            if len(t) > 1 and len(t) < 40 and not t.lower().startswith("very popular"):
                cleaned_tags.append(t)
        meta["companyTags"] = cleaned_tags

    # Time complexity
    tc_match = re.search(r"(?:T\.C|Time Complexity)\s*:\s*([^\r\n*]+)", content, re.I)
    if tc_match:
        meta["timeComplexity"] = tc_match.group(1).strip()

    # Space complexity
    sc_match = re.search(r"(?:S\.C|Space Complexity)\s*:\s*([^\r\n*]+)", content, re.I)
    if sc_match:
        meta["spaceComplexity"] = sc_match.group(1).strip()

    # Java detection
    if "JAVA" in content and ("class Solution" in content or "public int" in content or "public void" in content):
        meta["hasJava"] = True

    return meta

def detect_difficulty(topic_name, filename, content):
    lower_topic = topic_name.lower()
    lower_file = filename.lower()

    if "easy" in lower_topic or "easy" in lower_file:
        return "Easy"
    if "medium" in lower_topic or "medium" in lower_file:
        return "Medium"
    if "hard" in lower_topic or "hard" in lower_file:
        return "Hard"

    diff_match = re.search(r"Difficulty\s*:\s*(Easy|Medium|Hard)", content, re.I)
    if diff_match:
        return diff_match.group(1).capitalize()

    return "Unknown"

def parse_readme_for_titles(readme_path):
    mapping = {}
    if not os.path.exists(readme_path):
        return mapping
    try:
        with open(readme_path, "r", encoding="utf-8", errors="ignore") as f:
            text = f.read()
        matches = re.findall(r'<a\s+href=["\'][^"\']*?/([^"\'/]+(?:\.cpp)?)[^"\']*?["\']\s*>\s*([^<]+)\s*</a>', text)
        for fname, title in matches:
            fname = fname.strip()
            title = re.sub(r"\s+", " ", title).strip()
            mapping[fname] = title
    except Exception:
        pass
    return mapping

def run_import():
    print(f"Scanning source directory: {SOURCE_DIR}")
    if not os.path.exists(SOURCE_DIR):
        print(f"Error: Source directory {SOURCE_DIR} does not exist!")
        return

    os.makedirs(OUTPUT_SOLUTIONS_DIR, exist_ok=True)
    os.makedirs(os.path.dirname(OUTPUT_SRC_META), exist_ok=True)
    os.makedirs(os.path.dirname(OUTPUT_PUBLIC_META), exist_ok=True)

    chapter_entries = sorted(os.listdir(SOURCE_DIR))
    chapters = []
    pdf_notes = []
    all_companies = set()
    global_problem_counter = 0

    # Handle iPad PDF Notes and any PDF notes folders
    for root, dirs, files in os.walk(SOURCE_DIR):
        if any(ign in root.split(os.sep) for ign in IGNORE_DIRS):
            continue
        for f in files:
            if f.lower().endswith(".pdf"):
                rel_path = os.path.relpath(os.path.join(root, f), SOURCE_DIR).replace("\\", "/")
                pdf_notes.append({
                    "id": f"pdf-{slugify(f)}",
                    "title": os.path.splitext(f)[0],
                    "filename": f,
                    "relativePath": rel_path
                })


    chapter_order = 1
    for item in chapter_entries:
        chap_path = os.path.join(SOURCE_DIR, item)
        if not os.path.isdir(chap_path) or item in IGNORE_DIRS or item == "iPad PDF Notes":
            continue

        chap_id = slugify(item)
        chap_name = item.replace("_", " ").title()
        if item.upper() == "DP":
            chap_name = "Dynamic Programming (DP)"
        elif item.upper() == "CSES":
            chap_name = "CSES Problem Set"

        readme_map = parse_readme_for_titles(os.path.join(chap_path, "README.md"))

        topics = []
        topic_order = 1

        sub_items = sorted(os.listdir(chap_path))
        subdirs = [d for d in sub_items if os.path.isdir(os.path.join(chap_path, d))]
        
        direct_files = [f for f in sub_items if os.path.isfile(os.path.join(chap_path, f)) 
                        and not f.lower().endswith(tuple(IGNORE_EXTS)) 
                        and not f.lower() == "readme.md"]

        if direct_files:
            topic_name = "Core & Practice"
            topic_id = f"{chap_id}-core"
            problems = []
            prob_order = 1
            for f in direct_files:
                fpath = os.path.join(chap_path, f)
                try:
                    with open(fpath, "r", encoding="utf-8", errors="ignore") as code_file:
                        content = code_file.read()
                except Exception:
                    content = ""

                meta = parse_metadata_from_code(content)
                for c in meta["companyTags"]:
                    all_companies.add(c)

                clean_prob_title = clean_title(f)
                prob_slug = slugify(clean_prob_title)
                prob_id = f"{chap_id}-{prob_slug}"
                raw_title = readme_map.get(f, clean_prob_title)
                diff = detect_difficulty(topic_name, f, content)

                global_problem_counter += 1
                prob_data = {
                    "id": prob_id,
                    "globalNo": global_problem_counter,
                    "order": prob_order,
                    "title": clean_prob_title,
                    "fullTitle": raw_title,
                    "chapterId": chap_id,
                    "chapterName": chap_name,
                    "topicId": topic_id,
                    "topicName": topic_name,
                    "difficulty": diff,
                    "leetcodeUrl": meta["leetcodeUrl"],
                    "gfgUrl": meta["gfgUrl"],
                    "youtubeUrl": meta["youtubeUrl"],
                    "companyTags": meta["companyTags"],
                    "timeComplexity": meta["timeComplexity"],
                    "spaceComplexity": meta["spaceComplexity"],
                    "hasCpp": meta["hasCpp"],
                    "hasJava": meta["hasJava"],
                    "sourcePath": f"{item}/{f}"
                }
                problems.append(prob_data)

                # Save individual solution file for instant on-demand viewing
                sol_obj = {
                    **prob_data,
                    "code": content
                }
                sol_path = os.path.join(OUTPUT_SOLUTIONS_DIR, f"{prob_id}.json")
                with open(sol_path, "w", encoding="utf-8") as sol_f:
                    json.dump(sol_obj, sol_f)

                prob_order += 1

            if problems:
                topics.append({
                    "id": topic_id,
                    "name": topic_name,
                    "order": topic_order,
                    "totalProblems": len(problems),
                    "problems": problems
                })
                topic_order += 1

        for subdir in subdirs:
            sub_path = os.path.join(chap_path, subdir)
            sub_readme_map = parse_readme_for_titles(os.path.join(sub_path, "README.md"))
            
            topic_files = []
            for root, dirs, files in os.walk(sub_path):
                for f in sorted(files):
                    if not f.lower().endswith(tuple(IGNORE_EXTS)) and not f.lower() == "readme.md":
                        rel_sub = os.path.relpath(os.path.join(root, f), chap_path).replace("\\", "/")
                        topic_files.append((f, os.path.join(root, f), rel_sub))

            if not topic_files:
                continue

            topic_clean_name = subdir.replace("_", " ")
            topic_id = f"{chap_id}-{slugify(subdir)}"
            problems = []
            prob_order = 1

            for f, full_fpath, rel_sub in topic_files:
                try:
                    with open(full_fpath, "r", encoding="utf-8", errors="ignore") as code_file:
                        content = code_file.read()
                except Exception:
                    content = ""

                meta = parse_metadata_from_code(content)
                for c in meta["companyTags"]:
                    all_companies.add(c)

                clean_prob_title = clean_title(f)
                prob_slug = slugify(clean_prob_title)
                prob_id = f"{chap_id}-{slugify(subdir)}-{prob_slug}"
                raw_title = sub_readme_map.get(f, readme_map.get(f, clean_prob_title))
                diff = detect_difficulty(subdir, f, content)

                global_problem_counter += 1
                prob_data = {
                    "id": prob_id,
                    "globalNo": global_problem_counter,
                    "order": prob_order,
                    "title": clean_prob_title,
                    "fullTitle": raw_title,
                    "chapterId": chap_id,
                    "chapterName": chap_name,
                    "topicId": topic_id,
                    "topicName": topic_clean_name,
                    "difficulty": diff,
                    "leetcodeUrl": meta["leetcodeUrl"],
                    "gfgUrl": meta["gfgUrl"],
                    "youtubeUrl": meta["youtubeUrl"],
                    "companyTags": meta["companyTags"],
                    "timeComplexity": meta["timeComplexity"],
                    "spaceComplexity": meta["spaceComplexity"],
                    "hasCpp": meta["hasCpp"],
                    "hasJava": meta["hasJava"],
                    "sourcePath": f"{item}/{rel_sub}"
                }
                problems.append(prob_data)

                sol_obj = {
                    **prob_data,
                    "code": content
                }
                sol_path = os.path.join(OUTPUT_SOLUTIONS_DIR, f"{prob_id}.json")
                with open(sol_path, "w", encoding="utf-8") as sol_f:
                    json.dump(sol_obj, sol_f)

                prob_order += 1

            if problems:
                topics.append({
                    "id": topic_id,
                    "name": topic_clean_name,
                    "order": topic_order,
                    "totalProblems": len(problems),
                    "problems": problems
                })
                topic_order += 1

        total_chap_problems = sum(t["totalProblems"] for t in topics)
        if total_chap_problems > 0:
            chapters.append({
                "id": chap_id,
                "name": chap_name,
                "folderName": item,
                "order": chapter_order,
                "totalTopics": len(topics),
                "totalProblems": total_chap_problems,
                "topics": topics
            })
            chapter_order += 1

    metadata_dataset = {
        "metadata": {
            "title": "Personal DSA Sheet - Striver-Style Progress Tracker",
            "sourceDirectory": SOURCE_DIR,
            "totalChapters": len(chapters),
            "totalTopics": sum(len(c["topics"]) for c in chapters),
            "totalProblems": global_problem_counter,
            "totalPdfNotes": len(pdf_notes),
            "allCompanies": sorted(list(all_companies)),
            "generatedAt": "2026-09-21T14:52:00+05:30"
        },
        "chapters": chapters,
        "pdfNotes": pdf_notes
    }

    with open(OUTPUT_PUBLIC_META, "w", encoding="utf-8") as f:
        json.dump(metadata_dataset, f, indent=2)

    print(f"Successfully generated DSA Sheet dataset!")
    print(f"Chapters: {len(chapters)}")
    print(f"Topics: {sum(len(c['topics']) for c in chapters)}")
    print(f"Problems: {global_problem_counter}")
    print(f"PDF Notes: {len(pdf_notes)}")
    print(f"Unique Companies: {len(all_companies)}")
    print(f"Metadata file saved: {OUTPUT_PUBLIC_META}")
    print(f"Solutions directory populated: {OUTPUT_SOLUTIONS_DIR}")

if __name__ == "__main__":
    run_import()
