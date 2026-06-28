#!/usr/bin/env python3
"""
スプライト差し替えツール。
旧ファイルを _archive/ に退避してから新ファイルを処理（緑/白背景除去）して配置する。

使い方:
  python3 scripts/replace_sprite.py <新ファイル.png> <配置先パス>

例:
  python3 scripts/replace_sprite.py ~/Downloads/new_fruit.png \
      public/assets/sprites/extracted/enemy_fruit/idle.png
"""

import sys, shutil, os
from datetime import datetime
from PIL import Image
from collections import deque

def remove_green(img):
    data = img.getdata()
    new_data = [(r, g, b, 0) if (g > 200 and r < 80 and b < 80) else (r, g, b, a)
                for r, g, b, a in data]
    img.putdata(new_data)
    return img

def remove_white_flood(img, threshold=238):
    w, h = img.size
    pixels = img.load()
    visited = [[False] * h for _ in range(w)]
    queue = deque()
    for sx, sy in [(0,0),(w-1,0),(0,h-1),(w-1,h-1)]:
        if not visited[sx][sy]:
            r, g, b, a = pixels[sx, sy]
            if r >= threshold and g >= threshold and b >= threshold:
                queue.append((sx, sy)); visited[sx][sy] = True
    while queue:
        x, y = queue.popleft()
        r, g, b, a = pixels[x, y]
        if r >= threshold and g >= threshold and b >= threshold:
            pixels[x, y] = (r, g, b, 0)
            for dx, dy in [(-1,0),(1,0),(0,-1),(0,1)]:
                nx, ny = x+dx, y+dy
                if 0 <= nx < w and 0 <= ny < h and not visited[nx][ny]:
                    visited[nx][ny] = True
                    nr, ng, nb, na = pixels[nx, ny]
                    if nr >= threshold and ng >= threshold and nb >= threshold:
                        queue.append((nx, ny))
    return img

def remove_fringe(img, threshold=200):
    w, h = img.size
    pixels = img.load()
    to_clear = []
    for x in range(w):
        for y in range(h):
            r, g, b, a = pixels[x, y]
            if a > 0 and r >= threshold and g >= threshold and b >= threshold:
                for dx, dy in [(-1,0),(1,0),(0,-1),(0,1)]:
                    nx, ny = x+dx, y+dy
                    if 0 <= nx < w and 0 <= ny < h and pixels[nx, ny][3] == 0:
                        to_clear.append((x, y)); break
    for x, y in to_clear:
        r, g, b, a = pixels[x, y]
        pixels[x, y] = (r, g, b, 0)
    return img, len(to_clear)

def main():
    if len(sys.argv) != 3:
        print(__doc__); sys.exit(1)
    src, dst = sys.argv[1], sys.argv[2]

    # 旧ファイルをアーカイブ
    if os.path.exists(dst):
        base = os.path.basename(os.path.dirname(dst))
        fname = os.path.basename(dst)
        stamp = datetime.now().strftime('%Y%m%d_%H%M')
        archive_dir = os.path.join('public/assets/sprites/_archive', f'{base}_{stamp}')
        os.makedirs(archive_dir, exist_ok=True)
        shutil.copy2(dst, os.path.join(archive_dir, fname))
        print(f'archived → {archive_dir}/{fname}')

    # 新ファイルを処理
    img = Image.open(src).convert('RGBA')
    corners = [img.getpixel(p) for p in [(0,0),(img.width-1,0),(0,img.height-1),(img.width-1,img.height-1)]]
    avg_r = sum(c[0] for c in corners) / 4
    avg_g = sum(c[1] for c in corners) / 4
    avg_b = sum(c[2] for c in corners) / 4

    if avg_g > 200 and avg_r < 80 and avg_b < 80:
        img = remove_green(img)
        img, n = remove_fringe(img)
        print(f'緑背景除去 + フリンジ {n}px')
    elif avg_r > 200 and avg_g > 200 and avg_b > 200:
        img = remove_white_flood(img)
        img, n = remove_fringe(img)
        print(f'白背景除去 + フリンジ {n}px')
    else:
        print('背景色不明 → そのまま配置')

    os.makedirs(os.path.dirname(dst), exist_ok=True)
    img.save(dst)
    print(f'saved → {dst}')

if __name__ == '__main__':
    main()
