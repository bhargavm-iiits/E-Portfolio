"""Rebuild every reference image used by ../MASTER-PROMPT.md from Ref_Videos/.

Usage (from the repo root):
    python Docs/NEXUS-Cinematic/tools/build_reference.py [--work DIR] [--skip-extract]

Needs Pillow + numpy and an ffmpeg binary (FFMPEG env var, PATH, or the
imageio-ffmpeg wheel). Frames are decoded at 10 fps into --work (default: the
system temp dir) and are NOT kept in the repo; only the derived sheets, key
frames, transition strips and JSON data are written to ../reference/.
"""
import argparse, json, os, shutil, subprocess, sys, tempfile
import numpy as np
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
REF = os.path.join(ROOT, 'Ref_Videos')
# portfolio_1..6 were also copied here by the earlier analysis; used when Ref_Videos lacks a clip
FALLBACK = os.path.join(ROOT, 'Docs', 'Game', 'analysis', 'assets')
OUT = os.path.join(HERE, '..', 'reference')
FPS = 10

VIDEOS = {
    'C1': ('download/Part_1_of_2__Cinematic_20261001052145.mp4', 'Cinematic Part 1 of 2'),
    'C2': ('download (1)/Part_2_of_2__Cinematic_20261001052201.mp4', 'Cinematic Part 2 of 2'),
    'VR': ('Player_entering_VR_portal_animation_20261001051526.mp4', 'Player entering VR portal'),
    'P1': ('portfolio_1.mp4', 'portfolio_1'), 'P2': ('portfolio_2.mp4', 'portfolio_2'),
    'P3': ('portfolio_3.mp4', 'portfolio_3'), 'P4': ('portfolio_4.mp4', 'portfolio_4'),
    'P5': ('portfolio_5.mp4', 'portfolio_5'), 'P6': ('portfolio_6.mp4', 'portfolio_6'),
}

