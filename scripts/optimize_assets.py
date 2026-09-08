from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
ASSET_ROOT = ROOT / "public" / "assets"

TARGETS = [
    ASSET_ROOT / "hero-abstract.png",
    ASSET_ROOT / "resume-portrait-soft.png",
    ASSET_ROOT / "services" / "ai-coding-generated-v2.png",
    ASSET_ROOT / "services" / "ppt-optimization-generated.png",
]
TARGETS += sorted((ASSET_ROOT / "certificates").glob("*.*"))
TARGETS += sorted((ASSET_ROOT / "works").glob("*.png"))


def max_edge_for(path: Path) -> int:
    text = path.as_posix()
    if "/certificates/" in text:
        return 1680
    if "/works/" in text:
        return 1160
    if "/services/" in text:
        return 1200
    if path.name == "resume-portrait-soft.png":
        return 960
    return 1600


def optimize(path: Path) -> tuple[int, int]:
    if path.suffix.lower() not in {".png", ".jpg", ".jpeg"}:
        return (0, 0)

    output = path.with_suffix(".webp")
    before = path.stat().st_size
    with Image.open(path) as image:
        image = image.convert("RGBA" if image.mode in {"RGBA", "LA", "P"} else "RGB")
        image.thumbnail((max_edge_for(path), max_edge_for(path)), Image.Resampling.LANCZOS)
        image.save(output, "WEBP", quality=84, method=6)
    return before, output.stat().st_size


def main() -> None:
    original = 0
    optimized = 0
    count = 0
    for path in dict.fromkeys(TARGETS):
        before, after = optimize(path)
        if before:
            original += before
            optimized += after
            count += 1
            print(f"{path.relative_to(ROOT)} -> {path.with_suffix('.webp').relative_to(ROOT)} {before // 1024}KB -> {after // 1024}KB")
    saved = original - optimized
    print(f"optimized {count} images: {original // 1024}KB -> {optimized // 1024}KB, saved {saved // 1024}KB")


if __name__ == "__main__":
    main()
