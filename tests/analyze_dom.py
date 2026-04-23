import os
import sys
from bs4 import BeautifulSoup

def analyze_file(file_path):
    print(f"\n--- Analyzing {os.path.basename(file_path)} ---")
    if not os.path.exists(file_path):
        print("File not found")
        return

    with open(file_path, 'r', encoding='utf-8') as f:
        html = f.read()
    
    soup = BeautifulSoup(html, 'html.parser')

    # 1. Check for Reviews tab
    print("\n[Search: Reviews Tab]")
    tabs = soup.find_all('button', role='tab')
    print(f"Found {len(tabs)} tabs with role='tab'")
    for i, tab in enumerate(tabs):
        print(f"  Tab {i}: text='{tab.get_text(strip=True)}' aria-label='{tab.get('aria-label')}' class='{tab.get('class')}'")

    # Search for specific text 'Reviews'
    print("\n[Search: Text 'Reviews']")
    reviews_els = soup.find_all(lambda tag: tag.name in ['button', 'div', 'span'] and 'Reviews' in tag.get_text())
    for i, el in enumerate(reviews_els[:10]):
        print(f"  Match {i}: <{el.name} class='{el.get('class')}' aria-label='{el.get('aria-label')}' role='{el.get('role')}'>{el.get_text(strip=True)[:50]}...")

    # 2. Check for Sort button
    print("\n[Search: Sort Button]")
    sort_btns = soup.find_all('button', attrs={'aria-label': lambda x: x and 'Sort' in x})
    print(f"Found {len(sort_btns)} buttons with aria-label containing 'Sort'")
    for i, btn in enumerate(sort_btns):
         print(f"  Btn {i}: aria-label='{btn.get('aria-label')}' class='{btn.get('class')}'")

step1_path = os.path.join(os.getcwd(), 'tests/output/debug/step1_details_overview.html')
step3_path = os.path.join(os.getcwd(), 'tests/output/debug/step3_sort_menu.html')

analyze_file(step1_path)
analyze_file(step3_path)