# (id, video, t seconds, slug)
KEYFRAMES = [
    ('KF01', 'C1', 0.0, 'gate-idle'), ('KF02', 'C1', 3.0, 'hud-boot-particles'),
    ('KF03', 'C1', 5.0, 'activation-portal-window'), ('KF04', 'C1', 6.5, 'vortex-spin'),
    ('KF05', 'C1', 7.8, 'charge-lightning'), ('KF06', 'C1', 8.6, 'pass-figure-core-flare'),
    ('KF07', 'C1', 9.6, 'white-out'),
    ('KF08', 'C2', 1.5, 'world-entry-hud'), ('KF09', 'C2', 2.8, 'threshold'),
    ('KF10', 'C2', 3.5, 'nexus-hub-city'), ('KF11', 'C2', 4.3, 'second-portal-burst'),
    ('KF12', 'C2', 5.5, 'hyperspace-corridor'), ('KF13', 'C2', 7.5, 'wormhole-lightning'),
    ('KF14', 'C2', 9.3, 'ribbon-warp'),
    ('KF15', 'VR', 0.5, 'rooftop-portal-idle'), ('KF16', 'VR', 1.4, 'headset-lock-on'),
    ('KF17', 'VR', 1.8, 'silhouette-pass'), ('KF18', 'VR', 3.0, 'reticle-hud-streaks'),
    ('KF19', 'VR', 5.0, 'reticle-expand'), ('KF20', 'VR', 6.3, 'warp-bloom'),
    ('KF21', 'VR', 7.5, 'city-flyover'),
    ('KF22', 'P1', 0.0, 'home-hero'), ('KF23', 'P1', 1.7, 'hero-push-text-slide'),
    ('KF24', 'P1', 2.6, 'holo-hud-around-head'), ('KF25', 'P1', 3.1, 'visor-mask-menu'),
    ('KF26', 'P1', 3.4, 'vr-main-menu'), ('KF27', 'P1', 3.7, 'menu-orb-lens'),
    ('KF28', 'P1', 4.4, 'm01-vr-physics-lab'), ('KF29', 'P1', 4.9, 'door-split'),
    ('KF30', 'P1', 5.5, 'm02-terrain-path'), ('KF31', 'P1', 6.1, 'whip-pan'),
    ('KF32', 'P1', 6.6, 'm03-isro-hangar'), ('KF33', 'P1', 7.1, 'shrink-orb-logos'),
    ('KF34', 'P1', 7.8, 'tech-constellation'), ('KF35', 'P1', 8.4, 'portal-burst'),
    ('KF36', 'P1', 9.6, 'final-hero-cta-hover'),
    ('KF37', 'P2', 2.9, 'into-headset-pov'), ('KF38', 'P2', 3.3, 'droste-visor'),
    ('KF39', 'P2', 4.6, 'labels-explode'), ('KF40', 'P2', 5.7, 'terrain-extrude'),
    ('KF41', 'P2', 9.0, 'particle-torus'),
    ('KF42', 'P3', 1.6, 'vertical-slide-blur'), ('KF43', 'P3', 2.5, 'daylight-glass-deck'),
    ('KF44', 'P3', 4.0, 'featured-card-carousel'), ('KF45', 'P3', 6.0, 'card-hover-glow'),
    ('KF46', 'P3', 8.8, 'tech-tiles-light'), ('KF47', 'P3', 9.5, 'tiles-dissolve-hero'),
    ('KF48', 'P4', 0.8, 'mechanical-ring-portal'), ('KF49', 'P4', 1.4, 'ring-fly-through'),
    ('KF50', 'P4', 1.8, 'daylight-world-glass'), ('KF51', 'P4', 4.0, 'glass-projects-dashboard'),
    ('KF52', 'P4', 6.0, 'tirumala-row'), ('KF53', 'P4', 8.9, 'tech-glass-tiles-hover'),
    ('KF54', 'P5', 0.8, 'iris-reveal-daylight'), ('KF55', 'P5', 2.2, 'dark-glass-card-grid'),
    ('KF56', 'P5', 3.0, 'split-and-zoom'), ('KF57', 'P5', 4.2, 'webgl-window-lab'),
    ('KF58', 'P5', 4.9, 'panel-door-swing'), ('KF59', 'P5', 6.6, 'terrain-glass-backplate'),
    ('KF60', 'P5', 7.7, 'isro-glass-card'), ('KF61', 'P5', 8.9, 'tech-tiles-dark'),
    ('KF62', 'P6', 1.5, 'ring-assembly'), ('KF63', 'P6', 2.2, 'glass-shatter'),
    ('KF64', 'P6', 2.7, 'hologram-digitise'), ('KF65', 'P6', 3.8, 'player-front-trails'),
    ('KF66', 'P6', 4.2, 'neon-city-trails'), ('KF67', 'P6', 4.7, 'world-to-panel'),
    ('KF68', 'P6', 5.4, 'inception-fold-nodes'), ('KF69', 'P6', 6.8, 'glass-vitrines'),
    ('KF70', 'P6', 7.8, 'comet-logos'), ('KF71', 'P6', 8.6, 'hyperspace-to-hero'),
]

# (id, slug, title, video, t0, t1)
TRANSITIONS = [
    ('T01', 'hud-boot', 'HUD boot + particle swarm', 'C1', 2.3, 4.0),
    ('T02', 'portal-window', 'Plasma membrane becomes a window', 'C1', 3.4, 4.6),
    ('T03', 'vortex-push', 'Vortex spin-up + ease-in push', 'C1', 4.5, 7.9),
    ('T04', 'whiteout', 'Pass the figure -> core flare -> white-out', 'C1', 7.8, 9.9),
    ('T05', 'world-entry', 'WORLD ENTRY HUD -> threshold crossing', 'C2', 0.0, 3.2),
    ('T06', 'hub-title', '[ THE NEXUS HUB ] title + second portal', 'C2', 3.0, 4.5),
    ('T07', 'hyperspace', 'Hyperspace corridor -> ribbon warp', 'C2', 4.4, 9.9),
    ('T08', 'silhouette-wipe', 'Silhouette pass-through wipe', 'VR', 1.2, 2.1),
    ('T09', 'reticle-bloom', 'Reticle expand + white-core bloom', 'VR', 3.9, 6.0),
    ('T10', 'warp-exit', 'Warp exit -> city flyover', 'VR', 6.0, 7.9),
    ('T11', 'hero-push', 'Hero push-in + copy slides out', 'P1', 1.0, 2.0),
    ('T12', 'holo-hud', 'Holo HUD materialises around head', 'P1', 2.0, 2.8),
    ('T13', 'visor-dive', 'Visor dive + goggle mask', 'P1', 2.7, 3.4),
    ('T14', 'droste', 'Droste double-visor', 'P2', 2.8, 3.9),
    ('T15', 'orb-lens', 'Menu cube -> orb lens -> scene', 'P1', 3.4, 4.0),
    ('T16', 'labels-explode', 'Labels explode past camera', 'P2', 4.3, 4.9),
    ('T17', 'door-split', 'Centre-slit door split', 'P1', 4.6, 5.2),
    ('T18', 'path-draw', 'Route path draws to pin', 'P1', 5.0, 5.8),
    ('T19', 'terrain-build', 'Terrain wireframe extrusion build', 'P2', 5.3, 6.3),
    ('T20', 'whip-pan', 'Whip-pan horizontal blur', 'P1', 5.8, 6.4),
    ('T21', 'hard-push', 'Hard-edge push slide', 'P2', 6.3, 6.8),
    ('T22', 'shrink-orb', 'Shrink into orb + logos fly in', 'P1', 6.9, 7.4),
    ('T23', 'portal-burst', 'Portal burst energy ring -> hero', 'P1', 8.0, 8.9),
    ('T24', 'particle-torus', 'Particle torus burst -> hero', 'P2', 8.6, 9.5),
    ('T25', 'final-settle', 'Final hero settle + CTA reticle + hover', 'P1', 8.8, 9.9),
    ('T26', 'iris-daylight', 'Iris reveal into daylight', 'P5', 0.4, 1.2),
    ('T27', 'cards-materialise', 'Glass cards materialise over scene', 'P5', 1.5, 2.2),
    ('T28', 'split-zoom', 'Split-and-zoom card grid', 'P5', 2.6, 3.6),
    ('T29', 'door-swing', 'Panel door-swing', 'P5', 4.6, 5.1),
    ('T30', 'card-into-scene', 'Card shrinks into the next scene', 'P5', 6.9, 7.4),
    ('T31', 'ring-assembly', 'Mechanical ring assembles', 'P6', 1.1, 1.9),
    ('T32', 'shatter-digitise', 'Glass shatter + hologram digitise', 'P6', 1.9, 3.1),
    ('T33', 'light-trails', 'Neon light-trail ribbons', 'P6', 3.4, 4.4),
    ('T34', 'world-to-panel', 'World pulls back into a panel, then folds', 'P6', 4.4, 5.7),
    ('T35', 'vitrines', 'Glass vitrines + neon node connectors', 'P6', 5.6, 6.4),
    ('T36', 'comet-logos', 'Comet logo fly-in', 'P6', 7.4, 8.3),
    ('T37', 'hyper-to-hero', 'Hyperspace radial zoom to hero', 'P6', 8.2, 8.9),
    ('T38', 'vertical-slide', 'Vertical full-page slide with motion blur', 'P3', 1.1, 2.1),
    ('T39', 'carousel', 'Glass carousel slide + hover lift', 'P3', 2.8, 7.0),
    ('T40', 'tile-dissolve', 'Tiles dissolve into hero', 'P3', 9.0, 9.9),
    ('T41', 'ring-daylight', 'Ring fly-through to daylight + figure to glass', 'P4', 0.0, 2.1),
    ('T42', 'glass-dolly', 'Glass dashboard dolly + vertical scroll', 'P4', 2.0, 5.7),
    ('T43', 'tile-hover-tint', 'Glass tiles hover tint', 'P4', 8.3, 9.9),
]


# Site storyboard (MASTER-PROMPT §3): chapter, label, key frame id (None = no reference footage)
STORYBOARD = [
    ('CH00', 'BOOT  T01', 'KF02'), ('CH01', 'THE GATE  T01-T04', 'KF03'),
    ('CH02', 'WORLD ENTRY  T05', 'KF08'), ('CH03', 'THE NEXUS HUB  T06', 'KF10'),
    ('CH04', 'WARP  T07 T09 T10', 'KF12'), ('CH05', 'HOME  (idle)', 'KF22'),
    ('CH06', 'DIVE  T11-T13', 'KF24'), ('CH07', 'VR MAIN MENU  T15 T16', 'KF26'),
    ('CH08', 'M: PHYSICS LAB  T17 out', 'KF28'), ('CH09', 'M: TIRUMALA  T19 T18', 'KF30'),
    ('CH10', 'M: VR CINEMA  (no ref)', None), ('CH11', 'M: ISRO HANGAR  T22 out', 'KF32'),
    ('CH12', 'ABILITIES  T22 T36', 'KF34'), ('CH13', 'PLAYER LOG  T24 T32 T33', 'KF65'),
    ('CH14', 'THE VAULT  T34 T35 T27', 'KF69'), ('CH15', 'FINALE / COMMS  T37 T25', 'KF36'),
    ('/archive', 'DAYLIGHT ARCHIVE  T41 T38 T39', 'KF44'), ('short', 'SHORT ENTRY  T08-T10', 'KF18'),
    ('nav', 'PLAYER jump  T31 T32', 'KF63'), ('nav', 'CONTACT jump  T23', 'KF35'),
]


def font(size):
    for f in ('C:/Windows/Fonts/consola.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'):
        if os.path.exists(f):
            return ImageFont.truetype(f, size)
    return ImageFont.load_default()


def find_ffmpeg():
    if os.environ.get('FFMPEG'):
        return os.environ['FFMPEG']
    if shutil.which('ffmpeg'):
        return shutil.which('ffmpeg')
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError:
        sys.exit('ffmpeg not found: set FFMPEG or pip install imageio-ffmpeg')


def frame_path(work, vid, t):
    files = sorted(os.listdir(os.path.join(work, vid)))
    n = min(int(round(t * FPS)), len(files) - 1)
    return os.path.join(work, vid, files[n])


def kmeans_palette(im, k=6, iters=20):
    px = np.asarray(im.convert('RGB').resize((120, 68))).reshape(-1, 3).astype(np.float32)
    lum = px @ np.array([0.299, 0.587, 0.114], np.float32)
    order = np.argsort(lum)
    c = px[order[np.linspace(0, len(px) - 1, k).astype(int)]].copy()
    for _ in range(iters):
        lab = np.argmin(((px[:, None, :] - c[None]) ** 2).sum(-1), axis=1)
        for j in range(k):
            if (lab == j).any():
                c[j] = px[lab == j].mean(0)
    share = np.bincount(lab, minlength=k) / len(px)
    idx = np.argsort(-share)
    return [{'hex': '#%02X%02X%02X' % tuple(int(v) for v in c[j]), 'share': round(float(share[j]), 3)} for j in idx]


ACCENTS = {  # hue deg range, min sat, min val (0-255)
    'hud_cyan': ((165, 200), 110, 170), 'plasma_violet': ((245, 290), 80, 150),
    'neon_pink': ((305, 345), 120, 160), 'amber': ((22, 50), 140, 170), 'core_white': (None, 0, 245),
}


def accents(paths):
    acc = {k: [] for k in ACCENTS}
    for p in paths:
        rgb = np.asarray(Image.open(p).convert('RGB').resize((256, 144))).reshape(-1, 3)
        hsv = np.asarray(Image.open(p).convert('RGB').resize((256, 144)).convert('HSV')).reshape(-1, 3).astype(int)
        h = hsv[:, 0] * 360 / 255
        for name, (hr, smin, vmin) in ACCENTS.items():
            if hr is None:
                m = (hsv[:, 2] >= vmin) & (hsv[:, 1] < 40)
            else:
                m = (h >= hr[0]) & (h <= hr[1]) & (hsv[:, 1] >= smin) & (hsv[:, 2] >= vmin)
            if m.any():
                acc[name].append(rgb[m])
    res = {}
    for k, arrs in acc.items():
        if arrs:
            a = np.concatenate(arrs)
            med = np.median(a, axis=0).astype(int)
            res[k] = {'hex': '#%02X%02X%02X' % tuple(med), 'pixels': int(len(a))}
    return res


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--work', default=os.path.join(tempfile.gettempdir(), 'nexus-ref-frames'))
    ap.add_argument('--skip-extract', action='store_true')
    a = ap.parse_args()
    work = a.work
    for sub in ('keyframes', 'transitions', 'contact-sheets', 'data'):
        os.makedirs(os.path.join(OUT, sub), exist_ok=True)

    if not a.skip_extract:
        ff = find_ffmpeg()
        for vid, (rel, _) in VIDEOS.items():
            src = next((p for p in (os.path.join(REF, rel), os.path.join(FALLBACK, os.path.basename(rel))) if os.path.exists(p)), None)
            if not src:
                print(f'WARNING {vid}: source missing ({rel}); keeping any frames already in {work}')
                continue
            d = os.path.join(work, vid)
            shutil.rmtree(d, ignore_errors=True)
            os.makedirs(d)
            subprocess.run([ff, '-hide_banner', '-loglevel', 'error', '-i', src,
                            '-vf', f'fps={FPS}', '-q:v', '2', os.path.join(d, 'f_%03d.jpg')], check=True)

    have = {vid for vid in VIDEOS if os.path.isdir(os.path.join(work, vid)) and os.listdir(os.path.join(work, vid))}
    for vid in VIDEOS.keys() - have:
        print(f'WARNING {vid}: no decoded frames; its existing reference images are left untouched')

    f18, f22 = font(18), font(22)
    def load(name, default):
        f = os.path.join(OUT, 'data', name)
        return json.load(open(f)) if os.path.exists(f) else default
    metrics = load('motion-metrics.json', {})
    # contact sheets: every decoded frame, 20 per sheet (2 s), labelled with t and frame-diff
    TW, TH, COLS, ROWS, LAB = 400, 225, 4, 5, 24
    for vid in sorted(have):
        files = sorted(os.listdir(os.path.join(work, vid)))
        prev, m = None, []
        for i, f in enumerate(files):
            im = Image.open(os.path.join(work, vid, f)).convert('RGB')
            g = np.asarray(im.resize((160, 90))).astype(np.float32).mean(2)
            m.append({'t': round(i / FPS, 1), 'lum': round(float(g.mean()), 1),
                      'diff': round(float(np.abs(g - prev).mean()), 2) if prev is not None else 0.0})
            prev = g
        metrics[vid] = m
        for s in range(0, len(files), COLS * ROWS):
            sheet = Image.new('RGB', (COLS * TW, ROWS * (TH + LAB)), (8, 10, 16))
            d = ImageDraw.Draw(sheet)
            for j, f in enumerate(files[s:s + COLS * ROWS]):
                i = s + j
                x, y = (j % COLS) * TW, (j // COLS) * (TH + LAB)
                sheet.paste(Image.open(os.path.join(work, vid, f)).convert('RGB').resize((TW, TH)), (x, y))
                d.text((x + 6, y + TH + 2), f"{vid} t={i / FPS:4.1f}s  motion={m[i]['diff']:.1f}", fill=(140, 239, 255), font=f18)
            sheet.save(os.path.join(OUT, 'contact-sheets', f'{vid}_{s / FPS:04.1f}-{min(s + 19, len(files) - 1) / FPS:04.1f}s.jpg'), quality=80)

    # key frames (full decoded resolution, 1280 wide)
    old = load('palette.json', {})
    pal = old.get('keyframes', {})
    for kid, vid, t, slug in KEYFRAMES:
        if vid not in have:
            continue
        im = Image.open(frame_path(work, vid, t)).convert('RGB')
        if im.width > 1280:
            im = im.resize((1280, int(im.height * 1280 / im.width)), Image.LANCZOS)
        im.save(os.path.join(OUT, 'keyframes', f'{kid}_{vid}_{t:.1f}s_{slug}.jpg'), quality=88)
        pal[kid] = {'video': vid, 't': t, 'slug': slug, 'palette': kmeans_palette(im)}

    # transition strips: 8 evenly spaced frames, read left->right, top->bottom
    SW, SH = 480, 270
    for tid, slug, title, vid, t0, t1 in TRANSITIONS:
        if vid not in have:
            continue
        ts = np.linspace(t0, t1, 8)
        strip = Image.new('RGB', (4 * SW, 44 + 2 * (SH + 28)), (6, 9, 15))
        d = ImageDraw.Draw(strip)
        d.text((12, 10), f'{tid}  {title}   [{VIDEOS[vid][1]}  {t0:.1f}-{t1:.1f} s]', fill=(232, 240, 255), font=f22)
        for j, t in enumerate(ts):
            x, y = (j % 4) * SW, 44 + (j // 4) * (SH + 28)
            strip.paste(Image.open(frame_path(work, vid, t)).convert('RGB').resize((SW, SH)), (x, y))
            d.text((x + 8, y + SH + 4), f'{j + 1}/8  t={t:.2f}s', fill=(140, 239, 255), font=f18)
        strip.save(os.path.join(OUT, 'transitions', f'{tid}_{slug}_{vid}_{t0:.1f}-{t1:.1f}s.jpg'), quality=84)

    # storyboard: one tile per chapter / route, in scroll order
    kf_file = {k[0]: f'{k[0]}_{k[1]}_{k[2]:.1f}s_{k[3]}.jpg' for k in KEYFRAMES}
    BW, BH, BL, BC = 480, 270, 34, 4
    rows = (len(STORYBOARD) + BC - 1) // BC
    board = Image.new('RGB', (BC * BW, 50 + rows * (BH + BL)), (6, 9, 15))
    d = ImageDraw.Draw(board)
    d.text((12, 12), 'NEXUS cinematic portfolio - storyboard (scroll order, then routes)', fill=(232, 240, 255), font=f22)
    for i, (ch, label, kf) in enumerate(STORYBOARD):
        x, y = (i % BC) * BW, 50 + (i // BC) * (BH + BL)
        if kf:
            board.paste(Image.open(os.path.join(OUT, 'keyframes', kf_file[kf])).convert('RGB').resize((BW, BH)), (x, y))
        else:
            d.rectangle((x + 4, y + 4, x + BW - 4, y + BH - 4), outline=(95, 227, 240))
            d.text((x + 24, y + BH // 2 - 10), 'no reference footage: build in-language', fill=(140, 239, 255), font=f18)
        d.text((x + 8, y + BH + 6), f'{ch}  {label}', fill=(140, 239, 255), font=f18)
    board.save(os.path.join(OUT, 'storyboard.jpg'), quality=86)

    acc = old.get('accents_by_video', {})
    acc.update({vid: accents([os.path.join(work, vid, f) for f in sorted(os.listdir(os.path.join(work, vid)))[::5]]) for vid in have})
    json.dump(metrics, open(os.path.join(OUT, 'data', 'motion-metrics.json'), 'w'), indent=1)
    json.dump({'keyframes': pal, 'accents_by_video': acc}, open(os.path.join(OUT, 'data', 'palette.json'), 'w'), indent=1)
    json.dump({'videos': {k: v[0] for k, v in VIDEOS.items()},
               'keyframes': [dict(zip(('id', 'video', 't', 'slug'), k)) for k in KEYFRAMES],
               'transitions': [dict(zip(('id', 'slug', 'title', 'video', 't0', 't1'), t)) for t in TRANSITIONS]},
              open(os.path.join(OUT, 'data', 'index.json'), 'w'), indent=1)
    print('done ->', os.path.abspath(OUT))


if __name__ == '__main__':
    main()
